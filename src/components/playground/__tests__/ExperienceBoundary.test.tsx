import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExperienceBoundary from "../ExperienceBoundary";

let shouldThrow = true;

function Fragile() {
  if (shouldThrow) throw new Error("expérience cassée");
  return <p>tout va bien</p>;
}

describe("<ExperienceBoundary />", () => {
  it("affiche un message et permet de relancer l'expérience seule", async () => {
    const user = userEvent.setup();
    const silence = vi.spyOn(console, "error").mockImplementation(() => {});
    shouldThrow = true;

    render(
      <ExperienceBoundary message="Un problème est survenu." retryLabel="Réessayer">
        <Fragile />
      </ExperienceBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Un problème est survenu.");

    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(screen.getByText("tout va bien")).toBeInTheDocument();

    silence.mockRestore();
  });

  it("laisse passer un contenu sans erreur", () => {
    shouldThrow = false;
    render(
      <ExperienceBoundary message="x" retryLabel="y">
        <Fragile />
      </ExperienceBoundary>,
    );
    expect(screen.getByText("tout va bien")).toBeInTheDocument();
  });
});
