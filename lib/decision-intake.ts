import { parseLines } from "@/lib/utils";

export type DecisionIntakeOption = {
  title: string;
  description: string;
};

export type DecisionIntakeCandidate = {
  title: string;
  description: string;
  options: DecisionIntakeOption[];
  blockers: string[];
  owner: string;
  deadline: string;
  workspace: string;
  project: string;
  tags: string[];
  confidence: number;
  affectedStakeholders: number;
  nextAction: string;
  uncertainty: string;
};

const decisionCue = /(?:^|\b)(decision|decide|choose|pick|need to decide|should we|we need to|finalize|finalise)\b/i;
const sectionBreak = /\n{2,}/;

function normalizeNotes(notes: string) {
  return notes
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanValue(value: string) {
  return value.replace(/^[\s:,-]+/, "").trim();
}

function parseDate(value: string) {
  const raw = cleanValue(value);
  if (!raw) return "";

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  const isoMatch = raw.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return isoMatch?.[1] ?? "";
}

function parseList(lines: string[], pattern: RegExp) {
  return lines
    .map((line) => line.match(pattern)?.[1])
    .filter((value): value is string => Boolean(value))
    .map(cleanValue)
    .filter(Boolean);
}

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanValue(match[1]);
  }
  return "";
}

function titleFromParagraph(paragraph: string) {
  const lines = paragraph
    .split("\n")
    .map((line) => cleanValue(line))
    .filter(Boolean);

  const firstLine =
    lines.find((line) =>
      /^(?:decision|decide|choose|pick|need to decide|should we|we need to|finalize|finalise)\s*[:\-]/i.test(line)
    ) ?? lines[0];

  if (!firstLine) return "Untitled decision";

  const cue = firstLine.match(
    /^(?:decision|decide|choose|pick|need to decide|should we|we need to|finalize|finalise)\s*[:\-]?\s*(.+)$/i
  );
  if (cue?.[1]) {
    return cue[1]
      .replace(/\b(before|for|to)\b.*$/i, "")
      .replace(/[.?!]+$/, "")
      .trim();
  }

  const heading = firstLine.match(/^([A-Z][^:]{2,80})(?::\s*(.+))?$/);
  if (heading?.[1] && heading[2]) {
    return heading[1].trim();
  }

  return firstLine.replace(/[.?!]+$/, "").slice(0, 90);
}

function confidenceFromText(text: string) {
  const explicit = text.match(/confidence[:\s-]*(\d(?:\.\d)?)/i);
  if (explicit?.[1]) {
    const value = Number(explicit[1]);
    return Math.max(1, Math.min(5, Math.round(value)));
  }

  const low = /uncertain|uncertainty|unclear|blocked/i.test(text);
  if (low) return 2;
  const high = /confident|clear|aligned|ready/i.test(text);
  if (high) return 4;
  return 3;
}

function stakeholdersFromText(text: string) {
  const explicit = text.match(/stakeholders?[:\s-]*(\d+)/i);
  if (explicit?.[1]) return Math.max(0, Number(explicit[1]));

  const people = text.match(/(\d+)\s+(?:people|teammates|stakeholders|users)/i);
  return people?.[1] ? Math.max(0, Number(people[1])) : 0;
}

function sectionFromParagraph(paragraph: string, label: string) {
  const regex = new RegExp(`${label}[:\\s-]*([\\s\\S]+?)(?:\\n\\w+[:\\s-]|$)`, "i");
  const match = paragraph.match(regex);
  return match?.[1] ? cleanValue(match[1]) : "";
}

function extractOptions(paragraph: string) {
  const lines = normalizeNotes(paragraph);
  const optionLines = lines.filter((line) => /^(?:[-*]\s*)?(?:option\s*[a-z0-9]+|option\s*1|option\s*2|choice\s*[a-z0-9]+)/i.test(line));

  if (optionLines.length > 0) {
    return optionLines.map((line, index) => {
      const cleaned = line.replace(/^[-*]\s*/, "");
      const split = cleaned.split(/[:\-–]\s*/);
      return {
        title: split[0].replace(/^option\s*/i, "Option ").trim(),
        description: split.slice(1).join(": ").trim() || `Option ${index + 1}`
      };
    });
  }

  const bulletLines = lines.filter((line) => /^[-*]\s+/.test(line));
  return bulletLines.slice(0, 3).map((line, index) => ({
    title: `Option ${index + 1}`,
    description: line.replace(/^[-*]\s+/, "")
  }));
}

function inferTags(text: string, workspace: string, project: string) {
  const tags = new Set<string>();
  const keywords = [
    ["pricing", "pricing"],
    ["onboarding", "onboarding"],
    ["launch", "launch"],
    ["scope", "scope"],
    ["owner", "triage"],
    ["blocker", "blocker"],
    ["ai", "ai"],
    ["beta", "beta"]
  ] as const;

  for (const [needle, tag] of keywords) {
    if (text.toLowerCase().includes(needle)) tags.add(tag);
  }

  if (workspace) tags.add(workspace.toLowerCase());
  if (project) tags.add(project.toLowerCase());

  return [...tags].slice(0, 6);
}

function buildCandidate(paragraph: string): DecisionIntakeCandidate | null {
  const compact = paragraph.trim();
  if (!compact || !decisionCue.test(compact)) return null;

  const owner = firstMatch(compact, [
    /owner[:\s-]+([^\n,.;]+)/i,
    /assigned to[:\s-]+([^\n,.;]+)/i,
    /lead[:\s-]+([^\n,.;]+)/i
  ]);
  const deadline = parseDate(
    firstMatch(compact, [/deadline[:\s-]+([^\n,.;]+)/i, /due[:\s-]+([^\n,.;]+)/i, /by[:\s-]+([^\n,.;]+)/i])
  );
  const workspace = firstMatch(compact, [/workspace[:\s-]+([^\n,.;]+)/i, /team[:\s-]+([^\n,.;]+)/i]);
  const project = firstMatch(compact, [/project[:\s-]+([^\n,.;]+)/i, /initiative[:\s-]+([^\n,.;]+)/i]);
  const blockers = [
    ...parseLines(sectionFromParagraph(compact, "blockers")),
    ...parseList(normalizeNotes(compact), /^[-*]\s*blocker[:\s-]+(.+)$/i)
  ];
  const nextAction = firstMatch(compact, [
    /next action[:\s-]+([^\n]+)/i,
    /next step[:\s-]+([^\n]+)/i,
    /action[:\s-]+([^\n]+)/i
  ]);
  const options = extractOptions(compact);
  const confidence = confidenceFromText(compact);
  const affectedStakeholders = stakeholdersFromText(compact);
  const title = titleFromParagraph(compact);
  const description = compact.split("\n").slice(1).join(" ").trim() || compact;

  return {
    title,
    description,
    options,
    blockers,
    owner,
    deadline,
    workspace,
    project,
    tags: inferTags(compact, workspace, project),
    confidence,
    affectedStakeholders,
    nextAction:
      nextAction ||
      (owner
        ? `Confirm ownership with ${owner}.`
        : "Pick an owner and capture the smallest next action."),
    uncertainty: /uncertain|uncertainty|unclear|blocked/i.test(compact)
      ? "High"
      : confidence <= 2
        ? "Medium"
        : "Low"
  };
}

export function extractDecisionIntakeCandidates(notes: string) {
  const normalized = notes.trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(sectionBreak);
  const candidates = paragraphs
    .map((paragraph) => buildCandidate(paragraph))
    .filter((candidate): candidate is DecisionIntakeCandidate => Boolean(candidate));

  if (candidates.length > 0) return candidates;

  return [
    {
      title: titleFromParagraph(normalized),
      description: normalized,
      options: extractOptions(normalized),
      blockers: parseLines(firstMatch(normalized, [/blockers[:\s-]+([\s\S]+)/i]) ?? ""),
      owner: firstMatch(normalized, [/owner[:\s-]+([^\n,.;]+)/i]),
      deadline: parseDate(
        firstMatch(normalized, [/deadline[:\s-]+([^\n,.;]+)/i, /due[:\s-]+([^\n,.;]+)/i])
      ),
      workspace: firstMatch(normalized, [/workspace[:\s-]+([^\n,.;]+)/i]),
      project: firstMatch(normalized, [/project[:\s-]+([^\n,.;]+)/i]),
      tags: inferTags(normalized, "", ""),
      confidence: confidenceFromText(normalized),
      affectedStakeholders: stakeholdersFromText(normalized),
      nextAction: "Assign an owner and confirm the fastest next step.",
      uncertainty: "Medium"
    }
  ];
}
