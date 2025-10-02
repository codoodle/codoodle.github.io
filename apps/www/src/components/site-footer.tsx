import { classNames } from "@codoodle/utils";
import ColorSchemeSwitcher from "./color-scheme-switcher";

export default function SiteFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={classNames("border-t border-separator", className)}
      {...props}
    >
      <div className="min-h-24 flex flex-col mx-auto max-lg:max-w-2xl max-lg:border-x border-separator">
        <div className="p-3 flex items-center justify-between">
          <div className="text-sm leading-none">
            <div>&copy; Codoodle 2025. All rights reserved.</div>
          </div>
          <ColorSchemeSwitcher />
        </div>
      </div>
    </div>
  );
}
