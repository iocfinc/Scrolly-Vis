import type { ChartState, PartialToastDataPatch, PartialToastOptionsPatch, ToastData, ToastOptions, TransitionSpec } from "../types";
import { deepMerge } from "../utils";

export type StateSnapshot = {
  data: ToastData;
  options: ToastOptions;
  highlights: ChartState["highlights"];
  annotations: ChartState["annotations"];
};

export type StateApplyResult = {
  next: StateSnapshot;
  transition?: TransitionSpec;
};

export class StateDiffEngine {
  apply(current: StateSnapshot, incoming: ChartState): StateApplyResult {
    const nextData = applyDataPatch(current.data, incoming.dataPatch);
    const nextOptions = applyOptionsPatch(current.options, incoming.optionsPatch);

    return {
      next: {
        data: nextData,
        options: nextOptions,
        highlights: incoming.highlights ?? current.highlights,
        annotations: incoming.annotations ?? current.annotations,
      },
      transition: incoming.transition,
    };
  }
}

function applyDataPatch(current: ToastData, patch?: PartialToastDataPatch): ToastData {
  if (!patch) return current;
  return {
    categories: patch.categories ?? current.categories,
    series: patch.series ?? current.series,
  };
}

function applyOptionsPatch(current: ToastOptions, patch?: PartialToastOptionsPatch): ToastOptions {
  if (!patch) return current;
  return deepMerge(current as Record<string, unknown>, patch) as ToastOptions;
}
