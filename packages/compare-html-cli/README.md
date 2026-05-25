# @compare-html/cli

A command-line tool for comparing HTML files or strings. Built on top of [@compare-html/core](https://www.npmjs.com/package/@compare-html/core).

## Online Playground

Try it out at [https://comparehtml.com](https://comparehtml.com)

## Installation

```bash
# npm
npm install -g @compare-html/cli

# yarn
yarn global add @compare-html/cli

# pnpm
pnpm add -g @compare-html/cli
```

## CLI

### Quick Start

```bash
# View help
compare-html --help

# Compare two HTML strings
compare-html '<div>Hello</div>' '<div>World</div>'

# Compare two HTML files
compare-html base.html contrast.html

# Output as JSON format
compare-html base.html contrast.html --json-export

# Save output to file
compare-html base.html contrast.html -o output.txt
```

### Usage

```
compare-html <base> <contrast> [options]
```

#### Arguments

| Argument | Description |
|----------|-------------|
| `<base>` | Base HTML string or file path |
| `<contrast>` | Contrast HTML string or file path |

#### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--json-export` | `-j` | Output as JSON format | `false` |
| `--output <file>` | `-o` | Output to file | - |
| `--mcp` | - | Run as an MCP server via stdio | `false` |

### Examples

#### Basic Comparison

```bash
compare-html '<div class="old">Hello</div>' '<div class="new">Hello</div>'
```

Output:
```
┌────────────────┬─────────────────┐
│ Path           │ Change Type     │
├────────────────┼─────────────────┤
│ div > @class   │ valueChanged    │
└────────────────┴─────────────────┘
```

#### Compare Files

```bash
compare-html base.html contrast.html
```

#### Detect Added/Removed Elements

```bash
compare-html '<ul><li>A</li></ul>' '<ul><li>A</li><li>B</li></ul>'
```

Output:
```
┌────────────┬─────────────────┐
│ Path       │ Change Type     │
├────────────┼─────────────────┤
│ ul > li    │ added           │
└────────────┴─────────────────┘
```

#### JSON Output

```bash
compare-html base.html contrast.html -j
compare-html base.html contrast.html --json-export
```

Output:
```json
[
  {
    "pathSegments": ["0", "@class"],
    "pathString": "0.@class",
    "contrastPathString": "0.@class",
    "displayPath": "div > @class",
    "pathBelongsTo": "both",
    "diffType": "valueChanged"
  }
]
```

#### Save to File

```bash
# Save table format
compare-html base.html contrast.html -o diff.txt

# Save JSON format
compare-html base.html contrast.html -j -o diff.json
```

### Output Format

#### Table Format (Default)

```
┌──────────────────────┬─────────────────┐
│ Path                 │ Change Type     │
├──────────────────────┼─────────────────┤
│ div > @class         │ valueChanged    │
│ div > p > ::text      │ valueChanged    │
│ div > span           │ added           │
└──────────────────────┴─────────────────┘
```

#### JSON Format

```json
[
  {
    "pathSegments": ["0", "@class"],
    "pathString": "0.@class",
    "contrastPathString": "0.@class",
    "displayPath": "div > @class",
    "pathBelongsTo": "both",
    "diffType": "valueChanged"
  },
  {
    "pathSegments": ["0", "0", "0"],
    "pathString": "0.0.0",
    "contrastPathString": "0.0.0",
    "displayPath": "div > p > ::text",
    "pathBelongsTo": "both",
    "diffType": "valueChanged"
  },
  {
    "pathSegments": ["0", "2"],
    "pathString": "0.2",
    "contrastPathString": "0.2",
    "displayPath": "div > span",
    "pathBelongsTo": "contrast",
    "diffType": "added"
  }
]
```

### Difference Types

| Type | Description |
|------|-------------|
| `added` | Node or attribute exists in contrast but not in base |
| `deleted` | Node or attribute exists in base but not in contrast |
| `valueChanged` | Value changed between base and contrast (text, attribute, or tag) |

## MCP Server

`@compare-html/cli` also provides an MCP (Model Context Protocol) server for AI assistants to compare HTML values programmatically.

### Start the MCP Server

```bash
npx @compare-html/cli --mcp
```

### Available Tools

#### `compare_html`

Compare two HTML values and return their structural differences.

**Input:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `baseHTML` | `string` | No | Base HTML string |
| `baseHTMLFilePath` | `string` | No | Base HTML file path |
| `contrastHTML` | `string` | No | Contrast HTML string |
| `contrastHTMLFilePath` | `string` | No | Contrast HTML file path |

At least one base and one contrast input must be provided.

**Output:**

Returns an array of `HTMLValueDifference` objects:

```json
{
  "differences": [
    {
      "pathSegments": ["0", "@class"],
      "pathString": "0.@class",
      "contrastPathString": "0.@class",
      "displayPath": "div > @class",
      "pathBelongsTo": "both",
      "diffType": "valueChanged"
    }
  ]
}
```

### MCP Client Configuration

Add the following to your MCP client config (e.g. `mcp.json`):

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

## License

MIT
