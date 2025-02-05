// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupBy<T extends Record<string, any>>(
  arr: T[],
  key: keyof T,
): Map<T[keyof T], T[]> {
  const groupedMap = new Map<T[keyof T], T[]>();
  for (const obj of arr) {
    const value = obj[key];
    if (value !== undefined) {
      const group = groupedMap.get(value);
      if (group) {
        group.push(obj);
      } else {
        groupedMap.set(value, [obj]);
      }
    }
  }
  return groupedMap;
}
