import { describe, expect, it } from "vitest";
import { computeSkills, CATEGORY_ORDER } from "../skills";
import projectsData from "@/data/projects.json";
import type { Project } from "../types";

describe("computeSkills", () => {
  const projects = projectsData as Project[];

  it("compte chaque technologie autant de fois qu'elle apparaît dans projects.json", () => {
    const byCategory = computeSkills();
    const rustCount = projects.filter((p) => p.stack.includes("Rust")).length;

    const allEntries = Object.values(byCategory).flat();
    const rustEntry = allEntries.find((e) => e.name === "Rust");

    expect(rustEntry).toBeDefined();
    expect(rustEntry?.count).toBe(rustCount);
  });

  it("ne classe une technologie que dans une seule catégorie", () => {
    const byCategory = computeSkills();
    const seen = new Map<string, string>();

    for (const [category, entries] of Object.entries(byCategory)) {
      for (const entry of entries) {
        expect(seen.has(entry.name)).toBe(false);
        seen.set(entry.name, category);
      }
    }
  });

  it("ne renvoie que des catégories connues", () => {
    const byCategory = computeSkills();
    for (const category of Object.keys(byCategory)) {
      expect(CATEGORY_ORDER).toContain(category);
    }
  });
});
