export function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

export function isNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

export function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean';
}

export function isString(x: unknown): x is string {
  return typeof x === 'string';
}
