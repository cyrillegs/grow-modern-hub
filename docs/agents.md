# Claude Code Agents

Notes on **Claude Code subagents** — specialized sessions you can spawn to handle a focused task and report back. Captured here so future-you knows when to graduate from "one main session" to a multi-agent setup.

## Current state of this project

Zero custom subagents. Everything is handled by the main Claude Code session. That's the right call while the codebase is small and the work is bounded. Revisit when the **signals** below start appearing.

## What subagents are good for

- **Context-window protection.** A subagent reads 50 files and returns a 200-word summary. The main conversation stays uncluttered.
- **Parallelism.** Multiple agents work simultaneously on independent tasks (e.g. one writes tests while another updates docs).
- **Specialization.** Each agent has a focused system prompt → better, more consistent output for its domain.
- **Reproducibility.** The same agent invoked the same way produces consistent reviews, useful for PR automation.

## Common agent categories in large projects

A team with 5+ developers, multiple services, and hundreds of files typically has **10–30 agent types** in active rotation. Roughly grouped:

### 1. Code-review specialists

Single dimension per agent, so reviews stay sharp.

| Agent | What it reviews |
|---|---|
| `security-reviewer` | OWASP top 10, auth flows, SQL injection, secret leakage, RLS gaps |
| `code-reviewer` | Style, naming, complexity, dead code |
| `a11y-reviewer` | ARIA, keyboard nav, color contrast, screen-reader compatibility |
| `perf-reviewer` | N+1 queries, missing memoization, bundle bloat, render thrashing |
| `test-coverage-reviewer` | Untested branches, missing edge cases, flaky test patterns |

Trigger via hooks on PR open, or manually via a slash command. Each writes a comment back to the PR.

### 2. Domain specialists

Focused expertise the main session delegates to.

| Agent | Use case |
|---|---|
| `db-migration-expert` | Writes safe Postgres migrations with rollback plans |
| `react-specialist` | Picks the right pattern (context vs Zustand vs Query) for the situation |
| `api-designer` | REST/GraphQL endpoint design, versioning, deprecation |
| `infra-specialist` | Terraform / K8s / CI/CD changes |
| `payment-specialist` | Stripe/PayMongo flows, idempotency, webhook handling |

### 3. Research / exploration

For when "find X" would take 5+ searches.

| Agent | Use case |
|---|---|
| `codebase-explorer` *(built-in: Explore)* | "Where does config get loaded?" / "Who calls this function?" |
| `library-researcher` | "Compare 5 date-picker libraries; recommend one" |
| `incident-investigator` | Reads logs + recent commits to localize a regression |

### 4. Implementation workers

Parallel work, time-bounded tasks.

| Agent | Use case |
|---|---|
| `test-writer` | "Write tests for this PR" — runs in parallel with main work |
| `type-tightener` | "Add proper types to this module; remove implicit `any`" |
| `docs-writer` | "Update CHANGELOG.md and the README based on this PR" |
| `migration-runner` | Headless agent in CI for things like dep upgrades |

### 5. Planning

For complex changes before any code is written.

| Agent | Use case |
|---|---|
| `architect` *(built-in: Plan)* | "Design the data model + API for a notifications system" |
| `migration-planner` | "We're moving from REST to GraphQL. Plan the rollout." |
| `refactor-planner` | "Plan splitting this 5000-line file into modules" |

## Typical workflow on a feature PR

```text
You: "Add comments feature"
  ↓
Main session → spawns Plan agent
  ↓
Plan agent returns design (DB schema, API surface, UI pages)
  ↓
You approve the plan
  ↓
Main session implements core code
  ↓
Main session spawns test-writer + docs-writer IN PARALLEL
  ↓
PR opens → GitHub Action runs:
  - security-reviewer
  - code-reviewer
  - test-coverage-reviewer
  ↓
You read 3 distinct review comments, address them, merge
```

That's why "10-agent project" isn't ridiculous — each agent runs briefly, returns a focused result, then exits.

## How to define a custom agent

Custom agents live in `.claude/agents/` as Markdown files with frontmatter:

```markdown
---
name: security-reviewer
description: Reviews PRs for security issues (OWASP top 10, auth flows, secrets)
tools: Read, Grep, Glob
model: claude-opus-4-7
---

You are a security review specialist. When reviewing a PR:
1. Scan all changed files for hardcoded secrets, weak crypto, SQL injection risk
2. Check auth/authz flows for RLS bypass, role escalation
3. Report findings as a Markdown PR comment with severity ratings
4. Never recommend permissive defaults
```

Invocation (from the main session):

```ts
Agent({
  subagent_type: "security-reviewer",
  description: "Review PR #42",
  prompt: "Review the changes on branch feat/checkout for security issues."
})
```

## When to add custom agents to this project

Watch for these signals — when one or more become routine, that's the time:

- **You hit context-window limits** during normal work → offload heavy reading to a subagent.
- **You repeat the same review pattern manually** every PR → automate it as an agent.
- **You have a specialty domain** (compliance, security, accessibility) where the rules need codifying.
- **Multiple developers** want consistent automated review without manual reminders.

### Specific candidates worth considering as the project grows

- **`security-reviewer`** — once payment / orders are wired (Buy Now), defending the checkout flow matters.
- **`db-migration-expert`** — if/when migrations get hairy (e.g., backfilling 100k rows safely).
- **Multi-agent PR review** — Claude Code's built-in `/ultrareview` runs multiple specialized reviewers in parallel before merging risky PRs.

## Built-in agents already available

Even without writing custom agents, Claude Code ships with a few that are usable today:

| Agent type | When to use |
|---|---|
| `Explore` | Open-ended codebase search across many files |
| `Plan` | Designing implementation strategy for non-trivial work |
| `general-purpose` | Complex multi-step tasks where the path isn't obvious |
| `claude-code-guide` | Questions about Claude Code itself, the Agent SDK, or the Anthropic API |
| `statusline-setup` | Configuring the Claude Code status line |

I'll reach for these when the work calls for them. For most current tasks in this project, the main session handles them directly.
