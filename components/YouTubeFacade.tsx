"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  /** YouTube video ID (e.g. "Kzl5SBETYuI") */
  videoId: string;
  /** Poster image shown before the user presses play. */
  poster: string;
  posterAlt: string;
  title: string;
  /** Optional aspect class — defaults to 16:9. */
  className?: string;
};

/**
 * YouTube "facade" — defers the heavy iframe + JS until the user clicks play.
 * Saves ~500 KB of blocking network on initial load (YouTube player JS, cookies,
 * third-party requests). Not the exact same UX as an autoplaying embed, but
 * identical in intent and dramatically faster to first paint.
 */
export function YouTubeFacade({ videoId, poster, posterAlt, title, className = "" }: Props) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className={`relative aspect-video overflow-hidden rounded-lg bg-black ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`Play ${title}`}
      className={`group relative block w-full aspect-video overflow-hidden rounded-lg bg-zinc-900 shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${className}`}
    >
      <Image
        src={poster}
        alt={posterAlt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/95 shadow-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:bg-white">
          <div
            className="w-0 h-0 border-y-[14px] border-y-transparent border-l-[22px] border-l-brand-600 ml-2"
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  );
}
