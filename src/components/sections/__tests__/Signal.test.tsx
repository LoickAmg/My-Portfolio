import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signal from "../Signal";

describe("<Signal />", () => {
  it("affiche le message d'accueil au chargement", () => {
    render(<Signal />);
    expect(
      screen.getByText(/Tape une commande/i),
    ).toBeInTheDocument();
  });

  it("répond à une commande tapée par l'utilisateur", async () => {
    const user = userEvent.setup();
    render(<Signal />);

    const input = screen.getByLabelText("Commande");
    await user.type(input, "whoami");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(await screen.findByText("$ whoami")).toBeInTheDocument();
    expect(
      screen.getByText(/Mahouna — Ingénieur IA/),
    ).toBeInTheDocument();
  });

  it("vide le fil sur la commande 'clear'", async () => {
    const user = userEvent.setup();
    render(<Signal />);

    const input = screen.getByLabelText("Commande");
    await user.type(input, "whoami{enter}");
    expect(await screen.findByText("$ whoami")).toBeInTheDocument();

    await user.type(input, "clear{enter}");
    expect(screen.queryByText("$ whoami")).not.toBeInTheDocument();
    expect(screen.getByText(/Tape une commande/i)).toBeInTheDocument();
  });
});
