export function NetworkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M12 6.5 7 16M12 6.5 17 16M7 16h10" />
      <circle cx="12" cy="6" r="2.4" fill="currentColor" />
      <circle cx="6.5" cy="16.5" r="2.4" fill="currentColor" />
      <circle cx="17.5" cy="16.5" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Logo() {
  return (
    <a href="#topo" className="flex items-center gap-2.5 rounded-full" aria-label="Alba, início">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-pink-soft">
        <NetworkIcon className="h-6 w-6" />
      </span>
      <span className="text-2xl font-bold tracking-tight">Alba</span>
    </a>
  );
}

export function Blob({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <path fill="currentColor" d="M44.7,-63.3C57.2,-53.5,66.2,-39.7,71.5,-24.4C76.8,-9.1,78.4,7.6,73.1,21.9C67.8,36.2,55.6,48.1,41.7,57.6C27.8,67.1,12.2,74.3,-3.9,79.6C-20,84.9,-36.6,88.3,-48.2,80.6C-59.8,72.9,-66.4,54.1,-71.7,36.6C-77,19.1,-81,2.9,-77.6,-11.6C-74.2,-26.1,-63.4,-38.9,-50.7,-48.8C-38,-58.7,-23.4,-65.7,-7.8,-70.3C7.8,-74.9,32.2,-73.1,44.7,-63.3Z" transform="translate(100 100)" />
    </svg>
  );
}
