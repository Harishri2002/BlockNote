import { ComponentProps } from "@blocknote/react";
import { forwardRef } from "react";
import { cn } from "../lib/utils";

export const SuggestionMenuLabel = forwardRef<
  HTMLDivElement,
  ComponentProps["SuggestionMenu"]["Label"]
>((props, ref) => {
  const { className, children } = props;

  return (
    <div
      // Styles from ShadCN DropdownMenuLabel component
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      ref={ref}>
      {children}
    </div>
  );
});
