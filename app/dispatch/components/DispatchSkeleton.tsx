export function DispatchSkeleton() {
  return (
    <div className="dispatch-skeleton" aria-busy="true" aria-label="Loading dispatch board">
      {Array.from({ length: 4 }, (_, index) => (
        <div className="skeleton-column" key={index}>
          <span className="skeleton-line" />
          <span className="skeleton-card" />
          <span className="skeleton-card" />
        </div>
      ))}
    </div>
  );
}

export default DispatchSkeleton;
