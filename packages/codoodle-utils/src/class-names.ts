import clsx from "clsx";
import { ClassNameValue, twMerge } from "tailwind-merge";

export function classNames(...inputs: ClassNameValue[]) {
  return twMerge(clsx(...inputs));
}
