// Types partagés du portfolio.

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  stack: string[];
  year: number;
  status: "livré" | "en cours";
  repoUrl?: string;
  highlight?: boolean;
}
