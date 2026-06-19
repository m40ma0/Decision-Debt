export const moonshotTitle = "Decision Debt: Foresight Infrastructure for Teams";

export const moonshotOneLiner =
  "A system that turns unresolved decisions into measurable future risk, so teams can see what their uncertainty is costing them before it compounds.";

export const moonshotSections = [
  {
    title: "The problem humanity has misunderstood",
    body:
      "Most teams treat decisions as tasks to close. The deeper problem is that unresolved choices behave like hidden liabilities: they tax attention, slow execution, and distort future options."
  },
  {
    title: "Why existing tools are insufficient",
    body:
      "Task managers track work. Docs store notes. AI chat summarizes text. None of them convert uncertainty into an operational model of delay, risk, ownership, and organizational memory."
  },
  {
    title: "First-principles insight",
    body:
      "A decision is not merely a record. It is a constraint on the future. If a team can represent unresolved choices as structured state, it can forecast the cost of delay, assign ownership, and reduce cognitive entropy before it becomes organizational debt."
  },
  {
    title: "Prototype",
    body:
      "Decision Debt captures meetings and project updates, extracts candidate decisions, scores unresolved risk, visualizes cost of delay, and preserves outcome reviews so the organization learns from each resolution."
  },
  {
    title: "Technical foundations",
    body:
      "The prototype uses a Supabase-backed event model, explainable heuristic scoring, local note extraction, workflow stages, exports, and demo seeding. The heuristic path keeps the system usable even without external AI infrastructure."
  },
  {
    title: "Long-term implication",
    body:
      "At scale, the product becomes a shared foresight layer for teams: not just an inbox for decisions, but an operating system for uncertainty, accountability, and second-order thinking."
  }
] as const;

export const moonshotArchitecture = [
  "Capture: paste notes, Slack updates, or meeting summaries.",
  "Extract: identify decisions, blockers, owner, deadline, and next action.",
  "Score: estimate decision debt, cost of delay, and stakeholder blast radius.",
  "Triage: move each item through a visible lifecycle.",
  "Resolve: commit, delegate, defer, or delete.",
  "Learn: record outcome quality and lesson learned so the system gets smarter."
] as const;

export function buildMoonshotPaperMarkdown() {
  return [
    `# ${moonshotTitle}`,
    "",
    moonshotOneLiner,
    "",
    ...moonshotSections.flatMap((section) => [
      `## ${section.title}`,
      section.body,
      ""
    ]),
    "## System Architecture",
    ...moonshotArchitecture.map((line) => `- ${line}`),
    "",
    "## Why it matters",
    "The product attempts to invent a new category: decision foresight infrastructure. If it works, teams can see the cost of hesitation, coordinate faster, and build institutional memory instead of repeatedly rediscovering the same uncertainty.",
    "",
    "## Demo Narrative",
    "A startup launch is blocked by unresolved pricing, onboarding, and AI scope decisions. The team pastes notes, sees the extracted decisions, triages them into owners, and watches the cost of delay update live.",
    ""
  ].join("\n");
}

