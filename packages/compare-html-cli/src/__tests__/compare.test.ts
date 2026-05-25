import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { compare, formatTable } from '../compare';
import type { HTMLValueDifference } from '@compare-html/core';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

describe('compare', () => {
  const tmpDir = join(__dirname, '../../.tmp-test');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should compare two HTML files', () => {
    const base = join(tmpDir, 'base.html');
    const contrast = join(tmpDir, 'contrast.html');
    writeFileSync(base, '<div>Hello</div>', 'utf-8');
    writeFileSync(contrast, '<div>World</div>', 'utf-8');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    compare(base, contrast);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should output JSON when jsonExport is true', () => {
    const base = join(tmpDir, 'base2.html');
    const contrast = join(tmpDir, 'contrast2.html');
    writeFileSync(base, '<div>Hello</div>', 'utf-8');
    writeFileSync(contrast, '<div>World</div>', 'utf-8');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    compare(base, contrast, { jsonExport: true });
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(() => JSON.parse(output) as unknown).not.toThrow();
    consoleSpy.mockRestore();
  });

  it('should write to output file', () => {
    const base = join(tmpDir, 'base3.html');
    const contrast = join(tmpDir, 'contrast3.html');
    const outputFile = join(tmpDir, 'output.txt');
    writeFileSync(base, '<div>Hello</div>', 'utf-8');
    writeFileSync(contrast, '<div>World</div>', 'utf-8');

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    compare(base, contrast, { output: outputFile });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Output written to'),
    );
    consoleSpy.mockRestore();
  });
});

describe('formatTable', () => {
  it('should return no differences message for empty array', () => {
    expect(formatTable([])).toBe('No differences found');
  });

  it('should format differences into a table', () => {
    const diffs: HTMLValueDifference[] = [
      {
        pathSegments: ['0', '0'],
        pathString: '0.0',
        displayPath: 'div > ::text',
        pathBelongsTo: 'both',
        diffType: 'valueChanged',
      },
    ];
    const result = formatTable(diffs);
    expect(result).toContain('Path');
    expect(result).toContain('Change Type');
    expect(result).toContain('valueChanged');
    expect(result).toContain('(Both) div > ::text');
  });

  it('should format contrast pathBelongsTo', () => {
    const diffs: HTMLValueDifference[] = [
      {
        pathSegments: ['0', '@class'],
        pathString: '0.@class',
        displayPath: 'div > @class',
        pathBelongsTo: 'contrast',
        diffType: 'added',
      },
    ];
    const result = formatTable(diffs);
    expect(result).toContain('(Contrast) div > @class');
    expect(result).toContain('added');
  });

  it('should format base pathBelongsTo', () => {
    const diffs: HTMLValueDifference[] = [
      {
        pathSegments: ['0', '@id'],
        pathString: '0.@id',
        displayPath: 'div > @id',
        pathBelongsTo: 'base',
        diffType: 'deleted',
      },
    ];
    const result = formatTable(diffs);
    expect(result).toContain('(Base) div > @id');
    expect(result).toContain('deleted');
  });

  it('should use pathString when displayPath is empty', () => {
    const diffs: HTMLValueDifference[] = [
      {
        pathSegments: ['0'],
        pathString: '0',
        displayPath: '',
        pathBelongsTo: 'both',
        diffType: 'valueChanged',
      },
    ];
    const result = formatTable(diffs);
    expect(result).toContain('(Both) 0');
  });
});
