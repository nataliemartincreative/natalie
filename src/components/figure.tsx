import Image from "next/image";
import type { Img } from "@/content/site";

/**
 * An image in a fixed-ratio frame. Without a `src` it shows a plain panel
 * with crop marks and "Image to come", so layouts hold until work is added.
 */
export function Figure({
  image,
  aspect = "3 / 2",
  sizes = "100vw",
  priority,
  showCaption = true,
  className = "",
}: {
  image?: Img;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  showCaption?: boolean;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden bg-panel" style={{ aspectRatio: image?.aspect ?? aspect }}>
        {image?.src ? (
          <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          <div role="img" aria-label={image?.alt ?? "Image to come"} className="@container absolute inset-0 text-ink/35">
            {/* Crop marks in the corners. */}
            <span className="absolute top-3 left-3 size-3 border-t border-l border-current" />
            <span className="absolute top-3 right-3 size-3 border-t border-r border-current" />
            <span className="absolute bottom-3 left-3 size-3 border-b border-l border-current" />
            <span className="absolute right-3 bottom-3 size-3 border-r border-b border-current" />
            <span className="label absolute inset-0 grid place-items-center">
              <span className="hidden @[10rem]:inline">Image to come</span>
              <span className="@[10rem]:hidden">+</span>
            </span>
          </div>
        )}
      </div>
      {showCaption && image?.caption && <figcaption className="label mt-3 text-ink-soft">{image.caption}</figcaption>}
    </figure>
  );
}
