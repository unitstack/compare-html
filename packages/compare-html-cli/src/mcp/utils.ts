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

export function parseInput(
  html: unknown,
  htmlFilePath: string | undefined,
  label: 'base' | 'contrast',
): string {
  if (typeof html === 'string' && html.trim()) {
    return html;
  }

  if (htmlFilePath) {
    if (!existsSync(htmlFilePath)) {
      throw new Error(`${label} file not found: ${htmlFilePath}`);
    }
    return readFileSync(htmlFilePath, 'utf-8');
  }

  throw new Error(
    `No ${label} HTML provided. Provide one of: html or htmlFilePath.`,
  );
}
