import { SECTIONS } from "@/lib/sections";
import SectionHeader from "./SectionHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Method.module.css";

const section = SECTIONS[2]; // méthode

// Décrit des pratiques réellement observables dans les projets livrés
// (voir Projets) plutôt qu'une déclaration d'intention abstraite.
const STEPS = [
  {
    title: "Cadrer honnêtement avant de coder",
    text: "Chaque projet démarre par un périmètre explicite — ce qu'il fait, ce qu'il ne fait pas — pour éviter de survendre ce qui est livré (ex. Trading Dashboard : aucun conseil financier, aucun ordre réel).",
  },
  {
    title: "Séparer la logique pure de l'exécution",
    text: "La logique testable (décision, calcul, état) est isolée des effets de bord (réseau, disque, temps) pour pouvoir la vérifier sans dépendre d'un service externe.",
  },
  {
    title: "Prouver plutôt qu'espérer",
    text: "Quand c'est possible, la correction est démontrée par une méthode indépendante du code lui-même : vérification numérique de gradient, comptage perft, tests statistiques — pas seulement des tests verts.",
  },
  {
    title: "Documenter les limites, pas seulement les fonctionnalités",
    text: "Un README dit aussi ce qui n'a pas pu être vérifié dans l'environnement de développement, pour ne jamais présenter une limite comme une garantie.",
  },
  {
    title: "Vérifier avant de livrer",
    text: "Lint, build et tests doivent passer réellement — pas supposés — avant qu'un projet ne soit considéré terminé.",
  },
];

export default function Method() {
  return (
    <section id={section.id} className={sectionStyles.section}>
      <SectionHeader index={section.index} label={section.label} />
      <h2 className={sectionStyles.title}>Méthode</h2>

      <div className={styles.steps}>
        {STEPS.map((step, i) => (
          <div key={step.title} className={styles.step}>
            <span className={styles.stepIndex}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={styles.stepBody}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
