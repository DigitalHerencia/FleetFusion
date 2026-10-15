// components/auth/user-menu.tsx

"use client";

import { UserButton } from "@clerk/nextjs";

export type UserMenuProps = Readonly<{
  size?: "default" | "compact";
}>;

export function UserMenu({ size = "default" }: UserMenuProps) {
  const isCompact = size === "compact";
  const triggerSize = isCompact ? "size-9" : "size-11";
  const avatarSize = isCompact ? "size-8" : "size-10";

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonTrigger: [
            triggerSize,
            "grid place-items-center rounded-none border border-neutral-400 bg-black",
            "transition-colors hover:border-blue-600 hover:bg-black",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
          ].join(" "),
          userButtonAvatarBox: [
            avatarSize,
            "rounded-none border border-neutral-400 bg-blue-600",
          ].join(" "),
          avatarBox: [
            avatarSize,
            "rounded-none border border-neutral-400 bg-blue-600",
          ].join(" "),
          userButtonPopoverCard:
            "rounded-none border border-neutral-400 bg-black text-white shadow-[8px_8px_0_0_oklch(54.6% 0.245 262.881 / 0.24)]",
          userPreviewMainIdentifier:
            "font-(family-name:--font-display) text-sm tracking-[0.06em] uppercase text-white",
          userPreviewSecondaryIdentifier: "font-mono text-xs text-neutral-400",
          userButtonPopoverActionButton:
            "rounded-none text-white hover:bg-blue-600 hover:text-white",
          userButtonPopoverActionButtonText:
            "font-(family-name:--font-display) text-[13px] tracking-[0.06em] uppercase",
          userButtonPopoverFooter: "hidden",
        },
      }}
    />
  );
}
