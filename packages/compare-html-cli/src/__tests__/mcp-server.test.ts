import { describe, it, expect } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import {
  createServer,
  createCompareHTMLInputSchema,
  createCompareHTMLOutputSchema,
  compareHTMLTool,
} from '../mcp/server';

describe('mcp/server', () => {
  describe('createCompareHTMLInputSchema', () => {
    it('should create a valid zod schema', () => {
      const schema = createCompareHTMLInputSchema();
      const result = schema.parse({
        baseHTML: '<div>Hello</div>',
        contrastHTML: '<div>World</div>',
      });
      expect(result.baseHTML).toBe('<div>Hello</div>');
      expect(result.contrastHTML).toBe('<div>World</div>');
    });

    it('should allow optional fields', () => {
      const schema = createCompareHTMLInputSchema();
      const result = schema.parse({});
      expect(result.baseHTML).toBeUndefined();
      expect(result.contrastHTML).toBeUndefined();
      expect(result.baseHTMLFilePath).toBeUndefined();
      expect(result.contrastHTMLFilePath).toBeUndefined();
    });
  });

  describe('createCompareHTMLOutputSchema', () => {
    it('should create a valid output schema', () => {
      const schema = createCompareHTMLOutputSchema();
      const result = schema.parse({
        differences: [
          {
            pathSegments: ['0', '0'],
            pathString: '0.0',
            contrastPathString: '0.0',
            displayPath: 'div > ::text',
            pathBelongsTo: 'both',
            diffType: 'valueChanged',
          },
        ],
      });
      expect(result.differences).toHaveLength(1);
    });
  });

  describe('compareHTMLTool', () => {
    it('should compare HTML strings', () => {
      const result = compareHTMLTool({
        baseHTML: '<div>Hello</div>',
        contrastHTML: '<div>World</div>',
      });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].diffType).toBe('valueChanged');
    });

    it('should return empty array for identical HTML', () => {
      const result = compareHTMLTool({
        baseHTML: '<div>Same</div>',
        contrastHTML: '<div>Same</div>',
      });
      expect(result).toHaveLength(0);
    });

    it('should throw when no base HTML provided', () => {
      expect(() =>
        compareHTMLTool({
          contrastHTML: '<div>World</div>',
        }),
      ).toThrow();
    });

    it('should throw when no contrast HTML provided', () => {
      expect(() =>
        compareHTMLTool({
          baseHTML: '<div>Hello</div>',
        }),
      ).toThrow();
    });
  });

  describe('createServer', () => {
    it('should create a server instance', () => {
      const server = createServer();
      expect(server).toBeDefined();
    });

    it('should handle listTools request', async () => {
      const server = createServer();
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();

      await server.connect(serverTransport);

      const client = new Client({ name: 'test-client', version: '1.0.0' });
      await client.connect(clientTransport);

      const result = await client.listTools();
      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].name).toBe('compare_html');

      await client.close();
      await server.close();
    });

    it('should handle compare_html tool call', async () => {
      const server = createServer();
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();

      await server.connect(serverTransport);

      const client = new Client({ name: 'test-client', version: '1.0.0' });
      await client.connect(clientTransport);

      const result = await client.callTool({
        name: 'compare_html',
        arguments: {
          baseHTML: '<div>Hello</div>',
          contrastHTML: '<div>World</div>',
        },
      });

      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);

      await client.close();
      await server.close();
    });

    it('should throw for unknown tool', async () => {
      const server = createServer();
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();

      await server.connect(serverTransport);

      const client = new Client({ name: 'test-client', version: '1.0.0' });
      await client.connect(clientTransport);

      await expect(
        client.callTool({ name: 'unknown_tool', arguments: {} }),
      ).rejects.toThrow();

      await client.close();
      await server.close();
    });
  });
});
