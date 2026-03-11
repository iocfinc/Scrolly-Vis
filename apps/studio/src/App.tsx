import { startTransition, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  applyTransforms,
  chartOptions,
  createId,
  createSampleDocument,
  documentToToastConfig,
  duplicateState,
  exportDocumentToHtml,
  getPalette,
  loadRowsFromText,
  mountPreviewChart,
  parseDocument,
  serializeDocument,
  type AnnotationRuleSpec,
  type HighlightRuleSpec,
  type StudioDocument,
  type ThemeMode,
  type TransformSpec,
} from "./studio";

const storageKey = "storycharts-studio-document-v1";

function downloadFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function useLoadedDocument() {
  const [document, setDocument] = useState<StudioDocument>(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return createSampleDocument();
    try {
      return parseDocument(saved);
    } catch {
      return createSampleDocument();
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, serializeDocument(document));
  }, [document]);

  return [document, setDocument] as const;
}

function PreviewStage({ studioDocument, stateName }: { studioDocument: StudioDocument; stateName: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.replaceChildren();
    const host = globalThis.document.createElement("div");
    host.style.height = "100%";
    host.style.width = "100%";
    mountRef.current.appendChild(host);
    const chart = mountPreviewChart(studioDocument, stateName, host);
    return () => chart.destroy();
  }, [studioDocument, stateName]);

  return <div className="previewCanvas" ref={mountRef} />;
}

export default function App() {
  const [document, setDocument] = useLoadedDocument();
  const [stateName, setStateName] = useState(document.initialState);
  const [highlightDraft, setHighlightDraft] = useState({
    selectorKind: "datePart",
    field: document.chart.mappings.x ?? document.dataset.raw.columns[0] ?? "",
    value: "1",
    secondary: "",
    color: "#f73ba9",
    label: "",
  });
  const [annotationDraft, setAnnotationDraft] = useState({
    type: "callout",
    text: "New annotation",
    rowIndex: "0",
    axis: "y",
    start: "0",
    end: "100",
    x: "50",
    y: "20",
  });
  const [transformDraft, setTransformDraft] = useState({
    type: "filterEquals",
    field: document.chart.mappings.x ?? document.dataset.raw.columns[0] ?? "",
    value: "",
    min: "",
    max: "",
  });
  const importRef = useRef<HTMLInputElement | null>(null);
  const datasetRef = useRef<HTMLInputElement | null>(null);
  const processedRows = applyTransforms(document);
  const palette = getPalette(document.presentation.theme.mode);
  const previewInfo = (() => {
    try {
      return documentToToastConfig(document);
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!document.states[stateName]) {
      setStateName(document.initialState);
    }
  }, [document, stateName]);

  function updateDocument(next: StudioDocument) {
    startTransition(() => {
      setDocument({
        ...next,
        meta: {
          ...next.meta,
          updatedAt: new Date().toISOString(),
        },
      });
    });
  }

  function onSpecImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const parsed = parseDocument(text);
      updateDocument(parsed);
      setStateName(parsed.initialState);
    });
    event.target.value = "";
  }

  function onDatasetImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const loaded = loadRowsFromText(file.name, text);
      updateDocument({
        ...document,
        meta: { ...document.meta, name: loaded.name },
        dataset: loaded.dataset,
        chart: {
          ...document.chart,
          mappings: {
            x: loaded.dataset.schema.find((field) => field.role === "x")?.key,
            y: loaded.dataset.schema.find((field) => field.role === "y")?.key,
            series: loaded.dataset.schema.find((field) => field.role === "series")?.key,
          },
        },
      });
    });
    event.target.value = "";
  }

  function addHighlight() {
    const nextHighlight: HighlightRuleSpec =
      highlightDraft.selectorKind === "rowIndex"
        ? {
            id: createId("hl"),
            selector: {
              kind: "rowIndex",
              indices: highlightDraft.value
                .split(",")
                .map((value) => Number(value.trim()))
                .filter((value) => Number.isFinite(value)),
            },
            style: { color: highlightDraft.color },
            legendLabel: highlightDraft.label || undefined,
            priority: 1,
          }
        : highlightDraft.selectorKind === "categoryValue"
          ? {
              id: createId("hl"),
              selector: {
                kind: "categoryValue",
                field: highlightDraft.field,
                values: highlightDraft.value.split(",").map((value) => value.trim()).filter(Boolean),
              },
              style: { color: highlightDraft.color },
              legendLabel: highlightDraft.label || undefined,
              priority: 1,
            }
          : highlightDraft.selectorKind === "numericRange"
            ? {
                id: createId("hl"),
                selector: {
                  kind: "numericRange",
                  field: highlightDraft.field,
                  min: highlightDraft.value ? Number(highlightDraft.value) : undefined,
                  max: highlightDraft.secondary ? Number(highlightDraft.secondary) : undefined,
                },
                style: { color: highlightDraft.color },
                legendLabel: highlightDraft.label || undefined,
                priority: 1,
              }
            : {
                id: createId("hl"),
                selector: {
                  kind: "datePart",
                  field: highlightDraft.field,
                  part: "month",
                  values: highlightDraft.value.split(",").map((value) => Number(value.trim())).filter(Number.isFinite),
                },
                style: { color: highlightDraft.color },
                legendLabel: highlightDraft.label || undefined,
                priority: 1,
              };

    updateDocument({
      ...document,
      states: {
        ...document.states,
        [stateName]: {
          ...document.states[stateName],
          highlights: [...document.states[stateName].highlights, nextHighlight],
        },
      },
    });
  }

  function addAnnotation() {
    const nextAnnotation: AnnotationRuleSpec =
      annotationDraft.type === "band"
        ? {
            id: createId("ann"),
            type: "band",
            axis: annotationDraft.axis as "x" | "y",
            range: [annotationDraft.start, annotationDraft.end],
            text: annotationDraft.text,
          }
        : annotationDraft.type === "note"
          ? {
              id: createId("ann"),
              type: "note",
              position: { x: Number(annotationDraft.x), y: Number(annotationDraft.y) },
              text: annotationDraft.text,
            }
          : {
              id: createId("ann"),
              type: annotationDraft.type as "callout" | "label",
              anchor: { kind: "dataPoint", rowIndex: Number(annotationDraft.rowIndex) || 0 },
              text: annotationDraft.text,
              pointer: annotationDraft.type === "callout",
              offset: { x: 0, y: -48 },
            };

    updateDocument({
      ...document,
      states: {
        ...document.states,
        [stateName]: {
          ...document.states[stateName],
          annotations: [...document.states[stateName].annotations, nextAnnotation],
        },
      },
    });
  }

  function addTransform() {
    const nextTransform: TransformSpec =
      transformDraft.type === "filterEquals"
        ? {
            id: createId("tx"),
            type: "filterEquals",
            field: transformDraft.field,
            values: transformDraft.value.split(",").map((value) => value.trim()).filter(Boolean),
          }
        : {
            id: createId("tx"),
            type: "filterRange",
            field: transformDraft.field,
            min: transformDraft.min ? Number(transformDraft.min) : undefined,
            max: transformDraft.max ? Number(transformDraft.max) : undefined,
          };

    updateDocument({
      ...document,
      dataset: {
        ...document.dataset,
        transforms: [...document.dataset.transforms, nextTransform],
      },
    });
  }

  function themeToggle(nextMode: ThemeMode) {
    updateDocument({
      ...document,
      presentation: {
        ...document.presentation,
        theme: { ...document.presentation.theme, mode: nextMode },
      },
    });
  }

  return (
    <div className={`studio studio--${document.presentation.theme.mode}`} style={{ "--panel-bg": palette.panel, "--canvas-bg": palette.background, "--card-bg": palette.card, "--text": palette.text, "--muted": palette.muted, "--grid": palette.grid, "--accent": palette.pink, "--orange": palette.orange, "--axis": palette.axis } as React.CSSProperties}>
      <input ref={importRef} type="file" accept=".storychart.json,.json" hidden onChange={onSpecImport} />
      <input ref={datasetRef} type="file" accept=".csv,.json" hidden onChange={onDatasetImport} />

      <header className="topbar">
        <div>
          <div className="eyebrow">StoryCharts Studio</div>
          <input
            className="projectName"
            value={document.meta.name}
            onChange={(event) =>
              updateDocument({
                ...document,
                meta: { ...document.meta, name: event.target.value },
              })
            }
          />
        </div>
        <div className="topbarActions">
          <button className="ghostButton" onClick={() => themeToggle(document.presentation.theme.mode === "light" ? "dark" : "light")}>
            {document.presentation.theme.mode === "light" ? "Dark mode" : "Light mode"}
          </button>
          <button className="ghostButton" onClick={() => datasetRef.current?.click()}>
            Upload data
          </button>
          <button className="ghostButton" onClick={() => importRef.current?.click()}>
            Import spec
          </button>
          <button className="ghostButton" onClick={() => downloadFile(`${document.meta.name || "storychart"}.storychart.json`, serializeDocument(document), "application/json")}>
            Export JSON
          </button>
          <button className="accentButton" onClick={() => downloadFile(`${document.meta.name || "storychart"}.html`, exportDocumentToHtml(document, stateName), "text/html")}>
            Export HTML
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <section className="panel">
            <h2>States</h2>
            <div className="stateList">
              {Object.keys(document.states).map((name) => (
                <button key={name} className={`stateButton ${name === stateName ? "is-active" : ""}`} onClick={() => setStateName(name)}>
                  {name}
                </button>
              ))}
            </div>
            <div className="inlineRow">
              <button className="ghostButton" onClick={() => updateDocument(duplicateState(document, stateName))}>
                Duplicate
              </button>
              <button
                className="ghostButton"
                onClick={() => {
                  const name = `state_${Object.keys(document.states).length + 1}`;
                  updateDocument({
                    ...document,
                    states: {
                      ...document.states,
                      [name]: { highlights: [], annotations: [] },
                    },
                  });
                  setStateName(name);
                }}
              >
                Add state
              </button>
            </div>
          </section>

          <section className="panel">
            <h2>Chart</h2>
            <label>
              Type
              <select
                value={document.chart.type}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    chart: { ...document.chart, type: event.target.value as StudioDocument["chart"]["type"] },
                  })
                }
              >
                {chartOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              X field
              <select
                value={document.chart.mappings.x ?? ""}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    chart: {
                      ...document.chart,
                      mappings: { ...document.chart.mappings, x: event.target.value || undefined },
                    },
                  })
                }
              >
                <option value="">Select field</option>
                {document.dataset.raw.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Y field
              <select
                value={document.chart.mappings.y ?? ""}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    chart: {
                      ...document.chart,
                      mappings: { ...document.chart.mappings, y: event.target.value || undefined },
                    },
                  })
                }
              >
                <option value="">Select field</option>
                {document.dataset.raw.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Series field
              <select
                value={document.chart.mappings.series ?? ""}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    chart: {
                      ...document.chart,
                      mappings: { ...document.chart.mappings, series: event.target.value || undefined },
                    },
                  })
                }
              >
                <option value="">Single series</option>
                {document.dataset.raw.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={document.chart.options.showLegend ?? true}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    chart: {
                      ...document.chart,
                      options: { ...document.chart.options, showLegend: event.target.checked },
                    },
                  })
                }
              />
              Show legend
            </label>
          </section>

          <section className="panel">
            <h2>Filters</h2>
            <label>
              Filter type
              <select value={transformDraft.type} onChange={(event) => setTransformDraft({ ...transformDraft, type: event.target.value })}>
                <option value="filterEquals">Equals</option>
                <option value="filterRange">Range</option>
              </select>
            </label>
            <label>
              Field
              <select value={transformDraft.field} onChange={(event) => setTransformDraft({ ...transformDraft, field: event.target.value })}>
                {document.dataset.raw.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            {transformDraft.type === "filterEquals" ? (
              <label>
                Values
                <input value={transformDraft.value} onChange={(event) => setTransformDraft({ ...transformDraft, value: event.target.value })} placeholder="Jan, Feb" />
              </label>
            ) : (
              <div className="inlineRow">
                <label>
                  Min
                  <input value={transformDraft.min} onChange={(event) => setTransformDraft({ ...transformDraft, min: event.target.value })} />
                </label>
                <label>
                  Max
                  <input value={transformDraft.max} onChange={(event) => setTransformDraft({ ...transformDraft, max: event.target.value })} />
                </label>
              </div>
            )}
            <button className="ghostButton" onClick={addTransform}>
              Add filter
            </button>
            <div className="tokenList">
              {document.dataset.transforms.map((transform) => (
                <button
                  key={transform.id}
                  className="token"
                  onClick={() =>
                    updateDocument({
                      ...document,
                      dataset: {
                        ...document.dataset,
                        transforms: document.dataset.transforms.filter((item) => item.id !== transform.id),
                      },
                    })
                  }
                >
                  {transform.field}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="canvasArea">
          <div className="frameCard">
            <div className="frameMeta">Live preview</div>
            <h1>{document.presentation.framing.title}</h1>
            {document.presentation.framing.subtitle ? <p className="subtitle">{document.presentation.framing.subtitle}</p> : null}
            <div className="previewWrap">
              {previewInfo ? <PreviewStage studioDocument={document} stateName={stateName} /> : <div className="emptyState">Map both X and Y fields to render the chart.</div>}
            </div>
            <div className="footerMeta">
              {document.presentation.framing.source ? <span>{document.presentation.framing.source}</span> : null}
              {document.presentation.framing.byline ? <span>{document.presentation.framing.byline}</span> : null}
              {document.presentation.framing.footnote ? <span>{document.presentation.framing.footnote}</span> : null}
            </div>
          </div>

          <section className="panel tablePanel">
            <div className="panelHeader">
              <h2>Data preview</h2>
              <span>{processedRows.length} rows</span>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    {document.dataset.raw.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedRows.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {document.dataset.raw.columns.map((column) => (
                        <td key={column}>{String(row[column] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside className="inspector">
          <section className="panel">
            <h2>Framing</h2>
            <label>
              Title
              <textarea
                value={document.presentation.framing.title}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    presentation: {
                      ...document.presentation,
                      framing: { ...document.presentation.framing, title: event.target.value },
                    },
                  })
                }
              />
            </label>
            <label>
              Subtitle
              <textarea
                value={document.presentation.framing.subtitle ?? ""}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    presentation: {
                      ...document.presentation,
                      framing: { ...document.presentation.framing, subtitle: event.target.value },
                    },
                  })
                }
              />
            </label>
            <label>
              Source
              <input
                value={document.presentation.framing.source ?? ""}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    presentation: {
                      ...document.presentation,
                      framing: { ...document.presentation.framing, source: event.target.value },
                    },
                  })
                }
              />
            </label>
            <label>
              Footnote
              <input
                value={document.presentation.framing.footnote ?? ""}
                onChange={(event) =>
                  updateDocument({
                    ...document,
                    presentation: {
                      ...document.presentation,
                      framing: { ...document.presentation.framing, footnote: event.target.value },
                    },
                  })
                }
              />
            </label>
          </section>

          <section className="panel">
            <h2>Highlights</h2>
            <label>
              Selector
              <select value={highlightDraft.selectorKind} onChange={(event) => setHighlightDraft({ ...highlightDraft, selectorKind: event.target.value })}>
                <option value="datePart">Date month</option>
                <option value="categoryValue">Category value</option>
                <option value="numericRange">Numeric range</option>
                <option value="rowIndex">Row index</option>
              </select>
            </label>
            <label>
              Field
              <select value={highlightDraft.field} onChange={(event) => setHighlightDraft({ ...highlightDraft, field: event.target.value })}>
                {document.dataset.raw.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {highlightDraft.selectorKind === "numericRange" ? "Min" : "Values"}
              <input value={highlightDraft.value} onChange={(event) => setHighlightDraft({ ...highlightDraft, value: event.target.value })} placeholder="1 or Jan,Feb" />
            </label>
            {highlightDraft.selectorKind === "numericRange" ? (
              <label>
                Max
                <input value={highlightDraft.secondary} onChange={(event) => setHighlightDraft({ ...highlightDraft, secondary: event.target.value })} />
              </label>
            ) : null}
            <label>
              Color
              <input type="color" value={highlightDraft.color} onChange={(event) => setHighlightDraft({ ...highlightDraft, color: event.target.value })} />
            </label>
            <label>
              Legend label
              <input value={highlightDraft.label} onChange={(event) => setHighlightDraft({ ...highlightDraft, label: event.target.value })} />
            </label>
            <button className="ghostButton" onClick={addHighlight}>
              Add highlight
            </button>
            <div className="inspectorList">
              {document.states[stateName].highlights.map((highlight) => (
                <button
                  key={highlight.id}
                  className="listItem"
                  onClick={() =>
                    updateDocument({
                      ...document,
                      states: {
                        ...document.states,
                        [stateName]: {
                          ...document.states[stateName],
                          highlights: document.states[stateName].highlights.filter((item) => item.id !== highlight.id),
                        },
                      },
                    })
                  }
                >
                  {highlight.legendLabel || highlight.selector.kind}
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Annotations</h2>
            <label>
              Type
              <select value={annotationDraft.type} onChange={(event) => setAnnotationDraft({ ...annotationDraft, type: event.target.value })}>
                <option value="callout">Callout</option>
                <option value="label">Label</option>
                <option value="band">Band</option>
                <option value="note">Note</option>
              </select>
            </label>
            <label>
              Text
              <textarea value={annotationDraft.text} onChange={(event) => setAnnotationDraft({ ...annotationDraft, text: event.target.value })} />
            </label>
            {annotationDraft.type === "band" ? (
              <>
                <label>
                  Axis
                  <select value={annotationDraft.axis} onChange={(event) => setAnnotationDraft({ ...annotationDraft, axis: event.target.value })}>
                    <option value="x">x</option>
                    <option value="y">y</option>
                  </select>
                </label>
                <div className="inlineRow">
                  <label>
                    Start
                    <input value={annotationDraft.start} onChange={(event) => setAnnotationDraft({ ...annotationDraft, start: event.target.value })} />
                  </label>
                  <label>
                    End
                    <input value={annotationDraft.end} onChange={(event) => setAnnotationDraft({ ...annotationDraft, end: event.target.value })} />
                  </label>
                </div>
              </>
            ) : annotationDraft.type === "note" ? (
              <div className="inlineRow">
                <label>
                  X %
                  <input value={annotationDraft.x} onChange={(event) => setAnnotationDraft({ ...annotationDraft, x: event.target.value })} />
                </label>
                <label>
                  Y %
                  <input value={annotationDraft.y} onChange={(event) => setAnnotationDraft({ ...annotationDraft, y: event.target.value })} />
                </label>
              </div>
            ) : (
              <label>
                Row index
                <input value={annotationDraft.rowIndex} onChange={(event) => setAnnotationDraft({ ...annotationDraft, rowIndex: event.target.value })} />
              </label>
            )}
            <button className="ghostButton" onClick={addAnnotation}>
              Add annotation
            </button>
            <div className="inspectorList">
              {document.states[stateName].annotations.map((annotation) => (
                <button
                  key={annotation.id}
                  className="listItem"
                  onClick={() =>
                    updateDocument({
                      ...document,
                      states: {
                        ...document.states,
                        [stateName]: {
                          ...document.states[stateName],
                          annotations: document.states[stateName].annotations.filter((item) => item.id !== annotation.id),
                        },
                      },
                    })
                  }
                >
                  {annotation.type}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
