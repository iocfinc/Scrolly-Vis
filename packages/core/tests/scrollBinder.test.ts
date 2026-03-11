// @vitest-environment jsdom
import { describe, expect, test, vi } from "vitest";
import { ScrollBinder } from "../src/scroll/ScrollBinder";

describe("ScrollBinder", () => {
  test("maps step enter to applyState", () => {
    let enterCb: ((resp: { element: Element; index: number; direction: string }) => void) | undefined;

    const scrollama = {
      setup: vi.fn().mockReturnThis(),
      onStepEnter: vi.fn((cb) => {
        enterCb = cb;
        return scrollama;
      }),
    };

    const applyState = vi.fn();
    const binder = new ScrollBinder();
    binder.bind(scrollama, {
      steps: ".step",
      mapStepToState: (_el, idx) => `state-${idx}`,
    }, { applyState });

    enterCb?.({ element: document.createElement("div"), index: 2, direction: "down" });

    expect(applyState).toHaveBeenCalledWith("state-2");
  });
});
