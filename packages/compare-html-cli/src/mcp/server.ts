import { Server } from '@modelcontextprotocol/sdk/server';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { compareHTML, type HTMLValueDifference } from '@compare-html/core';
import { getPkgVersion, parseInput } from './utils';

export function createServer() {
  const server = new Server(
    {
      name: 'compare-html-mcp',
      version: getPkgVersion(),
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );
  const compareHTMLInputSchema = createCompareHTMLInputSchema();
  const compareHTMLOutputSchema = createCompareHTMLOutputSchema();

  server.setRequestHandler(ListToolsRequestSchema, () => {
    return {
      tools: [
        {
          name: 'compare_html',
          description:
            'Compare two HTML values and return differences. Parses HTML into virtual nodes and performs structural comparison.',
          inputSchema: compareHTMLInputSchema.toJSONSchema() as Record<
            string,
            unknown
          >,
          outputSchema: compareHTMLOutputSchema.toJSONSchema() as Record<
            string,
            unknown
          >,
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, (request) => {
    if (request.params.name === 'compare_html') {
      const args = compareHTMLInputSchema.parse(request.params.arguments);
      const differences = compareHTMLTool(args);

      return {
        structuredContent: { differences },
        content: [{ type: 'text', text: JSON.stringify(differences, null, 2) }],
      };
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
}

export function createCompareHTMLInputSchema() {
  return z.object({
    baseHTML: z.string().describe('Base HTML string').optional(),
    baseHTMLFilePath: z.string().describe('Base HTML file path').optional(),
    contrastHTML: z.string().describe('Contrast HTML string').optional(),
    contrastHTMLFilePath: z
      .string()
      .describe('Contrast HTML file path')
      .optional(),
  });
}

export function createCompareHTMLOutputSchema() {
  return z.object({
    differences: z.array(
      z.object({
        pathSegments: z.array(z.string()),
        pathString: z.string(),
        contrastPathString: z.string(),
        displayPath: z.string(),
        pathBelongsTo: z.enum(['base', 'contrast', 'both']),
        diffType: z.enum(['added', 'deleted', 'valueChanged']),
      }),
    ),
  });
}

export function compareHTMLTool(args: {
  baseHTML?: string;
  baseHTMLFilePath?: string;
  contrastHTML?: string;
  contrastHTMLFilePath?: string;
}): HTMLValueDifference[] {
  const baseHTMLContent = parseInput(
    args.baseHTML,
    args.baseHTMLFilePath,
    'base',
  );
  const contrastHTMLContent = parseInput(
    args.contrastHTML,
    args.contrastHTMLFilePath,
    'contrast',
  );

  return compareHTML({
    baseHTML: baseHTMLContent,
    contrastHTML: contrastHTMLContent,
  });
}
