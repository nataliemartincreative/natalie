import Image from "next/image";
import type { Img } from "@/content/site";

/**
 * An image in a fixed-ratio frame. Without a `src` it shows a plain panel
 * with crop marks and "Image to come", so layouts hold until work is added.
 */
export function Figure({
  image,
  aspect,
  sizes = "100vw",
  priority,
  showCaption = true,
  className = "",
  imgClassName = "",
}: {
  image?: Img;
  /** Overrides the image's own aspect ratio when set. */
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  showCaption?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <figure className={className}>
      <div
        className="relative overflow-hidden bg-panel"
        style={{ aspectRatio: aspect ?? image?.aspect ?? "3 / 2", backgroundColor: image?.src ? undefined : image?.tint }}
      >
        {image?.src ? (
          <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className={`object-cover ${imgClassName}`} />
        ) : (
          <div
            role="img"
            aria-label={image?.alt ?? "Image to come"}
            // Light marks on a colored placeholder, dark ones on the plain panel.
            className={`@container absolute inset-0 ${image?.tint ? "text-white/45" : "text-ink/30"}`}
          >
            <span className="absolute top-4 left-4 size-3 border-t border-l border-current" />
            <span className="absolute top-4 right-4 size-3 border-t border-r border-current" />
            <span className="absolute bottom-4 left-4 size-3 border-b border-l border-current" />
            <span className="absolute right-4 bottom-4 size-3 border-r border-b border-current" />
            <span className="absolute inset-0 grid place-items-center text-xs tracking-wide">
              <span className="hidden @[10rem]:inline">Image to come</span>
              <span className="@[10rem]:hidden">+</span>
            </span>
          </div>
        )}
      </div>
      {showCaption && image?.caption && <figcaption className="mt-3 text-sm text-mute">{image.caption}</figcaption>}
    </figure>
  );
}
