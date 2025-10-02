import { classNames } from "@codoodle/utils";
import Image from "next/image";

export default function Glassmorphism({
  className,
  backgroundAlt,
  backgroundImage,
  backgroundClassName,
  children,
  childrenClassName,
  copy,
  copyClassName,
}: {
  className?: string;
  backgroundAlt?: string;
  backgroundImage: string;
  backgroundClassName?: string;
  children: React.ReactNode;
  childrenClassName?: string;
  copy?: React.ReactNode;
  copyClassName?: string;
}) {
  return (
    <div
      className={classNames(
        "not-prose relative aspect-square overflow-hidden rounded-sm",
        className,
      )}
    >
      <div className="absolute inset-0 z-0">
        <Image
          alt={backgroundAlt ?? ""}
          src={backgroundImage}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className={classNames(
            "object-cover object-center",
            backgroundClassName,
          )}
          aria-hidden={backgroundAlt ? undefined : true}
          priority={false}
        />
      </div>
      <div
        className={classNames(
          "absolute z-10 bg-white/20 backdrop-blur-none rounded-md shadow-xl p-4 border border-white/40 sm:backdrop-blur-md",
          "transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none",
          "hover:scale-105 hover:-translate-y-1 hover:shadow-2xl",
          "focus-within:scale-105 focus-within:-translate-y-1 focus-within:shadow-2xl",
          "focus-within:ring-2 focus-within:ring-white/40 focus-within:ring-offset-2",
          childrenClassName,
        )}
        tabIndex={-1}
      >
        {children}
      </div>
      {copy && (
        <div
          className={classNames(
            "absolute z-10 text-xs bottom-2 left-3",
            copyClassName,
          )}
        >
          {copy}
        </div>
      )}
    </div>
  );
}
