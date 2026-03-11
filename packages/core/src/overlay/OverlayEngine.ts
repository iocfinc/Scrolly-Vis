import type { GeometryRegistry } from "../geometry/GeometryRegistry";
import { renderBand } from "./annotations/band";
import { renderCallout } from "./annotations/callout";
import { renderLabel } from "./annotations/label";
import type { AnnotationSpec, ToastData } from "../types";

export class OverlayEngine {
  private readonly rootEl: HTMLElement;
  private readonly highlightsLayer: HTMLElement;
  private readonly annotationsLayer: HTMLElement;

  constructor(container: HTMLElement, highlightMode: "behind" | "front" = "behind") {
    this.rootEl = document.createElement("div");
    this.rootEl.className = "sc-overlay-root";
    this.rootEl.style.position = "absolute";
    this.rootEl.style.inset = "0";
    this.rootEl.style.pointerEvents = "none";

    this.highlightsLayer = document.createElement("div");
    this.highlightsLayer.className = "sc-layer sc-layer-highlights";
    this.highlightsLayer.style.position = "absolute";
    this.highlightsLayer.style.inset = "0";

    this.annotationsLayer = document.createElement("div");
    this.annotationsLayer.className = "sc-layer sc-layer-annotations";
    this.annotationsLayer.style.position = "absolute";
    this.annotationsLayer.style.inset = "0";

    if (highlightMode === "behind") {
      this.rootEl.append(this.highlightsLayer, this.annotationsLayer);
    } else {
      this.rootEl.append(this.annotationsLayer, this.highlightsLayer);
    }
    container.style.position = container.style.position || "relative";
    container.appendChild(this.rootEl);
  }

  getHighlightLayerEl(): HTMLElement {
    return this.highlightsLayer;
  }

  renderAnnotations(args: {
    annotations: AnnotationSpec[];
    geometry: GeometryRegistry;
    data: ToastData;
    viewportWidth?: number;
  }): void {
    this.annotationsLayer.replaceChildren();
    const vw = args.viewportWidth ?? window.innerWidth;
    const isMobile = vw < 768;

    for (const ann of args.annotations) {
      if (ann.visibleOn) {
        if (isMobile && ann.visibleOn.mobile === false) continue;
        if (!isMobile && ann.visibleOn.desktop === false) continue;
      }

      if (ann.type === "band") {
        this.annotationsLayer.appendChild(renderBand(ann, args.geometry.getSnapshot().plotBox, args.data));
        continue;
      }

      const anchor = args.geometry.resolveAnchor(ann.anchor, args.data);
      if (!anchor) continue;
      if (ann.type === "callout") {
        this.annotationsLayer.appendChild(renderCallout(ann, anchor));
        continue;
      }
      this.annotationsLayer.appendChild(renderLabel(ann, anchor));
    }
  }

  destroy(): void {
    this.rootEl.remove();
  }
}
