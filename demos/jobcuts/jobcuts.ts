import { createStoryChart } from "../../packages/core/src/index";

const categories = [
  "2024-01",
  "2024-06",
  "2025-01",
  "2025-06",
  "2026-01",
  "2026-06",
];
const series = [{ name: "jobCuts", data: [10, 16, 20, 24, 31, 27] }];

const januarys = categories.filter((c) => c.endsWith("-01"));
const junes = categories.filter((c) => c.endsWith("-06")).slice(0, 2);

const chart = createStoryChart({
  mount: document.getElementById("chart")!,
  toast: {
    type: "bar",
    data: { categories, series },
    options: {
      chart: { title: "Job cuts by month", width: "auto", height: "auto" },
      xAxis: { title: "Month" },
      yAxis: { title: "Count" },
      legend: { visible: false },
    },
    chartFactory: ({ type, el, data, options }) =>
      new (window as unknown as { toastui: { Chart: Record<string, any> } }).toastui.Chart[type]({
        el,
        data,
        options,
      }),
  },
  states: {
    baseline: {
      highlights: [{ kind: "byCategory", categories: januarys, color: "#111111", priority: 1 }],
    },
    highlightJune: {
      highlights: [
        { kind: "byCategory", categories: januarys, color: "#111111", priority: 1 },
        { kind: "byCategory", categories: junes, color: "#f73ba9", priority: 2 },
      ],
    },
    callout: {
      highlights: [
        { kind: "byCategory", categories: januarys, color: "#111111", priority: 1 },
        { kind: "byCategory", categories: junes, color: "#f73ba9", priority: 2 },
      ],
      annotations: [
        {
          id: "jan-2026",
          type: "callout",
          anchor: { kind: "category", category: "2026-01", series: "jobCuts" },
          text: "January 2026\nlayoff spike",
          pointer: true,
        },
      ],
    },
  },
  initialState: "baseline",
});

const steps = Array.from(document.querySelectorAll(".story-step"));
const onScroll = () => {
  const idx = steps.findIndex((step) => {
    const rect = step.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.55 && rect.bottom >= window.innerHeight * 0.25;
  });

  if (idx <= 0) {
    void chart.applyState("baseline");
  } else if (idx === 1) {
    void chart.applyState("highlightJune");
  } else if (idx >= 2) {
    void chart.applyState("callout");
  }
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
