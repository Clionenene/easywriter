import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 120) + 1);
}
