import type { VNode, HTMLValueDifference } from './types';
import { NODE_DISPLAY_NAME } from './types';
import { pathSegmentsToString } from './utils';
import { parseHTML } from './parse';

export function compareHTML({
  baseHTML,
  contrastHTML,
}: {
  baseHTML: string;
  contrastHTML: string;
}): HTMLValueDifference[] {
  const baseVNode = parseHTML(baseHTML);
  const contrastVNode = parseHTML(contrastHTML);
  return diffNode(baseVNode, contrastVNode, [], [], []);
}

function formatDisplayPath(displayList: string[]): string {
  return displayList.join(' > ');
}

function getNodeDisplayName(node: VNode, index: number): string {
  if (node.type === 'element' && node.tag) {
    return node.tag;
  }
  if (node.type === 'text') {
    return NODE_DISPLAY_NAME.TEXT;
  }
  if (node.type === 'comment') {
    return NODE_DISPLAY_NAME.COMMENT;
  }
  if (node.type === 'doctype') {
    return NODE_DISPLAY_NAME.DOCTYPE;
  }
  /* v8 ignore next */
  return `[${index}]`;
}

function diffNode(
  base: VNode,
  contrast: VNode,
  pathSegments: string[],
  contrastPathSegments: string[],
  displayList: string[],
): HTMLValueDifference[] {
  /* v8 ignore next 9 */
  if (base.type !== contrast.type) {
    return [
      {
        pathSegments,
        pathString: pathSegmentsToString(pathSegments),
        contrastPathString: pathSegmentsToString(contrastPathSegments),
        displayPath: formatDisplayPath(displayList),
        pathBelongsTo: 'both',
        diffType: 'valueChanged',
      },
    ];
  }

  if (base.type === 'root' && contrast.type === 'root') {
    return diffChildren(
      base.children || [],
      contrast.children || [],
      pathSegments,
      contrastPathSegments,
      displayList,
    );
  }

  if (base.type === 'text' || base.type === 'comment') {
    if (base.value !== contrast.value) {
      return [
        {
          pathSegments,
          pathString: pathSegmentsToString(pathSegments),
          contrastPathString: pathSegmentsToString(contrastPathSegments),
          displayPath: formatDisplayPath(displayList),
          pathBelongsTo: 'both',
          diffType: 'valueChanged',
        },
      ];
    }
    return [];
  }

  if (base.type === 'doctype') {
    if (
      base.doctypeName !== contrast.doctypeName ||
      base.publicId !== contrast.publicId ||
      base.systemId !== contrast.systemId
    ) {
      return [
        {
          pathSegments,
          pathString: pathSegmentsToString(pathSegments),
          contrastPathString: pathSegmentsToString(contrastPathSegments),
          displayPath: formatDisplayPath(displayList),
          pathBelongsTo: 'both',
          diffType: 'valueChanged',
        },
      ];
    }
    return [];
  }

  if (base.type === 'element' && contrast.type === 'element') {
    /* v8 ignore next 9 */
    if (base.tag !== contrast.tag) {
      return [
        {
          pathSegments,
          pathString: pathSegmentsToString(pathSegments),
          contrastPathString: pathSegmentsToString(contrastPathSegments),
          displayPath: formatDisplayPath(displayList),
          pathBelongsTo: 'both',
          diffType: 'valueChanged',
        },
      ];
    }

    const differences: HTMLValueDifference[] = [];

    differences.push(
      ...diffAttrs(
        base.attrs || {},
        contrast.attrs || {},
        pathSegments,
        contrastPathSegments,
        displayList,
      ),
    );
    differences.push(
      ...diffChildren(
        base.children || [],
        contrast.children || [],
        pathSegments,
        contrastPathSegments,
        displayList,
      ),
    );

    return differences;
  }

  /* v8 ignore next */
  return [];
}

function diffAttrs(
  baseAttrs: Record<string, string>,
  contrastAttrs: Record<string, string>,
  pathSegments: string[],
  contrastPathSegments: string[],
  displayList: string[],
): HTMLValueDifference[] {
  const differences: HTMLValueDifference[] = [];
  const baseKeys = Object.keys(baseAttrs);
  const contrastKeys = Object.keys(contrastAttrs);

  for (const key of baseKeys) {
    const attrPath = [...pathSegments, `@${key}`];
    const contrastAttrPath = [...contrastPathSegments, `@${key}`];
    const attrDisplay = [...displayList, `@${key}`];
    if (!(key in contrastAttrs)) {
      differences.push({
        pathSegments: attrPath,
        pathString: pathSegmentsToString(attrPath),
        contrastPathString: pathSegmentsToString(contrastAttrPath),
        displayPath: formatDisplayPath(attrDisplay),
        pathBelongsTo: 'base',
        diffType: 'deleted',
      });
    } else if (baseAttrs[key] !== contrastAttrs[key]) {
      differences.push({
        pathSegments: attrPath,
        pathString: pathSegmentsToString(attrPath),
        contrastPathString: pathSegmentsToString(contrastAttrPath),
        displayPath: formatDisplayPath(attrDisplay),
        pathBelongsTo: 'both',
        diffType: 'valueChanged',
      });
    }
  }

  for (const key of contrastKeys) {
    if (!(key in baseAttrs)) {
      const attrPath = [...pathSegments, `@${key}`];
      const contrastAttrPath = [...contrastPathSegments, `@${key}`];
      const attrDisplay = [...displayList, `@${key}`];
      differences.push({
        pathSegments: attrPath,
        pathString: pathSegmentsToString(attrPath),
        contrastPathString: pathSegmentsToString(contrastAttrPath),
        displayPath: formatDisplayPath(attrDisplay),
        pathBelongsTo: 'contrast',
        diffType: 'added',
      });
    }
  }

  return differences;
}

function isWhitespaceTextNode(node: VNode): boolean {
  return node.type === 'text' && !(node.value || '').trim();
}

function getDisplayNameWithNthChild(
  node: VNode,
  index: number,
  siblings: { node: VNode; idx: number }[],
  positionInSiblings: number,
): string {
  const baseName = getNodeDisplayName(node, index);
  const sameNameItems: number[] = [];
  for (let i = 0; i < siblings.length; i++) {
    if (getNodeDisplayName(siblings[i].node, siblings[i].idx) === baseName) {
      sameNameItems.push(i);
    }
  }
  if (sameNameItems.length <= 1) {
    return baseName;
  }
  const nthIndex = sameNameItems.indexOf(positionInSiblings) + 1;
  return `${baseName}:nth-child(${nthIndex})`;
}

function getNodeKey(node: VNode): string {
  if (node.type === 'element' && node.tag) {
    return `element:${node.tag}`;
  }
  return node.type;
}

function computeLCS(
  baseItems: { node: VNode; idx: number }[],
  contrastItems: { node: VNode; idx: number }[],
): { baseIdx: number; contrastIdx: number }[] {
  const m = baseItems.length;
  const n = contrastItems.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (
        getNodeKey(baseItems[i - 1].node) ===
        getNodeKey(contrastItems[j - 1].node)
      ) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcsLength = dp[m][n];
  if (lcsLength === 0) return [];

  const sdp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (getNodeKey(baseItems[i].node) === getNodeKey(contrastItems[j].node)) {
        sdp[i][j] = sdp[i + 1][j + 1] + 1;
      } else {
        sdp[i][j] = Math.max(sdp[i + 1][j], sdp[i][j + 1]);
      }
    }
  }

  const pairs: { baseIdx: number; contrastIdx: number }[] = [];
  let ci = 0;
  let remaining = lcsLength;
  for (let bi = 0; bi < m && remaining > 0; bi++) {
    for (let cj = ci; cj < n; cj++) {
      if (
        getNodeKey(baseItems[bi].node) === getNodeKey(contrastItems[cj].node) &&
        sdp[bi + 1][cj + 1] >= remaining - 1
      ) {
        pairs.push({ baseIdx: bi, contrastIdx: cj });
        ci = cj + 1;
        remaining--;
        break;
      }
    }
  }

  return pairs;
}

function diffChildren(
  baseChildren: VNode[],
  contrastChildren: VNode[],
  pathSegments: string[],
  contrastPathSegments: string[],
  displayList: string[],
): HTMLValueDifference[] {
  const differences: HTMLValueDifference[] = [];

  const baseSignificant = baseChildren
    .map((node, idx) => ({ node, idx }))
    .filter(({ node }) => !isWhitespaceTextNode(node));
  const contrastSignificant = contrastChildren
    .map((node, idx) => ({ node, idx }))
    .filter(({ node }) => !isWhitespaceTextNode(node));

  const lcsPairs = computeLCS(baseSignificant, contrastSignificant);

  const matchedBaseIndices = new Set(lcsPairs.map((p) => p.baseIdx));
  const matchedContrastIndices = new Set(lcsPairs.map((p) => p.contrastIdx));

  for (let i = 0; i < baseSignificant.length; i++) {
    if (!matchedBaseIndices.has(i)) {
      const baseItem = baseSignificant[i];
      const childPath = [...pathSegments, String(baseItem.idx)];
      const childDisplay = [
        ...displayList,
        getDisplayNameWithNthChild(
          baseItem.node,
          baseItem.idx,
          baseSignificant,
          i,
        ),
      ];
      differences.push({
        pathSegments: childPath,
        pathString: pathSegmentsToString(childPath),
        contrastPathString: pathSegmentsToString(childPath),
        displayPath: formatDisplayPath(childDisplay),
        pathBelongsTo: 'base',
        diffType: 'deleted',
      });
    }
  }

  for (let j = 0; j < contrastSignificant.length; j++) {
    if (!matchedContrastIndices.has(j)) {
      const contrastItem = contrastSignificant[j];
      const childPath = [...contrastPathSegments, String(contrastItem.idx)];
      const childDisplay = [
        ...displayList,
        getDisplayNameWithNthChild(
          contrastItem.node,
          contrastItem.idx,
          contrastSignificant,
          j,
        ),
      ];
      differences.push({
        pathSegments: childPath,
        pathString: pathSegmentsToString(childPath),
        contrastPathString: pathSegmentsToString(childPath),
        displayPath: formatDisplayPath(childDisplay),
        pathBelongsTo: 'contrast',
        diffType: 'added',
      });
    }
  }

  for (const pair of lcsPairs) {
    const baseItem = baseSignificant[pair.baseIdx];
    const contrastItem = contrastSignificant[pair.contrastIdx];
    const childPath = [...pathSegments, String(baseItem.idx)];
    const contrastChildPath = [
      ...contrastPathSegments,
      String(contrastItem.idx),
    ];
    const childDisplay = [
      ...displayList,
      getDisplayNameWithNthChild(
        baseItem.node,
        baseItem.idx,
        baseSignificant,
        pair.baseIdx,
      ),
    ];
    differences.push(
      ...diffNode(
        baseItem.node,
        contrastItem.node,
        childPath,
        contrastChildPath,
        childDisplay,
      ),
    );
  }

  return differences;
}
