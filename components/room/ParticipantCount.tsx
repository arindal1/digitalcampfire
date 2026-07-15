export function ParticipantCount({ count }: { count: number }) {
  return (
    <span className="text-secondary text-xs">
      {count} around the fire
    </span>
  );
}