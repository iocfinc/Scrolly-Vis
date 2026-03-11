import { ToastAdapter } from "./adapters/ToastAdapter";
import { HighlightEngine } from "./highlights/HighlightEngine";
import { OverlayEngine } from "./overlay/OverlayEngine";
import { ScrollBinder } from "./scroll/ScrollBinder";
import { StoryController } from "./story/StoryController";
import { resolveHighlightTargets, type HighlightTarget } from "./highlights/resolveTargets";
import type { ChartState, PredicateFn, StoryBindings, StoryChartInstance, StoryChartSpec, ToastData, ToastOptions } from "./types";

class StoryChartRuntime implements StoryChartInstance {
  private readonly adapter: ToastAdapter;
  private readonly overlayEngine: OverlayEngine;
  private readonly highlightEngine: HighlightEngine;
  private readonly storyController: StoryController;
  private readonly chartType: StoryChartSpec["toast"]["type"];
  private readonly defaultSeriesColors: string[];
  private readonly scrollBinder = new ScrollBinder();
  private readonly predicates = new Map<string, PredicateFn>();
  private destroyed = false;

  constructor(spec: StoryChartSpec) {
    if (!["bar", "column", "line", "area"].includes(spec.toast.type)) {
      throw new Error(`Unsupported chart type in v1: ${spec.toast.type}`);
    }

    spec.mount.classList.add("sc-storychart");
    if (spec.theme?.className) {
      spec.mount.classList.add(spec.theme.className);
    }
    if (spec.theme?.vars) {
      Object.entries(spec.theme.vars).forEach(([k, v]) => spec.mount.style.setProperty(k, v));
    }

    this.chartType = spec.toast.type;
    this.defaultSeriesColors = this.readDefaultSeriesColors(spec.toast.options);

    this.adapter = new ToastAdapter({
      type: spec.toast.type,
      mount: spec.mount,
      data: spec.toast.data,
      options: spec.toast.options,
      chartFactory: spec.toast.chartFactory,
    });

    this.overlayEngine = new OverlayEngine(this.adapter.getChartElement(), spec.layers?.[0]?.highlightMode ?? "behind");
    this.highlightEngine = new HighlightEngine(this.overlayEngine.getHighlightLayerEl());

    this.storyController = new StoryController(spec.states, {
      data: spec.toast.data,
      options: spec.toast.options,
      highlights: [],
      annotations: [],
    });

    if (spec.initialState) {
      void this.applyState(spec.initialState);
    } else {
      void this.adapter.refreshGeometry();
    }

    window.addEventListener("resize", this.resize);
    if ((document as unknown as { fonts?: { ready?: Promise<void> } }).fonts?.ready) {
      void (document as unknown as { fonts: { ready: Promise<void> } }).fonts.ready.then(() => {
        if (!this.destroyed) this.resize();
      });
    }
  }

  applyState = async (stateNameOrObject: string | ChartState): Promise<void> => {
    if (this.destroyed) return;

    const { snapshot } = this.storyController.preview(stateNameOrObject);
    const renderData = this.getRenderData(snapshot.data, snapshot.highlights ?? []);
    const renderOptions = this.getRenderOptions(snapshot.options, snapshot.data, snapshot.highlights ?? []);

    const prev = this.storyController.getCurrent();
    if (snapshot.data !== prev.data || snapshot.highlights !== prev.highlights) {
      this.adapter.setData(renderData);
    }
    if (snapshot.options !== prev.options || snapshot.highlights !== prev.highlights) {
      this.adapter.setOptions(renderOptions);
    }

    await this.adapter.refreshGeometry();

    this.renderHighlights(snapshot, renderData);

    this.overlayEngine.renderAnnotations({
      annotations: snapshot.annotations ?? [],
      geometry: this.adapter.getGeometryRegistry(),
      data: renderData,
    });

    this.storyController.commit(snapshot);
  };

  bindScroll = (scrollamaInstance: import("./types").ScrollamaLike, bindings: StoryBindings): void => {
    this.scrollBinder.bind(scrollamaInstance, bindings, {
      applyState: (state) => {
        void this.applyState(state);
      },
    });
  };

  registerPredicate = (id: string, fn: PredicateFn): void => {
    this.predicates.set(id, fn);
  };

  resize = (): void => {
    if (this.destroyed) return;
    this.adapter.resize();
    void this.adapter.refreshGeometry().then(() => {
      const snapshot = this.storyController.getCurrent();
      const renderData = this.getRenderData(snapshot.data, snapshot.highlights ?? []);
      this.renderHighlights(snapshot, renderData);
      this.overlayEngine.renderAnnotations({
        annotations: snapshot.annotations ?? [],
        geometry: this.adapter.getGeometryRegistry(),
        data: renderData,
      });
    });
  };

  destroy = (): void => {
    this.destroyed = true;
    window.removeEventListener("resize", this.resize);
    this.scrollBinder.destroy();
    this.overlayEngine.destroy();
    this.adapter.destroy();
  };

  private renderHighlights(snapshot: { data: ToastData; highlights: ChartState["highlights"] }, renderData: ToastData): void {
    if (this.supportsBaseHighlightStyling(snapshot.data)) {
      this.highlightEngine.render({
        data: renderData,
        rules: [],
        geometry: this.adapter.getGeometryRegistry(),
        predicates: this.predicates,
      });
      return;
    }

    this.highlightEngine.render({
      data: renderData,
      rules: snapshot.highlights ?? [],
      geometry: this.adapter.getGeometryRegistry(),
      predicates: this.predicates,
    });
  }

  private supportsBaseHighlightStyling(data: ToastData): boolean {
    return (this.chartType === "bar" || this.chartType === "column") && data.series.length === 1;
  }

  private getRenderData(data: ToastData, highlights: ChartState["highlights"]): ToastData {
    if (!this.supportsBaseHighlightStyling(data) || !highlights?.length) {
      return data;
    }

    const targets = resolveHighlightTargets(data, highlights, this.predicates);
    if (!targets.length) return data;

    const byKey = new Map<string, HighlightTarget>();
    targets.forEach((target) => {
      const key = `${target.series}:${target.index}`;
      const prev = byKey.get(key);
      if (!prev || target.priority >= prev.priority) {
        byKey.set(key, target);
      }
    });

    return {
      categories: data.categories,
      series: data.series.map((series, seriesIndex) => {
        const fallbackColor =
          this.defaultSeriesColors[seriesIndex % Math.max(1, this.defaultSeriesColors.length)] ??
          "#888888";
        const baseColors = Array(data.categories.length).fill(fallbackColor);

        byKey.forEach((target) => {
          if (target.series === series.name && target.index >= 0 && target.index < baseColors.length) {
            baseColors[target.index] = target.color;
          }
        });

        return {
          ...series,
          colorByCategories: true,
        };
      }),
    };
  }

  private getRenderOptions(options: ToastOptions, data: ToastData, highlights: ChartState["highlights"]): ToastOptions {
    if (!this.supportsBaseHighlightStyling(data) || !highlights?.length) {
      return options;
    }

    const targets = resolveHighlightTargets(data, highlights, this.predicates);
    if (!targets.length) return options;

    const fallbackColor = this.defaultSeriesColors[0] ?? "#888888";
    const colors = Array(data.categories.length).fill(fallbackColor);
    const byIndex = new Map<number, HighlightTarget>();
    targets.forEach((target) => {
      if (target.series !== data.series[0]?.name) return;
      const prev = byIndex.get(target.index);
      if (!prev || target.priority >= prev.priority) {
        byIndex.set(target.index, target);
      }
    });
    byIndex.forEach((target, index) => {
      if (index >= 0 && index < colors.length) colors[index] = target.color;
    });

    return {
      ...(options as Record<string, unknown>),
      theme: {
        ...((options.theme as Record<string, unknown> | undefined) ?? {}),
        series: {
          ...(((options.theme as { series?: Record<string, unknown> } | undefined)?.series ?? {}) as Record<string, unknown>),
          colors,
        },
      },
    };
  }

  private readDefaultSeriesColors(options: ToastOptions): string[] {
    const colors = (options.theme as { series?: { colors?: unknown } } | undefined)?.series?.colors;
    return Array.isArray(colors) ? colors.filter((value): value is string => typeof value === "string") : [];
  }
}

export function createStoryChart(spec: StoryChartSpec): StoryChartInstance {
  return new StoryChartRuntime(spec);
}
