import Link from "next/link";
import LegalDocument, { LegalSection, Todo } from "@/components/legal/LegalDocument";
import { legalMetadata } from "@/lib/legalMetadata";
import { CONTACT_EMAIL, LEGAL_UPDATED, OWNER_NAME } from "@/lib/site";

export const metadata = legalMetadata(
  "Mentions légales",
  "Identité de l'éditeur, de l'hébergeur et informations légales du portfolio de Mahouna.",
  "/mentions-legales",
);

export default function MentionsLegales() {
  return (
    <LegalDocument index="01" title="Mentions légales" updated={LEGAL_UPDATED}>
      <LegalSection number="01" title="Éditeur du site">
        <dl>
          <dt>Nom</dt>
          <dd>
            <Todo>nom et prénom complets</Todo>
          </dd>
          <dt>Statut</dt>
          <dd>
            <Todo>particulier, ou entrepreneur individuel avec numéro SIRET</Todo>
          </dd>
          <dt>Adresse</dt>
          <dd>
            <Todo>adresse postale</Todo>
          </dd>
          <dt>Contact</dt>
          <dd>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </dd>
        </dl>
      </LegalSection>

      <LegalSection number="02" title="Directeur de la publication">
        <p>
          {OWNER_NAME}, en qualité d&apos;éditeur du site. <Todo>nom complet si différent de l&apos;éditeur</Todo>
        </p>
      </LegalSection>

      <LegalSection number="03" title="Hébergeur">
        <dl>
          <dt>Société</dt>
          <dd>
            <Todo>nom de l&apos;hébergeur</Todo>
          </dd>
          <dt>Adresse</dt>
          <dd>
            <Todo>adresse du siège de l&apos;hébergeur</Todo>
          </dd>
          <dt>Contact</dt>
          <dd>
            <Todo>site web ou téléphone de l&apos;hébergeur</Todo>
          </dd>
        </dl>
      </LegalSection>

      <LegalSection number="04" title="Propriété intellectuelle">
        <p>
          Les textes, l&apos;interface, les animations et le code de ce site sont l&apos;œuvre de son éditeur,
          sauf mention contraire. Les projets présentés sont publiés sur GitHub sous les licences indiquées
          dans chacun de leurs dépôts.
        </p>
        <p>
          Les polices <strong>Satoshi</strong> et <strong>Stardom</strong> sont © Indian Type Foundry,
          distribuées par Fontshare sous la licence ITF Free Font License et servies depuis ce site sans
          modification.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Inspiration graphique et non-affiliation">
        <p>
          L&apos;univers visuel s&apos;inspire des jeux Persona 3 Reload et Persona 5 Royal. Ces titres et
          marques appartiennent à leurs titulaires (ATLUS, SEGA). Ce site est indépendant : il n&apos;est ni
          affilié, ni approuvé, ni sponsorisé par ces sociétés, et il ne reprend aucune illustration, musique
          ni ressource tirée de ces jeux.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Données personnelles">
        <p>
          Le traitement des données est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Responsabilité et liens externes">
        <p>
          Les informations publiées sont fournies à titre indicatif et peuvent évoluer. Les liens vers des sites
          tiers (GitHub, LinkedIn) sont proposés pour information : l&apos;éditeur ne contrôle pas leur contenu et
          n&apos;en est pas responsable.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Droit applicable">
        <p>Le site et ses documents légaux sont soumis au droit français.</p>
      </LegalSection>
    </LegalDocument>
  );
}
