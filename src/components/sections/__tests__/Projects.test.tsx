import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Projects from "../Projects";
import projectsData from "@/data/projects.json";
import type { Project } from "@/lib/types";

const projects = projectsData as Project[];

describe("<Projects />", () => {
  it("affiche tous les projets par défaut", () => {
    render(<Projects />);
    expect(
      screen.getByText(`${projects.length} / ${projects.length} projets livrés`),
    ).toBeInTheDocument();
  });

  it("filtre par technologie principale au clic", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const rustCount = projects.filter((p) => p.stack[0] === "Rust").length;
    await user.click(screen.getByRole("button", { name: "Rust" }));

    expect(
      screen.getByText(`${rustCount} / ${projects.length} projets livrés`),
    ).toBeInTheDocument();
  });

  it("déplie le détail d'un projet au clic (statut masqué par défaut)", async () => {
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
