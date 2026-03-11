const stepStates = [
  {
    label: "Baseline",
    value: "22%",
    height: "22%",
    caption: "Start with the pre-change condition so later movement is easy to read.",
    color: "linear-gradient(180deg, #d74f42, #8f1d14)",
  },
  {
    label: "Comparison",
    value: "37%",
    height: "37%",
    caption: "Use the second step to make the key contrast explicit.",
    color: "linear-gradient(180deg, #d97706, #9a3412)",
  },
  {
    label: "Anomaly",
    value: "68%",
    height: "68%",
    caption: "Reserve the most dramatic visual state for the surprising point.",
    color: "linear-gradient(180deg, #2563eb, #1d4ed8)",
  },
  {
    label: "Implication",
    value: "54%",
    height: "54%",
    caption: "Close with interpretation, not just another data point.",
    color: "linear-gradient(180deg, #0f766e, #115e59)",
  },
];

const steps = Array.from(document.querySelectorAll(".step"));
const barFill = document.getElementById("bar-fill");
const stateLabel = document.getElementById("state-label");
const stateValue = document.getElementById("state-value");
const vizCaption = document.getElementById("viz-caption");

function applyState(index) {
  const state = stepStates[index] || stepStates[0];

  steps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === index);
  });

  barFill.style.height = state.height;
  barFill.style.background = state.color;
  stateLabel.textContent = state.label;
  stateValue.textContent = state.value;
  vizCaption.textContent = state.caption;
}

function getActiveStepIndex() {
  return steps.findIndex((step) => {
    const rect = step.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.55 && rect.bottom >= window.innerHeight * 0.3;
  });
}

function updateFromScroll() {
  const index = getActiveStepIndex();
  applyState(index < 0 ? 0 : index);
}

window.addEventListener("scroll", updateFromScroll, { passive: true });
window.addEventListener("resize", updateFromScroll);

applyState(0);
updateFromScroll();
