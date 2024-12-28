import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import StarterKit from '@tiptap/starter-kit';
import { datePageExtension } from './date-page-extension';
import { fileExtension } from './file-extension';
import { imageExtension } from './image-extension';
import { taskExtension } from './task-extension';

export const defaultExtensions = [
  fileExtension,
  imageExtension,
  taskExtension,
  datePageExtension,
  CodeBlockLowlight,
  StarterKit,
];
