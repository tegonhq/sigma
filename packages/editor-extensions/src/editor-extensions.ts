import { datePageExtension } from './date-page-extension';
import { fileExtension } from './file-extension';
import { imageExtension } from './image-extension';
import { taskExtension } from './task-extension';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import ListKeymap from '@tiptap/extension-list-keymap';
import { tasksExtension } from './tasks-extension';
import taskList from './task-list';
import { getSchema as fetchSchema } from '@tiptap/core';

export const defaultExtensions = [
  fileExtension,
  imageExtension,
  taskExtension,
  tasksExtension,
  datePageExtension,
  StarterKit,
  Link,
  Placeholder,
  Highlight,
  taskList,
  ListKeymap,
];

export const getSchema = () => fetchSchema(defaultExtensions);
