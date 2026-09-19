import Link from "next/link";
import LegalDocument, { LegalSection, Todo } from "@/components/legal/LegalDocument";
import { legalMetadata } from "@/lib/legalMetadata";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/site";
import { STORAGE_KEY_DOCS } from "@/lib/storage";

export const metadata = legalMetadata(
  "Politique de confidentialité",
  "Ce que le portfolio de Mahouna collecte, stocke sur votre appareil, et comment exercer vos droits.",
  "/confidentialite",
);

export default function Confidentialite() {
  return (
    <LegalDocument index="02" title="Politique de confidentialité" updated={LEGAL_UPDATED}>
      <LegalSection number="01" title="Responsable du traitement">
        <p>
          L&apos;éditeur du site, identifié dans les <Link href="/mentions-legales">mentions légales</Link>. Pour toute
          question : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Ce que ce site ne fait pas">
        <p>
          Ce site ne demande aucun compte, ne propose aucun formulaire, ne dépose aucun cookie, n&apos;utilise
          aucun outil de mesure d&apos;audience ni de publicité, et ne charge aucune ressource depuis un
          service tiers : les polices et les bibliothèques sont servies depuis le site lui-même.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Ce qui est mémorisé sur votre appareil">
        <p>
          Le site inscrit quelques valeurs dans le stockage local de votre navigateur (<code>localStorage</code>)
          pour retrouver vos préférences et vos scores. Elles restent sur votre appareil, ne sont jamais envoyées
          à un serveur et ne servent à aucun suivi. Vous pouvez les effacer à tout moment depuis les réglages de
          votre navigateur.
        </p>
        <dl>
          {STORAGE_KEY_DOCS.map((entry) => (
            <div key={entry.key}>
              <dt>
                <code>{entry.key}</code>
              </dt>
              <dd>{entry.purpose}</dd>
            </div>
          ))}
        </dl>
        <p>
          Ces valeurs ne servent qu&apos;à fournir la fonction que vous utilisez ; c&apos;est pourquoi aucun
          bandeau de consentement n&apos;est affiché.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Si vous m'écrivez">
        <p>
          Un email envoyé à l&apos;adresse de contact est traité par le service de messagerie de l&apos;éditeur
          (Gmail). Votre adresse et le contenu du message servent uniquement à vous répondre, sur la base de
          l&apos;intérêt légitime de l&apos;éditeur à répondre aux sollicitations qu&apos;on lui adresse.
        </p>
        <p>
          Durée de conservation : <Todo>durée de conservation des échanges</Todo>.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Journaux de l'hébergeur">
        <p>
          Comme tout hébergeur, le prestataire qui sert ce site peut enregistrer des journaux techniques de
          connexion (adresse IP, date, page demandée) pour la sécurité et le bon fonctionnement du service.{" "}
          <Todo>nom de l&apos;hébergeur, contenu et durée de conservation de ses journaux</Todo>
        </p>
      </LegalSection>

      <LegalSection number="06" title="Vos droits">
        <p>
          Vous pouvez demander l&apos;accès à vos données, leur rectification, leur effacement, la limitation
          ou l&apos;opposition à leur traitement, ainsi que leur portabilité (articles 15 à 22 du RGPD), en
          écrivant à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de
          la CNIL :{" "}
          <a href="https://www.cnil.fr/fr/plaintes" rel="noreferrer" target="_blank">
            cnil.fr/fr/plaintes
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection number="07" title="Évolutions">
        <p>
          Si un outil de mesure d&apos;audience ou tout autre traitement était ajouté un jour, cette page serait
          mise à jour avant sa mise en service, et votre consentement serait demandé lorsque la loi l&apos;exige.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
