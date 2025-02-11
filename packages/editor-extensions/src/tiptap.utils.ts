import { Blockquote } from '@tiptap/extension-blockquote';
import { BulletList } from '@tiptap/extension-bullet-list';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { Text } from '@tiptap/extension-text';
import { Underline } from '@tiptap/extension-underline';
import { generateHTML, generateJSON } from '@tiptap/html';

export const tiptapExtensions = [
  Document,
  Text,
  Paragraph,
  Heading,
  Blockquote,
  ListItem,
  OrderedList,
  BulletList,
  TaskList,
  TaskItem,
  Image,
  CodeBlock,
  HardBreak,
  HorizontalRule,
  Link,
  Underline,
];

export function convertHtmlToTiptapJson(html: string) {
  const tiptapJson = generateJSON(html, tiptapExtensions);
  return tiptapJson;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertTiptapJsonToHtml(tiptapJson: Record<string, any>) {
  return generateHTML(tiptapJson, tiptapExtensions);
}
