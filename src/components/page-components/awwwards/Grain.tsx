// Fixed film grain over the whole page: a tiny SVG noise tile, never repainted on scroll.
const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function Grain() {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[140] opacity-[0.05] mix-blend-multiply" style={{ backgroundImage: NOISE }} />;
}
