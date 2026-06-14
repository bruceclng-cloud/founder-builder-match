const scenarios = [
  {
    id: "fullstack-tutor-mvp",
    name: "Full-stack MVP for tutor booking",
    description: "A semi-technical founder needs a builder to ship a small booking flow.",
    founder: {
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
    },
    trial: {
      trialType: "feature",
      acceptance: "Demo booking flow works with sample data. Screens are responsive. Handoff notes explain next technical steps.",
      evidence: "GitHub branch, deployed demo link, Loom walkthrough, screenshots of mobile and desktop."
    },
    proof: {
      status: "Milestones completed",
      artifacts: "Demo URL, GitHub branch, Loom walkthrough, implementation notes.",
      feedback: "Strong execution and clear communication."
    },
    builders: [
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
    ]
  },
  {
    id: "ai-ops-prototype",
    name: "AI operations proof-of-concept",
    description: "A founder with customer conversations needs an AI automation builder.",
    founder: {
      name: "Noah Patel",
      timezone: "GMT+0",
      summary: "An AI assistant that turns messy client emails into task lists for boutique agencies.",
      neededSkill: "ai",
      budget: 1800,
      stage: "Prototype exists",
      marketEvidence: "Waitlist",
      outcome: "Build a proof-of-concept that classifies 30 sample emails, extracts tasks, and exports a reviewable task board.",
      hasBudget: true,
      clearScope: true,
      hasTimeline: true,
      canGiveFeedback: true
    },
    trial: {
      trialType: "ai",
      acceptance: "Prototype processes the sample email set, produces task JSON, and includes notes on accuracy limits and next model choices.",
      evidence: "Repository link, notebook or service demo, test email set, Loom walkthrough, accuracy notes."
    },
    proof: {
      status: "Milestones completed",
      artifacts: "Repository link, model notes, sample outputs, Loom walkthrough.",
      feedback: "Useful POC with clear limitations and practical next steps."
    },
    builders: [
      {
        id: "amina-ai",
        name: "Amina Patel",
        timezone: "GMT+0",
        status: "Recently laid off",
        skills: ["ai", "backend", "fullstack"],
        minimumRate: 1500,
        availability: "Full week",
        proofLinks: ["GitHub: LLM workflow tooling", "Case study: support automation", "LinkedIn: ML platform engineer"]
      },
      {
        id: "marco",
        name: "Marco Silva",
        timezone: "GMT+1",
        status: "Freelance",
        skills: ["backend", "devops"],
        minimumRate: 1100,
        availability: "12 hrs/week",
        proofLinks: ["GitHub: API integrations", "Resume: backend engineer"]
      },
      {
        id: "nina",
        name: "Nina Roberts",
        timezone: "GMT-5",
        status: "Open to project work",
        skills: ["design", "frontend"],
        minimumRate: 800,
        availability: "Evenings",
        proofLinks: ["Portfolio: workflow dashboards", "Figma: operations UI"]
      }
    ]
  },
  {
    id: "design-led-waitlist",
    name: "Design-led landing page and waitlist",
    description: "An idea-stage founder needs a credible design/frontend trial, not a full app build.",
    founder: {
      name: "Iris Morgan",
      timezone: "GMT-5",
      summary: "A local marketplace for parents to find vetted after-school activity providers.",
      neededSkill: "frontend",
      budget: 750,
      stage: "Idea only",
      marketEvidence: "No evidence yet",
      outcome: "Create a landing page, waitlist form, and three value-proposition variants for parent interviews.",
      hasBudget: true,
      clearScope: true,
      hasTimeline: true,
      canGiveFeedback: true
    },
    trial: {
      trialType: "prototype",
      acceptance: "Landing page has three message variants, a working waitlist form mock, mobile layout, and a list of assumptions to test.",
      evidence: "Deployed page, Figma file, screenshots, notes on messaging assumptions."
    },
    proof: {
      status: "Partial completion",
      artifacts: "Deployed page, Figma file, messaging notes.",
      feedback: "Strong design direction; market evidence still needs founder interviews."
    },
    builders: [
      {
        id: "sam-design",
        name: "Sam Rivera",
        timezone: "GMT-5",
        status: "Freelance",
        skills: ["design", "frontend"],
        minimumRate: 700,
        availability: "15 hrs/week",
        proofLinks: ["Portfolio: mobile prototypes", "Figma community", "Resume: product designer"]
      },
      {
        id: "leo-remote",
        name: "Leo Wong",
        timezone: "GMT+8",
        status: "Underemployed",
        skills: ["frontend", "backend", "fullstack"],
        minimumRate: 900,
        availability: "20 hrs/week",
        proofLinks: ["GitHub: booking widgets", "Portfolio: SaaS dashboards", "LinkedIn: 4 years full-stack"]
      },
      {
        id: "rachel",
        name: "Rachel Kim",
        timezone: "GMT-8",
        status: "Looking for portfolio work",
        skills: ["design"],
        minimumRate: 500,
        availability: "10 hrs/week",
        proofLinks: ["Portfolio: landing pages", "Case study: waitlist conversion"]
      }
    ]
  }
];

function getScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) || scenarios[0];
}

export { getScenario, scenarios };
