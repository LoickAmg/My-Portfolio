import type { Metadata } from "next";
import { LEGAL_PAGES_READY } from "./site";

export function legalMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: LEGAL_PAGES_READY ? { index: true, follow: true } : { index: false, follow: true },
  };
}
