import { createStoryChart } from "@storycharts/core";

export type FieldType = "string" | "number" | "date" | "boolean";
export type FieldRole = "x" | "y" | "series" | "label" | "color";
export type ChartKind = "bar" | "column" | "line" | "area" | "scatter" | "combo" | "lollipop";
export type ThemeMode = "light" | "dark";

export type TransformSpec =
  | {
      id: string;
      type: "filterEquals";
      field: string;
      values: string[];
    }
  | {
      id: string;
      type: "filterRange";
      field: string;
      min?: number;
      max?: number;
    };

export type FieldSchema = {
  key: string;
  label: string;
  type: FieldType;
  role?: FieldRole;
  format?: string;
};

export type DatasetSpec = {
  sourceType: "inline" | "csv" | "json";
  raw: {
    columns: string[];
    rows: Array<Record<string, string | number | null>>;
  };
  schema: FieldSchema[];
  transforms: TransformSpec[];
};

export type HighlightRuleSpec = {
  id: string;
  selector:
    | { kind: "rowIndex"; indices: number[] }
    | { kind: "categoryValue"; field: string; values: string[] }
    | { kind: "datePart"; field: string; part: "month" | "quarter" | "year"; values: Array<string | number> }
    | { kind: "numericRange"; field: string; min?: number; max?: number }
    | { kind: "seriesValue"; field: string; values: string[] };
  style: {
    color?: string;
    opacity?: number;
    dimOthers?: boolean;
  };
  legendLabel?: string;
  priority?: number;
};

export type AnnotationRuleSpec =
  | {
      id: string;
      type: "callout" | "label";
      anchor:
        | { kind: "dataPoint"; rowIndex: number }
        | { kind: "category"; field: string; value: string }
        | { kind: "seriesCategory"; series: string; category: string };
      text: string;
      pointer?: boolean;
      offset?: { x: number; y: number };
    }
  | {
      id: string;
      type: "band";
      axis: "x" | "y";
      range: [string | number, string | number];
      text?: string;
    }
  | {
      id: string;
      type: "note";
      position: { x: number; y: number };
      text: string;
    };

export type StoryStateSpec = {
  highlights: HighlightRuleSpec[];
  annotations: AnnotationRuleSpec[];
};

export type ChartSpec = {
  type: ChartKind;
  mappings: {
    x?: string;
    y?: string;
    series?: string;
    label?: string;
    color?: string;
  };
  options: {
    stacked?: boolean;
    horizontal?: boolean;
    showLegend?: boolean;
    yAxisLabelFormat?: "number" | "percent" | "currency";
    xAxisTimeUnit?: "day" | "week" | "month" | "quarter" | "year";
  };
};

export type PresentationSpec = {
  theme: {
    mode: ThemeMode;
    paletteId: "newsroom-default";
  };
  framing: {
    title: string;
    subtitle?: string;
    source?: string;
    footnote?: string;
    byline?: string;
  };
};

export type StudioDocument = {
  version: "1";
  meta: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  dataset: DatasetSpec;
  chart: ChartSpec;
  presentation: PresentationSpec;
  states: Record<string, StoryStateSpec>;
  initialState: string;
};

export type LoadedDataset = {
  name: string;
  dataset: DatasetSpec;
};

const palette = {
  light: {
    background: "#e7e5e4",
    panel: "#f3f0ec",
    card: "#fbfaf8",
    text: "#111111",
    muted: "#4b5563",
    grid: "#cfc8bf",
    axis: "#111111",
    orange: "#ffa028",
    black: "#000000",
    pink: "#f73ba9",
    blue: "#00aeff",
    green: "#3ef794",
    dim: "#c7c0b9",
  },
  dark: {
    background: "#18181b",
    panel: "#202126",
    card: "#24262d",
    text: "#f4f4f5",
    muted: "#c7c9d1",
    grid: "#4b5563",
    axis: "#f4f4f5",
    orange: "#ffa028",
    black: "#ffffff",
    pink: "#ff62ba",
    blue: "#53c7ff",
    green: "#5ef5a0",
    dim: "#555b66",
  },
} as const;

const jobCutsRows = [
  { month: "2021-01", jobCuts: 79552 },
  { month: "2021-06", jobCuts: 20476 },
  { month: "2022-01", jobCuts: 19064 },
  { month: "2022-06", jobCuts: 32517 },
  { month: "2023-01", jobCuts: 102943 },
  { month: "2023-06", jobCuts: 40709 },
  { month: "2024-01", jobCuts: 82307 },
  { month: "2024-06", jobCuts: 48786 },
  { month: "2025-01", jobCuts: 49795 },
  { month: "2025-02", jobCuts: 172017 },
  { month: "2025-03", jobCuts: 275240 },
  { month: "2025-06", jobCuts: 47999 },
  { month: "2026-01", jobCuts: 108435 },
];

export const chartOptions: Array<{ value: ChartKind; label: string }> = [
  { value: "bar", label: "Bar" },
  { value: "column", label: "Column" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "scatter", label: "Scatter" },
  { value: "combo", label: "Combo" },
  { value: "lollipop", label: "Lollipop" },
];

export function getPalette(mode: ThemeMode) {
  return palette[mode];
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

type PlotBox = { x: number; y: number; width: number; height: number };

function getPlotBox(host: HTMLElement): PlotBox {
  const chartWithStore = host as HTMLElement & {
    __storychartsToastChart__?: {
      getPlotBox?: () => { x: number; y: number; width?: number; height?: number; w?: number; h?: number } | null;
      store?: { state?: { layout?: { plot?: { x?: number; y?: number; width?: number; height?: number } } } };
    };
  };
  const directPlot = chartWithStore.__storychartsToastChart__?.getPlotBox?.();
  const plotFromChart =
    directPlot ??
    chartWithStore.__storychartsToastChart__?.store?.state?.layout?.plot;
  if (plotFromChart) {
    const width = ("w" in plotFromChart ? plotFromChart.w : undefined) ?? plotFromChart.width;
    const height = ("h" in plotFromChart ? plotFromChart.h : undefined) ?? plotFromChart.height;
    if (
      typeof plotFromChart.x === "number" &&
      Number.isFinite(plotFromChart.x) &&
      typeof plotFromChart.y === "number" &&
      Number.isFinite(plotFromChart.y) &&
      typeof width === "number" &&
      Number.isFinite(width) &&
      typeof height === "number" &&
      Number.isFinite(height)
    ) {
      return {
        x: plotFromChart.x,
        y: plotFromChart.y,
        width,
        height,
      };
    }
  }

  const rootRect = host.getBoundingClientRect();
  const plotArea = host.querySelector(".toastui-chart-plot-area") as HTMLElement | null;
  if (!plotArea) {
    return { x: 0, y: 0, width: rootRect.width, height: rootRect.height };
  }
  const plotRect = plotArea.getBoundingClientRect();
  return {
    x: plotRect.left - rootRect.left,
    y: plotRect.top - rootRect.top,
    width: plotRect.width,
    height: plotRect.height,
  };
}

function positionNodeInPlot(node: HTMLElement, plotBox: PlotBox, position: { x: number; y: number }) {
  node.style.left = `${plotBox.x + (plotBox.width * position.x) / 100}px`;
  node.style.top = `${plotBox.y + (plotBox.height * position.y) / 100}px`;
}

function renderStaticNotes(
  host: HTMLElement,
  overlay: HTMLElement,
  annotations: AnnotationRuleSpec[],
  applyTheme?: (node: HTMLElement) => void,
) {
  overlay.replaceChildren();
  const plotBox = getPlotBox(host);
  annotations.forEach((annotation) => {
    if (annotation.type !== "note") return;
    const note = globalThis.document.createElement("div");
    note.className = "sc-annotation sc-label";
    note.textContent = annotation.text;
    note.style.position = "absolute";
    note.style.transform = "translate(-50%, -50%)";
    positionNodeInPlot(note, plotBox, annotation.position);
    applyTheme?.(note);
    overlay.appendChild(note);
  });
}

export function inferFieldType(values: Array<string | number | null>): FieldType {
  const filtered = values.filter((value) => value !== null && `${value}`.trim() !== "");
  if (!filtered.length) return "string";
  if (filtered.every((value) => typeof value === "boolean" || value === "true" || value === "false")) {
    return "boolean";
  }
  if (filtered.every((value) => Number.isFinite(typeof value === "number" ? value : Number(value)))) {
    return "number";
  }
  if (
    filtered.every((value) => {
      const date = new Date(String(value));
      return !Number.isNaN(date.getTime());
    })
  ) {
    return "date";
  }
  return "string";
}

export function normalizeCell(value: string): string | number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

export function parseCsv(text: string) {
  const lines: string[][] = [];
  let current = "";
  let row: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }
    if (char === "," && !insideQuotes) {
      row.push(current);
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      current = "";
      if (row.some((cell) => cell.length > 0)) lines.push(row);
      row = [];
      continue;
    }
    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    if (row.some((cell) => cell.length > 0)) lines.push(row);
  }

  const [header, ...body] = lines;
  if (!header?.length) throw new Error("CSV file is empty.");

  const columns = header.map((value, index) => value.trim() || `column_${index + 1}`);
  const rows = body.map((cells) => {
    const out: Record<string, string | number | null> = {};
    columns.forEach((column, index) => {
      out[column] = normalizeCell(cells[index] ?? "");
    });
    return out;
  });

  return { columns, rows };
}

export function createDatasetFromRows(
  name: string,
  rows: Array<Record<string, string | number | null>>,
  sourceType: DatasetSpec["sourceType"] = "inline",
): LoadedDataset {
  const columns = rows.length ? Array.from(new Set(rows.flatMap((row) => Object.keys(row)))) : [];
  const schema = columns.map((column, index) => {
    const type = inferFieldType(rows.map((row) => row[column] ?? null));
    const role =
      index === 0 ? "x" : index === 1 && type === "number" ? "y" : index === 2 ? "series" : undefined;
    return {
      key: column,
      label: column,
      type,
      role,
    } satisfies FieldSchema;
  });

  return {
    name,
    dataset: {
      sourceType,
      raw: { columns, rows },
      schema,
      transforms: [],
    },
  };
}

export function loadRowsFromText(fileName: string, text: string): LoadedDataset {
  if (fileName.endsWith(".json")) {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return createDatasetFromRows(fileName.replace(/\.json$/i, ""), parsed as Array<Record<string, string | number | null>>, "json");
    }
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as { rows?: unknown }).rows)) {
      return createDatasetFromRows(
        fileName.replace(/\.json$/i, ""),
        (parsed as { rows: Array<Record<string, string | number | null>> }).rows,
        "json",
      );
    }
    throw new Error("JSON upload must be an array of objects or an object with a rows array.");
  }

  const parsed = parseCsv(text);
  return createDatasetFromRows(fileName.replace(/\.csv$/i, ""), parsed.rows, "csv");
}

export function applyTransforms(document: StudioDocument) {
  return document.dataset.raw.rows.filter((row) =>
    document.dataset.transforms.every((transform) => {
      if (transform.type === "filterEquals") {
        return transform.values.includes(String(row[transform.field] ?? ""));
      }
      const value = Number(row[transform.field]);
      if (!Number.isFinite(value)) return false;
      if (typeof transform.min === "number" && value < transform.min) return false;
      if (typeof transform.max === "number" && value > transform.max) return false;
      return true;
    }),
  );
}

export function stringifyValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function numericValue(value: string | number | null | undefined) {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function monthValue(value: string | number | null | undefined) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCMonth() + 1;
}

function quarterValue(value: string | number | null | undefined) {
  const month = monthValue(value);
  return month ? Math.ceil(month / 3) : null;
}

function yearValue(value: string | number | null | undefined) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCFullYear();
}

export function evaluateHighlightIndices(
  document: StudioDocument,
  stateName: string,
  categories: string[],
  rows: Array<Record<string, string | number | null>>,
) {
  const state = document.states[stateName];
  return state.highlights.map((rule) => {
    const selector = rule.selector;
    if (selector.kind === "rowIndex") {
      return {
        ...rule,
        indices: selector.indices.filter((index) => index >= 0 && index < categories.length),
      };
    }

    if (selector.kind === "categoryValue") {
      const values = new Set(selector.values.map(String));
      return {
        ...rule,
        indices: rows
          .map((row, index) => (values.has(String(row[selector.field] ?? "")) ? index : -1))
          .filter((value) => value >= 0),
      };
    }

    if (selector.kind === "numericRange") {
      return {
        ...rule,
        indices: rows
          .map((row, index) => {
            const value = numericValue(row[selector.field]);
            if (value === null) return -1;
            if (typeof selector.min === "number" && value < selector.min) return -1;
            if (typeof selector.max === "number" && value > selector.max) return -1;
            return index;
          })
          .filter((value) => value >= 0),
      };
    }

    if (selector.kind === "seriesValue") {
      const values = new Set(selector.values.map(String));
      return {
        ...rule,
        indices: rows
          .map((row, index) => (values.has(String(row[selector.field] ?? "")) ? index : -1))
          .filter((value) => value >= 0),
      };
    }

    return {
      ...rule,
      indices: rows
        .map((row, index) => {
          const value = row[selector.field];
          const matched =
            selector.part === "month"
              ? monthValue(value)
              : selector.part === "quarter"
                ? quarterValue(value)
                : yearValue(value);
          return selector.values.map(String).includes(String(matched)) ? index : -1;
        })
        .filter((value) => value >= 0),
    };
  });
}

function getThemeOptions(mode: ThemeMode) {
  const colors = getPalette(mode);
  return {
    chart: { backgroundColor: mode === "dark" ? colors.background : "transparent" },
    xAxis: {
      color: colors.axis,
      label: { color: colors.axis },
    },
    yAxis: {
      color: colors.axis,
      label: { color: colors.axis },
    },
    plot: {
      backgroundColor: mode === "dark" ? colors.background : colors.card,
      vertical: { lineColor: colors.grid },
      horizontal: { lineColor: colors.grid },
    },
    legend: {
      label: { color: colors.text },
    },
    series: {
      colors: [colors.orange, colors.black, colors.blue, colors.green, colors.pink],
    },
  };
}

function formatYAxis(value: number, format?: ChartSpec["options"]["yAxisLabelFormat"]) {
  if (format === "percent") return `${value}%`;
  if (format === "currency") return `$${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

export function documentToToastConfig(document: StudioDocument) {
  const rows = applyTransforms(document);
  const xKey = document.chart.mappings.x ?? document.dataset.schema.find((field) => field.role === "x")?.key;
  const yKey = document.chart.mappings.y ?? document.dataset.schema.find((field) => field.role === "y")?.key;
  const seriesKey = document.chart.mappings.series ?? document.dataset.schema.find((field) => field.role === "series")?.key;
  if (!xKey || !yKey) throw new Error("Choose both an X field and a Y field.");

  const categories = rows.map((row, index) => stringifyValue(row[xKey]) || `Row ${index + 1}`);
  const grouped = new Map<string, Array<number | null>>();
  rows.forEach((row, index) => {
    const name = seriesKey ? stringifyValue(row[seriesKey]) || "Series" : "Series";
    if (!grouped.has(name)) grouped.set(name, Array(rows.length).fill(null));
    grouped.get(name)![index] = numericValue(row[yKey]);
  });

  const series = Array.from(grouped.entries()).map(([name, data]) => ({ name, data }));
  const colors = getPalette(document.presentation.theme.mode);
  const commonOptions = {
    chart: { width: "auto", height: 520 },
    legend: { visible: document.chart.options.showLegend ?? true },
    xAxis: { title: xKey, label: { interval: Math.max(1, Math.floor(rows.length / 12)) } },
    yAxis: {
      title: yKey,
      label: {
        formatter: (value: string) => formatYAxis(Number(value), document.chart.options.yAxisLabelFormat),
      },
    },
    series: {
      selectable: true,
      stacked: document.chart.options.stacked,
      showDot: document.chart.type === "lollipop" || document.chart.type === "line" || document.chart.type === "area",
      dataLabels: { visible: false },
      spline: false,
    },
    tooltip: { enabled: true },
    theme: getThemeOptions(document.presentation.theme.mode),
  };

  if (document.chart.type === "scatter") {
    return {
      toastType: "scatter" as const,
      data: {
        series: Array.from(
          rows.reduce((map, row) => {
            const name = seriesKey ? stringifyValue(row[seriesKey]) || "Series" : "Series";
            const list = map.get(name) ?? [];
            list.push({
              x: numericValue(row[xKey]) ?? 0,
              y: numericValue(row[yKey]) ?? 0,
            });
            map.set(name, list);
            return map;
          }, new Map<string, Array<{ x: number; y: number }>>()),
        ).map(([name, data]) => ({ name, data })),
      },
      options: {
        ...commonOptions,
        xAxis: { title: xKey },
        yAxis: { title: yKey },
      },
      rows,
      categories,
      series,
    };
  }

  if (document.chart.type === "combo") {
    return {
      toastType: "combo" as const,
      data: {
        categories,
        series: {
          column: series,
          line: series.map((entry) => ({ name: `${entry.name} trend`, data: entry.data })),
        },
      },
      options: {
        ...commonOptions,
        series: {
          column: { stack: document.chart.options.stacked },
          line: { showDot: true },
        },
      },
      rows,
      categories,
      series,
    };
  }

  return {
    toastType: document.chart.type === "lollipop" ? "line" : document.chart.type,
    data: { categories, series },
    options: commonOptions,
    rows,
    categories,
    series,
  };
}

export function documentToStoryChartSpec(document: StudioDocument, stateName: string, mount: HTMLElement) {
  const toast = documentToToastConfig(document);
  if (!["bar", "column", "line", "area", "lollipop"].includes(document.chart.type)) {
    return null;
  }
  const highlightDefs = evaluateHighlightIndices(document, stateName, toast.categories, toast.rows);
  const annotations = document.states[stateName].annotations.map((annotation) => {
    if (annotation.type === "band") {
      return annotation;
    }
    if (annotation.type === "note") {
      return {
        id: annotation.id,
        type: "label" as const,
        anchor: { kind: "plotPercent" as const, x: annotation.position.x, y: annotation.position.y },
        text: annotation.text,
      };
    }
    if (annotation.anchor.kind === "dataPoint") {
      return {
        id: annotation.id,
        type: annotation.type,
        anchor: { kind: "dataPoint" as const, index: annotation.anchor.rowIndex },
        text: annotation.text,
        pointer: annotation.pointer,
        offset: annotation.offset,
      };
    }
    if (annotation.anchor.kind === "category") {
      const anchor = annotation.anchor;
      const category = stringifyValue(
        toast.rows.find((row) => stringifyValue(row[anchor.field]) === anchor.value)?.[anchor.field],
      );
      return {
        id: annotation.id,
        type: annotation.type,
        anchor: { kind: "category" as const, category },
        text: annotation.text,
        pointer: annotation.pointer,
        offset: annotation.offset,
      };
    }
    return {
      id: annotation.id,
      type: annotation.type,
      anchor: {
        kind: "category" as const,
        category: annotation.anchor.category,
        series: annotation.anchor.series,
      },
      text: annotation.text,
      pointer: annotation.pointer,
      offset: annotation.offset,
    };
  });

  return {
    spec: {
      mount,
      toast: {
        type: toast.toastType as "bar" | "column" | "line" | "area",
        data: toast.data as { categories: string[]; series: Array<{ name: string; data: Array<number | null> }> },
        options: toast.options,
      },
      theme: {
        vars: {
          "--sc-bg": getPalette(document.presentation.theme.mode).background,
          "--sc-text": getPalette(document.presentation.theme.mode).text,
          "--sc-muted": getPalette(document.presentation.theme.mode).muted,
          "--sc-accent": getPalette(document.presentation.theme.mode).pink,
          "--sc-series-0": getPalette(document.presentation.theme.mode).orange,
          "--sc-series-1": getPalette(document.presentation.theme.mode).black,
          "--sc-annotation-bg": getPalette(document.presentation.theme.mode).card,
          "--sc-annotation-border": getPalette(document.presentation.theme.mode).axis,
        },
      },
      states: {
        [stateName]: {
          highlights: highlightDefs.map((rule) => ({
            kind: "byIndex" as const,
            indices: rule.indices,
            color: rule.style.color ?? getPalette(document.presentation.theme.mode).pink,
            priority: rule.priority,
          })),
          annotations: annotations.map((annotation) =>
            annotation.type === "band"
              ? {
                  id: annotation.id,
                  type: "band" as const,
                  axis: annotation.axis,
                  range: annotation.range,
                }
              : annotation,
          ),
        },
      },
      initialState: stateName,
    },
    predicates: [],
  };
}

export function mountPreviewChart(document: StudioDocument, stateName: string, mount: HTMLElement) {
  const toastConfig = documentToToastConfig(document);
  const colors = getPalette(document.presentation.theme.mode);
  const chartApi = (window as unknown as {
    toastui?: {
      Chart?: Record<
        string,
        (args: { el: HTMLElement; data: unknown; options: unknown }) => {
          destroy?: () => void;
          resize?: (size: { width: number; height: number }) => void;
          setData?: (data: unknown) => void;
          setOptions?: (options: unknown) => void;
          updateOptions?: (options: unknown) => void;
        }
      >;
    };
  }).toastui?.Chart;

  const methodMap = {
    bar: "barChart",
    column: "columnChart",
    line: "lineChart",
    area: "areaChart",
    scatter: "scatterChart",
    combo: "columnLineChart",
    lollipop: "lineChart",
  } as const;

  if (!chartApi?.[methodMap[document.chart.type]]) {
    throw new Error("Toast UI Chart is not available on window.");
  }

  const story = documentToStoryChartSpec(document, stateName, mount);
  if (story) {
    const instance = createStoryChart({
      ...story.spec,
      toast: {
        ...story.spec.toast,
        chartFactory: ({ type, el, data, options }) => {
          const method = methodMap[type];
          const chart = chartApi[method]({ el, data, options });
          (
            mount as HTMLElement & {
              __storychartsToastChart__?: typeof chart & {
                getPlotBox?: () => { x: number; y: number; width: number; height: number } | null;
              };
            }
          ).__storychartsToastChart__ = chart as typeof chart & {
            getPlotBox?: () => { x: number; y: number; width: number; height: number } | null;
          };
          return {
            destroy: () => chart.destroy?.(),
            resize: () => chart.resize?.({ width: el.clientWidth, height: el.clientHeight }),
            setData: (nextData) => (chart as { setData?: (value: unknown) => void }).setData?.(nextData),
            setOptions: (nextOptions) => (chart as { setOptions?: (value: unknown) => void }).setOptions?.(nextOptions),
            updateOptions: (nextOptions) => (chart as { updateOptions?: (value: unknown) => void }).updateOptions?.(nextOptions),
            getPlotBox: () => {
              const plot = (chart as { store?: { state?: { layout?: { plot?: { x: number; y: number; width: number; height: number } } } } }).store?.state?.layout?.plot;
              return plot ?? null;
            },
          };
        },
      },
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        instance.resize();
      });
    });
    return {
      destroy: () => {
        delete (mount as HTMLElement & { __storychartsToastChart__?: unknown }).__storychartsToastChart__;
        instance.destroy();
      },
    };
  }

  const chart = chartApi[methodMap[document.chart.type]]({
    el: mount,
    data: toastConfig.data,
    options: toastConfig.options,
  });
  (
    mount as HTMLElement & {
      __storychartsToastChart__?: typeof chart;
    }
  ).__storychartsToastChart__ = chart;

  // Minimal note rendering for non-core chart paths.
  const overlay = globalThis.document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.pointerEvents = "none";
  mount.style.position = "relative";
  mount.appendChild(overlay);
  const renderNotes = () =>
    renderStaticNotes(mount, overlay, document.states[stateName].annotations, (note) => {
      note.style.background = colors.card;
      note.style.color = colors.text;
      note.style.borderColor = colors.axis;
    });
  const resizeHandler = () => {
    chart.resize?.({ width: mount.clientWidth, height: mount.clientHeight });
    renderNotes();
  };
  requestAnimationFrame(renderNotes);
  globalThis.addEventListener("resize", resizeHandler);

  return {
    destroy: () => {
      delete (mount as HTMLElement & { __storychartsToastChart__?: unknown }).__storychartsToastChart__;
      globalThis.removeEventListener("resize", resizeHandler);
      overlay.remove();
      chart.destroy?.();
    },
  };
}

export function createSampleDocument(): StudioDocument {
  const loaded = createDatasetFromRows("job-cuts", jobCutsRows, "inline");
  const now = new Date().toISOString();
  return {
    version: "1",
    meta: {
      id: createId("doc"),
      name: "January job cuts sample",
      createdAt: now,
      updatedAt: now,
    },
    dataset: loaded.dataset,
    chart: {
      type: "column",
      mappings: {
        x: "month",
        y: "jobCuts",
      },
      options: {
        showLegend: false,
        yAxisLabelFormat: "number",
        xAxisTimeUnit: "month",
      },
    },
    presentation: {
      theme: {
        mode: "light",
        paletteId: "newsroom-default",
      },
      framing: {
        title: "Worst January for Job-Cut Announcements Since 2009",
        subtitle: "Hiring intentions also slipped from same month a year ago",
        source: "Source: Challenger, Gray & Christmas Inc.",
        byline: "Sample by StoryCharts Studio",
      },
    },
    states: {
      baseline: {
        highlights: [
          {
            id: createId("hl"),
            selector: { kind: "datePart", field: "month", part: "month", values: [1] },
            style: { color: "#000000" },
            legendLabel: "Each January",
            priority: 1,
          },
        ],
        annotations: [
          {
            id: createId("ann"),
            type: "callout",
            anchor: { kind: "dataPoint", rowIndex: jobCutsRows.length - 1 },
            text: "Up 118%\nvs year ago",
            pointer: true,
            offset: { x: -8, y: -74 },
          },
        ],
      },
      highlight_peak: {
        highlights: [
          {
            id: createId("hl"),
            selector: { kind: "datePart", field: "month", part: "month", values: [1] },
            style: { color: "#000000" },
            legendLabel: "Each January",
            priority: 1,
          },
          {
            id: createId("hl"),
            selector: { kind: "numericRange", field: "jobCuts", min: 100000 },
            style: { color: "#f73ba9" },
            legendLabel: "Above 100K",
            priority: 2,
          },
        ],
        annotations: [
          {
            id: createId("ann"),
            type: "band",
            axis: "y",
            range: [100000, 300000],
            text: "Above 100K",
          },
        ],
      },
    },
    initialState: "baseline",
  };
}

export function duplicateState(document: StudioDocument, stateName: string) {
  const nextName = `${stateName}_copy`;
  return {
    ...document,
    states: {
      ...document.states,
      [nextName]: JSON.parse(JSON.stringify(document.states[stateName])) as StoryStateSpec,
    },
  };
}

export function serializeDocument(document: StudioDocument) {
  return JSON.stringify(document, null, 2);
}

export function parseDocument(text: string) {
  const parsed = JSON.parse(text) as StudioDocument;
  if (parsed.version !== "1") throw new Error("Unsupported StoryCharts Studio document version.");
  return parsed;
}

export function exportDocumentToHtml(document: StudioDocument, stateName: string) {
  const escaped = JSON.stringify(document);
  const paletteSource = JSON.stringify(palette);
  const exportColors = getPalette(document.presentation.theme.mode);
  const exportPlotSurface = document.presentation.theme.mode === "dark" ? exportColors.background : exportColors.card;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${document.presentation.framing.title}</title>
    <link rel="stylesheet" href="https://uicdn.toast.com/chart/latest/toastui-chart.min.css" />
    <style>
      body{margin:0;background:${exportColors.background};color:${exportColors.text};font-family:"IBM Plex Sans","Avenir Next","Segoe UI",sans-serif;}
      .page{padding:32px 24px 24px;max-width:1280px;margin:0 auto;}
      .frame{display:grid;gap:18px;}
      .kicker{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${exportColors.muted};}
      h1{margin:0;font-size:clamp(32px,4vw,58px);line-height:1.02;letter-spacing:-.03em;}
      .subtitle{margin:0;font-size:clamp(18px,2vw,30px);color:${exportColors.text};max-width:42ch;}
      .chart-wrap{position:relative;background:${exportColors.card};border:1px solid ${exportColors.grid};border-radius:24px;padding:20px;overflow:visible;}
      #chart{height:560px;position:relative;background:${exportPlotSurface};border-radius:18px;overflow:visible;}
      #chart .toastui-chart-wrapper{background:${exportPlotSurface} !important;border-radius:18px;}
      #chart svg{background:${exportPlotSurface} !important;border-radius:18px;}
      #chart text{fill:${exportColors.axis} !important;}
      #chart .toastui-chart-export-menu{background:${exportColors.card};color:${exportColors.text};}
      .meta{display:flex;flex-wrap:wrap;gap:12px 18px;font-size:14px;color:${exportColors.muted};}
      .note{position:absolute;transform:translate(-50%,-50%);background:${exportColors.card};border:1px solid ${exportColors.axis};padding:6px 10px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.12);}
    </style>
  </head>
  <body>
    <div class="page">
      <div class="frame">
        <div class="kicker">StoryCharts Studio Export</div>
        <h1>${document.presentation.framing.title}</h1>
        ${document.presentation.framing.subtitle ? `<p class="subtitle">${document.presentation.framing.subtitle}</p>` : ""}
        <div class="chart-wrap"><div id="chart"></div></div>
        <div class="meta">
          ${document.presentation.framing.source ? `<div>${document.presentation.framing.source}</div>` : ""}
          ${document.presentation.framing.footnote ? `<div>${document.presentation.framing.footnote}</div>` : ""}
          ${document.presentation.framing.byline ? `<div>${document.presentation.framing.byline}</div>` : ""}
        </div>
      </div>
    </div>
    <script src="https://uicdn.toast.com/chart/latest/toastui-chart.min.js"></script>
    <script>
      const documentSpec = ${escaped};
      const stateName = ${JSON.stringify(stateName)};
      const palette = ${paletteSource};
      const host = document.getElementById("chart");
      const colors = palette[documentSpec.presentation.theme.mode];
      const rows = documentSpec.dataset.raw.rows.filter((row) => documentSpec.dataset.transforms.every((transform) => {
        if (transform.type === "filterEquals") return transform.values.includes(String(row[transform.field] ?? ""));
        const value = Number(row[transform.field]);
        if (!Number.isFinite(value)) return false;
        if (typeof transform.min === "number" && value < transform.min) return false;
        if (typeof transform.max === "number" && value > transform.max) return false;
        return true;
      }));
      const xKey = documentSpec.chart.mappings.x || documentSpec.dataset.schema.find((field) => field.role === "x")?.key;
      const yKey = documentSpec.chart.mappings.y || documentSpec.dataset.schema.find((field) => field.role === "y")?.key;
      const seriesKey = documentSpec.chart.mappings.series || documentSpec.dataset.schema.find((field) => field.role === "series")?.key;
      const categories = rows.map((row, index) => String(row[xKey] ?? ("Row " + (index + 1))));
      const grouped = new Map();
      rows.forEach((row, index) => {
        const name = seriesKey ? String(row[seriesKey] ?? "Series") : "Series";
        if (!grouped.has(name)) grouped.set(name, Array(rows.length).fill(null));
        grouped.get(name)[index] = Number(row[yKey]);
      });
      const series = Array.from(grouped.entries()).map(([name, data]) => ({ name, data }));
      const chartMethod = {
        bar: "barChart",
        column: "columnChart",
        line: "lineChart",
        area: "areaChart",
        scatter: "scatterChart",
        combo: "columnLineChart",
        lollipop: "lineChart",
      }[documentSpec.chart.type];
      const options = {
        chart: { width: host.clientWidth, height: 560 },
        legend: { visible: documentSpec.chart.options.showLegend ?? true },
        tooltip: { enabled: true },
        theme: {
          chart: { backgroundColor: colors.background },
          xAxis: { color: colors.axis, label: { color: colors.axis } },
          yAxis: { color: colors.axis, label: { color: colors.axis } },
          plot: {
            backgroundColor: documentSpec.presentation.theme.mode === "dark" ? colors.background : colors.card,
            vertical: { lineColor: colors.grid },
            horizontal: { lineColor: colors.grid }
          },
          series: { colors: [colors.orange, colors.black, colors.blue, colors.green, colors.pink] }
        },
        series: { showDot: ["line","area","lollipop"].includes(documentSpec.chart.type) },
      };
      const data = documentSpec.chart.type === "scatter"
        ? { series: Array.from(rows.reduce((map, row) => {
            const name = seriesKey ? String(row[seriesKey] ?? "Series") : "Series";
            const list = map.get(name) ?? [];
            list.push({ x: Number(row[xKey] ?? 0), y: Number(row[yKey] ?? 0) });
            map.set(name, list);
            return map;
          }, new Map()).entries()).map(([name, data]) => ({ name, data })) }
        : documentSpec.chart.type === "combo"
          ? { categories, series: { column: series, line: series.map((entry) => ({ name: entry.name + " trend", data: entry.data })) } }
          : { categories, series };
      const chart = window.toastui.Chart[chartMethod]({ el: host, data, options });
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.pointerEvents = "none";
      host.appendChild(overlay);
      const normalizePlotBox = (plot) => {
        if (!plot) return null;
        const x = plot.x;
        const y = plot.y;
        const width = plot.width ?? plot.w;
        const height = plot.height ?? plot.h;
        if (![x, y, width, height].every((value) => typeof value === "number" && Number.isFinite(value))) return null;
        return { x, y, width, height };
      };
      const getPlotBox = () => {
        const fromStore = normalizePlotBox(chart.store?.state?.layout?.plot);
        if (fromStore) return fromStore;
        const rootRect = host.getBoundingClientRect();
        const plotArea = host.querySelector(".toastui-chart-plot-area");
        if (!plotArea) return { x: 0, y: 0, width: rootRect.width, height: rootRect.height };
        const plotRect = plotArea.getBoundingClientRect();
        return {
          x: plotRect.left - rootRect.left,
          y: plotRect.top - rootRect.top,
          width: plotRect.width,
          height: plotRect.height,
        };
      };
      const getAxisLimit = () => {
        const axisName = documentSpec.chart.type === "bar" ? "xAxis" : "yAxis";
        const limit = chart.store?.state?.scale?.[axisName]?.limit;
        if (!limit) return null;
        if (typeof limit.min !== "number" || typeof limit.max !== "number" || !Number.isFinite(limit.min) || !Number.isFinite(limit.max) || limit.max === limit.min) {
          return null;
        }
        return { min: limit.min, max: limit.max };
      };
      const projectValueToY = (value, plotBox) => {
        const limit = getAxisLimit();
        if (!limit) {
          const maxValue = Math.max(1, ...rows.map((row) => Number(row[yKey] ?? 0)));
          return plotBox.y + plotBox.height - (Math.max(0, value) / maxValue) * plotBox.height;
        }
        const ratio = (value - limit.min) / (limit.max - limit.min);
        return plotBox.y + plotBox.height - ratio * plotBox.height;
      };
      const clampBoxToPlot = (box, plotBox) => {
        const x = Math.max(box.x, plotBox.x);
        const y = Math.max(box.y, plotBox.y);
        const right = Math.min(box.x + box.width, plotBox.x + plotBox.width);
        const bottom = Math.min(box.y + box.height, plotBox.y + plotBox.height);
        return {
          x,
          y,
          width: Math.max(0, right - x),
          height: Math.max(0, bottom - y),
        };
      };
      const readRenderedBars = () => {
        const svg = host.querySelector("svg");
        if (!svg) return [];
        const rootRect = host.getBoundingClientRect();
        const plotBox = getPlotBox();
        const out = [];
        svg.querySelectorAll("rect, path").forEach((node) => {
          if (typeof node.getBBox !== "function" || typeof node.getScreenCTM !== "function") return;
          const ctm = node.getScreenCTM();
          if (!ctm) return;
          let box;
          try {
            box = node.getBBox();
          } catch {
            return;
          }
          if (box.width < 1 || box.height < 1) return;
          const fillAttr = node.getAttribute("fill");
          const fillStyle = getComputedStyle(node).fill;
          const fill = fillAttr && fillAttr !== "none" ? fillAttr : fillStyle;
          if (!fill || fill === "none" || fill === "transparent" || fill === "rgba(0, 0, 0, 0)") return;
          const p1 = new DOMPoint(box.x, box.y).matrixTransform(ctm);
          const p2 = new DOMPoint(box.x + box.width, box.y + box.height).matrixTransform(ctm);
          const x = Math.min(p1.x, p2.x) - rootRect.left;
          const y = Math.min(p1.y, p2.y) - rootRect.top;
          const width = Math.abs(p2.x - p1.x);
          const height = Math.abs(p2.y - p1.y);
          const cx = x + width / 2;
          if (cx < plotBox.x - 2 || cx > plotBox.x + plotBox.width + 2) return;
          if (y + height < plotBox.y - 2 || y > plotBox.y + plotBox.height + 2) return;
          if (width > plotBox.width * 0.85 && height > plotBox.height * 0.85) return;
          const clamped = clampBoxToPlot({ x, y, width, height }, plotBox);
          if (clamped.width < 1 || clamped.height < 1) return;
          out.push(clamped);
        });
        return out.sort((a, b) => a.x - b.x);
      };
      const readRenderedPoints = () => {
        const svg = host.querySelector("svg");
        if (!svg) return [];
        const rootRect = host.getBoundingClientRect();
        const plotBox = getPlotBox();
        const out = [];
        svg.querySelectorAll("circle").forEach((node) => {
          const ctm = node.getScreenCTM();
          if (!ctm) return;
          const cx = Number(node.getAttribute("cx"));
          const cy = Number(node.getAttribute("cy"));
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
          const point = new DOMPoint(cx, cy).matrixTransform(ctm);
          const x = point.x - rootRect.left;
          const y = point.y - rootRect.top;
          if (x < plotBox.x - 2 || x > plotBox.x + plotBox.width + 2) return;
          if (y < plotBox.y - 2 || y > plotBox.y + plotBox.height + 2) return;
          out.push({ x, y });
        });
        return out.sort((a, b) => a.x - b.x);
      };
      const buildGeometry = () => {
        const plotBox = getPlotBox();
        const isBarLike = ["bar", "column", "combo"].includes(documentSpec.chart.type);
        const isPointLike = ["line", "area", "lollipop", "scatter", "combo"].includes(documentSpec.chart.type);
        const renderedBars = isBarLike ? readRenderedBars() : [];
        const renderedPoints = isPointLike ? readRenderedPoints() : [];
        const expectedBars = categories.length * Math.max(1, series.length);
        const barsBySeries = {};
        const pointsBySeries = {};
        series.forEach((entry, seriesIndex) => {
          const seriesBars = [];
          const seriesPoints = [];
          if (renderedBars.length === expectedBars && renderedBars.length > 0) {
            renderedBars.filter((_, index) => index % series.length === seriesIndex).forEach((box) => {
              seriesBars.push(box);
              seriesPoints.push({ x: box.x + box.width / 2, y: box.y });
            });
          } else if (renderedPoints.length >= categories.length * Math.max(1, series.length) && renderedPoints.length > 0) {
            renderedPoints.filter((_, index) => index % series.length === seriesIndex).slice(0, categories.length).forEach((point) => {
              seriesPoints.push(point);
              seriesBars.push({ x: point.x - 2, y: point.y - 2, width: 4, height: 4 });
            });
          } else {
            const bandWidth = plotBox.width / Math.max(1, categories.length);
            const itemWidth = Math.max(4, (bandWidth * 0.7) / Math.max(1, series.length));
            entry.data.forEach((rawValue, index) => {
              const value = Number(rawValue ?? 0);
              const x = plotBox.x + index * bandWidth + (bandWidth * 0.15 + seriesIndex * itemWidth);
              const y = projectValueToY(value, plotBox);
              const zeroY = projectValueToY(0, plotBox);
              const top = Math.min(y, zeroY);
              const height = Math.max(2, Math.abs(zeroY - y));
              seriesBars.push({ x, y: top, width: itemWidth, height });
              seriesPoints.push({ x: x + itemWidth / 2, y });
            });
          }
          barsBySeries[entry.name] = seriesBars;
          pointsBySeries[entry.name] = seriesPoints;
        });
        return { plotBox, barsBySeries, pointsBySeries };
      };
      const getCategoryIndex = (annotation) => {
        if (annotation.anchor.kind === "dataPoint") return annotation.anchor.rowIndex;
        if (annotation.anchor.kind === "category") return rows.findIndex((row) => String(row[annotation.anchor.field] ?? "") === annotation.anchor.value);
        if (annotation.anchor.kind === "seriesCategory") return categories.indexOf(annotation.anchor.category);
        return -1;
      };
      const getSeriesNameForAnnotation = (annotation) => {
        if (annotation.anchor?.kind === "seriesCategory") return annotation.anchor.series;
        return series[0]?.name;
      };
      const getAnchorPoint = (annotation, geometry) => {
        if (annotation.type === "note") {
          return {
            x: geometry.plotBox.x + (geometry.plotBox.width * annotation.position.x) / 100,
            y: geometry.plotBox.y + (geometry.plotBox.height * annotation.position.y) / 100,
          };
        }
        const index = getCategoryIndex(annotation);
        if (index < 0) return null;
        const seriesName = getSeriesNameForAnnotation(annotation);
        return geometry.pointsBySeries[seriesName]?.[index] ?? geometry.pointsBySeries[series[0]?.name]?.[index] ?? null;
      };
      const evaluateHighlightIndices = (rule) => {
        if (rule.selector.kind === "rowIndex") return rule.selector.indices;
        if (rule.selector.kind === "categoryValue") {
          const values = new Set(rule.selector.values.map(String));
          return rows.map((row, index) => values.has(String(row[rule.selector.field] ?? "")) ? index : -1).filter((index) => index >= 0);
        }
        if (rule.selector.kind === "numericRange") {
          return rows.map((row, index) => {
            const value = Number(row[rule.selector.field]);
            if (!Number.isFinite(value)) return -1;
            if (typeof rule.selector.min === "number" && value < rule.selector.min) return -1;
            if (typeof rule.selector.max === "number" && value > rule.selector.max) return -1;
            return index;
          }).filter((index) => index >= 0);
        }
        if (rule.selector.kind === "seriesValue") {
          const values = new Set(rule.selector.values.map(String));
          return rows.map((row, index) => values.has(String(row[rule.selector.field] ?? "")) ? index : -1).filter((index) => index >= 0);
        }
        return rows.map((row, index) => {
          const date = new Date(String(row[rule.selector.field] ?? ""));
          if (Number.isNaN(date.getTime())) return -1;
          const partValue = rule.selector.part === "month"
            ? date.getUTCMonth() + 1
            : rule.selector.part === "quarter"
              ? Math.ceil((date.getUTCMonth() + 1) / 3)
              : date.getUTCFullYear();
          return rule.selector.values.map(String).includes(String(partValue)) ? index : -1;
        }).filter((index) => index >= 0);
      };
      const renderOverlay = () => {
        overlay.replaceChildren();
        const geometry = buildGeometry();
        const plotBox = geometry.plotBox;
        const state = documentSpec.states[stateName] || { highlights: [], annotations: [] };
        state.highlights.forEach((rule) => {
          const seriesNames = series.length ? series.map((entry) => entry.name) : ["Series"];
          evaluateHighlightIndices(rule).forEach((index) => {
            seriesNames.forEach((seriesName) => {
              const marker = document.createElement("div");
              marker.style.position = "absolute";
              marker.style.background = rule.style.color || colors.pink;
              marker.style.opacity = String(rule.style.opacity ?? 0.92);
              const barBox = geometry.barsBySeries[seriesName]?.[index];
              const point = geometry.pointsBySeries[seriesName]?.[index];
              if (barBox && ["bar", "column", "combo"].includes(documentSpec.chart.type)) {
                marker.style.left = barBox.x + "px";
                marker.style.top = barBox.y + "px";
                marker.style.width = barBox.width + "px";
                marker.style.height = barBox.height + "px";
                marker.style.borderRadius = "0";
              } else if (point) {
                marker.style.width = "12px";
                marker.style.height = "12px";
                marker.style.borderRadius = "999px";
                marker.style.left = point.x + "px";
                marker.style.top = point.y + "px";
                marker.style.transform = "translate(-50%, -50%)";
                marker.style.boxShadow = "0 0 0 3px rgba(255,255,255,.55)";
              } else {
                return;
              }
              overlay.appendChild(marker);
            });
          });
        });
        state.annotations.forEach((annotation) => {
          if (annotation.type === "note") {
            const node = document.createElement("div");
            node.className = "note";
            node.textContent = annotation.text;
            const anchor = getAnchorPoint(annotation, geometry);
            node.style.left = anchor.x + "px";
            node.style.top = anchor.y + "px";
            overlay.appendChild(node);
            return;
          }
          if (annotation.type === "band") {
            const band = document.createElement("div");
            band.style.position = "absolute";
            band.style.background = "rgba(247,59,169,.16)";
            band.style.border = "1px solid rgba(247,59,169,.35)";
            band.style.borderRadius = "6px";
            if (annotation.axis === "x") {
              const startIndex = Math.max(0, categories.indexOf(String(annotation.range[0])));
              const endIndex = Math.max(startIndex, categories.indexOf(String(annotation.range[1])));
              const bandWidth = plotBox.width / Math.max(1, categories.length);
              band.style.left = plotBox.x + startIndex * bandWidth + "px";
              band.style.top = plotBox.y + "px";
              band.style.width = Math.max(bandWidth, (endIndex - startIndex + 1) * bandWidth) + "px";
              band.style.height = plotBox.height + "px";
            } else {
              const top = projectValueToY(Math.max(Number(annotation.range[0]), Number(annotation.range[1])), plotBox);
              const bottom = projectValueToY(Math.min(Number(annotation.range[0]), Number(annotation.range[1])), plotBox);
              band.style.left = plotBox.x + "px";
              band.style.top = Math.min(top, bottom) + "px";
              band.style.width = plotBox.width + "px";
              band.style.height = Math.max(3, Math.abs(bottom - top)) + "px";
            }
            overlay.appendChild(band);
            return;
          }
          const point = getAnchorPoint(annotation, geometry);
          if (!point) return;
          const node = document.createElement("div");
          node.className = "note";
          node.style.borderRadius = annotation.type === "label" ? "10px" : "12px";
          node.style.padding = annotation.type === "label" ? "4px 8px" : "8px 10px";
          node.textContent = annotation.text;
          node.style.left = point.x + (annotation.offset?.x || 0) + "px";
          node.style.top = point.y + (annotation.offset?.y || -40) + "px";
          node.style.transform = annotation.type === "label" ? "translate(-50%, -50%)" : "translate(-50%, -100%)";
          if (annotation.pointer) {
            const pointer = document.createElement("span");
            pointer.style.position = "absolute";
            pointer.style.left = "50%";
            pointer.style.bottom = "-10px";
            pointer.style.width = "2px";
            pointer.style.height = "10px";
            pointer.style.background = "currentColor";
            pointer.style.transform = "translateX(-50%)";
            node.appendChild(pointer);
          }
          overlay.appendChild(node);
        });
      };
      const syncOverlay = () => requestAnimationFrame(() => requestAnimationFrame(renderOverlay));
      syncOverlay();
      addEventListener("resize", () => {
        chart.resize?.({ width: host.clientWidth, height: 560 });
        syncOverlay();
      });
    </script>
  </body>
</html>`;
}
