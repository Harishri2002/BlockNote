"use client";

import { CommentData, mergeCSSClasses } from "@blocknote/core";
import type {
  ComponentPropsWithoutRef,
  FormEvent,
  MouseEvent,
  ReactNode,
  SyntheticEvent,
} from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useComponentsContext } from "../../editor/ComponentsContext.js";
import { useCreateBlockNote } from "../../hooks/useCreateBlockNote.js";
import { useDictionary } from "../../i18n/dictionary.js";
import { mergeRefs } from "../../util/mergeRefs.js";
import { schema } from "./schema.js";

/**
 * Liveblocks, but changed:
 * - removed attachments
 * - removed read status
 */
const REACTIONS_TRUNCATE = 5;

export interface CommentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The comment to display.
   */
  comment: CommentData;

  /**
   * How to show or hide the actions.
   */
  showActions?: boolean | "hover";

  /**
   * Whether to show the comment if it was deleted. If set to `false`, it will render deleted comments as `null`.
   */
  showDeleted?: boolean;

  /**
   * Whether to show reactions.
   */
  showReactions?: boolean;

  /**
   * Whether to show the composer's formatting controls when editing the comment.
   */
  // showComposerFormattingControls?: ComposerProps["showFormattingControls"];

  /**
   * Whether to indent the comment's content.
   */
  indentContent?: boolean;

  /**
   * The event handler called when the comment is edited.
   */
  onCommentEdit?: (comment: CommentData) => void;

  /**
   * The event handler called when the comment is deleted.
   */
  onCommentDelete?: (comment: CommentData) => void;

  /**
   * The event handler called when clicking on the author.
   */
  onAuthorClick?: (userId: string, event: MouseEvent<HTMLElement>) => void;

  /**
   * The event handler called when clicking on a mention.
   */
  onMentionClick?: (userId: string, event: MouseEvent<HTMLElement>) => void;

  /**
   * Override the component's strings.
   */
  // overrides?: Partial<GlobalOverrides & CommentOverrides & ComposerOverrides>;

  /**
   * @internal
   */
  autoMarkReadThreadId?: string;

  /**
   * @internal
   */
  additionalActions?: ReactNode;

  /**
   * @internal
   */
  additionalActionsClassName?: string;
}

// interface CommentReactionButtonProps
//   extends ComponentPropsWithoutRef<typeof Button> {
//   reaction: CommentReactionData;
//   // overrides?: Partial<GlobalOverrides & CommentOverrides>;
// }

// interface CommentReactionProps extends ComponentPropsWithoutRef<"button"> {
//   comment: CommentData;
//   reaction: CommentReactionData;
//   // overrides?: Partial<GlobalOverrides & CommentOverrides>;
// }

// type CommentNonInteractiveReactionProps = Omit<CommentReactionProps, "comment">;

// const CommentReactionButton = forwardRef<
//   HTMLButtonElement,
//   CommentReactionButtonProps
// >(({ reaction, overrides, className, ...props }, forwardedRef) => {
//   const $ = useOverrides(overrides);
//   return (
//     <Button
//       className={classNames("lb-comment-reaction", className)}
//       variant="outline"
//       aria-label={$.COMMENT_REACTION_DESCRIPTION(
//         reaction.emoji,
//         reaction.users.length
//       )}
//       {...props}
//       ref={forwardedRef}>
//       <Emoji className="lb-comment-reaction-emoji" emoji={reaction.emoji} />
//       <span className="lb-comment-reaction-count">{reaction.users.length}</span>
//     </Button>
//   );
// });

// export const CommentReaction = forwardRef<
//   HTMLButtonElement,
//   CommentReactionProps
// >(({ comment, reaction, overrides, disabled, ...props }, forwardedRef) => {
//   const addReaction = useAddRoomCommentReaction(comment.roomId);
//   const removeReaction = useRemoveRoomCommentReaction(comment.roomId);
//   const currentId = useCurrentUserId();
//   const isActive = useMemo(() => {
//     return reaction.users.some((users) => users.id === currentId);
//   }, [currentId, reaction]);
//   const $ = useOverrides(overrides);
//   const tooltipContent = useMemo(
//     () => (
//       <span>
//         {$.COMMENT_REACTION_LIST(
//           <List
//             values={reaction.users.map((users) => (
//               <User key={users.id} userId={users.id} replaceSelf />
//             ))}
//             formatRemaining={$.LIST_REMAINING_USERS}
//             truncate={REACTIONS_TRUNCATE}
//             locale={$.locale}
//           />,
//           reaction.emoji,
//           reaction.users.length
//         )}
//       </span>
//     ),
//     [$, reaction]
//   );

//   const stopPropagation = useCallback((event: SyntheticEvent) => {
//     event.stopPropagation();
//   }, []);

//   const handlePressedChange = useCallback(
//     (isPressed: boolean) => {
//       if (isPressed) {
//         addReaction({
//           threadId: comment.threadId,
//           commentId: comment.id,
//           emoji: reaction.emoji,
//         });
//       } else {
//         removeReaction({
//           threadId: comment.threadId,
//           commentId: comment.id,
//           emoji: reaction.emoji,
//         });
//       }
//     },
//     [addReaction, comment.threadId, comment.id, reaction.emoji, removeReaction]
//   );

//   return (
//     <Tooltip
//       content={tooltipContent}
//       multiline
//       className="lb-comment-reaction-tooltip">
//       <TogglePrimitive.Root
//         asChild
//         pressed={isActive}
//         onPressedChange={handlePressedChange}
//         onClick={stopPropagation}
//         disabled={disabled}
//         ref={forwardedRef}>
//         <CommentReactionButton
//           data-self={isActive ? "" : undefined}
//           reaction={reaction}
//           overrides={overrides}
//           {...props}
//         />
//       </TogglePrimitive.Root>
//     </Tooltip>
//   );
// });

// export const CommentNonInteractiveReaction = forwardRef<
//   HTMLButtonElement,
//   CommentNonInteractiveReactionProps
// >(({ reaction, overrides, ...props }, forwardedRef) => {
//   const currentId = useCurrentUserId();
//   const isActive = useMemo(() => {
//     return reaction.users.some((users) => users.id === currentId);
//   }, [currentId, reaction]);

//   return (
//     <CommentReactionButton
//       disableable={false}
//       data-self={isActive ? "" : undefined}
//       reaction={reaction}
//       overrides={overrides}
//       {...props}
//       ref={forwardedRef}
//     />
//   );
// });

/**
 * Displays a single comment.
 *
 * @example
 * <>
 *   {thread.comments.map((comment) => (
 *     <Comment key={comment.id} comment={comment} />
 *   ))}
 * </>
 */
export const Comment = forwardRef<HTMLDivElement, CommentProps>(
  (
    {
      comment,
      indentContent = true,
      showDeleted,
      showActions = "hover",
      showReactions = true,
      // showComposerFormattingControls = true,
      onAuthorClick,
      onMentionClick,
      onCommentEdit,
      onCommentDelete,
      // overrides,
      className,
      additionalActions,
      additionalActionsClassName,
      autoMarkReadThreadId,
      ...props
    },
    forwardedRef
  ) => {
    const dict = useDictionary();

    const commentEditor = useCreateBlockNote({
      initialContent: comment.body,
      trailingBlock: false,
      dictionary: {
        ...dict,
        placeholders: {
          ...dict.placeholders,
          default: "Edit comment...", // TODO: only for empty doc
        },
      },
      schema,
    });

    const ctx = useComponentsContext()!;

    const ref = useRef<HTMLDivElement>(null);
    const mergedRefs = mergeRefs([forwardedRef, ref]);
    // const currentUserId = useCurrentUserId();
    // const deleteComment = useDeleteRoomComment(comment.roomId);
    // const editComment = useEditRoomComment(comment.roomId);
    // const addReaction = useAddRoomCommentReaction(comment.roomId);
    // const removeReaction = useRemoveRoomCommentReaction(comment.roomId);
    // const $ = useOverrides(overrides);
    const [isEditing, setEditing] = useState(false);
    const [isTarget, setTarget] = useState(false);
    const [isMoreActionOpen, setMoreActionOpen] = useState(false);
    const [isReactionActionOpen, setReactionActionOpen] = useState(false);

    const stopPropagation = useCallback((event: SyntheticEvent) => {
      event.stopPropagation();
    }, []);

    const handleEdit = useCallback(() => {
      setEditing(true);
    }, []);

    const handleEditCancel = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setEditing(false);
      },
      []
    );

    const handleEditSubmit = useCallback(
      (
        { body, attachments }: ComposerSubmitComment,
        event: FormEvent<HTMLFormElement>
      ) => {
        // TODO: Add a way to preventDefault from within this callback, to override the default behavior (e.g. showing a confirmation dialog)
        onCommentEdit?.(comment);

        // event.preventDefault();
        // setEditing(false);
        // editComment({
        //   commentId: comment.id,
        //   threadId: comment.threadId,
        //   body,
        //   attachments,
        // });
      },
      [comment, onCommentEdit]
    );

    const handleDelete = useCallback(() => {
      // TODO: Add a way to preventDefault from within this callback, to override the default behavior (e.g. showing a confirmation dialog)
      onCommentDelete?.(comment);

      // deleteComment({
      //   commentId: comment.id,
      //   threadId: comment.threadId,
      // });
    }, [comment, onCommentDelete]);

    // const handleAuthorClick = useCallback(
    //   (event: MouseEvent<HTMLElement>) => {
    //     onAuthorClick?.(comment.userId, event);
    //   },
    //   [comment.userId, onAuthorClick]
    // );

    // const handleReactionSelect = useCallback(
    //   (emoji: string) => {
    //     const reactionIndex = comment.reactions.findIndex(
    //       (reaction) => reaction.emoji === emoji
    //     );

    //     if (
    //       reactionIndex >= 0 &&
    //       currentUserId &&
    //       comment.reactions[reactionIndex]?.users.some(
    //         (user) => user.id === currentUserId
    //       )
    //     ) {
    //       removeReaction({
    //         threadId: comment.threadId,
    //         commentId: comment.id,
    //         emoji,
    //       });
    //     } else {
    //       addReaction({
    //         threadId: comment.threadId,
    //         commentId: comment.id,
    //         emoji,
    //       });
    //     }
    //   },
    //   [
    //     addReaction,
    //     comment.id,
    //     comment.reactions,
    //     comment.threadId,
    //     removeReaction,
    //     currentUserId,
    //   ]
    // );

    useEffect(() => {
      const isWindowDefined = typeof window !== "undefined";
      if (!isWindowDefined) {
        return;
      }

      const hash = window.location.hash;
      const commentId = hash.slice(1);

      if (commentId === comment.id) {
        setTarget(true);
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!showDeleted && !comment.body) {
      return null;
    }

    return (
      <div
        id={comment.id}
        className={mergeCSSClasses(
          "lb-root lb-comment",
          indentContent && "lb-comment:indent-content",
          showActions === "hover" && "lb-comment:show-actions-hover",
          (isMoreActionOpen || isReactionActionOpen) &&
            "lb-comment:action-open",
          className
        )}
        data-deleted={!comment.body ? "" : undefined}
        data-editing={isEditing ? "" : undefined}
        // In some cases, `:target` doesn't work as expected so we also define it manually.
        data-target={isTarget ? "" : undefined}
        // dir={$.dir}
        {...props}
        ref={mergedRefs}>
        <div className="lb-comment-header">
          {/* <div className="lb-comment-details">
            <Avatar
              className="lb-comment-avatar"
              userId={comment.userId}
              onClick={handleAuthorClick}
            />
            <span className="lb-comment-details-labels">
              <User
                className="lb-comment-author"
                userId={comment.userId}
                onClick={handleAuthorClick}
              />
              <span className="lb-comment-date">
                <Timestamp
                  locale={$.locale}
                  date={comment.createdAt}
                  className="lb-date lb-comment-date-created"
                />
                {comment.editedAt && comment.body && (
                  <>
                    {" "}
                    <span className="lb-comment-date-edited">
                      {$.COMMENT_EDITED}
                    </span>
                  </>
                )}
              </span>
            </span>
          </div> */}
          {showActions && !isEditing && (
            <div
              className={mergeCSSClasses(
                "lb-comment-actions",
                additionalActionsClassName
              )}>
              {additionalActions ?? null}
              {/* {showReactions && (
                <EmojiPicker
                  onEmojiSelect={handleReactionSelect}
                  onOpenChange={setReactionActionOpen}>
                  <Tooltip content={$.COMMENT_ADD_REACTION}>
                    <EmojiPickerTrigger asChild>
                      <Button
                        className="lb-comment-action"
                        onClick={stopPropagation}
                        aria-label={$.COMMENT_ADD_REACTION}>
                        <EmojiAddIcon className="lb-button-icon" />
                      </Button>
                    </EmojiPickerTrigger>
                  </Tooltip>
                </EmojiPicker>
              )} */}
              {/* {comment.userId === currentUserId && (
                <Dropdown
                  open={isMoreActionOpen}
                  onOpenChange={setMoreActionOpen}
                  align="end"
                  content={
                    <>
                      <DropdownItem
                        onSelect={handleEdit}
                        onClick={stopPropagation}>
                        <EditIcon className="lb-dropdown-item-icon" />
                        {$.COMMENT_EDIT}
                      </DropdownItem>
                      <DropdownItem
                        onSelect={handleDelete}
                        onClick={stopPropagation}>
                        <DeleteIcon className="lb-dropdown-item-icon" />
                        {$.COMMENT_DELETE}
                      </DropdownItem>
                    </>
                  }>
                  <Tooltip content={$.COMMENT_MORE}>
                    <DropdownTrigger asChild>
                      <Button
                        className="lb-comment-action"
                        disabled={!comment.body}
                        onClick={stopPropagation}
                        aria-label={$.COMMENT_MORE}>
                        <EllipsisIcon className="lb-button-icon" />
                      </Button>
                    </DropdownTrigger>
                  </Tooltip>
                </Dropdown>
              )} */}
            </div>
          )}
        </div>
        <div className="lb-comment-content">
          {isEditing ? (
            <ctx.Comments.Comment editor={commentEditor} editable={true} />
          ) : // <Composer
          //   // className="lb-comment-composer"
          //   onComposerSubmit={handleEditSubmit}
          //   defaultValue={comment.body}
          //   autoFocus
          //   showAttribution={false}
          //   showFormattingControls={showComposerFormattingControls}
          // actions={
          //   <>
          //     <Tooltip
          //       content={$.COMMENT_EDIT_COMPOSER_CANCEL}
          //       aria-label={$.COMMENT_EDIT_COMPOSER_CANCEL}>
          //       <Button
          //         className="lb-composer-action"
          //         onClick={handleEditCancel}>
          //         <CrossIcon className="lb-button-icon" />
          //       </Button>
          //     </Tooltip>
          //     <ShortcutTooltip
          //       content={$.COMMENT_EDIT_COMPOSER_SAVE}
          //       shortcut={<ShortcutTooltipKey name="enter" />}>
          //       <ComposerPrimitive.Submit asChild>
          //         <Button
          //           variant="primary"
          //           className="lb-composer-action"
          //           onClick={stopPropagation}
          //           aria-label={$.COMMENT_EDIT_COMPOSER_SAVE}>
          //           <CheckIcon className="lb-button-icon" />
          //         </Button>
          //       </ComposerPrimitive.Submit>
          //     </ShortcutTooltip>
          //   </>
          // }
          // overrides={{
          //   COMPOSER_PLACEHOLDER: $.COMMENT_EDIT_COMPOSER_PLACEHOLDER,
          // }}
          // roomId={comment.roomId}
          // />
          comment.body ? (
            <>
              <ctx.Comments.Comment editor={commentEditor} editable={false} />
              {/* <CommentPrimitive.Body
                className="lb-comment-body"
                body={comment.body}
                components={{
                  Mention: ({ userId }) => (
                    <CommentMention
                      userId={userId}
                      onClick={(event) => onMentionClick?.(userId, event)}
                    />
                  ),
                  Link: CommentLink,
                }}
              /> */}
              {showReactions && comment.reactions.length > 0 && (
                <div className="lb-comment-reactions">
                  {/* {comment.reactions.map((reaction) => (
                    <CommentReaction
                      key={reaction.emoji}
                      comment={comment}
                      reaction={reaction}
                      overrides={overrides}
                    />
                  ))} */}
                  {/* <EmojiPicker onEmojiSelect={handleReactionSelect}>
                    <Tooltip content={$.COMMENT_ADD_REACTION}>
                      <EmojiPickerTrigger asChild>
                        <Button
                          className="lb-comment-reaction lb-comment-reaction-add"
                          variant="outline"
                          onClick={stopPropagation}
                          aria-label={$.COMMENT_ADD_REACTION}>
                          <EmojiAddIcon className="lb-button-icon" />
                        </Button>
                      </EmojiPickerTrigger>
                    </Tooltip>
                  </EmojiPicker> */}
                </div>
              )}
            </>
          ) : (
            <div className="lb-comment-body">
              {/* <p className="lb-comment-deleted">{$.COMMENT_DELETED}</p> */}
            </div>
          )}
        </div>
      </div>
    );
  }
);
