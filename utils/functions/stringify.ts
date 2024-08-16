export function deepStringify(obj: any): any {
  if (obj === null) return null;
  if (obj === undefined) return undefined;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepStringify(item));
  }
  
  if (typeof obj === "object") {
    const result: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = deepStringify(obj[key]);
      }
    }
    return result;
  }
  
  return String(obj);
}
