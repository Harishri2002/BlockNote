"use client";

import { CommentData, ThreadData, mergeCSSClasses } from "@blocknote/core";
import { type EmojiMartData } from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import type { EmojiData } from "emoji-mart";
import {
  ComponentPropsWithoutRef,
  MouseEvent,
  ReactNode,
  useCallback,
  useState,
} from "react";
import {
  RiArrowGoBackFill,
  RiCheckFill,
  RiDeleteBinFill,
  RiEditFill,
  RiEmotionLine,
  RiMoreFill,
} from "react-icons/ri";

import { useBlockNoteContext } from "../../editor/BlockNoteContext.js";
import { useComponentsContext } from "../../editor/ComponentsContext.js";
import { useBlockNoteEditor } from "../../hooks/useBlockNoteEditor.js";
import { useCreateBlockNote } from "../../hooks/useCreateBlockNote.js";
import { useDictionary } from "../../i18n/dictionary.js";
import { CommentEditor } from "./CommentEditor.js";
import { schema } from "./schema.js";
import { useUser } from "./useUsers.js";

let data: EmojiMartData | undefined;
async function initData() {
  const fullData = await import("@emoji-mart/data");
  data = fullData.default as EmojiMartData;
}

export interface CommentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The comment to display.
   */
  comment: CommentData;

  /**
   * The thread the comment belongs to.
   */
  thread: ThreadData;

  /**
   * How to show or hide the actions.
   */
  showActions?: boolean | "hover";

  /**
   * Whether to show the resolve action.
   */
  showResolveAction?: boolean;

  /**
   * Whether to show the comment if it was deleted. If set to `false`, it will render deleted comments as `null`.
   */
  showDeleted?: boolean;

  /**
   * Whether to show reactions.
   */
  showReactions?: boolean;
}

/**
 * The Comment component displays a single comment with actions,
 * a reaction list and an editor when editing.
 *
 * It's generally used in the `Thread` component for comments that have already been created.
 */
export const Comment = ({
  comment,
  thread,
  showDeleted,
  showActions = "hover",
  showReactions = true,
  showResolveAction = false,
  className,
}: CommentProps) => {
  const dict = useDictionary();

  // TODO: review use of sub-editor
  const commentEditor = useCreateBlockNote(
    {
      initialContent: comment.body,
      trailingBlock: false,
      dictionary: {
        ...dict,
        placeholders: {
          emptyDocument: "Edit comment...",
        },
      },
      schema,
    },
    [comment.body]
  );

  const Components = useComponentsContext()!;

  const [isEditing, setEditing] = useState(false);
  // We need to keep a state so we can close the picker after selecting an emoji
  const [showReactionsPicker, setShowReactionsPicker] = useState<
    undefined | "toolbar" | "badge"
  >(undefined);

  const [moreActionsTooltip, setMoreActionsTooltip] = useState<
    string | undefined
  >("More actions");

  const editor = useBlockNoteEditor();

  if (!editor.comments) {
    throw new Error("Comments plugin not found");
  }

  const threadStore = editor.comments.threadStore;

  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  const onEditCancel = useCallback(() => {
    commentEditor.replaceBlocks(commentEditor.document, comment.body);
    setEditing(false);
  }, [commentEditor, comment.body]);

  const onEditSubmit = useCallback(
    async (_event: MouseEvent) => {
      // TODO: show error on failure?
      await threadStore.updateComment({
        commentId: comment.id,
        comment: {
          body: commentEditor.document,
        },
        threadId: thread.id,
      });

      setEditing(false);
    },
    [comment, thread.id, commentEditor, threadStore]
  );

  const onDelete = useCallback(async () => {
    // TODO: show error on failure?
    await threadStore.deleteComment({
      commentId: comment.id,
      threadId: thread.id,
    });
  }, [comment, thread.id, threadStore]);

  const onReactionSelect = useCallback(
    async (emoji: string) => {
      // TODO: show error on failure?
      await threadStore.addReaction({
        threadId: thread.id,
        commentId: comment.id,
        emoji,
      });
    },
    [comment.id, threadStore, thread.id]
  );

  const onResolve = useCallback(async () => {
    // TODO: show error on failure?
    await threadStore.resolveThread({
      threadId: thread.id,
    });
  }, [thread.id, threadStore]);

  const onReopen = useCallback(async () => {
    // TODO: show error on failure?
    await threadStore.unresolveThread({
      threadId: thread.id,
    });
  }, [thread.id, threadStore]);

  const user = useUser(editor, comment.userId);

  const blockNoteContext = useBlockNoteContext();

  if (!showDeleted && !comment.body) {
    return null;
  }

  let actions: ReactNode | undefined = undefined;
  const canAddReaction = threadStore.auth.canAddReaction(comment);
  const canDeleteComment = threadStore.auth.canDeleteComment(comment);
  const canEditComment = threadStore.auth.canUpdateComment(comment);

  const showResolveOrReopen =
    showResolveAction &&
    (thread.resolved
      ? threadStore.auth.canUnresolveThread(thread)
      : threadStore.auth.canResolveThread(thread));

  if (!data) {
    // TODO: Is this safe? we should technically wait for this to load before
    //  rendering emoji picker
    initData();
  }

  if (showActions && !isEditing) {
    actions = (
      <Components.Generic.Toolbar.Root
        className={mergeCSSClasses("bn-action-toolbar", "bn-comment-actions")}>
        {canAddReaction && (
          <Components.Generic.Popover.Root
            opened={showReactionsPicker === "toolbar"}>
            <Components.Generic.Popover.Trigger>
              <Components.Generic.Toolbar.Button
                mainTooltip={showReactionsPicker ? undefined : "Add reaction"}
                variant="compact"
                onClick={(e) => {
                  setShowReactionsPicker(
                    showReactionsPicker === "toolbar" ? undefined : "toolbar"
                  );
                  // Needed as the Picker component's onClickOutside handler
                  // fires immediately after otherwise, preventing the popover
                  // from opening.
                  e.preventDefault();
                  e.stopPropagation();
                }}>
                <RiEmotionLine size={16} />
              </Components.Generic.Toolbar.Button>
            </Components.Generic.Popover.Trigger>
            <Components.Generic.Popover.Content variant={"form-popover"}>
              <Picker
                data={data}
                onEmojiSelect={(emoji: EmojiData) => {
                  onReactionSelect(emoji.native);
                  setShowReactionsPicker(undefined);
                }}
                onClickOutside={() => setShowReactionsPicker(undefined)}
                theme={blockNoteContext?.colorSchemePreference}
              />
            </Components.Generic.Popover.Content>
          </Components.Generic.Popover.Root>
        )}
        {showResolveOrReopen &&
          (thread.resolved ? (
            <Components.Generic.Toolbar.Button
              mainTooltip="Re-open"
              variant="compact"
              onClick={onReopen}>
              <RiArrowGoBackFill size={16} />
            </Components.Generic.Toolbar.Button>
          ) : (
            <Components.Generic.Toolbar.Button
              mainTooltip="Resolve"
              variant="compact"
              onClick={onResolve}>
              <RiCheckFill size={16} />
            </Components.Generic.Toolbar.Button>
          ))}
        {(canDeleteComment || canEditComment) && (
          <Components.Generic.Menu.Root
            position={"bottom-start"}
            onOpenChange={(open) =>
              setMoreActionsTooltip(open ? undefined : "More actions")
            }>
            <Components.Generic.Menu.Trigger>
              <Components.Generic.Toolbar.Button
                mainTooltip={moreActionsTooltip}
                variant="compact">
                <RiMoreFill size={16} />
              </Components.Generic.Toolbar.Button>
            </Components.Generic.Menu.Trigger>
            <Components.Generic.Menu.Dropdown className={"bn-menu-dropdown"}>
              {canEditComment && (
                <Components.Generic.Menu.Item
                  icon={<RiEditFill />}
                  onClick={handleEdit}>
                  Edit comment
                </Components.Generic.Menu.Item>
              )}
              {canDeleteComment && (
                <Components.Generic.Menu.Item
                  icon={<RiDeleteBinFill />}
                  onClick={onDelete}>
                  Delete comment
                </Components.Generic.Menu.Item>
              )}
            </Components.Generic.Menu.Dropdown>
          </Components.Generic.Menu.Root>
        )}
      </Components.Generic.Toolbar.Root>
    );
  }

  const timeString =
    comment.createdAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }) +
    (comment.updatedAt.getTime() !== comment.createdAt.getTime()
      ? " (edited)"
      : "");

  return (
    <Components.Comments.Comment
      authorInfo={user ?? "loading"}
      timeString={timeString}
      showActions={showActions}
      actions={actions}
      className={className}>
      {comment.body ? (
        <>
          <CommentEditor
            editor={commentEditor}
            editable={isEditing}
            actions={
              (showReactions && comment.reactions.length > 0) || isEditing
                ? ({ isEmpty }) => (
                    <>
                      {showReactions && comment.reactions.length > 0 && (
                        <Components.Generic.Badge.Group
                          className={mergeCSSClasses(
                            "bn-badge-group",
                            "bn-comment-reactions"
                          )}>
                          {comment.reactions.map((reaction) => (
                            <Components.Generic.Badge.Root
                              key={reaction.emoji}
                              className={mergeCSSClasses(
                                "bn-badge",
                                "bn-comment-reaction"
                              )}
                              text={reaction.userIds.length.toString()}
                              icon={reaction.emoji}
                              isSelected={
                                user && reaction.userIds.includes(user.id)
                              }
                              onClick={() => onReactionSelect(reaction.emoji)}
                              mainTooltip={"Reacted by"}
                              secondaryTooltip={`${reaction.userIds.join(
                                "\n"
                              )}`}
                            />
                          ))}
                          <Components.Generic.Popover.Root
                            opened={showReactionsPicker === "badge"}>
                            <Components.Generic.Popover.Trigger>
                              <Components.Generic.Badge.Root
                                className={mergeCSSClasses(
                                  "bn-badge",
                                  "bn-comment-add-reaction"
                                )}
                                text={"+"}
                                icon={<RiEmotionLine size={16} />}
                                onClick={(e) => {
                                  setShowReactionsPicker(
                                    showReactionsPicker === "badge"
                                      ? undefined
                                      : "badge"
                                  );
                                  // Needed as the Picker component's onClickOutside handler
                                  // fires immediately after otherwise, preventing the popover
                                  // from opening.
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                mainTooltip={
                                  showReactionsPicker === "badge"
                                    ? undefined
                                    : "Add reaction"
                                }
                              />
                            </Components.Generic.Popover.Trigger>
                            <Components.Generic.Popover.Content
                              variant={"form-popover"}>
                              <Picker
                                data={data}
                                onEmojiSelect={(emoji: EmojiData) => {
                                  onReactionSelect(emoji.native);
                                  setShowReactionsPicker(undefined);
                                }}
                                onClickOutside={() =>
                                  setShowReactionsPicker(undefined)
                                }
                                theme={blockNoteContext?.colorSchemePreference}
                              />
                            </Components.Generic.Popover.Content>
                          </Components.Generic.Popover.Root>
                        </Components.Generic.Badge.Group>
                      )}
                      {isEditing && (
                        <Components.Generic.Toolbar.Root
                          variant="action-toolbar"
                          className={mergeCSSClasses(
                            "bn-action-toolbar",
                            "bn-comment-actions"
                          )}>
                          <Components.Generic.Toolbar.Button
                            mainTooltip="Save"
                            variant="compact"
                            onClick={onEditSubmit}
                            isDisabled={isEmpty}>
                            Save
                          </Components.Generic.Toolbar.Button>
                          <Components.Generic.Toolbar.Button
                            className={"bn-button"}
                            mainTooltip="Cancel"
                            variant="compact"
                            onClick={onEditCancel}>
                            Cancel
                          </Components.Generic.Toolbar.Button>
                        </Components.Generic.Toolbar.Root>
                      )}
                    </>
                  )
                : undefined
            }
          />
        </>
      ) : (
        // Soft deletes
        // TODO, test
        <div className="bn-comment-body">
          <p className="bn-comment-deleted">Deleted</p>
        </div>
      )}
    </Components.Comments.Comment>
  );
};
