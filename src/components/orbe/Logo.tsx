import { Link } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";

const PALETA = { c1: "#F0559A", c2: "#A66BFF", c3: "#141414" };

function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduzido(mq.matches);
    const f = () => setReduzido(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return reduzido;
}

/** Orbe de energia animado (símbolo da marca). Fica parado se a pessoa pediu menos movimento. */
export function Orbe({ size = 44, rotulo }: { size?: number; rotulo?: string }) {
  const uid = useId().replace(/:/g, "");
  const parado = useMovimentoReduzido();
  const { c1, c2, c3 } = PALETA;
  const anima = !parado;
  const a11y = rotulo ? { role: "img", "aria-label": rotulo } : { "aria-hidden": true as const };

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" {...a11y} style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={c1} stopOpacity="0.55" />
          <stop offset="0.55" stopColor={c2} stopOpacity="0.22" />
          <stop offset="1" stopColor={c2} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`core-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="0.12" stopColor={c1} stopOpacity="0.95" />
          <stop offset="0.48" stopColor={c2} stopOpacity="0.8" />
          <stop offset="0.82" stopColor={c3} stopOpacity="0.75" />
          <stop offset="1" stopColor={c3} stopOpacity="0" />
        </radialGradient>
        <filter id={`el-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves={2} seed={3} result="n">
            {anima && <animate attributeName="baseFrequency" values="0.03;0.046;0.03" dur="5s" repeatCount="indefinite" />}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale={12} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="d" /></feMerge>
        </filter>
        <filter id={`el2-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves={2} seed={9} result="n">
            {anima && <animate attributeName="baseFrequency" values="0.045;0.028;0.045" dur="7s" repeatCount="indefinite" />}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="G" yChannelSelector="R" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="d" /></feMerge>
        </filter>
        <filter id={`soft-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#halo-${uid})`}>
        {anima && <animate attributeName="r" values="88;98;88" dur="4s" repeatCount="indefinite" />}
      </circle>
      <circle cx="100" cy="100" r="72" fill={`url(#core-${uid})`} />
      <g filter={`url(#el-${uid})`} fill="none" strokeLinecap="round">
        <g>
          {anima && <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="18s" repeatCount="indefinite" />}
          <circle cx="100" cy="100" r="74" stroke={c1} strokeWidth="2.6" />
          <circle cx="100" cy="100" r="60" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.75" />
          <circle cx="100" cy="100" r="46" stroke={c1} strokeWidth="1.6" />
          <circle cx="100" cy="100" r="30" stroke={c2} strokeWidth="1.4" />
          <path d="M100 100 L100 26 M100 100 L152 48 M100 100 L174 100 M100 100 L152 152 M100 100 L100 174 M100 100 L48 152 M100 100 L26 100 M100 100 L48 48" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.55" />
        </g>
      </g>
      <g filter={`url(#el2-${uid})`} fill="none">
        <g>
          {anima && <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="26s" repeatCount="indefinite" />}
          <circle cx="100" cy="100" r="82" stroke={c1} strokeWidth="1.2" strokeOpacity="0.85" />
          <circle cx="100" cy="100" r="67" stroke={c2} strokeWidth="2" />
          <circle cx="100" cy="100" r="52" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.8" />
        </g>
      </g>
      <circle cx="100" cy="100" r="10" fill="#FFFFFF" filter={`url(#soft-${uid})`}>
        {anima && <animate attributeName="r" values="7;12;7" dur="2.4s" repeatCount="indefinite" />}
      </circle>
      <circle cx="100" cy="100" r="3" fill="#FFFFFF" />
      <g>
        {anima && <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="6s" repeatCount="indefinite" />}
        <circle cx="100" cy="9" r="8" fill={c1} fillOpacity="0.5" filter={`url(#soft-${uid})`} />
        <circle cx="100" cy="9" r="3.2" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function Logo({ to = "/", size = "md", slogan = false }: { to?: string; size?: "sm" | "md"; slogan?: boolean }) {
  const px = size === "sm" ? 36 : 44;
  const txt = size === "sm" ? "text-xl" : "text-[26px]";
  return (
    <Link to={to} className="flex items-center gap-2 rounded-full" aria-label="ORBE, Ecossistemas que crescem juntos. Início">
      <Orbe size={px} />
      <span className="flex flex-col leading-none">
        <span className={`${txt} font-bold tracking-[-0.03em]`}>ORBE</span>
        {slogan && <span className="mt-1 hidden text-xs font-medium text-muted-foreground sm:block">Ecossistemas que crescem juntos.</span>}
      </span>
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
