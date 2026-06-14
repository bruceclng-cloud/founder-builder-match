import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTrialEconomics,
  founderSeriousness,
  getReadinessBreakdown,
  getSkillScore,
  recommendMatches,
  skillMatches
} from "../prototype/matching.js";
import { scenarios } from "../prototype/scenarios.js";

test("full-stack need can match frontend/backend/fullstack builders", () => {
  assert.equal(skillMatches("fullstack", ["frontend"]), true);
  assert.equal(skillMatches("fullstack", ["backend"]), true);
  assert.equal(skillMatches("fullstack", ["design"]), false);
});

test("exact skill fit scores higher than adjacent skill fit", () => {
  assert.equal(getSkillScore("fullstack", ["fullstack"]), 100);
  assert.equal(getSkillScore("fullstack", ["frontend"]), 75);
  assert.equal(getSkillScore("fullstack", ["design"]), 20);
});

test("founder seriousness rewards budget, scope, timeline, feedback, and market evidence", () => {
  const score = founderSeriousness({
    hasBudget: true,
    clearScope: true,
    hasTimeline: true,
    canGiveFeedback: true,
    budget: 1200,
    marketEvidence: "Customer conversations"
  });

  assert.equal(score, 100);
});

test("recommendMatches ranks compatible skill, proof, and pricing higher", () => {
  const founder = {
    neededSkill: "fullstack",
    budget: 1200,
    timezone: "GMT+8",
    hasBudget: true,
    clearScope: true,
    hasTimeline: true,
    canGiveFeedback: true,
    marketEvidence: "Waitlist"
  };

  const matches = recommendMatches(founder, [
    {
      name: "Thin Proof",
      timezone: "GMT+8",
      skills: ["design"],
      minimumRate: 700,
      proofLinks: ["Portfolio"]
    },
    {
      name: "Strong Fit",
      timezone: "GMT+8",
      skills: ["fullstack", "backend"],
      minimumRate: 900,
      proofLinks: ["GitHub", "Portfolio", "LinkedIn"]
    }
  ]);

  assert.equal(matches[0].builder.name, "Strong Fit");
  assert.ok(matches[0].score > matches[1].score);
});

test("trial economics only proceeds when founder budget meets builder minimum and fair range", () => {
  const blocked = calculateTrialEconomics({
    trialType: "feature",
    founderBudget: 800,
    builderMinimum: 900
  });

  assert.equal(blocked.canProceed, false);

  const allowed = calculateTrialEconomics({
    trialType: "feature",
    founderBudget: 1200,
    builderMinimum: 900
  });

  assert.equal(allowed.canProceed, true);
  assert.equal(allowed.platformFee, 120);
  assert.equal(allowed.builderReceives, 1080);
});

test("readiness breakdown exposes weighted score inputs", () => {
  const breakdown = getReadinessBreakdown(
    {
      neededSkill: "ai",
      budget: 1500,
      timezone: "GMT+8",
      hasBudget: true,
      clearScope: true,
      hasTimeline: true,
      canGiveFeedback: true,
      marketEvidence: "Paying customers"
    },
    {
      timezone: "GMT+8",
      skills: ["backend", "ai"],
      minimumRate: 1200,
      proofLinks: ["GitHub", "Portfolio", "LinkedIn"]
    }
  );

  assert.deepEqual(breakdown, {
    skill: 100,
    price: 100,
    proof: 100,
    founder: 100,
    timezone: 100
  });
});

test("all demo scenarios produce a recommended match and viable trial economics when intended", () => {
  for (const scenario of scenarios) {
    const matches = recommendMatches(scenario.founder, scenario.builders);
    assert.ok(matches.length >= 1);
    assert.ok(matches[0].score > 0);

    const economics = calculateTrialEconomics({
      trialType: scenario.trial.trialType,
      founderBudget: scenario.founder.budget,
      builderMinimum: matches[0].builder.minimumRate
    });

    assert.equal(typeof economics.canProceed, "boolean");
    assert.ok(economics.stipend >= 0);
  }
});
