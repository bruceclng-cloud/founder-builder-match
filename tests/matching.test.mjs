import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTrialEconomics,
  founderSeriousness,
  recommendMatches,
  skillMatches
} from "../prototype/matching.js";

test("full-stack need can match frontend/backend/fullstack builders", () => {
  assert.equal(skillMatches("fullstack", ["frontend"]), true);
  assert.equal(skillMatches("fullstack", ["backend"]), true);
  assert.equal(skillMatches("fullstack", ["design"]), false);
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
