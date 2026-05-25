import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

describe('CLI e2e', { timeout: 30000 }, () => {
  const tmpDir = join(__dirname, '../.tmp-e2e');
  const cliPath = join(__dirname, '../src/cli.ts');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should compare two HTML files and show table output', () => {
    const base = join(tmpDir, 'base.html');
    const contrast = join(tmpDir, 'contrast.html');
    writeFileSync(base, '<div>Hello</div>', 'utf-8');
    writeFileSync(contrast, '<div>World</div>', 'utf-8');

    const result = execSync(`npx tsx ${cliPath} "${base}" "${contrast}"`, {
      encoding: 'utf-8',
      cwd: join(__dirname, '..'),
    });
    expect(result).toContain('valueChanged');
  });

  it('should compare two identical HTML files and show no differences', () => {
    const base = join(tmpDir, 'same1.html');
    const contrast = join(tmpDir, 'same2.html');
    writeFileSync(base, '<div>Hello</div>', 'utf-8');
    writeFileSync(contrast, '<div>Hello</div>', 'utf-8');

    const result = execSync(`npx tsx ${cliPath} "${base}" "${contrast}"`, {
      encoding: 'utf-8',
      cwd: join(__dirname, '..'),
    });
    expect(result).toContain('No differences found');
  });

  it('should output JSON format with --json-export flag', () => {
    const base = join(tmpDir, 'json-base.html');
    const contrast = join(tmpDir, 'json-contrast.html');
    writeFileSync(base, '<div class="a">Hello</div>', 'utf-8');
    writeFileSync(contrast, '<div class="b">Hello</div>', 'utf-8');

    const result = execSync(
      `npx tsx ${cliPath} "${base}" "${contrast}" --json-export`,
      { encoding: 'utf-8', cwd: join(__dirname, '..') },
    );
    const parsed: unknown = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect((parsed as unknown[]).length).toBeGreaterThan(0);
  });
});
