import { mkdir, writeFile } from "node:fs/promises";
import { calculateTrialEconomics, getReadinessBreakdown, recommendMatches } from "../prototype/matching.js";
import { scenarios } from "../prototype/scenarios.js";

const outputDir = new URL("../examples/", import.meta.url);

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function buildExample(scenario) {
  const matches = recommendMatches(scenario.founder, scenario.builders);
  const selectedMatch = matches[0];
  const economics = calculateTrialEconomics({
    trialType: scenario.trial.trialType,
    founderBudget: scenario.founder.budget,
    builderMinimum: selectedMatch.builder.minimumRate
  });

  const packet = {
    generatedAt: "2026-06-14T00:00:00.000Z",
    scenario: {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description
    },
    founder: scenario.founder,
    selectedMatch: {
      builder: selectedMatch.builder,
      score: selectedMatch.score,
      reasons: selectedMatch.reasons,
      breakdown: getReadinessBreakdown(scenario.founder, selectedMatch.builder)
    },
    topMatches: matches.slice(0, 3).map((match) => ({
      builder: match.builder.name,
      score: match.score,
      reasons: match.reasons
    })),
    trial: {
      ...scenario.trial,
      economics
    },
    proofRecord: {
      builder: selectedMatch.builder.name,
      founder: scenario.founder.name,
      role: `${scenario.founder.neededSkill} builder`,
      ...scenario.proof
    }
  };

  const summary = [
    `# ${scenario.name}`,
    ``,
    scenario.description,
    ``,
    `## Founder`,
    ``,
    `- Name: ${scenario.founder.name}`,
    `- Need: ${scenario.founder.neededSkill}`,
    `- Budget: ${money(scenario.founder.budget)}`,
    `- Project: ${scenario.founder.summary}`,
    `- 7-day outcome: ${scenario.founder.outcome}`,
    ``,
    `## Recommended Builder`,
    ``,
    `- Name: ${selectedMatch.builder.name}`,
    `- Score: ${selectedMatch.score}`,
    `- Status: ${selectedMatch.builder.status}`,
    `- Minimum rate: ${money(selectedMatch.builder.minimumRate)}`,
    `- Proof: ${selectedMatch.builder.proofLinks.join("; ")}`,
    ``,
    `## Why This Match`,
    ``,
    ...selectedMatch.reasons.map((reason) => `- ${reason}`),
    ``,
    `## Trial Economics`,
    ``,
    `- Suggested stipend: ${money(economics.stipend)}`,
    `- Builder receives: ${money(economics.builderReceives)}`,
    `- Platform fee: ${money(economics.platformFee)}`,
    `- Can proceed: ${economics.canProceed ? "yes" : "needs budget/scope adjustment"}`,
    ``,
    `## Top Matches`,
    ``,
    ...matches.slice(0, 3).map((match, index) => `${index + 1}. ${match.builder.name} - score ${match.score}`)
  ].join("\n");

  return { packet, summary };
}

await mkdir(outputDir, { recursive: true });

for (const scenario of scenarios) {
  const { packet, summary } = buildExample(scenario);
  await writeFile(new URL(`${scenario.id}.json`, outputDir), `${JSON.stringify(packet, null, 2)}\n`);
  await writeFile(new URL(`${scenario.id}.md`, outputDir), `${summary}\n`);
}

console.log(`Generated ${scenarios.length} example match packets in examples/`);
