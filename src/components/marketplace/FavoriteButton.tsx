"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDataStore } from "@/lib/store/dataStore";
import { useSessionStore } from "@/lib/store/sessionStore";
import type { SellerType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  sellerId,
  sellerType,
  className,
  size = 18,
}: {
  sellerId: string;
  sellerType: SellerType;
  className?: string;
  size?: number;
}) {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const favorites = useDataStore((s) => s.favorites);
  const toggleFavorite = useDataStore((s) => s.toggleFavorite);
  const isFavorite = Boolean(
    user && favorites.some((f) => f.userId === user.id && f.sellerId === sellerId),
  );

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label="Favorite"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          router.push("/ienakt");
          return;
        }
        toggleFavorite(user.id, sellerType, sellerId);
      }}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm backdrop-blur transition hover:text-clay-500",
        isFavorite && "text-clay-500",
        className,
      )}
    >
      <Heart size={size} fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}
