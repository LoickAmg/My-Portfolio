import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Playground from "../Playground";

// jsdom n'implémente ni WebGL ni le contexte canvas 2D : les expériences se
// montent et réagissent, mais ne dessinent rien. Ces tests vérifient la
// mécanique React de la coque (index, clavier, chargement à la demande, lien
// source), pas le rendu graphique, vérifié visuellement dans le navigateur.
describe("<Playground />", () => {
  it("propose les cinq expériences, la première étant sélectionnée", () => {
    render(<Playground />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(5);
    expect(screen.getByRole("tab", { name: /Réseau de neurones/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", { name: /Neural Net/ })).toHaveAttribute(
      "href",
      "https://github.com/LoickAmg/Neural-Net",
    );
  });

  it("charge l'expérience à la demande, avec un squelette d'attente accessible", async () => {
    render(<Playground />);
    expect(await screen.findByRole("img", { name: /frontière de décision/i })).toBeInTheDocument();
  });

  it.each([
    ["Système solaire", "Solar System", "https://github.com/LoickAmg/Solar-System"],
    ["Double pendule", "Double Pendulum", "https://github.com/LoickAmg/Double-Pendulum"],
    ["Puissance 4", "Connect-4", "https://github.com/LoickAmg/Connect-4"],
    ["Snake", "Snake Clone", "https://github.com/LoickAmg/Snake-Clone"],
  ])("bascule vers %s avec son dépôt source", async (tabName, sourceName, href) => {
    const user = userEvent.setup();
    render(<Playground />);

    await user.click(screen.getByRole("tab", { name: new RegExp(tabName) }));

    expect(screen.getByRole("tab", { name: new RegExp(tabName) })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", { name: new RegExp(sourceName) })).toHaveAttribute("href", href);
  });

  it("navigue entre les onglets aux flèches, avec retour en boucle", async () => {
    const user = userEvent.setup();
    render(<Playground />);

    screen.getByRole("tab", { name: /Réseau de neurones/ }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: /Système solaire/ })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("tab", { name: /Snake/ })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: /Réseau de neurones/ })).toHaveAttribute("aria-selected", "true");
  });

  it("ne laisse qu'un seul onglet dans l'ordre de tabulation", () => {
    render(<Playground />);
    const tabbable = screen.getAllByRole("tab").filter((tab) => tab.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
  });
});
