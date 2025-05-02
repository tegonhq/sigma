import { generateHTML, generateJSON } from '@tiptap/html';
import { defaultExtensions } from './editor-extensions';

export function convertHtmlToTiptapJson(html: string) {
  const tiptapJson = generateJSON(html, defaultExtensions);
  return tiptapJson;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertTiptapJsonToHtml(tiptapJson: Record<string, any>) {
  return generateHTML(tiptapJson, defaultExtensions);
}
