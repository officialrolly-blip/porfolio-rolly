export default function Logo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims =
    size === "sm"
      ? "h-9 w-9 rounded-xl text-[11px]"
      : size === "lg"
        ? "h-12 w-12 rounded-2xl text-base"
        : "h-10 w-10 rounded-xl text-sm";
  return (
    <span
      aria-hidden
      className={`logo-animated grid place-items-center font-black text-white shadow-lg shadow-fuchsia-500/25 ring-1 ring-white/30 ${dims} ${className}`}
    >
      <span className="relative z-10">RP</span>
    </span>
  );
}
