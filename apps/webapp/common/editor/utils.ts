import type { Editor } from '@tiptap/core';

import { type ImageUploadOptions } from 'novel/plugins';

const onUploadFile = async (file: File) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const formData = new FormData();

  formData.append('files', file);
  const response = await fetch(`/api/v1/attachment/upload`, {
    method: 'POST',
    body: formData,
  });

  const responseJSON = await response.json();

  // This should return a src of the uploaded image
  return responseJSON[0];
};

export const createImageUpload =
  ({ validateFn, onUpload }: ImageUploadOptions): UploadFileFn =>
  (file, editor, pos) => {
    // check if the file is an image
    const validated = validateFn?.(file) as unknown as boolean;
    if (!validated) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpload(file).then((response: any) => {
      editor
        .chain()
        .insertContentAt(pos, [
          {
            type: 'img',
            attrs: {
              src: response.publicURL,
              alt: response.originalName,
              openViewer: false,
            },
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '\n',
              },
            ],
          },
        ])
        .exitCode()
        .focus()
        .run();
    });
  };

export const uploadFn = createImageUpload({
  onUpload: onUploadFile,
  validateFn: () => {
    return true;
  },
});

export const handleMarkAndImagePaste = (
  editor: Editor,
  event: ClipboardEvent,
  uploadFn: UploadFileFn,
) => {
  if (event.clipboardData?.files.length) {
    return handleFilePage(editor, event, uploadFn);
  }

  return false;
};

export const handleFilePage = (
  editor: Editor,
  event: ClipboardEvent,
  uploadFn: UploadFileFn,
) => {
  event.preventDefault();
  const [file] = Array.from(event.clipboardData.files);
  const pos = editor.view.state.selection.from;

  if (file) {
    if (file.type.startsWith('image/')) {
      uploadFn(file, editor, pos);
    } else {
      uploadFileFn(file, editor, pos);
    }
  }

  return true;
};

type UploadFileFn = (file: File, view: Editor, pos: number) => void;

export const createFileUpload =
  ({ validateFn, onUpload }: ImageUploadOptions): UploadFileFn =>
  (file, editor, pos) => {
    // check if the file is an image
    const validated = validateFn?.(file) as unknown as boolean;
    if (!validated) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpload(file).then((response: any) => {
      editor
        .chain()
        .insertContentAt(pos, [
          {
            type: 'file',
            attrs: {
              src: response.publicURL,
              alt: response.originalName,
              size: response.size,
              type: response.fileType,
            },
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '\n',
              },
            ],
          },
        ])
        .exitCode()
        .focus()
        .run();
    });
  };

export const uploadFileFn = createFileUpload({
  onUpload: onUploadFile,
  validateFn: () => {
    return true;
  },
});
