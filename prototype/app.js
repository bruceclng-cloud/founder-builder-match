import {
  calculateTrialEconomics,
  getReadinessBreakdown,
  recommendMatches
} from "./matching.js";
import { getScenario, scenarios } from "./scenarios.js";

const STORAGE_KEY = "founder-builder-match-prototype";

const defaultScenario = getScenario("fullstack-tutor-mvp");

let builders = [];
let currentMatches = [];
let selectedMatch = null;
let currentTrial = null;
let currentProofRecord = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function splitList(value) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slug(value) {
  return String(value || "builder")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function saveState() {
  const state = {
    founder: formToFounder(),
    builders
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setSaveStatus("Saved locally");
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    builders = structuredClone(defaultScenario.builders);
    return defaultScenario.founder;
  }

  try {
    const parsed = JSON.parse(stored);
    builders = Array.isArray(parsed.builders) && parsed.builders.length
      ? parsed.builders
      : structuredClone(defaultScenario.builders);
    return parsed.founder || defaultScenario.founder;
  } catch {
    builders = structuredClone(defaultScenario.builders);
    return defaultScenario.founder;
  }
}

function setSaveStatus(text) {
  const status = $("#save-status");
  if (status) status.textContent = text;
}

function formToFounder() {
  const form = $("#founder-form");
  const data = new FormData(form);
  return {
    name: data.get("name"),
    timezone: data.get("timezone"),
    summary: data.get("summary"),
    neededSkill: data.get("neededSkill"),
    budget: Number(data.get("budget")),
    stage: data.get("stage"),
    marketEvidence: data.get("marketEvidence"),
    outcome: data.get("outcome"),
    hasBudget: data.get("hasBudget") === "on",
    clearScope: data.get("clearScope") === "on",
    hasTimeline: data.get("hasTimeline") === "on",
    canGiveFeedback: data.get("canGiveFeedback") === "on"
  };
}

function fillFounderForm(founder) {
  const form = $("#founder-form");
  Object.entries(founder).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (field.type === "checkbox") field.checked = Boolean(value);
    else field.value = value;
  });
}

function fillTrialForm(trial) {
  const form = $("#trial-form");
  Object.entries(trial).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) field.value = value;
  });
}

function fillProofForm(proof) {
  const form = $("#proof-form");
  Object.entries(proof).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) field.value = value;
  });
}

function formToBuilder() {
  const form = $("#builder-form");
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  return {
    id: `${slug(name)}-${Date.now()}`,
    name,
    timezone: String(data.get("timezone") || "").trim(),
    status: String(data.get("status") || "").trim(),
    skills: splitList(data.get("skills")).map((skill) => skill.toLowerCase()),
    minimumRate: Number(data.get("minimumRate")) || 0,
    availability: String(data.get("availability") || "").trim(),
    proofLinks: splitList(data.get("proofLinks"))
  };
}

function renderBuilders() {
  $("#builder-grid").innerHTML = builders
    .map(
      (builder) => `
        <section class="person-card" data-builder-id="${builder.id}">
          <div class="card-title">
            <h3>${builder.name}</h3>
            <button class="text-button" data-remove-builder="${builder.id}" type="button">Remove</button>
          </div>
          <p class="muted">${builder.status} · ${builder.timezone} · ${builder.availability}</p>
          <div class="tag-row">
            ${builder.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
            <span class="tag warn">min ${money(builder.minimumRate)}</span>
          </div>
          <p><strong>Proof</strong></p>
          <ul class="reason-list">
            ${builder.proofLinks.map((proof) => `<li>${proof}</li>`).join("")}
          </ul>
        </section>
      `
    )
    .join("");

  $$("[data-remove-builder]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.removeBuilder;
      builders = builders.filter((builder) => builder.id !== id);
      renderBuilders();
      renderMatches();
      saveState();
    });
  });
}

function renderMatches() {
  const founder = formToFounder();
  currentMatches = recommendMatches(founder, builders);
  selectedMatch = currentMatches[0] || null;

  $("#match-count").textContent = String(currentMatches.length);
  $("#empty-matches").classList.toggle("is-visible", currentMatches.length === 0);

  $("#match-list").innerHTML = currentMatches
    .map(
      (match, index) => `
        <section class="match-card ${index === 0 ? "is-selected" : ""}" data-match-index="${index}">
          <div class="section-heading">
            <div>
              <h3>${match.builder.name}</h3>
              <p class="muted">${match.builder.status} · ${match.builder.timezone}</p>
            </div>
            <span class="score">${match.score}</span>
          </div>
          <div class="tag-row">
            ${match.builder.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
            <span class="tag warn">min ${money(match.builder.minimumRate)}</span>
          </div>
          ${renderBreakdown(formToFounder(), match.builder)}
          <ul class="reason-list">
            ${match.reasons.map((reason) => `<li>${reason}</li>`).join("")}
          </ul>
        </section>
      `
    )
    .join("");

  $$(".match-card").forEach((card) => {
    card.addEventListener("click", () => {
      const index = Number(card.dataset.matchIndex);
      selectedMatch = currentMatches[index];
      $$(".match-card").forEach((item) => item.classList.remove("is-selected"));
      card.classList.add("is-selected");
      updateEconomics();
    });
  });

  updateEconomics();
  renderPacket();
}

function renderBreakdown(founder, builder) {
  const breakdown = getReadinessBreakdown(founder, builder);
  return `
    <div class="breakdown" aria-label="Match score breakdown">
      ${Object.entries(breakdown)
        .map(([label, value]) => `
          <span>
            <strong>${value}</strong>
            ${label}
          </span>
        `)
        .join("")}
    </div>
  `;
}

function updateEconomics() {
  const founder = formToFounder();
  const trialData = new FormData($("#trial-form"));
  const builderMinimum = selectedMatch
    ? selectedMatch.builder.minimumRate
    : Number(trialData.get("builderMinimum"));
  const economics = calculateTrialEconomics({
    trialType: trialData.get("trialType"),
    founderBudget: founder.budget,
    builderMinimum
  });

  $("#trial-fee").textContent = money(economics.stipend);
  $("#platform-fee").textContent = money(economics.platformFee);
  renderPacket();
  return economics;
}

function buildTrialBrief() {
  if (!selectedMatch) {
    renderMatches();
  }

  const founder = formToFounder();
  const trialData = new FormData($("#trial-form"));
  const economics = updateEconomics();
  const builder = selectedMatch?.builder;

  currentTrial = {
    founder,
    builder,
    trialType: trialData.get("trialType"),
    acceptance: trialData.get("acceptance"),
    evidence: trialData.get("evidence"),
    economics
  };

  $("#trial-brief").innerHTML = `
    <h3>${founder.name} + ${builder.name}</h3>
    <dl>
      <dt>Need</dt>
      <dd>${founder.neededSkill}</dd>
      <dt>Outcome</dt>
      <dd>${founder.outcome}</dd>
      <dt>Stipend</dt>
      <dd>${money(economics.stipend)} (${money(economics.builderReceives)} to builder, ${money(economics.platformFee)} platform fee)</dd>
      <dt>Status</dt>
      <dd>${economics.canProceed ? "Budget overlaps with builder minimum" : "Budget or range needs adjustment"}</dd>
      <dt>Acceptance</dt>
      <dd>${currentTrial.acceptance}</dd>
      <dt>Evidence</dt>
      <dd>${currentTrial.evidence}</dd>
    </dl>
  `;
  renderPacket();
}

function generateProofRecord() {
  if (!currentTrial) {
    buildTrialBrief();
  }

  const proofData = new FormData($("#proof-form"));
  currentProofRecord = {
    builder: currentTrial.builder.name,
    founder: currentTrial.founder.name,
    role: `${currentTrial.founder.neededSkill} builder`,
    status: proofData.get("status"),
    artifacts: proofData.get("artifacts"),
    feedback: proofData.get("feedback")
  };

  $("#proof-record").innerHTML = `
    <h3>Verified trial record</h3>
    <dl>
      <dt>Builder</dt>
      <dd>${currentProofRecord.builder}</dd>
      <dt>Founder</dt>
      <dd>${currentProofRecord.founder}</dd>
      <dt>Role</dt>
      <dd>${currentProofRecord.role}</dd>
      <dt>Status</dt>
      <dd>${currentProofRecord.status}</dd>
      <dt>Artifacts</dt>
      <dd>${currentProofRecord.artifacts}</dd>
      <dt>Feedback</dt>
      <dd>${currentProofRecord.feedback}</dd>
    </dl>
  `;
  renderPacket();
}

function resetFounder() {
  fillFounderForm(defaultScenario.founder);
  renderMatches();
  saveState();
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  applyScenario(defaultScenario.id);
}

function applyScenario(id) {
  const scenario = getScenario(id);
  $("#scenario-select").value = scenario.id;
  builders = structuredClone(scenario.builders);
  fillFounderForm(scenario.founder);
  fillTrialForm(scenario.trial);
  fillProofForm(scenario.proof);
  currentTrial = null;
  currentProofRecord = null;
  $("#trial-brief").innerHTML = `
    <h3>Trial brief preview</h3>
    <p class="muted">Create a match first, then build a trial brief.</p>
  `;
  $("#proof-record").innerHTML = `
    <p class="muted">Generate a proof record after a trial brief exists.</p>
  `;
  renderBuilders();
  renderMatches();
  saveState();
  setSaveStatus(`Loaded: ${scenario.name}`);
}

function addBuilder() {
  const builder = formToBuilder();
  if (!builder.name || !builder.skills.length) {
    setSaveStatus("Add a builder name and at least one skill");
    return;
  }

  builders = [builder, ...builders];
  renderBuilders();
  renderMatches();
  saveState();
}

function buildPacket() {
  const founder = formToFounder();
  const selected = selectedMatch
    ? {
        builder: selectedMatch.builder,
        score: selectedMatch.score,
        reasons: selectedMatch.reasons,
        breakdown: getReadinessBreakdown(founder, selectedMatch.builder)
      }
    : null;

  return {
    generatedAt: new Date().toISOString(),
    founder,
    selectedMatch: selected,
    topMatches: currentMatches.slice(0, 3).map((match) => ({
      builder: match.builder.name,
      score: match.score,
      reasons: match.reasons
    })),
    trial: currentTrial,
    proofRecord: currentProofRecord
  };
}

function buildShareSummary() {
  const founder = formToFounder();
  const topMatch = selectedMatch;
  const trialData = new FormData($("#trial-form"));
  const builderMinimum = topMatch
    ? topMatch.builder.minimumRate
    : Number(trialData.get("builderMinimum"));
  const economics = calculateTrialEconomics({
    trialType: trialData.get("trialType"),
    founderBudget: founder.budget,
    builderMinimum
  });
  const topThree = currentMatches
    .slice(0, 3)
    .map((match, index) => `${index + 1}. ${match.builder.name} - score ${match.score}`)
    .join("\n");

  if (!topMatch) {
    return "No match generated yet.";
  }

  return [
    `Founder Builder Match summary`,
    ``,
    `Founder: ${founder.name}`,
    `Need: ${founder.neededSkill}`,
    `Project: ${founder.summary}`,
    `7-day outcome: ${founder.outcome}`,
    `Budget: ${money(founder.budget)}`,
    ``,
    `Recommended builder: ${topMatch.builder.name}`,
    `Match score: ${topMatch.score}`,
    `Builder status: ${topMatch.builder.status}`,
    `Builder minimum: ${money(topMatch.builder.minimumRate)}`,
    `Builder proof: ${topMatch.builder.proofLinks.join("; ")}`,
    ``,
    `Why this match:`,
    ...topMatch.reasons.map((reason) => `- ${reason}`),
    ``,
    `Trial economics:`,
    `- Suggested stipend: ${money(economics.stipend)}`,
    `- Builder receives: ${money(economics.builderReceives)}`,
    `- Platform fee: ${money(economics.platformFee)}`,
    `- Can proceed: ${economics.canProceed ? "yes" : "needs budget/scope adjustment"}`,
    ``,
    `Top matches:`,
    topThree
  ].join("\n");
}

function renderPacket() {
  const packet = buildPacket();
  $("#match-packet").textContent = JSON.stringify(packet, null, 2);
  $("#share-summary").textContent = buildShareSummary();
}

async function copyPacket() {
  const text = $("#match-packet").textContent;
  try {
    await navigator.clipboard.writeText(text);
    setSaveStatus("Match packet copied");
  } catch {
    setSaveStatus("Copy failed; select the packet manually");
  }
}

async function copySummary() {
  const text = $("#share-summary").textContent;
  try {
    await navigator.clipboard.writeText(text);
    setSaveStatus("Share summary copied");
  } catch {
    setSaveStatus("Copy failed; select the summary manually");
  }
}

function downloadPacket() {
  const blob = new Blob([$("#match-packet").textContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "founder-builder-match-packet.json";
  link.click();
  URL.revokeObjectURL(url);
}

function downloadSummary() {
  const blob = new Blob([$("#share-summary").textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "founder-builder-match-summary.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function showPanel(name) {
  $$(".tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.panel === name));
  $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === `panel-${name}`));
}

function bindEvents() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => showPanel(tab.dataset.panel));
  });

  $("#score-builders").addEventListener("click", () => {
    renderMatches();
    showPanel("matches");
  });
  $("#refresh-matches").addEventListener("click", renderMatches);
  $("#build-trial").addEventListener("click", buildTrialBrief);
  $("#generate-proof").addEventListener("click", generateProofRecord);
  $("#reset-founder").addEventListener("click", resetFounder);
  $("#reset-data").addEventListener("click", resetData);
  $("#add-builder").addEventListener("click", addBuilder);
  $("#copy-packet").addEventListener("click", copyPacket);
  $("#download-packet").addEventListener("click", downloadPacket);
  $("#copy-summary").addEventListener("click", copySummary);
  $("#download-summary").addEventListener("click", downloadSummary);
  $("#scenario-select").addEventListener("change", (event) => {
    applyScenario(event.target.value);
    showPanel("matches");
  });

  $("#founder-form").addEventListener("input", () => {
    renderMatches();
    saveState();
  });
  $("#trial-form").addEventListener("input", updateEconomics);
}

$("#scenario-select").innerHTML = scenarios
  .map((scenario) => `<option value="${scenario.id}">${scenario.name}</option>`)
  .join("");
fillFounderForm(loadState());
fillTrialForm(defaultScenario.trial);
fillProofForm(defaultScenario.proof);
renderBuilders();
bindEvents();
renderMatches();
