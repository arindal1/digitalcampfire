export function EmberBackground() {
  return (
    <>
      <div className="absolute bottom-[-140px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-[170px]" />

      <div className="embers">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="ember"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}