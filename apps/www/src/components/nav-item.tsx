"use client";

import { classNames } from "@codoodle/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function NavItem({
  exact,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { exact?: boolean }) {
  const pathname = usePathname();
  const href = useMemo(
    () =>
      typeof props.href === "string" ? props.href : (props.href.pathname ?? ""),
    [props.href],
  );
  return (
    <Link
      className={classNames(
        "data-[active]:text-primary data-[active]:font-semibold",
        className,
      )}
      {...props}
      {...((exact ? pathname == href : pathname.startsWith(href))
        ? {
            ["data-active"]: "true",
          }
        : {})}
    />
  );
}
