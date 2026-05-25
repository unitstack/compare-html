import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createCompareHTMLInputSchema,
  createCompareHTMLOutputSchema,
  compareHTMLTool,
} from '../src/mcp/server';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

describe('MCP server', () => {
  const tmpDir = join(__dirname, '.tmp-mcp');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should have valid input schema', () => {
    const schema = createCompareHTMLInputSchema();
    expect(schema).toBeDefined();
  });

  it('should have valid output schema', () => {
    const schema = createCompareHTMLOutputSchema();
    expect(schema).toBeDefined();
  });

  it('should compare HTML via compareHTMLTool with strings', () => {
    const result = compareHTMLTool({
      baseHTML: '<div>Hello</div>',
      contrastHTML: '<div>World</div>',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].diffType).toBe('valueChanged');
  });

  it('should compare HTML via compareHTMLTool with files', () => {
    const base = join(tmpDir, 'mcp-base.html');
    const contrast = join(tmpDir, 'mcp-contrast.html');
    writeFileSync(base, '<p>A</p>', 'utf-8');
    writeFileSync(contrast, '<p>B</p>', 'utf-8');

    const result = compareHTMLTool({
      baseHTMLFilePath: base,
      contrastHTMLFilePath: contrast,
    });
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return empty array for identical HTML', () => {
    const result = compareHTMLTool({
      baseHTML: '<div>Same</div>',
      contrastHTML: '<div>Same</div>',
    });
    expect(result).toHaveLength(0);
  });
});
