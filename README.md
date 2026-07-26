# compare-html

A toolkit for **structured HTML comparison** — find what changed between two HTML documents, with control over how elements, attributes, and child nodes are matched.

## Why

Most HTML diff tools either output unstructured text or hide the parts that matter (where an element was added, whether an array differs in order or in content). `compare-html` parses HTML into a structured representation and returns a list of differences — every entry carries a path, the side it belongs to (`base` / `contrast` / `both`), and the kind of change (`added`, `deleted`, `valueChanged`) — so you can render, filter, or program against it.

## Features

- **Deep comparison** of HTML elements, attributes, arrays, and text values.
- **Three child node comparison strategies**: `byIndex` (default), `lcs` (minimal diff via Longest Common Subsequence), and `unordered` (multiset match).
- **Case-insensitive** tag/attribute name and/or text/attribute value matching.
- **Path tracking** with both segment-array and dot-notation forms.
- **CLI** with table or JSON output, reading from inline strings or files.
- **MCP server** built in — drop the CLI into any MCP-aware AI assistant.
- **Agent Skill** — a single skill that works in Claude Code, OpenAI Codex CLI, and OpenCode.
- Full **TypeScript** types.

## Packages

This is a pnpm workspace:

| Package | Description |
|---------|-------------|
| [`@compare-html/core`](./packages/compare-html-core) | Core comparison library (programmatic API). |
| [`@compare-html/cli`](./packages/compare-html-cli) | Command-line tool & MCP server, built on top of `core`. |

## Quick Start

### Library

```bash
npm install @compare-html/core
```

```typescript
import { compareHTML } from '@compare-html/core';

const differences = compareHTML({
  baseHTML: '<user><name>Alice</name><age>30</age></user>',
  contrastHTML: '<user><name>Bob</name><age>30</age><email>bob@test.com</email></user>',
});

// [
//   { pathString: 'user.name',  pathBelongsTo: 'both',     diffType: 'valueChanged', ... },
//   { pathString: 'user.email', pathBelongsTo: 'contrast', diffType: 'added',        ... },
// ]
```

See the [core README](./packages/compare-html-core/README.md) for the full API.

### CLI

```bash
npm install -g @compare-html/cli

compare-html base.html contrast.html
```

```
┌──────────────┬──────────────┐
│ Key          │ Change Type  │
├──────────────┼──────────────┤
│ (Base) a     │ valueChanged │
│ (Base) b     │ deleted      │
│ (Contrast) c │ added        │
└──────────────┴──────────────┘
```

Use `--json-export` for machine-readable output, or `--mcp` to launch as an MCP server. See the [CLI README](./packages/compare-html-cli/README.md) for all flags and the MCP tool schema.

### MCP

```json
{
  "mcpServers": {
    "compare-html": {
      "command": "npx",
      "args": ["@compare-html/cli@latest", "--mcp"]
    }
  }
}
```

### Skill

A single [`SKILL.md`](./skills/compare-html/SKILL.md) teaches AI coding assistants how to invoke the CLI on demand. The file follows the open [Agent Skills](https://github.com/anthropics/skills) format and works across Claude Code, OpenAI Codex CLI, OpenCode, Cursor, and 50+ others.

The fastest install is [`npx skills`](https://github.com/vercel-labs/skills) — it auto-detects every agent you have installed and drops the skill into each one:

```bash
npx skills add unitstack/compare-html
```

## Development

Requires Node.js ≥ 20 and pnpm.

```bash
# install dependencies
pnpm install

# build all packages
pnpm -r build

# run tests across the workspace
pnpm -r test

# lint
pnpm -r lint
```

The repo layout:

```
packages/
├── compare-html-core/     # @compare-html/core — library
├── compare-html-cli/      # @compare-html/cli  — CLI + MCP server
└── internal/             # shared eslint/tsconfig (not published)
skills/
└── compare-html/          # SKILL.md for Claude Code / Codex CLI / OpenCode
```

## License

MIT
