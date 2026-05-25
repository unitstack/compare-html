import { compareHTML, type HTMLValueDifference } from '@compare-html/core';
import { writeFileSync } from 'fs';
import { parseInput } from './utils';

export interface CompareOptions {
  jsonExport?: boolean;
  output?: string;
}

export function compare(
  base: string,
  contrast: string,
  { jsonExport, output: outputPath }: CompareOptions = {},
) {
  const baseHTML = parseInput(base, 'base');
  const contrastHTML = parseInput(contrast, 'contrast');

  const differences = compareHTML({
    baseHTML,
    contrastHTML,
  });

  let output: string;
  if (jsonExport) {
    output = JSON.stringify(differences, null, 2);
  } else {
    output = formatTable(differences);
  }

  if (outputPath) {
    writeFileSync(outputPath, output, 'utf-8');
    console.log(`Output written to ${outputPath}`);
  } else {
    console.log(output);
  }
}

export function formatTable(differences: HTMLValueDifference[]): string {
  if (differences.length === 0) {
    return 'No differences found';
  }

  const rows = differences.map((d) => {
    const pathPrefix =
      d.pathBelongsTo === 'contrast'
        ? '(Contrast)'
        : d.pathBelongsTo === 'base'
          ? '(Base)'
          : '(Both)';
    const keyStr = `${pathPrefix} ${d.displayPath || d.pathString}`;

    return [keyStr, d.diffType] as string[];
  });

  const maxKeyLen = Math.max(...rows.map((r) => r[0].length), 'Path'.length);
  const maxTypeLen = Math.max(
    ...rows.map((r) => r[1].length),
    'Change Type'.length,
  );

  const topBorder = `┌${'─'.repeat(maxKeyLen + 2)}┬${'─'.repeat(maxTypeLen + 2)}┐`;
  const header = `│ ${'Path'.padEnd(maxKeyLen)} │ ${'Change Type'.padEnd(maxTypeLen)} │`;
  const separator = `├${'─'.repeat(maxKeyLen + 2)}┼${'─'.repeat(maxTypeLen + 2)}┤`;
  const bottomBorder = `└${'─'.repeat(maxKeyLen + 2)}┴${'─'.repeat(maxTypeLen + 2)}┘`;

  return [
    topBorder,
    header,
    separator,
    ...rows.map(
      (r) => `│ ${r[0].padEnd(maxKeyLen)} │ ${r[1].padEnd(maxTypeLen)} │`,
    ),
    bottomBorder,
  ].join('\n');
}
