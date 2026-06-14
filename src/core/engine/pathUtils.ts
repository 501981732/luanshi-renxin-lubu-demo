export function getValueByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export function hasPath(obj: unknown, path: string): boolean {
  const keys = path.split(".");
  let cursor = obj;

  for (const key of keys) {
    if (cursor === null || typeof cursor !== "object" || !(key in cursor)) {
      return false;
    }
    cursor = (cursor as Record<string, unknown>)[key];
  }

  return true;
}

export function setValueByPath(obj: unknown, path: string, value: unknown) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  if (!lastKey) return;

  let cursor = obj as Record<string, unknown>;
  for (const key of keys) {
    cursor = cursor[key] as Record<string, unknown>;
  }

  cursor[lastKey] = value;
}
