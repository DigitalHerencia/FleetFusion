import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { applicationProduct } from "@/content/application";

export function LogoLockup({
  className,
  collapsed = false,
  size = "default",
}: {
  className?: string;
  collapsed?: boolean;
  size?: "default" | "compact" | "auth";
}) {
  return (
    <span
      className={cn("brand-lockup", className)}
      data-size={size}
      data-collapsed={collapsed}
    >
      <Image
        src={applicationProduct.brand.image}
        alt=""
        width={40}
        height={40}
        className="brand-image"
      />
      {!collapsed && (
        <span className="brand-name">
          {applicationProduct.brand.title}
          <br />
          <span className="brand-subtitle">
            {applicationProduct.brand.subtitle}
          </span>
        </span>
      )}
    </span>
  );
}
