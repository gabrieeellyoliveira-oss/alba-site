import { Link } from "@tanstack/react-router";

/** Símbolo da Orbe: um núcleo com três parceiros em órbita. */
export function OrbeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(-28 12 12)" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
      <circle cx="20.1" cy="7.6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="3.9" cy="16.4" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="9.2" cy="5.9" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Logo({ to = "/", size = "md" }: { to?: string; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const txt = size === "sm" ? "text-xl" : "text-2xl";
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-full" aria-label="Orbe, início">
      <span className={`grid ${box} place-items-center rounded-full bg-ink text-pink-soft`}>
        <OrbeIcon className={icon} />
      </span>
      <span className={`${txt} font-bold tracking-tight`}>Orbe</span>
    </Link>
  );
}

export function Blob({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <path fill="currentColor" d="M44.7,-63.3C57.2,-53.5,66.2,-39.7,71.5,-24.4C76.8,-9.1,78.4,7.6,73.1,21.9C67.8,36.2,55.6,48.1,41.7,57.6C27.8,67.1,12.2,74.3,-3.9,79.6C-20,84.9,-36.6,88.3,-48.2,80.6C-59.8,72.9,-66.4,54.1,-71.7,36.6C-77,19.1,-81,2.9,-77.6,-11.6C-74.2,-26.1,-63.4,-38.9,-50.7,-48.8C-38,-58.7,-23.4,-65.7,-7.8,-70.3C7.8,-74.9,32.2,-73.1,44.7,-63.3Z" transform="translate(100 100)" />
    </svg>
  );
}
