import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "../Contact";

vi.mock("@/lib/scroll", () => ({
  scrollToSection: vi.fn(),
}));

describe("<Contact />", () => {
  it("affiche les liens de contact avec les labels", () => {
    render(<Contact />);

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("affiche les valeurs des liens comme 'à confirmer'", () => {
    render(<Contact />);

    const pending = screen.getAllByText("à confirmer");
    expect(pending.length).toBeGreaterThanOrEqual(3);
  });

  it("affiche le bouton Signal", () => {
    render(<Contact />);

    expect(screen.getByRole("button", { name: /Signal/i })).toBeInTheDocument();
  });

  it("affiche l'intro et le titre", () => {
    render(<Contact />);

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(
      screen.getByText(/Phrase d'invitation au contact/i)
    ).toBeInTheDocument();
  });
});
