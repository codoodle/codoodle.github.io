"use client";

import { useEffect, useRef } from "react";

export default function Utterances(props: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const createUtterances = (isDark: boolean) => {
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", "codoodle/codoodle.github.io");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "🌱 feedback");
    script.setAttribute("theme", isDark ? "github-dark" : "github-light");
    ref.current?.appendChild(script);
  };

  const refCreating = useRef(false);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (ref.current.querySelector("iframe")) {
      return;
    }

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      ref.current!.innerHTML = "";
      createUtterances(isDark);
    });
    if (refCreating.current) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return;
    }

    const isDark = document.documentElement.classList.contains("dark");
    ref.current.innerHTML = "";
    refCreating.current = true;
    createUtterances(isDark);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} {...props} />;
}
