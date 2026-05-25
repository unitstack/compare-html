import { describe, it, expect } from 'vitest';
import { parseHTML, validateHTML } from '../parse';

describe('parseHTML', () => {
  it('should parse a simple HTML fragment', () => {
    const result = parseHTML('<div>Hello</div>');
    expect(result.type).toBe('root');
    expect(result.children).toHaveLength(1);
    expect(result.children![0].type).toBe('element');
    expect(result.children![0].tag).toBe('div');
  });

  it('should parse a full HTML document', () => {
    const result = parseHTML(
      '<!DOCTYPE html><html><head></head><body></body></html>',
    );
    expect(result.type).toBe('root');
    expect(result.children!.length).toBeGreaterThanOrEqual(2);
    const doctype = result.children!.find((c) => c.type === 'doctype');
    expect(doctype).toBeDefined();
    expect(doctype!.doctypeName).toBe('html');
  });

  it('should parse elements with attributes', () => {
    const result = parseHTML(
      '<a href="https://example.com" class="link">Click</a>',
    );
    expect(result.type).toBe('root');
    const a = result.children![0];
    expect(a.type).toBe('element');
    expect(a.tag).toBe('a');
    expect(a.attrs).toEqual({ href: 'https://example.com', class: 'link' });
  });

  it('should parse comments', () => {
    const result = parseHTML('<!-- a comment -->');
    expect(result.type).toBe('root');
    const comment = result.children![0];
    expect(comment.type).toBe('comment');
    expect(comment.value).toBe(' a comment ');
  });

  it('should parse nested elements', () => {
    const result = parseHTML('<ul><li>Item 1</li><li>Item 2</li></ul>');
    const ul = result.children![0];
    expect(ul.tag).toBe('ul');
    expect(ul.children!.filter((c) => c.type === 'element')).toHaveLength(2);
  });

  it('should parse elements without attributes', () => {
    const result = parseHTML('<div></div>');
    const div = result.children![0];
    expect(div.type).toBe('element');
    expect(div.attrs).toBeUndefined();
  });

  it('should parse elements without children', () => {
    const result = parseHTML('<br>');
    const br = result.children![0];
    expect(br.type).toBe('element');
    expect(br.tag).toBe('br');
  });

  it('should parse HTML starting with <html tag', () => {
    const result = parseHTML('<html><body><p>Test</p></body></html>');
    expect(result.type).toBe('root');
    const html = result.children!.find(
      (c) => c.type === 'element' && c.tag === 'html',
    );
    expect(html).toBeDefined();
  });

  it('should handle doctype with publicId and systemId', () => {
    const result = parseHTML(
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html><body></body></html>',
    );
    expect(result.type).toBe('root');
    const doctype = result.children!.find((c) => c.type === 'doctype');
    expect(doctype).toBeDefined();
    expect(doctype!.publicId).toBe('-//W3C//DTD HTML 4.01//EN');
    expect(doctype!.systemId).toBe('http://www.w3.org/TR/html4/strict.dtd');
  });
});

describe('validateHTML', () => {
  it('should throw for empty HTML', () => {
    expect(() => validateHTML('')).toThrow('HTML is empty');
    expect(() => validateHTML('   ')).toThrow('HTML is empty');
  });

  it('should not throw for valid HTML', () => {
    expect(() => validateHTML('<div>Hello</div>')).not.toThrow();
  });
});
