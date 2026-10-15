import * as React from "react";
import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils/cn";

type ResizablePanelGroupProps = Omit<
  React.ComponentProps<typeof Group>,
  "orientation"
> & {
  /**
   * Backward-compatible alias for the pre-v4 API.
   * Prefer `orientation` in new code.
   */
  direction?: "horizontal" | "vertical";
  orientation?: "horizontal" | "vertical";
};

function ResizablePanelGroup({
  className,
  direction,
  orientation,
  ...props
}: ResizablePanelGroupProps) {
  const resolvedOrientation = orientation ?? direction ?? "horizontal";

  return (
    <Group
      orientation={resolvedOrientation}
      className={cn("flex h-full w-full", className)}
      {...props}
    />
  );
}

const ResizablePanel = Panel;

type ResizableHandleProps = React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
};

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizableHandleProps) {
  return (
    <Separator
      className={cn(
        "relative flex w-[3px] items-center justify-center bg-foreground after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none aria-[orientation=horizontal]:h-[3px] aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-2 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle ? (
        <div className="z-10 flex h-6 w-3 items-center justify-center border-3 border-foreground bg-background shadow-[2px_2px_0px_hsl(var(--shadow-color))]">
          <GripVertical className="h-2.5 w-2.5 stroke-[3]" />
        </div>
      ) : null}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
