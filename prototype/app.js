import {
  calculateTrialEconomics,
  recommendMatches
} from "./matching.js";

const sampleFounder = {
  name: "Maya Chen",
  timezone: "GMT+8",
  summary: "A lightweight scheduling and payment tool for independent tutors in Hong Kong.",
  neededSkill: "fullstack",
  budget: 1200,
  stage: "Validated problem",
  marketEvidence: "Customer conversations",
  outcome: "Ship a working booking flow with tutor availability, student request form, and admin review screen.",
  hasBudget: true,
  clearScope: true,
  hasTimeline: true,
  canGiveFeedback: true
};

const builders = [
  {
    id: "leo",
    name: "Leo Wong",
    timezone: "GMT+8",
    status: "Underemployed",
    skills: ["frontend", "backend", "fullstack"],
    minimumRate: 900,
    availability: "20 hrs/week",
    proofLinks: ["GitHub: booking widgets", "Portfolio: SaaS dashboards", "LinkedIn: 4 years full-stack"]
  },
  {
    id: "amina",
    name: "Amina Patel",
    timezone: "GMT+5:30",
    status: "Recently laid off",
    skills: ["ai", "backend"],
    minimumRate: 1400,
    availability: "Full week",
    proofLinks: ["GitHub: LLM automation", "Case study: support bot"]
  },
  {
    id: "sam",
    name: "Sam Rivera",
    timezone: "GMT+8",
    status: "Freelance",
    skills: ["design", "frontend"],
    minimumRate: 700,
    availability: "15 hrs/week",
    proofLinks: ["Portfolio: mobile prototypes", "Figma community", "Resume: product designer"]
  }
];

let currentMatches = [];
let selectedMatch = null;
let currentTrial = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
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

function renderBuilders() {
  $("#builder-grid").innerHTML = builders
    .map(
      (builder) => `
        <section class="person-card" data-builder-id="${builder.id}">
          <h3>${builder.name}</h3>
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
}

function generateProofRecord() {
  if (!currentTrial) {
    buildTrialBrief();
  }

  const proofData = new FormData($("#proof-form"));
  $("#proof-record").innerHTML = `
    <h3>Verified trial record</h3>
    <dl>
      <dt>Builder</dt>
      <dd>${currentTrial.builder.name}</dd>
      <dt>Founder</dt>
      <dd>${currentTrial.founder.name}</dd>
      <dt>Role</dt>
      <dd>${currentTrial.founder.neededSkill} builder</dd>
      <dt>Status</dt>
      <dd>${proofData.get("status")}</dd>
      <dt>Artifacts</dt>
      <dd>${proofData.get("artifacts")}</dd>
      <dt>Feedback</dt>
      <dd>${proofData.get("feedback")}</dd>
    </dl>
  `;
}

function resetFounder() {
  const form = $("#founder-form");
  Object.entries(sampleFounder).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (field.type === "checkbox") field.checked = Boolean(value);
    else field.value = value;
  });
  renderMatches();
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

  $("#founder-form").addEventListener("input", updateEconomics);
  $("#trial-form").addEventListener("input", updateEconomics);
}

renderBuilders();
bindEvents();
renderMatches();
