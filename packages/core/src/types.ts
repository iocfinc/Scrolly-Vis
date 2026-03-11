export type ChartType = "bar" | "column" | "line" | "area";

export type ToastSeriesDatum = {
  name: string;
  data: Array<number | null>;
  color?: string | string[];
  colorByCategories?: boolean;
};

export type ToastData = {
  categories: string[];
  series: ToastSeriesDatum[];
};

export type ToastOptions = Record<string, unknown>;

export type PartialToastDataPatch = Partial<ToastData>;
export type PartialToastOptionsPatch = Record<string, unknown>;

export type ThemeSpec = {
  className?: string;
  vars?: Record<string, string>;
};

export type LayerSpec = {
  highlightMode?: "behind" | "front";
};

export type TransitionSpec = {
  duration?: number;
  easing?: string;
};

export type Datum = {
  category: string;
  value: number | null;
  seriesName: string;
  raw: number | null;
};

export type HighlightRule =
  | {
      kind: "byIndex";
      series?: string;
      indices: number[];
      color: string;
      priority?: number;
    }
  | {
      kind: "byPredicate";
      series?: string;
      predicateId: string;
      color: string;
      priority?: number;
    }
  | {
      kind: "byCategory";
      categories: string[];
      series?: string;
      color: string;
      priority?: number;
    };

export type AnnotationStyle = {
  className?: string;
  background?: string;
  color?: string;
  borderColor?: string;
};

export type AnchorRef =
  | { kind: "dataPoint"; series?: string; index: number }
  | { kind: "category"; category: string; series?: string }
  | { kind: "value"; axis: "x" | "y"; value: number | string }
  | { kind: "plotPercent"; x: number; y: number }
  | { kind: "pixel"; x: number; y: number };

export type AnnotationSpec =
  | {
      id: string;
      type: "callout";
      anchor: AnchorRef;
      text: string;
      align?: "left" | "right" | "center";
      offset?: { x: number; y: number };
      pointer?: boolean;
      style?: AnnotationStyle;
      visibleOn?: { mobile?: boolean; desktop?: boolean };
    }
  | {
      id: string;
      type: "label";
      anchor: AnchorRef;
      text: string;
      offset?: { x: number; y: number };
      style?: AnnotationStyle;
      visibleOn?: { mobile?: boolean; desktop?: boolean };
    }
  | {
      id: string;
      type: "band";
      axis: "x" | "y";
      range: [number | string, number | string];
      style?: AnnotationStyle;
      visibleOn?: { mobile?: boolean; desktop?: boolean };
    };

export type ChartState = {
  dataPatch?: PartialToastDataPatch;
  optionsPatch?: PartialToastOptionsPatch;
  highlights?: HighlightRule[];
  annotations?: AnnotationSpec[];
  transition?: TransitionSpec;
};

export type StoryChartSpec = {
  mount: HTMLElement;
  toast: {
    type: ChartType;
    data: ToastData;
    options: ToastOptions;
    chartFactory?: ToastChartFactory;
  };
  theme?: ThemeSpec;
  layers?: LayerSpec[];
  states?: Record<string, ChartState>;
  initialState?: string;
};

export type ScrollamaLike = {
  setup(config: { step: string; offset?: number }): ScrollamaLike;
  onStepEnter(cb: (resp: { element: Element; index: number; direction: string }) => void): ScrollamaLike;
  onStepExit?(cb: (resp: { element: Element; index: number; direction: string }) => void): ScrollamaLike;
  onStepProgress?(cb: (resp: { element: Element; index: number; progress: number }) => void): ScrollamaLike;
};

export type StoryBindings = {
  steps: string;
  offset?: number;
  mapStepToState: (stepEl: Element, idx: number) => string | ChartState;
  rollbackOnExit?: boolean;
};

export type ToastChartInstance = {
  setData?: (data: ToastData) => void;
  setOptions?: (options: ToastOptions) => void;
  updateOptions?: (options: ToastOptions) => void;
  resize?: () => void;
  destroy?: () => void;
  getData?: () => ToastData;
  getPlotBox?: () => { x: number; y: number; width?: number; height?: number; w?: number; h?: number } | null;
};

export type ToastChartFactory = (args: {
  type: ChartType;
  el: HTMLElement;
  data: ToastData;
  options: ToastOptions;
}) => ToastChartInstance;

export type PredicateFn = (d: Datum, i: number) => boolean;

export type StoryChartInstance = {
  applyState: (stateNameOrObject: string | ChartState, options?: { transition?: TransitionSpec }) => Promise<void>;
  bindScroll: (scrollamaInstance: ScrollamaLike, bindings: StoryBindings) => void;
  registerPredicate: (id: string, fn: PredicateFn) => void;
  resize: () => void;
  destroy: () => void;
};
