import * as parse5 from 'parse5';
import type { VNode } from './types';

export function parseHTML(html: string): VNode {
  const trimmed = html.trim();
  if (isFullDocument(trimmed)) {
    const doc = parse5.parse(trimmed);
    return documentToVNode(doc);
  }
  const fragment = parse5.parseFragment(trimmed);
  return documentToVNode(fragment);
}

export function validateHTML(html: string) {
  if (!html.trim()) {
    throw new Error('HTML is empty');
  }
  parse5.parseFragment(html);
}

function isFullDocument(html: string): boolean {
  const lower = html.toLowerCase();
  return lower.startsWith('<!doctype') || lower.startsWith('<html');
}

function documentToVNode(
  node: parse5.DefaultTreeAdapterMap['parentNode'],
): VNode {
  return {
    type: 'root',
    children: node.childNodes.map(childNodeToVNode),
  };
}

function childNodeToVNode(
  node: parse5.DefaultTreeAdapterMap['childNode'],
): VNode {
  if ('tagName' in node && node.tagName) {
    const attrs: Record<string, string> = {};
    for (const attr of node.attrs || []) {
      attrs[attr.name] = attr.value;
    }
    return {
      type: 'element',
      tag: node.tagName,
      attrs: Object.keys(attrs).length > 0 ? attrs : undefined,
      children:
        node.childNodes && node.childNodes.length > 0
          ? node.childNodes.map(childNodeToVNode)
          : undefined,
    };
  }

  if ('data' in node && node.nodeName === '#comment') {
    return {
      type: 'comment',
      value: node.data,
    };
  }

  if (node.nodeName === '#text') {
    return {
      type: 'text',
      value: (node as parse5.DefaultTreeAdapterMap['textNode']).value,
    };
  }

  if (node.nodeName === '#documentType') {
    const doctype = node as parse5.DefaultTreeAdapterMap['documentType'];
    return {
      type: 'doctype',
      doctypeName: doctype.name || 'html',
      publicId: doctype.publicId || undefined,
      systemId: doctype.systemId || undefined,
    };
  }

  return {
    type: 'text',
    value: '',
  };
}
