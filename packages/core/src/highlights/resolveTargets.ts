import type { Datum, HighlightRule, PredicateFn, ToastData } from "../types";

export type HighlightTarget = {
  series: string;
  index: number;
  color: string;
  priority: number;
};

export function resolveHighlightTargets(
  data: ToastData,
  rules: HighlightRule[],
  predicates: Map<string, PredicateFn>,
): HighlightTarget[] {
  const targets: HighlightTarget[] = [];

  rules.forEach((rule) => {
    const priority = rule.priority ?? 0;
    if (rule.kind === "byIndex") {
      const seriesNames = rule.series ? [rule.series] : data.series.map((s) => s.name);
      seriesNames.forEach((seriesName) => {
        rule.indices.forEach((index) => {
          targets.push({ series: seriesName, index, color: rule.color, priority });
        });
      });
      return;
    }

    if (rule.kind === "byCategory") {
      const indices = rule.categories
        .map((c) => data.categories.indexOf(c))
        .filter((idx): idx is number => idx >= 0);
      const seriesNames = rule.series ? [rule.series] : data.series.map((s) => s.name);
      seriesNames.forEach((seriesName) => {
        indices.forEach((index) => {
          targets.push({ series: seriesName, index, color: rule.color, priority });
        });
      });
      return;
    }

    const predicate = predicates.get(rule.predicateId);
    if (!predicate) return;

    const seriesNames = rule.series ? [rule.series] : data.series.map((s) => s.name);
    seriesNames.forEach((seriesName) => {
      const series = data.series.find((s) => s.name === seriesName);
      if (!series) return;
      series.data.forEach((value, i) => {
        const d: Datum = {
          category: data.categories[i] ?? String(i),
          value,
          seriesName,
          raw: value,
        };
        if (predicate(d, i)) {
          targets.push({ series: seriesName, index: i, color: rule.color, priority });
        }
      });
    });
  });

  return targets;
}
