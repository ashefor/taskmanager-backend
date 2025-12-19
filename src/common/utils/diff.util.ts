// src/common/utils/diff.util.ts
export function getEntityDiff<T extends Record<string, any>>(
  before: T,
  after: T,
  exclude: string[] = ['updatedAt', 'createdAt', 'deletedAt']
): Record<string, { before: any; after: any }> | null {
  const changes: Record<string, { before: any; after: any }> = {};

  for (const key in after) {
    if (exclude.includes(key)) continue;

    if (before[key] !== after[key]) {
      changes[key] = {
        before: before[key],
        after: after[key],
      };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}
