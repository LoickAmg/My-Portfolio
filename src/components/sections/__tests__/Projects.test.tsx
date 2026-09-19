import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Projects from "../Projects";
import projectsData from "@/data/projects.json";
import type { Project } from "@/lib/types";

const projects = projectsData as Project[];
const selection = projects.filter((p) => p.highlight);
const archive = projects.filter((p) => !p.highlight);

describe("<Projects />", () => {
  it("affiche la sélection en avant et l'archive repliée par défaut", () => {
    render(<Projects />);

    expect(
      screen.getByText(`Sélection — ${selection.length} projets phares`),
    ).toBeInTheDocument();

    const toggle = screen.getByRole("button", {
      name: `Voir l'archive complète (${archive.length} projets)`,
    });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    // L'archive est repliée : aucun projet qui n'est pas dans la sélection
    // n'est présent dans le document.
    const firstArchiveOnly = archive[0];
    expect(
      screen.queryByRole("button", {
        name: new RegExp(firstArchiveOnly.name, "i"),
      }),
    ).not.toBeInTheDocument();
  });

  it("ouvre l'archive et filtre par type de travail au clic", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    await user.click(
      screen.getByRole("button", {
        name: `Voir l'archive complète (${archive.length} projets)`,
      }),
    );

    expect(
      screen.getByText(`${archive.length} / ${archive.length} projets dans l'archive`),
    ).toBeInTheDocument();

    const outilsCount = archive.filter((p) => p.workType === "outils").length;
    await user.click(screen.getByRole("button", { name: "Outils" }));

    expect(
      screen.getByText(`${outilsCount} / ${archive.length} projets dans l'archive`),
    ).toBeInTheDocument();
  });

  it("déplie le détail d'un projet de la sélection au clic (statut masqué par défaut)", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const target = projects.find((p) => p.slug === "chess-engine");
    expect(target).toBeDefined();
    const statusText = `${target!.status} · ${target!.year}`;

    expect(screen.queryByText(statusText)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /chess engine/i }));
    expect(screen.getByText(statusText)).toBeInTheDocument();

    // Un second clic replie à nouveau le détail (l'animation de sortie de
    // Framer Motion démonte l'élément de façon asynchrone).
    await user.click(screen.getByRole("button", { name: /chess engine/i }));
    await waitFor(() =>
      expect(screen.queryByText(statusText)).not.toBeInTheDocument(),
    );
  });
});
