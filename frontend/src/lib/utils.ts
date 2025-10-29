import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number) {
  if (!amount) return "-";
  return Intl.NumberFormat("en-US", {
    compactDisplay: "short",
    style: "decimal",
  }).format(amount);
}