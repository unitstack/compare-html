import { describe, it, expect } from 'vitest';
import { compareHTML } from '../compare';

describe('compareHTML', () => {
  describe('identical HTML', () => {
    it('should return no differences for identical HTML', () => {
      const diffs = compareHTML({
        baseHTML: '<div>Hello</div>',
        contrastHTML: '<div>Hello</div>',
      });
      expect(diffs).toHaveLength(0);
    });

    it('should return no differences for identical nested HTML', () => {
      const html = '<div><ul><li>Item 1</li><li>Item 2</li></ul></div>';
      const diffs = compareHTML({ baseHTML: html, contrastHTML: html });
      expect(diffs).toHaveLength(0);
    });

    it('should return no differences for identical HTML with attributes', () => {
      const html =
        '<div class="foo" id="bar"><span data-x="1">Text</span></div>';
      const diffs = compareHTML({ baseHTML: html, contrastHTML: html });
      expect(diffs).toHaveLength(0);
    });

    it('should return no differences for empty elements', () => {
      const diffs = compareHTML({
        baseHTML: '<div></div>',
        contrastHTML: '<div></div>',
      });
      expect(diffs).toHaveLength(0);
    });
  });

  describe('text value changes', () => {
    it('should detect text value changes', () => {
      const diffs = compareHTML({
        baseHTML: '<div>Hello</div>',
        contrastHTML: '<div>World</div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs[0].diffType).toBe('valueChanged');
      expect(diffs[0].pathBelongsTo).toBe('both');
    });

    it('should detect text change in deeply nested structure', () => {
      const diffs = compareHTML({
        baseHTML: '<div><section><p>Old</p></section></div>',
        contrastHTML: '<div><section><p>New</p></section></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
      expect(diffs[0].displayPath).toBe('div > section > p > ::text');
    });

    it('should detect multiple text changes in different branches', () => {
      const diffs = compareHTML({
        baseHTML: '<div><p>A</p><p>B</p></div>',
        contrastHTML: '<div><p>X</p><p>Y</p></div>',
      });
      expect(diffs).toHaveLength(2);
      expect(diffs[0].diffType).toBe('valueChanged');
      expect(diffs[1].diffType).toBe('valueChanged');
    });

    it('should detect change from non-empty to empty text', () => {
      const diffs = compareHTML({
        baseHTML: '<span>Content</span>',
        contrastHTML: '<span></span>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'deleted')).toBe(true);
    });
  });

  describe('element addition and deletion', () => {
    it('should detect added elements', () => {
      const diffs = compareHTML({
        baseHTML: '<div></div>',
        contrastHTML: '<div><span>New</span></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'added')).toBe(true);
      expect(
        diffs
          .filter((d) => d.diffType === 'added')
          .every((d) => d.pathBelongsTo === 'contrast'),
      ).toBe(true);
    });

    it('should detect deleted elements', () => {
      const diffs = compareHTML({
        baseHTML: '<div><span>Old</span></div>',
        contrastHTML: '<div></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'deleted')).toBe(true);
      expect(
        diffs
          .filter((d) => d.diffType === 'deleted')
          .every((d) => d.pathBelongsTo === 'base'),
      ).toBe(true);
    });

    it('should detect multiple added elements', () => {
      const diffs = compareHTML({
        baseHTML: '<ul><li>A</li></ul>',
        contrastHTML: '<ul><li>A</li><li>B</li><li>C</li></ul>',
      });
      expect(diffs).toHaveLength(2);
      expect(diffs.every((d) => d.diffType === 'added')).toBe(true);
      expect(diffs.every((d) => d.pathBelongsTo === 'contrast')).toBe(true);
    });

    it('should detect multiple deleted elements', () => {
      const diffs = compareHTML({
        baseHTML: '<ul><li>A</li><li>B</li><li>C</li></ul>',
        contrastHTML: '<ul><li>A</li></ul>',
      });
      expect(diffs).toHaveLength(2);
      expect(diffs.every((d) => d.diffType === 'deleted')).toBe(true);
      expect(diffs.every((d) => d.pathBelongsTo === 'base')).toBe(true);
    });

    it('should detect element replaced by a different element', () => {
      const diffs = compareHTML({
        baseHTML: '<div><span>A</span></div>',
        contrastHTML: '<div><em>B</em></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'deleted')).toBe(true);
      expect(diffs.some((d) => d.diffType === 'added')).toBe(true);
    });
  });

  describe('attribute changes', () => {
    it('should detect attribute value changes', () => {
      const diffs = compareHTML({
        baseHTML: '<div class="old"></div>',
        contrastHTML: '<div class="new"></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs[0].diffType).toBe('valueChanged');
      expect(diffs[0].pathString).toContain('@class');
      expect(diffs[0].pathBelongsTo).toBe('both');
    });

    it('should detect added attributes', () => {
      const diffs = compareHTML({
        baseHTML: '<div></div>',
        contrastHTML: '<div class="new"></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs[0].diffType).toBe('added');
      expect(diffs[0].pathBelongsTo).toBe('contrast');
    });

    it('should detect deleted attributes', () => {
      const diffs = compareHTML({
        baseHTML: '<div class="old"></div>',
        contrastHTML: '<div></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs[0].diffType).toBe('deleted');
      expect(diffs[0].pathBelongsTo).toBe('base');
    });

    it('should detect multiple attribute changes on same element', () => {
      const diffs = compareHTML({
        baseHTML: '<div class="a" id="b" title="c"></div>',
        contrastHTML: '<div class="x" id="y" title="z"></div>',
      });
      expect(diffs).toHaveLength(3);
      expect(diffs.every((d) => d.diffType === 'valueChanged')).toBe(true);
    });

    it('should detect mixed attribute add, delete, and change', () => {
      const diffs = compareHTML({
        baseHTML: '<div class="old" id="keep" title="remove"></div>',
        contrastHTML: '<div class="new" id="keep" data-new="added"></div>',
      });
      const changed = diffs.filter((d) => d.diffType === 'valueChanged');
      const deleted = diffs.filter((d) => d.diffType === 'deleted');
      const added = diffs.filter((d) => d.diffType === 'added');
      expect(changed).toHaveLength(1);
      expect(deleted).toHaveLength(1);
      expect(added).toHaveLength(1);
      expect(changed[0].pathString).toContain('@class');
      expect(deleted[0].pathString).toContain('@title');
      expect(added[0].pathString).toContain('@data-new');
    });

    it('should display attribute paths with @ prefix', () => {
      const diffs = compareHTML({
        baseHTML: '<input type="text" />',
        contrastHTML: '<input type="number" />',
      });
      expect(diffs[0].displayPath).toContain('@type');
    });
  });

  describe('tag changes', () => {
    it('should detect tag changes', () => {
      const diffs = compareHTML({
        baseHTML: '<div>Content</div>',
        contrastHTML: '<span>Content</span>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'deleted')).toBe(true);
      expect(diffs.some((d) => d.diffType === 'added')).toBe(true);
    });

    it('should detect tag change at nested level', () => {
      const diffs = compareHTML({
        baseHTML: '<div><span>Text</span></div>',
        contrastHTML: '<div><em>Text</em></div>',
      });
      expect(diffs.some((d) => d.diffType === 'deleted')).toBe(true);
      expect(diffs.some((d) => d.diffType === 'added')).toBe(true);
    });
  });

  describe('comment nodes', () => {
    it('should detect comment value change', () => {
      const diffs = compareHTML({
        baseHTML: '<div><!-- old comment --></div>',
        contrastHTML: '<div><!-- new comment --></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
      expect(diffs[0].displayPath).toContain('::comment');
    });

    it('should detect added comment', () => {
      const diffs = compareHTML({
        baseHTML: '<div></div>',
        contrastHTML: '<div><!-- added --></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'added')).toBe(true);
    });

    it('should detect deleted comment', () => {
      const diffs = compareHTML({
        baseHTML: '<div><!-- removed --></div>',
        contrastHTML: '<div></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'deleted')).toBe(true);
    });

    it('should return no differences for identical comments', () => {
      const html = '<div><!-- same --></div>';
      const diffs = compareHTML({ baseHTML: html, contrastHTML: html });
      expect(diffs).toHaveLength(0);
    });
  });

  describe('doctype handling', () => {
    it('should detect doctype changes', () => {
      const diffs = compareHTML({
        baseHTML: '<!DOCTYPE html><html><body></body></html>',
        contrastHTML:
          '<!DOCTYPE HTML SYSTEM "about:legacy-compat"><html><body></body></html>',
      });
      expect(diffs.length).toBeGreaterThan(0);
    });

    it('should return no differences for identical doctypes', () => {
      const html = '<!DOCTYPE html><html><body></body></html>';
      const diffs = compareHTML({ baseHTML: html, contrastHTML: html });
      expect(diffs).toHaveLength(0);
    });
  });

  describe('whitespace handling', () => {
    it('should ignore whitespace-only text nodes', () => {
      const diffs = compareHTML({
        baseHTML: '<div>\n  <p>Same</p>\n</div>',
        contrastHTML: '<div><p>Same</p></div>',
      });
      expect(diffs).toHaveLength(0);
    });

    it('should not ignore text nodes with meaningful whitespace mixed with text', () => {
      const diffs = compareHTML({
        baseHTML: '<div><span>Hello World</span></div>',
        contrastHTML: '<div><span>HelloWorld</span></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
    });
  });

  describe('type mismatch between nodes', () => {
    it('should detect type change from element to text', () => {
      const diffs = compareHTML({
        baseHTML: '<div><span>A</span></div>',
        contrastHTML: '<div>Plain text</div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
    });

    it('should detect type change from text to element', () => {
      const diffs = compareHTML({
        baseHTML: '<div>Plain text</div>',
        contrastHTML: '<div><span>A</span></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
    });

    it('should detect type change from comment to element', () => {
      const diffs = compareHTML({
        baseHTML: '<div><!-- comment --></div>',
        contrastHTML: '<div><p>content</p></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'deleted')).toBe(true);
      expect(diffs.some((d) => d.diffType === 'added')).toBe(true);
    });
  });

  describe('display paths (nth-child)', () => {
    it('should add :nth-child() for duplicate sibling tags', () => {
      const diffs = compareHTML({
        baseHTML: '<ul><li>A</li><li>B</li><li>C</li></ul>',
        contrastHTML: '<ul><li>A</li><li>X</li><li>C</li></ul>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].displayPath).toBe('ul > li:nth-child(2) > ::text');
    });

    it('should not add :nth-child() when tag is unique among siblings', () => {
      const diffs = compareHTML({
        baseHTML: '<div><p>Hello</p><span>World</span></div>',
        contrastHTML: '<div><p>Changed</p><span>World</span></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].displayPath).toBe('div > p > ::text');
    });

    it('should add :nth-child() only for the level with duplicates', () => {
      const diffs = compareHTML({
        baseHTML: '<div><p>A</p><p>B</p></div>',
        contrastHTML: '<div><p>A</p><p>X</p></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].displayPath).toBe('div > p:nth-child(2) > ::text');
    });

    it('should handle added element with :nth-child()', () => {
      const diffs = compareHTML({
        baseHTML: '<ul><li>A</li><li>B</li></ul>',
        contrastHTML: '<ul><li>A</li><li>B</li><li>C</li></ul>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('added');
      expect(diffs[0].pathBelongsTo).toBe('contrast');
      expect(diffs[0].displayPath).toBe('ul > li:nth-child(3)');
    });

    it('should handle deleted element with :nth-child()', () => {
      const diffs = compareHTML({
        baseHTML: '<ul><li>A</li><li>B</li><li>C</li></ul>',
        contrastHTML: '<ul><li>A</li><li>B</li></ul>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('deleted');
      expect(diffs[0].pathBelongsTo).toBe('base');
      expect(diffs[0].displayPath).toBe('ul > li:nth-child(3)');
    });

    it('should handle multiple levels of nth-child disambiguation', () => {
      const diffs = compareHTML({
        baseHTML:
          '<div><div><p>A</p><p>B</p></div><div><p>C</p><p>D</p></div></div>',
        contrastHTML:
          '<div><div><p>A</p><p>B</p></div><div><p>C</p><p>X</p></div></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].displayPath).toBe(
        'div > div:nth-child(2) > p:nth-child(2) > ::text',
      );
    });
  });

  describe('pathSegments and pathString', () => {
    it('should provide correct pathSegments for nested elements', () => {
      const diffs = compareHTML({
        baseHTML: '<div><p>A</p></div>',
        contrastHTML: '<div><p>B</p></div>',
      });
      expect(diffs[0].pathSegments).toEqual(['0', '0', '0']);
      expect(diffs[0].pathString).toBe('0.0.0');
    });

    it('should provide correct pathSegments for attribute changes', () => {
      const diffs = compareHTML({
        baseHTML: '<div class="a"></div>',
        contrastHTML: '<div class="b"></div>',
      });
      expect(diffs[0].pathSegments).toEqual(['0', '@class']);
      expect(diffs[0].pathString).toBe('0.@class');
    });

    it('should use index-based path for added element', () => {
      const diffs = compareHTML({
        baseHTML: '<div><p>A</p></div>',
        contrastHTML: '<div><p>A</p><span>B</span></div>',
      });
      const added = diffs.find((d) => d.diffType === 'added');
      expect(added).toBeDefined();
      expect(added!.pathSegments[0]).toBe('0');
    });
  });

  describe('complex / real-world scenarios', () => {
    it('should handle comparison of full HTML documents', () => {
      const diffs = compareHTML({
        baseHTML:
          '<!DOCTYPE html><html><head><title>Old</title></head><body></body></html>',
        contrastHTML:
          '<!DOCTYPE html><html><head><title>New</title></head><body></body></html>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'valueChanged')).toBe(true);
    });

    it('should handle deeply nested structure', () => {
      const diffs = compareHTML({
        baseHTML:
          '<div><div><div><div><span>Deep</span></div></div></div></div>',
        contrastHTML:
          '<div><div><div><div><span>Changed</span></div></div></div></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
      expect(diffs[0].displayPath).toBe(
        'div > div > div > div > span > ::text',
      );
    });

    it('should handle self-closing tags', () => {
      const diffs = compareHTML({
        baseHTML: '<div><img src="a.png" /><br /></div>',
        contrastHTML: '<div><img src="b.png" /><br /></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].pathString).toContain('@src');
    });

    it('should handle inline styles as attribute', () => {
      const diffs = compareHTML({
        baseHTML: '<div style="color: red;"></div>',
        contrastHTML: '<div style="color: blue;"></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
      expect(diffs[0].pathString).toContain('@style');
    });

    it('should handle boolean-like attributes', () => {
      const diffs = compareHTML({
        baseHTML: '<input disabled />',
        contrastHTML: '<input />',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('deleted');
      expect(diffs[0].pathString).toContain('@disabled');
    });

    it('should handle mixed content types as siblings', () => {
      const diffs = compareHTML({
        baseHTML: '<div>Text<!-- comment --><span>El</span></div>',
        contrastHTML: '<div>Changed<!-- comment --><span>El</span></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
    });

    it('should handle table structures', () => {
      const diffs = compareHTML({
        baseHTML: '<table><tr><td>A</td><td>B</td></tr></table>',
        contrastHTML: '<table><tr><td>A</td><td>X</td></tr></table>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
      expect(diffs[0].displayPath).toContain('td:nth-child(2)');
    });

    it('should handle completely different structures', () => {
      const diffs = compareHTML({
        baseHTML: '<div><h1>Title</h1><p>Paragraph</p></div>',
        contrastHTML: '<section><span>Totally different</span></section>',
      });
      expect(diffs.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty base and non-empty contrast', () => {
      const diffs = compareHTML({
        baseHTML: '<div></div>',
        contrastHTML: '<div><p>New content</p></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'added')).toBe(true);
    });

    it('should handle non-empty base and empty contrast', () => {
      const diffs = compareHTML({
        baseHTML: '<div><p>Old content</p></div>',
        contrastHTML: '<div></div>',
      });
      expect(diffs.length).toBeGreaterThan(0);
      expect(diffs.some((d) => d.diffType === 'deleted')).toBe(true);
    });

    it('should handle single text node fragments', () => {
      const diffs = compareHTML({
        baseHTML: 'Hello',
        contrastHTML: 'World',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
    });

    it('should handle special characters in text', () => {
      const diffs = compareHTML({
        baseHTML: '<p>&lt;script&gt;</p>',
        contrastHTML: '<p>&lt;div&gt;</p>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
    });

    it('should handle attributes with empty values', () => {
      const diffs = compareHTML({
        baseHTML: '<div data-empty=""></div>',
        contrastHTML: '<div data-empty="value"></div>',
      });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].diffType).toBe('valueChanged');
    });

    it('should handle many siblings', () => {
      const base =
        '<ul>' +
        Array.from({ length: 10 }, (_, i) => `<li>${i}</li>`).join('') +
        '</ul>';
      const contrast =
        '<ul>' +
        Array.from(
          { length: 10 },
          (_, i) => `<li>${i === 5 ? 'X' : i}</li>`,
        ).join('') +
        '</ul>';
      const diffs = compareHTML({ baseHTML: base, contrastHTML: contrast });
      expect(diffs).toHaveLength(1);
      expect(diffs[0].displayPath).toBe('ul > li:nth-child(6) > ::text');
    });
  });

  describe('doctype as child display name', () => {
    it('should handle doctype in full document comparison', () => {
      const diffs = compareHTML({
        baseHTML: '<!DOCTYPE html><html><body></body></html>',
        contrastHTML: '<html><body></body></html>',
      });
      expect(diffs.length).toBeGreaterThan(0);
    });
  });
});
