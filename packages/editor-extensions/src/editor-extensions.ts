import { datePageExtension } from './date-page-extension';
import { fileExtension } from './file-extension';
import { imageExtension } from './image-extension';
import { TaskExtension } from './task-item';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import ListKeymap from '@tiptap/extension-list-keymap';
import { getSchema as fetchSchema } from '@tiptap/core';
import TaskList from '@tiptap/extension-task-list';
import AutoJoiner from 'tiptap-extension-auto-joiner'; // optional
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { skillExtension } from './skill-extension';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { ContextMention } from './context-mention';

export const defaultExtensions = [
  fileExtension,
  imageExtension,
  TaskExtension,
  datePageExtension,
  StarterKit.configure({
    history: false,
    gapcursor: false,
    codeBlock: false,
  }),
  CodeBlockLowlight.configure(),
  Link,
  Placeholder,
  Highlight,
  TaskList,
  ListKeymap,
  AutoJoiner,
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  skillExtension,
  ContextMention,
];

export const getSchema = () => fetchSchema(defaultExtensions as any);
