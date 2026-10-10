import type { Locale } from "../config";
import { en, type Messages } from "./en";
import { hi } from "./hi";
import { kn } from "./kn";

export const messages: Record<Locale, Messages> = { en, hi, kn };
