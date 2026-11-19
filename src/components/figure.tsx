import Image from "next/image";
import type { Img } from "@/content/portfolio";

/**
 * An image in a fixed-ratio frame. Without a `src` it shows a quiet tinted
 * panel marked "Photography to come", so pages hold their layout until real
 * photos are added.
 */
export function Figure({
  image,
  tint = "var(--color-paper-deep)",
  aspect = "4 / 3",
  caption,
  sizes = "(min-width: 768px) 50vw, 100vw",
  priority,
  className = "",
}: {
  image?: Img;
  tint?: string;
  aspect?: string;
  caption?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden" style={{ aspectRatio: image?.aspect ?? aspect, background: tint }}>
        {image?.src ? (
          <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          <div role="img" aria-label={image?.alt ?? "Photography to come"} className="@container absolute inset-0">
            <div className="absolute inset-3 border border-white/50 sm:inset-4" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-ink/40 uppercase">
                <svg viewBox="0 0 10 10" className="size-2" aria-hidden>
                  <path d="M5 0.5 9.5 5 5 9.5 0.5 5Z" fill="none" stroke="currentColor" />
                </svg>
                {/* Small panels show just the mark. */}
                <span className="hidden @[13rem]:inline">Photography to come</span>
              </span>
            </div>
          </div>
        )}
      </div>
      {caption && <figcaption className="mt-3 text-xs text-ink-soft">{caption}</figcaption>}
    </figure>
  );
}
