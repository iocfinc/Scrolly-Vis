import { StateDiffEngine, type StateSnapshot } from "../state/StateDiffEngine";
import type { ChartState } from "../types";

export class StoryController {
  private readonly states: Record<string, ChartState>;
  private current: StateSnapshot;
  private readonly diff = new StateDiffEngine();

  constructor(states: Record<string, ChartState> | undefined, initial: StateSnapshot) {
    this.states = states ?? {};
    this.current = initial;
  }

  resolveState(stateNameOrObject: string | ChartState): ChartState {
    if (typeof stateNameOrObject === "string") {
      const state = this.states[stateNameOrObject];
      if (!state) throw new Error(`Unknown story state: ${stateNameOrObject}`);
      return state;
    }
    return stateNameOrObject;
  }

  preview(stateNameOrObject: string | ChartState): { snapshot: StateSnapshot; transition?: ChartState["transition"] } {
    const resolved = this.resolveState(stateNameOrObject);
    const result = this.diff.apply(this.current, resolved);
    return { snapshot: result.next, transition: result.transition };
  }

  commit(snapshot: StateSnapshot): void {
    this.current = snapshot;
  }

  getCurrent(): StateSnapshot {
    return this.current;
  }
}
