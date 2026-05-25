import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { getPkgVersion, parseInput } from '../mcp/utils';
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

describe('mcp/utils', () => {
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
    const tmpDir = join(__dirname, '../../.tmp-test-mcp');

    beforeAll(() => {
      mkdirSync(tmpDir, { recursive: true });
    });

    afterAll(() => {
      rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should return html string directly when provided', () => {
      const result = parseInput('<div>Hello</div>', undefined, 'base');
      expect(result).toBe('<div>Hello</div>');
    });

    it('should trim and return html string', () => {
      const result = parseInput('  <div>Hello</div>  ', undefined, 'base');
      expect(result).toBe('  <div>Hello</div>  ');
    });

    it('should read from file path when html is not provided', () => {
      const filePath = join(tmpDir, 'test.html');
      writeFileSync(filePath, '<div>From File</div>', 'utf-8');
      const result = parseInput(undefined, filePath, 'base');
      expect(result).toBe('<div>From File</div>');
    });

    it('should throw when file does not exist', () => {
      expect(() =>
        parseInput(undefined, '/nonexistent/path.html', 'base'),
      ).toThrow('base file not found');
    });

    it('should throw when neither html nor file path provided', () => {
      expect(() => parseInput(undefined, undefined, 'contrast')).toThrow(
        'No contrast HTML provided',
      );
    });

    it('should prefer html string over file path', () => {
      const filePath = join(tmpDir, 'ignored.html');
      writeFileSync(filePath, '<div>From File</div>', 'utf-8');
      const result = parseInput('<div>Direct</div>', filePath, 'base');
      expect(result).toBe('<div>Direct</div>');
    });

    it('should fall back to file path when html is empty string', () => {
      const filePath = join(tmpDir, 'fallback.html');
      writeFileSync(filePath, '<div>Fallback</div>', 'utf-8');
      const result = parseInput('', filePath, 'base');
      expect(result).toBe('<div>Fallback</div>');
    });

    it('should fall back to file path when html is whitespace only', () => {
      const filePath = join(tmpDir, 'whitespace.html');
      writeFileSync(filePath, '<div>WS</div>', 'utf-8');
      const result = parseInput('   ', filePath, 'base');
      expect(result).toBe('<div>WS</div>');
    });

    it('should throw when html is not a string and no file path', () => {
      expect(() => parseInput(null, undefined, 'base')).toThrow(
        'No base HTML provided',
      );
    });
  });
});
