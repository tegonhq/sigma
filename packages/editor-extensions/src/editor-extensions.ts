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

export const defaultExtensions = [
  fileExtension,
  imageExtension,
  TaskExtension,
  datePageExtension,
  StarterKit,
  Link,
  Placeholder,
  Highlight,
  TaskList,
  ListKeymap,
];

export const getSchema = () => fetchSchema(defaultExtensions);
