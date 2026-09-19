import { afterEach, describe, expect, it, vi } from "vitest";
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

describe("adresse absolue du site", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function siteUrlWith(env: Record<string, string>): Promise<string> {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", env.NEXT_PUBLIC_SITE_URL ?? "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", env.VERCEL_PROJECT_PRODUCTION_URL ?? "");
    const site = await import("../site");
    return site.SITE_URL;
  }

  it("utilise le domaine personnalisé en priorité", async () => {
    expect(
      await siteUrlWith({ NEXT_PUBLIC_SITE_URL: "https://mon-domaine.fr", VERCEL_PROJECT_PRODUCTION_URL: "exemple.vercel.app" }),
    ).toBe("https://mon-domaine.fr");
  });

  it("retombe sur le domaine de production fourni par Vercel", async () => {
    expect(await siteUrlWith({ VERCEL_PROJECT_PRODUCTION_URL: "exemple.vercel.app" })).toBe("https://exemple.vercel.app");
  });

  it("reste sur localhost en développement", async () => {
    expect(await siteUrlWith({})).toBe("http://localhost:3000");
  });
});
