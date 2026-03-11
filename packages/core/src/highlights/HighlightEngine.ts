import type { GeometryRegistry } from "../geometry/GeometryRegistry";
import type { HighlightRule, PredicateFn, ToastData } from "../types";
import { resolveHighlightTargets, type HighlightTarget } from "./resolveTargets";

export class HighlightEngine {
  private readonly layerEl: HTMLElement;

  constructor(layerEl: HTMLElement) {
    this.layerEl = layerEl;
  }

  render(args: {
    data: ToastData;
    rules: HighlightRule[];
    geometry: GeometryRegistry;
    predicates: Map<string, PredicateFn>;
  }): void {
    this.layerEl.replaceChildren();
    const targets = resolveHighlightTargets(args.data, args.rules, args.predicates);
    const byKey = new Map<string, HighlightTarget>();

    targets.forEach((t) => {
      const key = `${t.series}:${t.index}`;
      const prev = byKey.get(key);
      if (!prev || t.priority >= prev.priority) {
        byKey.set(key, t);
      }
    });

    for (const target of byKey.values()) {
      const box = args.geometry.getSnapshot().bars[target.series]?.[target.index];
      if (!box) continue;
      const rect = document.createElement("div");
      rect.className = "sc-highlight";
      rect.style.position = "absolute";
      rect.style.left = `${box.x}px`;
      rect.style.top = `${box.y}px`;
      rect.style.width = `${box.w}px`;
      rect.style.height = `${box.h}px`;
      rect.style.background = target.color;
      rect.style.opacity = "0.9";
      rect.style.transition = "opacity 240ms ease, background-color 240ms ease";
      this.layerEl.appendChild(rect);
    }
  }
}
