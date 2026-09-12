import { describe, expect, it } from "vitest";
import { runCommand } from "../commands";

describe("runCommand", () => {
  it("répond à whoami avec le placeholder attendu", () => {
    const { lines } = runCommand("whoami");
    expect(lines).toEqual(["[Nom, rôle, une phrase de positionnement.]"]);
  });

  it("normalise la casse et les accents (COMPÉTENCES == competences)", () => {
    const withAccent = runCommand("COMPÉTENCES");
    const withoutAccent = runCommand("competences");
    expect(withAccent.lines).toEqual(withoutAccent.lines);
  });

  it("liste les commandes disponibles sur 'aide'", () => {
    const { lines } = runCommand("aide");
    expect(lines[0]).toBe("Commandes disponibles :");
    expect(lines.length).toBeGreaterThan(1);
  });

  it("signale une commande inconnue sans planter", () => {
    const { lines } = runCommand("zzz-inconnu");
    expect(lines[0]).toMatch(/Commande inconnue/);
  });

  it("gère une entrée vide", () => {
    const { lines } = runCommand("   ");
    expect(lines[0]).toMatch(/essaie 'aide'/);
  });

  it("répond à projets à partir du catalogue réel (données non vides)", () => {
    const { lines } = runCommand("projets");
    // Le catalogue réel (src/data/projects.json) contient des projets
    // repères — la commande doit donc renvoyer une liste, pas le message
    // de secours "catalogue vide".
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.join(" ")).not.toMatch(/sera bientôt disponible/);
  });
});
