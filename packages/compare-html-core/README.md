# @compare-html/core

A lightweight library for deep comparison of HTML structures. Parses HTML into virtual nodes (VNode) and detects additions, removals, and value changes between two HTML documents with structural awareness.

## Online Playground

Try it out at [https://comparehtml.com](https://comparehtml.com)

## Installation

```bash
# npm
npm install @compare-html/core

# yarn
yarn add @compare-html/core

# pnpm
pnpm add @compare-html/core
```

## Quick Start

```typescript
import { compareHTML } from '@compare-html/core';

const diffs = compareHTML({
  baseHTML: '<div class="old"><p>Hello</p></div>',
  contrastHTML: '<div class="new"><p>World</p></div>',
});

console.log(diffs);
// [
//   { pathSegments: ['0', '@class'], pathString: '0.@class', contrastPathString: '0.@class', displayPath: 'div > @class', pathBelongsTo: 'both', diffType: 'valueChanged' },
//   { pathSegments: ['0', '0', '0'], pathString: '0.0.0', contrastPathString: '0.0.0', displayPath: 'div > p > ::text', pathBelongsTo: 'both', diffType: 'valueChanged' },
// ]
```

## Examples

### Parsing HTML

```typescript
import { parseHTML, validateHTML } from '@compare-html/core';

// Parse an HTML fragment
const vnode = parseHTML('<div><p>Hello</p></div>');

// Parse a full document
const doc = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');

// Validate HTML (throws if empty)
validateHTML('<div>Valid</div>'); // OK
validateHTML(''); // throws Error: 'HTML is empty'
```

### Comparing HTML

```typescript
import { compareHTML } from '@compare-html/core';

// Detect attribute changes
compareHTML({ baseHTML: '<div class="old"></div>', contrastHTML: '<div class="new"></div>' });
// [{ pathSegments: ['0', '@class'], pathString: '0.@class', contrastPathString: '0.@class', displayPath: 'div > @class', pathBelongsTo: 'both', diffType: 'valueChanged' }]

// Detect added elements
compareHTML({ baseHTML: '<div></div>', contrastHTML: '<div><span>New</span></div>' });
// [{ ..., displayPath: 'div > span', pathBelongsTo: 'contrast', diffType: 'added' }]

// Detect deleted elements
compareHTML({ baseHTML: '<div><p>Old</p></div>', contrastHTML: '<div></div>' });
// [{ ..., displayPath: 'div > p', pathBelongsTo: 'base', diffType: 'deleted' }]
```

## API Reference

### `parseHTML`

```typescript
function parseHTML(html: string): VNode;
```

Parses an HTML string into a virtual node tree. Automatically detects whether the input is a full document or a fragment.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `html` | `string` | The HTML string to parse. |

**Returns:** `VNode` - The root virtual node representing the parsed HTML.

---

### `validateHTML`

```typescript
function validateHTML(html: string): void;
```

Validates an HTML string. Throws an error if the input is empty.

---

### `compareHTML`

```typescript
function compareHTML(params: {
  baseHTML: string;
  contrastHTML: string;
}): HTMLValueDifference[];
```

Compares two HTML strings and returns an array of structural differences. Internally parses both strings into VNode trees and performs a deep comparison.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `baseHTML` | `string` | The base (left-side) HTML string. |
| `contrastHTML` | `string` | The contrast (right-side) HTML string. |

**Returns:** `HTMLValueDifference[]` - An array of difference objects. Returns an empty array if the structures are equal.

---

### `pathSegmentsToString`

```typescript
function pathSegmentsToString(pathSegments: string[]): string;
```

Converts a path segments array to a dot-notation string.

---

### `VNode`

```typescript
interface VNode {
  type: 'element' | 'text' | 'comment' | 'doctype' | 'root';
  tag?: string;
  attrs?: Record<string, string>;
  children?: VNode[];
  value?: string;
  doctypeName?: string;
  publicId?: string;
  systemId?: string;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | The node type. |
| `tag` | `string` | Element tag name (for `element` type). |
| `attrs` | `Record<string, string>` | Element attributes. |
| `children` | `VNode[]` | Child nodes. |
| `value` | `string` | Text or comment content. |
| `doctypeName` | `string` | Doctype name (for `doctype` type). |

---

### `HTMLValueDiffType`

```typescript
type HTMLValueDiffType = 'added' | 'deleted' | 'valueChanged';
```

| Value | Description |
|-------|-------------|
| `'added'` | A node or attribute exists in the contrast but not in the base. |
| `'deleted'` | A node or attribute exists in the base but not in the contrast. |
| `'valueChanged'` | The value changed between base and contrast (text content, attribute value, or tag name). |

---

### `HTMLValueDifference`

```typescript
interface HTMLValueDifference {
  pathSegments: string[];
  pathString: string;
  contrastPathString: string;
  displayPath: string;
  pathBelongsTo: 'base' | 'contrast' | 'both';
  diffType: HTMLValueDiffType;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `pathSegments` | `string[]` | The path to the differing node as an array of segments. |
| `pathString` | `string` | The path as a dot-notation string (e.g., `'0.1.@class'`). |
| `contrastPathString` | `string` | The path in the contrast tree as a dot-notation string. |
| `displayPath` | `string` | A human-readable path (e.g., `'div > p > @class'`). |
| `pathBelongsTo` | `string` | Which side the path belongs to: `'base'`, `'contrast'`, or `'both'`. |
| `diffType` | `HTMLValueDiffType` | The type of difference detected at this path. |

## License

MIT
