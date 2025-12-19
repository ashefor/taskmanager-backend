/**
 * Recursively sanitizes an object or array of objects by removing unwanted keys.
 * 
 * @param data - The object or array of objects to sanitize
 * @param excludeKeys - Keys to remove from the object(s)
 */
export function sanitizeResponse<T>(data: T, excludeKeys: string[] = []): T {
  if (!data) return data;

   if (data instanceof Date) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item, excludeKeys)) as any;
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (!excludeKeys.includes(key)) {
          sanitized[key] = sanitizeResponse((data as any)[key], excludeKeys);
        }
      }
    }
    return sanitized;
  }

  return data;
}
