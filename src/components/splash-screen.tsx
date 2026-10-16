"use client";

import {
  useEffect,
  useEffectEvent,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from "react";
import { INTRO_STORAGE_KEY } from "@/lib/intro";
import { site } from "@/lib/site";
import "./splash-screen.css";

const TITLE_LINES = [
  ["Natalie's", "Favorite"],
  ["Website", "Ever"],
];

const indexStyle = (i: number) => ({ "--i": i }) as CSSProperties;

export function SplashScreen() {
  const [finished, setFinished] = useState(false);

  function finish() {
    document.documentElement.dataset.intro = "done";
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // Storage can be blocked (private mode); the intro just plays again.
    }
    setFinished(true);
  }

  const onEscape = useEffectEvent(finish);

  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished]);

  if (finished) return null;

  // Only the curtain animation on the root itself ends the intro.
  const onAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) finish();
  };

  let wordIndex = 0;

  return (
    <div data-splash className="splash" onAnimationEnd={onAnimationEnd}>
      <div className="splash-grain" aria-hidden />
      <div className="splash-vignette" aria-hidden />
      <div className="splash-bar splash-bar-top" aria-hidden />
      <div className="splash-bar splash-bar-bottom" aria-hidden />

      <div className="splash-stage" aria-hidden>
        <p className="splash-eyebrow">A Natalie Original</p>
        <p className="splash-title">
          {TITLE_LINES.map((line) => (
            <span key={line.join(" ")} className="splash-line">
              {line.map((word) => (
                <span key={word} className="splash-word">
                  <span className="splash-word-inner" style={indexStyle(wordIndex++)}>
                    {word}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </p>
        <span className="splash-rule" />
      </div>

      <div className="splash-panel" aria-hidden>
        <span className="splash-monogram">
          {[...site.initials].map((letter, i) => (
            <span key={i} className="splash-letter" style={indexStyle(i)}>
              {letter}
            </span>
          ))}
        </span>
      </div>

      <button type="button" className="splash-skip" onClick={finish}>
        Skip intro
      </button>
    </div>
  );
}
