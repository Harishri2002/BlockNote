import { assertEmpty } from "@blocknote/core";
import { ComponentProps } from "@blocknote/react";
import { forwardRef } from "react";
import { BlockNoteView } from "../BlockNoteView.js";

export const Comment = forwardRef<
  HTMLDivElement,
  ComponentProps["Comments"]["Comment"]
>((props, ref) => {
  const { className, editor, editable, ...rest } = props;

  assertEmpty(rest, false);

  return (
    <BlockNoteView
      editor={props.editor}
      sideMenu={false}
      slashMenu={false}
      tableHandles={false}
      filePanel={false}
      editable={editable}
      ref={ref}
    />
  );
});
