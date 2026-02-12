export const parseArrayField = <T extends string | number = string | number>(
  field: unknown,
  options: { forceType?: "string" | "number" } = {},
): T[] => {
  if (!field) return [] as T[];

  // Handle array input
  if (Array.isArray(field)) {
    return field.map((item) => {
      if (options.forceType === "number") {
        return (typeof item === "number" ? item : Number(item)) as T;
      } else if (options.forceType === "string") {
        return String(item) as T;
      }
      return (typeof item === "number" ? item : String(item)) as T;
    }) as T[];
  }

  // Handle string input
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (options.forceType === "number") {
            return (typeof item === "number" ? item : Number(item)) as T;
          } else if (options.forceType === "string") {
            return String(item) as T;
          }
          return (typeof item === "number" ? item : String(item)) as T;
        }) as T[];
      }
    } catch {
      // Fallback to comma-separated parsing
      const cleanString = field.replace(/[\[\]]/g, "");
      const items = cleanString
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      return items.map((item) => {
        if (options.forceType === "number") {
          return Number(item) as T;
        } else if (options.forceType === "string") {
          return item as T;
        }
        return (!isNaN(Number(item)) ? Number(item) : item) as T;
      }) as T[];
    }
  }

  // Handle single values
  if (typeof field === "number") return [field] as T[];
  if (typeof field === "boolean") return [String(field) as T];

  return [] as T[];
};

export const guestCartToken = process.env.GUEST_CART_TOKEN as string;
export const OTP_TIMER = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
export const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString();
