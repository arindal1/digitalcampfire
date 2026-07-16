// Ember positions are derived deterministically from the index so that the
// server-rendered HTML and the client hydration pass produce identical inline
// styles. Using Math.random() here caused React hydration mismatches because
// EmberBackground is part of the LobbyView client-component tree and therefore
// re-executed on the client with different random values.
export function EmberBackground() {
  return (
    <>
      <div className="absolute bottom-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-[170px]" />

      <div className="embers">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="ember"
            style={{
              left: `${(i * 4.25 + (i % 7) * 1.5) % 100}%`,
              animationDelay: `${(i * 0.37) % 8}s`,
              animationDuration: `${6 + (i % 5) * 1.1}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}