import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Block, BlockNoteEditor, PartialBlock } from "../..";

let editor: BlockNoteEditor;

function waitForEditor() {
  // wait for create event on editor,
  // this is necessary because otherwise UniqueId.create hasn't been called yet, and
  // blocks would have "null" as their id
  return new Promise<void>((resolve) => {
    editor._tiptapEditor.on("create", () => {
      resolve();
    });
  });
}

let singleBlock: PartialBlock;

let multipleBlocks: PartialBlock[];

let insert: (placement: "before" | "nested" | "after") => Block[];

beforeEach(() => {
  editor = new BlockNoteEditor();

  singleBlock = {
    type: "paragraph",
    content: "Paragraph",
  };

  multipleBlocks = [
    {
      type: "heading",
      props: {
        level: 1,
      },
      content: "Heading 1",
      children: [
        {
          type: "heading",
          props: {
            level: 1,
          },
          content: "Nested Heading 1",
        },
      ],
    },
    {
      type: "heading",
      props: {
        level: 2,
      },
      content: "Heading 2",
      children: [
        {
          type: "heading",
          props: {
            level: 2,
          },
          content: "Nested Heading 2",
        },
      ],
    },
  ];

  insert = (placement) => {
    const existingBlock = editor.topLevelBlocks[0];
    editor.insertBlocks(multipleBlocks, existingBlock, placement);

    return editor.topLevelBlocks;
  };
});

afterEach(() => {
  editor._tiptapEditor.destroy();
  editor = undefined as any;
});

describe("Inserting Blocks with Different Placements", () => {
  it("Insert before existing block", async () => {
    await waitForEditor();

    const output = insert("before");

    expect(output).toMatchSnapshot();
  });

  it("Insert nested inside existing block", async () => {
    await waitForEditor();

    const output = insert("nested");

    expect(output).toMatchSnapshot();
  });

  it("Insert after existing block", async () => {
    await waitForEditor();

    const output = insert("after");

    expect(output).toMatchSnapshot();
  });
});

describe("Insert, Update, & Delete Blocks", () => {
  it("Insert, update, & delete single block", async () => {
    await waitForEditor();

    const existingBlock = editor.topLevelBlocks[0];
    editor.insertBlocks([singleBlock], existingBlock);

    expect(editor.topLevelBlocks).toMatchSnapshot();

    const newBlock = editor.topLevelBlocks[0];
    editor.updateBlock(newBlock, {
      type: "heading",
      props: {
        textAlignment: "right",
        level: 3,
      },
      content: [
        {
          type: "text",
          text: "Heading ",
          styles: {
            textColor: "red",
          },
        },
        {
          type: "text",
          text: "3",
          styles: {
            backgroundColor: "red",
          },
        },
      ],
      children: [singleBlock],
    });

    expect(editor.topLevelBlocks).toMatchSnapshot();

    const updatedBlock = editor.topLevelBlocks[0];
    editor.removeBlocks([updatedBlock]);

    expect(editor.topLevelBlocks).toMatchSnapshot();
  });

  it("Insert, update, & delete multiple blocks", async () => {
    await waitForEditor();

    const existingBlock = editor.topLevelBlocks[0];
    editor.insertBlocks(multipleBlocks, existingBlock);

    expect(editor.topLevelBlocks).toMatchSnapshot();

    const newBlock = editor.topLevelBlocks[0];
    editor.updateBlock(newBlock, {
      type: "paragraph",
    });

    expect(editor.topLevelBlocks).toMatchSnapshot();

    const updatedBlocks = editor.topLevelBlocks.slice(0, 2);
    editor.removeBlocks([updatedBlocks[0].children[0], updatedBlocks[1]]);

    expect(editor.topLevelBlocks).toMatchSnapshot();
  });
});
