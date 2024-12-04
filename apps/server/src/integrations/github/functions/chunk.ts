/* eslint-disable @typescript-eslint/no-var-requires */
/** Copyright (c) 2023, Mira, all rights reserved. **/

import { SyntaxNode } from 'tree-sitter';
import Parser from 'tree-sitter';
import * as JSON from 'tree-sitter-json';

import { Snippet } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EXTENSION_TO_LANGUAGE: Record<string, any> = {
  javascript: require('tree-sitter-javascript'),
  js: require('tree-sitter-javascript'),
  jsx: require('tree-sitter-typescript').tsx,
  ts: require('tree-sitter-typescript').typescript,
  tsx: require('tree-sitter-typescript').tsx,

  json: JSON,

  c: require('tree-sitter-c'),
  h: require('tree-sitter-c'),
  cpp: require('tree-sitter-cpp'),
  cc: require('tree-sitter-cpp'),

  rs: require('tree-sitter-rust'),
  go: require('tree-sitter-go'),
  java: require('tree-sitter-java'),
  py: require('tree-sitter-python'),
  rb: require('tree-sitter-ruby'),
};

function nonWhitespaceLen(text: string): number {
  return text.replace(/\s+/g, '').length;
}

function getLineNumber(index: number, sourceCode: string): number {
  let totalChars = 0;
  const lines = sourceCode.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    totalChars += lines[lineNum].length;

    if (totalChars > index) {
      return lineNum + 1;
    }
  }

  return lines.length;
}

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    // No dot (period) found in the file name, so it has no extension.
    return 'tsx';
  }

  // Use slice to get the substring after the last dot.
  const extension = fileName.slice(lastDotIndex + 1);
  return extension.toLowerCase(); // You may want to convert it to lowercase for consistency.
}

interface Chunk {
  text: string;
  startIndex: number;
  endIndex: number;
}

function chunkNode(node: SyntaxNode, MAX_CHARS: number) {
  let chunks: Chunk[] = [];
  let currentChunk: Chunk = {
    text: '',
    startIndex: node.startIndex,
    endIndex: node.startIndex,
  };
  const nodeChildren = node.children;

  for (const child of nodeChildren) {
    // If the chunk is greater than MAX characters choosen
    if (child.endIndex - child.startIndex > MAX_CHARS) {
      if (currentChunk.text !== '') {
        chunks.push(currentChunk);
      }

      currentChunk = {
        text: '',
        startIndex: child.endIndex,
        endIndex: child.endIndex,
      };

      chunks = chunks.concat(chunkNode(child, MAX_CHARS));

      // Adding new chunk to current chunk exceeds MAX characters
    } else if (
      child.endIndex -
        child.startIndex +
        (currentChunk.endIndex - currentChunk.startIndex) >
      MAX_CHARS
    ) {
      chunks.push(currentChunk);
      currentChunk = {
        text: child.text,
        startIndex: child.startIndex,
        endIndex: child.endIndex,
      };

      // Merge chunk with current chunk
    } else {
      currentChunk = {
        text: currentChunk.text + child.text,
        startIndex: currentChunk.startIndex,
        endIndex: child.endIndex,
      };
    }
  }

  chunks.push(currentChunk);
  return chunks;
}

function chunkTree(node: SyntaxNode, MAX_CHARS = 1500, coalesce = 100) {
  const chunks: Chunk[] = chunkNode(node, MAX_CHARS);

  if (chunks.length === 0) {
    return [];
  }

  // Fill the gaps in between chunk index
  for (let i = 0; i < chunks.length - 1; i++) {
    const prev = chunks[i];
    const curr = chunks[i + 1];
    prev.endIndex = curr.startIndex;
  }

  const new_chunks: Chunk[] = [];
  let current_chunk: Chunk = {
    startIndex: 0,
    endIndex: 0,
    text: '',
  };

  // Merge smaller chunks with the bigger one
  chunks.forEach((chunk) => {
    current_chunk = {
      text: current_chunk.text + chunk.text,
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex + current_chunk.endIndex,
    };

    if (
      nonWhitespaceLen(current_chunk.text) > coalesce &&
      current_chunk.text.includes('\n')
    ) {
      new_chunks.push(current_chunk);
      current_chunk = {
        text: '',
        startIndex: chunk.endIndex,
        endIndex: chunk.endIndex,
      };
    }
  });

  // Remove emty chunks
  return new_chunks.filter((chunk) => chunk.text !== '');
}

export function chunkCode(
  code: string,
  path: string,
  MAX_CHARS = 1500,
  coalesce = 100,
) {
  try {
    const parser = new Parser();
    parser.setLanguage(EXTENSION_TO_LANGUAGE[getFileExtension(path)]);

    const tree = parser.parse(code);
    const chunks: Chunk[] = chunkTree(tree.rootNode, MAX_CHARS, coalesce);
    const snippets: Snippet[] = [];

    for (const chunk of chunks) {
      const newSnippet = {
        text: chunk.text,
        start: getLineNumber(chunk.startIndex, code),
        end: getLineNumber(chunk.endIndex, code),
        path,
      };
      snippets.push(newSnippet);
    }
    return snippets;
  } catch (e) {
    console.error(e);
    return [];
  }
}
