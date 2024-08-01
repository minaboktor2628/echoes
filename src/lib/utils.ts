import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getPlural(number: number, singular: string, plural: string) {
  return new Intl.PluralRules().select(number) === "one" ? singular : plural;
}
