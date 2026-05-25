import { describe, it, expect } from 'vitest';
import { pathSegmentsToString } from '../utils';

describe('pathSegmentsToString', () => {
  it('should return empty string for empty array', () => {
    expect(pathSegmentsToString([])).toBe('');
  });

  it('should return single segment as-is', () => {
    expect(pathSegmentsToString(['0'])).toBe('0');
  });

  it('should join segments with dots', () => {
    expect(pathSegmentsToString(['0', '1', '@class'])).toBe('0.1.@class');
  });
});
