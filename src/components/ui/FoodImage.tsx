import { visualFor } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

/**
 * Listings have an `image` field for real photography. Until an upload
 * pipeline exists, the prototype renders a category-coloured tile so nothing
 * appears broken.
 */
export function FoodImage({
  categorySlug,
  src,
  alt,
  className,
  emojiClassName,
}: {
  categorySlug: string;
  src?: string;
  alt: string;
  className?: string;
  emojiClassName?: string;
}) {
  const visual = visualFor(categorySlug);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("relative flex h-full w-full items-center justify-center overflow-hidden", className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${visual.from}, ${visual.to})` }}
    >
      <span
        aria-hidden
        className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/20 blur-xl"
      />
      <span
        aria-hidden
        className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-black/10 blur-xl"
      />
      <span className={cn("relative text-5xl drop-shadow-sm", emojiClassName)} aria-hidden>
        {visual.emoji}
      </span>
    </div>
  );
}
