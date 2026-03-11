import type { ChartState, ScrollamaLike, StoryBindings } from "../types";

export type ScrollCallbacks = {
  applyState: (state: string | ChartState) => void;
};

export class ScrollBinder {
  private unbound = false;

  bind(scrollama: ScrollamaLike, bindings: StoryBindings, callbacks: ScrollCallbacks): void {
    scrollama
      .setup({ step: bindings.steps, offset: bindings.offset })
      .onStepEnter((resp) => {
        if (this.unbound) return;
        const mapped = bindings.mapStepToState(resp.element, resp.index);
        callbacks.applyState(mapped);
      });

    if (bindings.rollbackOnExit && scrollama.onStepExit) {
      scrollama.onStepExit(() => {
        if (this.unbound) return;
        callbacks.applyState({ annotations: [] });
      });
    }
  }

  destroy(): void {
    this.unbound = true;
  }
}
