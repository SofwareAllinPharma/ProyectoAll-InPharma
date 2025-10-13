export async function jsonOrThrow(res: Response): Promise<unknown> {
  const text = await res.text();
  let data: unknown = undefined;
  try { data = text ? JSON.parse(text) : undefined; } catch {}
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    if (data && typeof data === 'object' && data !== null) {
      const errorObj = data as Record<string, unknown>;
      if (typeof errorObj.error === 'string') message = errorObj.error;
      else if (typeof errorObj.message === 'string') message = errorObj.message;
    } else if (typeof data === 'string') message = data;
    throw new Error(message);
  }
  return data;
}
