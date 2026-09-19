import Link from "next/link";
import LegalDocument, { LegalSection, Todo } from "@/components/legal/LegalDocument";
import { legalMetadata } from "@/lib/legalMetadata";
import { LEGAL_UPDATED } from "@/lib/site";

export const metadata = legalMetadata(
  "Conditions générales d'utilisation",
  "Règles d'utilisation du portfolio de Mahouna et de son Playground.",
  "/cgu",
);

export default function Cgu() {
  return (
    <LegalDocument index="03" title="Conditions générales d'utilisation" updated={LEGAL_UPDATED}>
      <LegalSection number="01" title="Objet">
        <p>
          Ces conditions encadrent l&apos;utilisation du site, qui présente le parcours, les projets et les
          compétences de son éditeur, ainsi qu&apos;un Playground d&apos;expériences interactives. Utiliser le
          site vaut acceptation de ces conditions.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Accès">
        <p>
          L&apos;accès est gratuit. Les frais de connexion restent à la charge de la personne qui visite. Le
          site peut être interrompu ou modifié à tout moment, sans préavis, notamment pour maintenance.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Propriété intellectuelle">
        <p>
          Les contenus du site sont protégés, comme précisé dans les <Link href="/mentions-legales">mentions légales</Link>.
          Vous pouvez en citer de courts extraits en indiquant leur source. Toute autre reproduction nécessite
          l&apos;accord écrit de l&apos;éditeur. Le code des projets publiés sur GitHub suit la licence de chaque
          dépôt.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Playground">
        <p>
          Les expériences du Playground sont des démonstrations fournies en l&apos;état, sans garantie de
          résultat. Les scores et réglages sont enregistrés uniquement sur votre appareil, comme détaillé dans la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Usage attendu">
        <p>
          Il est demandé de ne pas perturber le fonctionnement du site : pas d&apos;analyse intrusive, pas de
          requêtes automatisées abusives, pas de tentative d&apos;accès aux systèmes qui l&apos;hébergent.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Responsabilité">
        <p>
          L&apos;éditeur s&apos;efforce de publier des informations exactes mais ne peut garantir qu&apos;elles
          soient exhaustives ou à jour. Il n&apos;est pas responsable des dommages liés à l&apos;usage du site
          ni du contenu des sites tiers vers lesquels il renvoie.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Modification des conditions">
        <p>
          Ces conditions peuvent évoluer. La version en vigueur est celle publiée sur cette page, à la date
          indiquée en haut de document.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Droit applicable et juridiction">
        <p>
          Ces conditions sont soumises au droit français. En cas de litige, et à défaut de résolution amiable,
          les tribunaux compétents sont ceux de <Todo>ville ou ressort du tribunal compétent</Todo>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
