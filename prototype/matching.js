const SKILL_ALIASES = {
  fullstack: ["frontend", "backend", "fullstack"],
  frontend: ["frontend", "design"],
  backend: ["backend", "fullstack"],
  ai: ["ai", "backend", "fullstack"],
  design: ["design", "frontend"]
};

const PRICE_RANGES = {
  prototype: { min: 500, max: 900 },
  feature: { min: 900, max: 1600 },
  architecture: { min: 900, max: 1800 },
  ai: { min: 1200, max: 2600 },
  audit: { min: 450, max: 900 }
};

function normalizeSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean);
  }

  return String(skills)
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
}

function skillMatches(neededSkill, builderSkills) {
  const normalizedNeed = String(neededSkill || "").toLowerCase();
  const accepted = SKILL_ALIASES[normalizedNeed] || [normalizedNeed];
  const normalizedBuilderSkills = normalizeSkills(builderSkills);
  return normalizedBuilderSkills.some((skill) => accepted.includes(skill));
}

function founderSeriousness(founder) {
  const checks = [
    Boolean(founder.hasBudget),
    Boolean(founder.clearScope),
    Boolean(founder.hasTimeline),
    Boolean(founder.canGiveFeedback),
    Number(founder.budget) > 0,
    String(founder.marketEvidence || "").toLowerCase() !== "no evidence yet"
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function proofCompleteness(builder) {
  const proofLinks = Array.isArray(builder.proofLinks) ? builder.proofLinks : [];
  const proofCount = proofLinks.filter(Boolean).length;
  return Math.min(100, Math.round((proofCount / 3) * 100));
}

function priceCompatibility(founderBudget, builderMinimum) {
  const budget = Number(founderBudget) || 0;
  const minimum = Number(builderMinimum) || 0;
  if (budget <= 0 || minimum <= 0) return 0;
  if (budget < minimum) return Math.max(0, Math.round((budget / minimum) * 60));
  if (budget >= minimum) return 100;
  return 0;
}

function timezoneCompatibility(founderTimezone, builderTimezone) {
  if (!founderTimezone || !builderTimezone) return 50;
  return founderTimezone === builderTimezone ? 100 : 70;
}

function scoreMatch(founder, builder) {
  const reasons = [];
  const skillScore = skillMatches(founder.neededSkill, builder.skills) ? 100 : 20;
  const priceScore = priceCompatibility(founder.budget, builder.minimumRate);
  const proofScore = proofCompleteness(builder);
  const seriousnessScore = founderSeriousness(founder);
  const timezoneScore = timezoneCompatibility(founder.timezone, builder.timezone);

  if (skillScore === 100) reasons.push(`Skill fit: ${builder.name} covers ${founder.neededSkill}.`);
  else reasons.push(`Skill gap: ${builder.name} may not directly cover ${founder.neededSkill}.`);

  if (priceScore === 100) reasons.push("Budget overlaps with builder minimum.");
  else reasons.push("Budget is below builder minimum or needs adjustment.");

  if (proofScore >= 67) reasons.push("Builder has multiple proof links.");
  else reasons.push("Builder proof is thin and needs review.");

  if (seriousnessScore >= 80) reasons.push("Founder seriousness checks are strong.");
  else reasons.push("Founder readiness needs more detail before trial.");

  if (timezoneScore === 100) reasons.push("Timezone match supports real-time collaboration.");
  else reasons.push("Timezone is workable but not exact.");

  const score = Math.round(
    skillScore * 0.32 +
      priceScore * 0.24 +
      proofScore * 0.2 +
      seriousnessScore * 0.16 +
      timezoneScore * 0.08
  );

  return { builder, score, reasons };
}

function getReadinessBreakdown(founder, builder) {
  return {
    skill: skillMatches(founder.neededSkill, builder.skills) ? 100 : 20,
    price: priceCompatibility(founder.budget, builder.minimumRate),
    proof: proofCompleteness(builder),
    founder: founderSeriousness(founder),
    timezone: timezoneCompatibility(founder.timezone, builder.timezone)
  };
}

function recommendMatches(founder, builders) {
  return builders
    .map((builder) => scoreMatch(founder, builder))
    .sort((a, b) => b.score - a.score);
}

function getRecommendedRange(trialType) {
  return PRICE_RANGES[trialType] || PRICE_RANGES.feature;
}

function calculateTrialEconomics({ trialType, founderBudget, builderMinimum, platformRate = 0.1 }) {
  const range = getRecommendedRange(trialType);
  const budget = Number(founderBudget) || 0;
  const minimum = Number(builderMinimum) || 0;
  const stipend = Math.max(minimum, Math.min(budget, range.max));
  const canProceed = budget >= minimum && stipend >= range.min;
  const platformFee = Math.round(stipend * platformRate);
  const builderReceives = stipend - platformFee;

  return {
    range,
    stipend,
    platformFee,
    builderReceives,
    canProceed
  };
}

export {
  PRICE_RANGES,
  calculateTrialEconomics,
  founderSeriousness,
  getReadinessBreakdown,
  proofCompleteness,
  recommendMatches,
  scoreMatch,
  skillMatches
};
