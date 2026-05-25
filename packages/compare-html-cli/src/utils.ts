import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { packageDirectorySync } from 'package-directory';

export function getPkgVersion(): string {
  const pkgDir = packageDirectorySync({ cwd: __dirname });
  if (!pkgDir) {
    throw new Error('Failed to find package directory');
  }

  const pkg = JSON.parse(
    readFileSync(join(pkgDir, 'package.json'), 'utf-8'),
  ) as {
    version: string;
  };
  return pkg.version;
}

export function parseInput(input: string, label: 'base' | 'contrast'): string {
  if (existsSync(input)) {
    return readFileSync(input, 'utf-8');
  }

  // Treat as raw HTML string
  const trimmed = input.trim();
  if (trimmed.startsWith('<') || trimmed.startsWith('<!')) {
    return trimmed;
  }

  throw new Error(
    `Failed to parse ${label} input: if you passed a file path, the file was not found; if you passed an HTML string, it doesn't look like valid HTML.`,
  );
}
