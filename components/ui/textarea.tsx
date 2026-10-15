import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "bk-interactive flex min-h-[100px] w-full border-3 border-input bg-background px-4 py-3 text-base shadow-[4px_4px_0px_hsl(var(--shadow-color))] placeholder:text-muted-foreground focus-visible:translate-x-[4px] focus-visible:translate-y-[4px] focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
