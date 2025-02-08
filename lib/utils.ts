import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert Prisma object into regualr JS Object

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
