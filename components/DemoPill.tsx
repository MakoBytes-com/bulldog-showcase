export function DemoPill({ realUrl }: { realUrl: string }) {
  return (
    <div
      className="fixed top-3 right-3 z-[100] flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-black shadow-lg backdrop-blur-md"
      style={{ WebkitBackdropFilter: "blur(10px)" }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>Portfolio Demo</span>
      <span className="hidden sm:inline text-black/40">·</span>
      <a
        href={realUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:inline text-blue-600 hover:text-blue-700 underline underline-offset-2"
      >
        Live site →
      </a>
    </div>
  );
}
