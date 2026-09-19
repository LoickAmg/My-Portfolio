import { describe, expect, it } from "vitest";
import { ARCANA, arcanaFor } from "../arcana";
import { SECTIONS } from "../sections";
import { UI } from "../i18n";

describe("arcana", () => {
  it("attribue un arcane à chaque section, dans le même ordre", () => {
    expect(ARCANA.map((entry) => entry.sectionId)).toEqual(SECTIONS.map((section) => section.id));
  });

  it("n'utilise chaque numéro qu'une seule fois", () => {
    const numerals = ARCANA.map((entry) => entry.numeral);
    expect(new Set(numerals).size).toBe(numerals.length);
  });

  it("nomme chaque arcane dans les deux langues", () => {
    for (const lang of ["fr", "en"] as const) {
      for (const entry of ARCANA) {
        expect(UI[lang].arcana.names[entry.sectionId]).toBeTruthy();
      }
    }
  });

  it("arcanaFor renvoie undefined pour une section inconnue", () => {
    expect(arcanaFor("inconnue")).toBeUndefined();
    expect(arcanaFor("playground")?.numeral).toBe("X");
  });
});
