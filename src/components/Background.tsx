export default function Background() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[-1] h-full w-full overflow-hidden"
      style={{ background: "var(--cream)" }}
    >
      <div 
        className="absolute inset-0 opacity-[0.1] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgb(var(--gold-rgb) / 0.2), transparent 34rem), linear-gradient(180deg, rgb(var(--cream-rgb) / 0.92), rgb(var(--gold-rgb) / 0.18), rgb(var(--cream-rgb) / 0.95))",
        }}
      />
    </div>
  );
}
