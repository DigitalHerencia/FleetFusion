interface VehiclesErrorProps {
  error: Error;
  reset: () => void;
}

// Error boundary for the vehicles domain pages.
export default function VehiclesError({ error, reset }: VehiclesErrorProps) {
  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Something went wrong</h2>
      <p className="text-destructive mb-2">{error.message}</p>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
      >
        Try again
      </button>
    </div>
  );
}
