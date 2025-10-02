"use client";

import { classNames } from "@codoodle/utils";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ThreeBarsIcon, XIcon } from "@primer/octicons-react";
import { MouseEvent, useState } from "react";

export default function NavDialog({
  children,
  triggerProps: { className: triggerClassName, ...triggerProps },
}: {
  children?: React.ReactNode;
  triggerProps: React.ComponentProps<typeof Button>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose(
    e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement> | boolean,
  ) {
    if (typeof e === "boolean") {
      setIsOpen(e);
    } else if (e.target instanceof HTMLAnchorElement) {
      setIsOpen(false);
    } else if (e.currentTarget instanceof HTMLButtonElement) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        className={classNames(triggerClassName)}
        {...triggerProps}
        aria-label="Open menu"
      >
        <ThreeBarsIcon size={16} />
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-30 focus:outline-none"
        onClose={handleClose}
      >
        <div className="fixed inset-0 z-30 w-screen overflow-y-auto">
          <div className="flex h-full">
            <DialogPanel
              transition
              className="w-full h-full p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle as="div">
                <Button
                  onClick={handleClose}
                  className={classNames("block ml-auto", triggerClassName)}
                  {...triggerProps}
                  aria-label="Close menu"
                >
                  <XIcon size={16} />
                </Button>
              </DialogTitle>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div onClick={handleClose}>{children}</div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
