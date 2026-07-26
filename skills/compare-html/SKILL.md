---
name: compare-html
description: Compare two HTML files or strings and identify the differences (added, deleted, value-changed) at each path. Use when the user wants to diff HTML documents, find what changed between two HTML pages, templates, or fragments.
---

# compare-html

Use `npx @compare-html/cli` to compare two HTML values and identify their differences.

## Usage

```bash
npx @compare-html/cli <base> <contrast> [options]
```

Each positional argument can be either an inline HTML string or a path to an HTML file. The CLI resolves the value at runtime: if it matches an existing file, the file is read and parsed; otherwise the argument itself is parsed as HTML.

## Arguments

- `<base>` — Base HTML string or file path
- `<contrast>` — Contrast HTML string or file path

## Options

- `-a, --array-compare-method <method>` — Child node comparison method, one of `byIndex` (default), `lcs`, `unordered`
  - `byIndex` — Compare child nodes by index position
  - `lcs` — Minimal diff for ordered child nodes via Longest Common Subsequence
  - `unordered` — Treat child nodes as multisets
- `-k, --key-case-insensitive` — Case-insensitive tag/attribute name comparison
- `-v, --value-case-insensitive` — Case-insensitive text/attribute value comparison
- `-j, --json-export` — Output as JSON instead of the default table
- `-o, --output <file>` — Write the output to a file instead of stdout

## Examples

Compare two HTML strings:

```bash
npx @compare-html/cli '<root><name>Alice</name></root>' '<root><name>Bob</name></root>'
```

Compare two HTML files:

```bash
npx @compare-html/cli base.html contrast.html
```

Case-insensitive keys:

```bash
npx @compare-html/cli '<root><Name>Alice</Name></root>' '<root><name>Alice</name></root>' -k
```

LCS array comparison — minimal diff for ordered arrays:

```bash
npx @compare-html/cli '<root><items><item>1</item><item>2</item><item>3</item></items></root>' '<root><items><item>2</item><item>3</item><item>4</item></items></root>' -a lcs
```

JSON output:

```bash
npx @compare-html/cli base.html contrast.html -j
```

Save output to a file:

```bash
npx @compare-html/cli base.html contrast.html -o diff.txt
```

Combine tolerance options:

```bash
npx @compare-html/cli '<root><Name>Alice</Name></root>' '<root><name>ALICE</name></root>' -k -v
```

## Output Format

By default, results are printed as a Unicode box-drawn table. Each row is labeled with the side that owns the path: `(Base)` for value changes and deletions, `(Contrast)` for additions, and `(Root)` when the top-level value itself differs.

```
┌──────────────┬──────────────┐
│ Key          │ Change Type  │
├──────────────┼──────────────┤
│ (Base) a     │ valueChanged │
│ (Base) b     │ deleted      │
│ (Contrast) c │ added        │
└──────────────┴──────────────┘
```

When the two inputs match exactly, the output is simply `No differences found`.

With `--json-export` (`-j`), the same data is emitted as JSON:

```json
[
  {
    "pathSegments": ["root", "name"],
    "pathString": "root.name",
    "pathBelongsTo": "both",
    "diffType": "valueChanged"
  }
]
```

## Difference Types

- `added` — Value exists in `contrast` but not in `base`
- `deleted` — Value exists in `base` but not in `contrast`
- `valueChanged` — Value changed between base and contrast
