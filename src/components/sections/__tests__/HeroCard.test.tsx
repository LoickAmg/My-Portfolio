import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import HeroCard from "../HeroCard";

const props = {
  sectionId: "index",
  numeral: "0",
  name: "Le Fou",
  sectionIndex: "00",
  sectionName: "Index",
};

function renderCard() {
  const { container } = render(<HeroCard {...props} />);
  const root = container.firstElementChild as HTMLElement;
  // jsdom ne fait pas de mise en page : on donne à la carte une boîte de 200 x 320.
  root.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 320, right: 200, bottom: 320, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  return { root, turner: root.querySelector("[data-spinning]") as HTMLElement };
}

function reduceMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) => ({ matches: reduce, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
  );
}

afterEach(() => vi.restoreAllMocks());

describe("HeroCard", () => {
  it("garde le nom de l'arcane lisible et masque la face cachée et le dos", () => {
    const { root } = renderCard();
    expect(screen.getByText("Le Fou")).toBeInTheDocument();
    const hidden = root.querySelectorAll('[aria-hidden="true"]');
    // face cachée, dos, et les illustrations SVG
    expect(hidden.length).toBeGreaterThanOrEqual(2);
  });

  it("s'incline et place le halo là où est le pointeur", () => {
    const { root } = renderCard();
    fireEvent.pointerEnter(root, { clientX: 150, clientY: 80 });
    fireEvent.pointerMove(root, { clientX: 150, clientY: 80 });

    expect(root).toHaveAttribute("data-near", "true");
    expect(root.style.getPropertyValue("--reveal-x")).toBe("75.0%");
    expect(root.style.getPropertyValue("--reveal-y")).toBe("25.0%");
    // Pointeur en haut à droite : la carte penche vers le haut (x positif)
    // et vers la droite (y positif).
    expect(parseFloat(root.style.getPropertyValue("--tilt-x"))).toBeGreaterThan(0);
    expect(parseFloat(root.style.getPropertyValue("--tilt-y"))).toBeGreaterThan(0);
  });

  it("se remet à plat et ferme le halo quand le pointeur part", () => {
    const { root } = renderCard();
    fireEvent.pointerEnter(root, { clientX: 150, clientY: 80 });
    fireEvent.pointerLeave(root);

    expect(root).not.toHaveAttribute("data-near");
    expect(root.style.getPropertyValue("--tilt-x")).toBe("0deg");
    expect(root.style.getPropertyValue("--tilt-y")).toBe("0deg");
  });

  it("fait un tour complet au clic, puis se libère à la fin de l'animation", () => {
    const { root, turner } = renderCard();
    expect(turner).toHaveAttribute("data-spinning", "false");

    fireEvent.click(root);
    expect(turner).toHaveAttribute("data-spinning", "true");

    // jsdom ne connaît pas AnimationEvent : React écoute alors le nom préfixé.
    fireEvent(turner, new Event("animationend", { bubbles: true }));
    fireEvent(turner, new Event("webkitAnimationEnd", { bubbles: true }));
    expect(turner).toHaveAttribute("data-spinning", "false");
  });

  it("ne bouge pas sous prefers-reduced-motion", () => {
    reduceMotion(true);
    const { root, turner } = renderCard();

    fireEvent.pointerEnter(root, { clientX: 150, clientY: 80 });
    fireEvent.click(root);

    expect(root).not.toHaveAttribute("data-near");
    expect(root.style.getPropertyValue("--reveal-x")).toBe("");
    expect(turner).toHaveAttribute("data-spinning", "false");
  });
});
