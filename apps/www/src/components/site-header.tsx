import { classNames } from "@codoodle/utils";
import Image from "next/image";
import Link from "next/link";
import Nav from "./nav";
import NavItem from "./nav-item";

export default function SiteHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={classNames("border-b border-separator", className)}
      {...props}
    >
      <div className="mx-auto max-lg:max-w-2xl max-lg:border-x max-sm:border-x-0 border-separator">
        <div className="p-3 flex items-center gap-4">
          <div>
            <Link href="/" aria-label="홈으로 이동">
              <Image
                src="/images/codoodle.png"
                alt="Logo"
                width={24}
                height={24}
                priority
                className="dark:invert"
                aria-hidden="true"
              />
              <span className="sr-only">Codoodle</span>
            </Link>
          </div>
          <Nav className="ml-auto flex items-center gap-4 text-sm">
            <NavItem href="/blog">블로그</NavItem>
          </Nav>
        </div>
      </div>
    </div>
  );
}
