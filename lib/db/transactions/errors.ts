export class ConcurrencyConflictError extends Error {
  constructor(resource: string) {
    super(
      `${resource} changed after it was read. Refresh and retry with the current version.`,
    );
    this.name = "ConcurrencyConflictError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} was not found in the active organization.`);
    this.name = "ResourceNotFoundError";
  }
}

export class InvariantViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvariantViolationError";
  }
}
