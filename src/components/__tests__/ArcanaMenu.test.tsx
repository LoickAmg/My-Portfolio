import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ArcanaMenu from "../ArcanaMenu";
import RailNav from "../RailNav";

vi.mock("@/lib/scroll", () => ({ scrollToSection: vi.fn() }));

function renderMenu(activeId = "playground") {
  const onClose = vi.fn();
  const onSelect = vi.fn();
  render(<ArcanaMenu activeId={activeId} onClose={onClose} onSelect={onSelect} />);
  return { onClose, onSelect };
}

describe("<ArcanaMenu />", () => {
  it("présente une carte par section, nommée par son arcane", () => {
    renderMenu();
    const cards = screen.getAllByRole("button").filter((button) => button.getAttribute("aria-label")?.includes(","));
    expect(cards).toHaveLength(7);
    expect(screen.getByRole("button", { name: /Le Fou, 00 Index/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /La Fortune, 04 Playground/ })).toBeInTheDocument();
  });

  it("marque la section courante et lui donne le focus à l'ouverture", () => {
    renderMenu("playground");
    const current = screen.getByRole("button", { name: /La Fortune/ });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toHaveFocus();
    expect(current).toHaveAccessibleName(/Tu es ici/);
  });

  it("se déclare comme dialogue modal nommé", () => {
    renderMenu();
    const dialog = screen.getByRole("dialog", { name: "Choisis une carte" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("navigue entre les cartes aux flèches, en bouclant", async () => {
    const user = userEvent.setup();
    renderMenu("contact");

    expect(screen.getByRole("button", { name: /Le Jugement/ })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: /Le Fou/ })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: /Le Jugement/ })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("button", { name: /Le Fou/ })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("button", { name: /Le Jugement/ })).toHaveFocus();
  });

  it("garde le focus dans le menu (piège à focus)", async () => {
    const user = userEvent.setup();
    renderMenu("contact");

    await user.keyboard("{Tab}");
    expect(screen.getByRole("button", { name: "Fermer" })).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByRole("button", { name: /Le Jugement/ })).toHaveFocus();
  });

  it("se ferme avec Échap", async () => {
    const user = userEvent.setup();
    const { onClose } = renderMenu();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("se ferme avec le bouton Fermer", async () => {
    const user = userEvent.setup();
    const { onClose } = renderMenu();
    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("annonce la section choisie une seule fois, même après plusieurs clics", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderMenu();

    await user.click(screen.getByRole("button", { name: /La Lune/ }));
    await user.click(screen.getByRole("button", { name: /Le Magicien/ }));

    await waitFor(() => expect(onSelect).toHaveBeenCalledWith("signal"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("fige le défilement de la page tant qu'il est ouvert, puis le rend", () => {
    const { unmount } = render(<ArcanaMenu activeId="index" onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(document.documentElement.style.overflow).toBe("hidden");
    unmount();
    expect(document.documentElement.style.overflow).toBe("");
  });
});

describe("<RailNav /> et le menu des arcanes", () => {
  it("ouvre le menu depuis le rail, puis rend le focus au bouton à la fermeture", async () => {
    const user = userEvent.setup();
    render(<RailNav />);

    const [trigger] = screen.getAllByRole("button", { name: "Ouvrir le menu des arcanes" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
