export const NODE_DISPLAY_NAME = {
  TEXT: '::text',
  COMMENT: '::comment',
  DOCTYPE: '::doctype',
} as const;

export interface VNode {
  type: 'element' | 'text' | 'comment' | 'doctype' | 'root';
  tag?: string;
  attrs?: Record<string, string>;
  children?: VNode[];
  value?: string;
  doctypeName?: string;
  publicId?: string;
  systemId?: string;
}

export type HTMLValueDiffType = 'added' | 'deleted' | 'valueChanged';

export interface HTMLValueDifference {
  pathSegments: string[];
  pathString: string;
  contrastPathString: string;
  displayPath: string;
  pathBelongsTo: 'base' | 'contrast' | 'both';
  diffType: HTMLValueDiffType;
}
