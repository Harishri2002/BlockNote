import "@blocknote/core/fonts/inter.css";
import "@blocknote/core/style.css";

/**
 On Server Side, you can use the ServerBlockNoteEditor to render BlockNote documents to HTML. e.g.:

    import { ServerBlockNoteEditor } from "@blocknote/server-util";

    const editor = ServerBlockNoteEditor.create();
    const html = await editor.blocksToFullHTML(document);

You can then use render this HTML as a static page or send it to the client.

This example has the HTML hard-coded, but shows at least how the document will be rendered when the appropriate style sheets are loaded.
 */

export default function App() {
  // Creates a new editor instance.
  const html = `<div class="bn-block-group" data-node-type="blockGroup">
  <div class="bn-block-outer" data-node-type="blockOuter" data-id="1" data-text-color="yellow" data-background-color="blue">
      <div class="bn-block" data-node-type="blockContainer" data-id="1" data-text-color="yellow" data-background-color="blue">
          <div class="bn-block-content" data-content-type="heading" data-text-alignment="right" data-level="2">
              <h2 class="bn-inline-content">
                  <strong><u>Heading </u></strong><em><s>2</s></em>
              </h2>
          </div>
          <div class="bn-block-group" data-node-type="blockGroup">
              <div class="bn-block-outer" data-node-type="blockOuter" data-id="2" data-background-color="red">
                  <div class="bn-block" data-node-type="blockContainer" data-id="2" data-background-color="red">
                      <div class="bn-block-content" data-content-type="paragraph">
                          <p class="bn-inline-content">Paragraph</p>
                      </div>
                  </div>
              </div>
              <div class="bn-block-outer" data-node-type="blockOuter" data-id="3">
                  <div class="bn-block" data-node-type="blockContainer" data-id="3">
                      <div class="bn-block-content" data-content-type="bulletListItem">
                          <p class="bn-inline-content">list item</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>
`;

  // Renders the editor instance using a React component.
  return (
    <div className="bn-container">
      <div
        className=" bn-default-styles"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
