import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

import type {
  BlockNoteEditor,
  BlockNoteEditorOptions,
} from "../../../editor/BlockNoteEditor";
import {
  BlockSchema,
  InlineContentSchema,
  StyleSchema,
} from "../../../schema/index.js";
import { acceptedMIMETypes } from "./acceptedMIMETypes.js";
import { handleFileInsertion } from "./handleFileInsertion.js";
import { handleVSCodePaste } from "./handleVSCodePaste.js";
import { isMarkdown } from "../../parsers/markdown/detectMarkdown.js";

function defaultPasteHandler({
  event,
  editor,
  pasteBehavior = "prefer-markdown",
}: {
  event: ClipboardEvent;
  editor: BlockNoteEditor<any, any, any>;
  pasteBehavior?: "prefer-markdown" | "prefer-html";
}) {
  let format: (typeof acceptedMIMETypes)[number] | undefined;
  for (const mimeType of acceptedMIMETypes) {
    if (event.clipboardData!.types.includes(mimeType)) {
      format = mimeType;
      break;
    }
  }

  if (!format) {
    return true;
  }

  if (format === "vscode-editor-data") {
    handleVSCodePaste(event, editor.prosemirrorView!);
    return true;
  }

  if (format === "Files") {
    handleFileInsertion(event, editor);
    return true;
  }

  const data = event.clipboardData!.getData(format);

  if (format === "blocknote/html") {
    // Is blocknote/html, so no need to convert it
    editor.pasteHTML(data, true);
    return true;
  }

  if (format === "text/markdown") {
    editor.pasteText(data);
    return true;
  }

  if (pasteBehavior === "prefer-markdown") {
    // Use plain text instead of HTML if it looks like Markdown
    const plainText = event.clipboardData!.getData("text/plain");

    if (isMarkdown(plainText)) {
      editor.pasteText(plainText);
      return true;
    }
  }

  if (format === "text/html") {
    editor.pasteHTML(data);
    return true;
  }

  editor.pasteText(data, true);
  return true;
}

export const createPasteFromClipboardExtension = <
  BSchema extends BlockSchema,
  I extends InlineContentSchema,
  S extends StyleSchema
>(
  editor: BlockNoteEditor<BSchema, I, S>,
  pasteHandler: Exclude<
    BlockNoteEditorOptions<any, any, any>["pasteHandler"],
    undefined
  >
) =>
  Extension.create({
    name: "pasteFromClipboard",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handleDOMEvents: {
              paste(_view, event) {
                event.preventDefault();

                if (!editor.isEditable) {
                  return;
                }

                return pasteHandler({
                  event,
                  editor,
                  defaultPasteHandler: (
                    { pasteBehavior } = { pasteBehavior: "prefer-markdown" }
                  ) => {
                    return defaultPasteHandler({
                      event,
                      editor,
                      pasteBehavior,
                    });
                  },
                });
              },
            },
          },
        }),
      ];
    },
  });
