import type { AnchorPoint } from "../../geometry/GeometryRegistry";
import type { AnnotationSpec } from "../../types";

export function renderCallout(ann: Extract<AnnotationSpec, { type: "callout" }>, anchor: AnchorPoint): HTMLElement {
  const el = document.createElement("div");
  el.className = `sc-annotation sc-callout ${ann.style?.className ?? ""}`.trim();
  el.style.position = "absolute";
  const ox = ann.offset?.x ?? 0;
  const oy = ann.offset?.y ?? -12;
  el.style.left = `${anchor.x + ox}px`;
  el.style.top = `${anchor.y + oy}px`;
  el.style.transform = "translate(-50%, -100%)";
  el.style.transition = "opacity 260ms ease, transform 260ms ease";
  if (ann.style?.background) el.style.background = ann.style.background;
  if (ann.style?.color) el.style.color = ann.style.color;
  if (ann.style?.borderColor) el.style.borderColor = ann.style.borderColor;
  el.textContent = ann.text;

  if (ann.pointer) {
    const pointer = document.createElement("span");
    pointer.className = "sc-pointer";
    pointer.style.position = "absolute";
    pointer.style.left = "50%";
    pointer.style.bottom = "-10px";
    pointer.style.width = "2px";
    pointer.style.height = "10px";
    pointer.style.background = "currentColor";
    pointer.style.transform = "translateX(-50%)";
    el.appendChild(pointer);
  }
  return el;
}
