import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { parseInput, getPkgVersion } from '../utils';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

vi.mock('package-directory', async (importOriginal) => {
  const actual =
    await importOriginal<Record<string, (...args: unknown[]) => unknown>>();
  return {
    ...actual,
    packageDirectorySync: vi.fn(actual.packageDirectorySync),
  };
});

describe('getPkgVersion', () => {
  it('should return the package version', () => {
    const version = getPkgVersion();
    expect(version).toBe('0.1.0');
  });

  it('should throw when package directory is not found', async () => {
    const { packageDirectorySync } = await import('package-directory');
    const mocked = vi.mocked(packageDirectorySync);
    mocked.mockReturnValueOnce(undefined);
    expect(() => getPkgVersion()).toThrow('Failed to find package directory');
  });
});

describe('parseInput', () => {
  const tmpDir = join(__dirname, '../../.tmp-test');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should read from a file path', () => {
    const filePath = join(tmpDir, 'test.html');
    writeFileSync(filePath, '<div>Hello</div>', 'utf-8');
    const result = parseInput(filePath, 'base');
    expect(result).toBe('<div>Hello</div>');
  });

  it('should accept raw HTML string starting with <', () => {
    const result = parseInput('<div>Hello</div>', 'base');
    expect(result).toBe('<div>Hello</div>');
  });

  it('should accept doctype HTML string', () => {
    const result = parseInput('<!DOCTYPE html><html></html>', 'base');
    expect(result).toBe('<!DOCTYPE html><html></html>');
  });

  it('should throw for non-existent file that is not HTML', () => {
    expect(() => parseInput('nonexistent.txt', 'base')).toThrow();
  });
});
