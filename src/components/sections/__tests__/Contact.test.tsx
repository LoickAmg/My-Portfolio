import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("affiche l'email et le GitHub comme de vrais liens cliquables", () => {
    render(<Contact />);

    const email = screen.getByText("mahounaamg@gmail.com");
    expect(email.closest("a")).toHaveAttribute(
      "href",
      "mailto:mahounaamg@gmail.com",
    );

    const github = screen.getByText("github.com/LoickAmg");
    expect(github.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/LoickAmg",
    );
  });

  it("laisse LinkedIn marqué 'à confirmer' (profil pas encore à jour)", () => {
    render(<Contact />);

    // Le libellé "LinkedIn" et la valeur/pastille "à confirmer" à côté.
    const pending = screen.getAllByText("à confirmer");
    expect(pending.length).toBeGreaterThanOrEqual(1);
  });

  it("affiche le bouton Signal", () => {
    render(<Contact />);

    expect(screen.getByRole("button", { name: /Signal/i })).toBeInTheDocument();
  });

  it("affiche l'intro et le titre", () => {
    render(<Contact />);

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(
      screen.getByText(/Écris-moi avec le contexte/i)
    ).toBeInTheDocument();
  });
});
