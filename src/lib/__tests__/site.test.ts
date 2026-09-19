import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import sitemap from "@/app/sitemap";
import Confidentialite from "@/app/confidentialite/page";
import MentionsLegales from "@/app/mentions-legales/page";
import { LEGAL_PAGES, LEGAL_PAGES_READY, SITE_URL } from "../site";
import { STORAGE_KEYS, STORAGE_KEY_DOCS } from "../storage";

describe("stockage local et confidentialité", () => {
  it("documente chaque clé de stockage écrite par le site", () => {
    const documented = STORAGE_KEY_DOCS.map((entry) => entry.key).sort();
    expect(documented).toEqual(Object.values(STORAGE_KEYS).sort());
  });

  it("la page de confidentialité liste toutes ces clés", () => {
    render(createElement(Confidentialite));
    for (const entry of STORAGE_KEY_DOCS) {
      expect(screen.getByText(entry.key)).toBeInTheDocument();
    }
  });
});

describe("pages légales", () => {
  it("signalent visiblement chaque information encore à fournir", () => {
    render(createElement(MentionsLegales));
    expect(screen.getAllByText(/\[À COMPLÉTER/).length).toBeGreaterThan(0);
  });

  it("restent hors du sitemap tant qu'elles ne sont pas prêtes", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain(SITE_URL);
    const legalUrls = LEGAL_PAGES.map((page) => `${SITE_URL}${page.href}`);
    for (const url of legalUrls) {
      expect(urls.includes(url)).toBe(LEGAL_PAGES_READY);
    }
  });
});
