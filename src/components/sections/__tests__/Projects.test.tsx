import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
