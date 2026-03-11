import { describe, expect, test } from "vitest";
import { StateDiffEngine } from "../src/state/StateDiffEngine";

describe("StateDiffEngine", () => {
  test("applies deterministic patch merge", () => {
    const engine = new StateDiffEngine();
    const result = engine.apply(
      {
        data: {
          categories: ["a", "b"],
          series: [{ name: "s", data: [1, 2] }],
        },
        options: { axis: { y: { min: 0, max: 100 } }, legend: { visible: true } },
        highlights: [{ kind: "byIndex", indices: [0], color: "#000" }],
        annotations: [],
      },
      {
        dataPatch: {
          series: [{ name: "s", data: [1, 3] }],
        },
        optionsPatch: { axis: { y: { max: 40 } } },
      },
    );

    expect(result.next.data.series[0].data[1]).toBe(3);
    expect((result.next.options as { axis: { y: { min: number; max: number } } }).axis.y.min).toBe(0);
    expect((result.next.options as { axis: { y: { min: number; max: number } } }).axis.y.max).toBe(40);
    expect(result.next.highlights).toHaveLength(1);
  });
});
