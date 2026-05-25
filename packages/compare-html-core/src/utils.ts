export function pathSegmentsToString(pathSegments: string[]) {
  if (pathSegments.length === 0) {
    return '';
  }

  return pathSegments.join('.');
}
