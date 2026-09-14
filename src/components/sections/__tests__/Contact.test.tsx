import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "../Contact";

describe("<Contact />", () => {
  it("affiche l'écran de téléphone avec la liste de conversations", () => {
    render(<Contact />);

    expect(screen.getByText(/Connexion établie/i)).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Signal")).toBeInTheDocument();
  });

  it("affiche le formulaire de saisie SMS", () => {
    render(<Contact />);

    const input = screen.getByLabelText("Message");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("placeholder", "Tapez un message…");
  });

  it("envoie un message utilisateur et affiche une réponse système", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    const input = screen.getByLabelText("Message");
    await user.type(input, "whoami");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(
      await screen.findByText(/whoami/, { selector: '[data-testid="message-bubble"]' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Reçu à \d{2}h\d{2} — je te réponds sous 24h/i)
    ).toBeInTheDocument();
  });

  it("vide le fil sur la commande 'clear'", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    const input = screen.getByLabelText("Message");
    await user.type(input, "whoami");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(
      await screen.findByText(/whoami/, { selector: '[data-testid="message-bubble"]' })
    ).toBeInTheDocument();

    await user.type(input, "clear");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(
      screen.queryByText(/whoami/, { selector: '[data-testid="message-bubble"]' })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Connexion établie/i)).toBeInTheDocument();
  });
});
