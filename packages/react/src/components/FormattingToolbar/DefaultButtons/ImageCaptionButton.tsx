import {
  BlockSchema,
  checkBlockIsDefaultType,
  checkDefaultBlockTypeInSchema,
  InlineContentSchema,
  StyleSchema,
} from "@blocknote/core";
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { RiText } from "react-icons/ri";

import { useComponentsContext } from "../../../editor/ComponentsContext";
import { useBlockNoteEditor } from "../../../hooks/useBlockNoteEditor";
import { useSelectedBlocks } from "../../../hooks/useSelectedBlocks";

export const ImageCaptionButton = () => {
  const Components = useComponentsContext()!;

  const editor = useBlockNoteEditor<
    BlockSchema,
    InlineContentSchema,
    StyleSchema
  >();

  const [currentEditingCaption, setCurrentEditingCaption] = useState<string>();

  const selectedBlocks = useSelectedBlocks(editor);

  const imageBlock = useMemo(() => {
    // Checks if only one block is selected.
    if (selectedBlocks.length !== 1) {
      return undefined;
    }

    const block = selectedBlocks[0];

    if (checkBlockIsDefaultType("image", block, editor)) {
      setCurrentEditingCaption(block.props.caption);
      return block;
    }

    return undefined;
  }, [editor, selectedBlocks]);

  const handleEnter = useCallback(
    (event: KeyboardEvent) => {
      if (
        imageBlock &&
        checkDefaultBlockTypeInSchema("image", editor) &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        editor.updateBlock(imageBlock, {
          type: "image",
          props: {
            caption: currentEditingCaption,
          },
        });
      }
    },
    [currentEditingCaption, editor, imageBlock]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setCurrentEditingCaption(event.currentTarget.value),
    []
  );

  if (!imageBlock) {
    return null;
  }

  return (
    <Components.Generic.Popover.Root>
      <Components.Generic.Popover.Trigger>
        <Components.FormattingToolbar.Button
          className={"bn-button"}
          mainTooltip={"Edit Caption"}
          icon={<RiText />}
          isSelected={imageBlock.props.caption !== ""}
        />
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content>
        <Components.Generic.Form.Root>
          <Components.Generic.Form.TextInput
            className={"bn-popover-content bn-input-popover"}
            name={"image-caption"}
            icon={<RiText />}
            value={currentEditingCaption || ""}
            autoFocus={true}
            placeholder={"Edit Caption"}
            onKeyDown={handleEnter}
            onChange={handleChange}
          />
        </Components.Generic.Form.Root>
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  );
};
