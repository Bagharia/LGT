import { Link } from 'react-router-dom';
import Header from '../components/Header';
import useSEO from '../hooks/useSEO';

const CGV = () => {
  useSEO({ title: 'Conditions Générales de Vente', description: 'Consultez les conditions générales de vente de LGT Imprimerie : commandes, paiement, livraison, retours et garanties.', path: '/cgv' });
  return (
    <div className="bg-primary min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
            Conditions Générales de Vente
          </h1>
          <p className="text-text-muted">Dernière mise à jour : janvier 2026</p>
        </div>

        <div className="space-y-10 text-text-muted leading-relaxed">

          {/* Article 1 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 1 — Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre la société LGT Imprimerie,
              ci-après dénommée « le Vendeur », et toute personne physique ou morale souhaitant procéder à un achat via le site internet
              lgt-imprimerie.com, ci-après dénommée « le Client ».
            </p>
            <p className="mt-3">
              Toute commande passée sur le site implique l'acceptation pleine et entière des présentes CGV.
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 2 — Produits</h2>
            <p>
              Les produits proposés à la vente sont des articles personnalisés (t-shirts, affiches, etc.) dont les caractéristiques
              essentielles sont présentées sur le site. Les visuels des produits sont fournis à titre illustratif et ne sont pas
              contractuels. Le Vendeur s'efforce de présenter au mieux les produits, notamment en matière de couleurs et de qualités.
            </p>
            <p className="mt-3">
              Les produits personnalisés sont fabriqués à la demande du Client. En raison de leur nature personnalisée, ces produits
              ne sont ni repris ni échangés, sauf en cas de défaut de fabrication imputable au Vendeur.
            </p>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 3 — Prix</h2>
            <p>
              Les prix sont indiqués en euros (€) toutes taxes comprises (TTC). Le Vendeur se réserve le droit de modifier ses prix
              à tout moment, étant entendu que le prix applicable à la commande sera celui en vigueur au jour de la validation de
              la commande par le Client.
            </p>
            <p className="mt-3">
              Les frais de livraison sont facturés en sus du prix des produits et sont indiqués avant la validation de la commande.
            </p>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 4 — Commande</h2>
            <p>Le processus de commande se déroule comme suit :</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Création ou sélection d'un design sur le site</li>
              <li>Choix des quantités et tailles</li>
              <li>Validation du panier et procédure de paiement</li>
              <li>Confirmation de commande par email</li>
            </ul>
            <p className="mt-3">
              Le Vendeur se réserve le droit de refuser toute commande pour des motifs légitimes, notamment en cas de contenu
              contraire à la loi, aux bonnes mœurs ou aux droits de tiers.
            </p>
            <p className="mt-3">
              <strong className="text-white">Comptes professionnels :</strong> Les clients disposant d'un compte professionnel
              doivent commander un minimum de 20 articles par commande.
            </p>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 5 — Paiement</h2>
            <p>
              Le paiement s'effectue en ligne par carte bancaire via notre prestataire de paiement sécurisé Stripe.
              Les données bancaires sont cryptées et ne transitent pas par nos serveurs.
            </p>
            <p className="mt-3">
              Pour les commandes de 30 articles et plus, un acompte pourra être demandé à la validation de la commande.
              Le solde sera réglé avant expédition.
            </p>
            <p className="mt-3">
              La commande est validée et la fabrication débutée uniquement après confirmation du paiement.
            </p>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 6 — Délais de fabrication et livraison</h2>
            <p>
              Les délais de fabrication sont généralement de 5 à 10 jours ouvrés à compter de la validation du paiement.
              Ces délais sont donnés à titre indicatif et ne constituent pas un engagement ferme.
            </p>
            <p className="mt-3">
              La livraison est assurée par des transporteurs partenaires. Les délais de livraison sont fonction du transporteur
              choisi et de la destination. Le Vendeur ne peut être tenu responsable des retards imputables au transporteur.
            </p>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 7 — Droit de rétractation</h2>
            <p>
              Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour
              les biens confectionnés selon les spécifications du consommateur ou nettement personnalisés.
            </p>
            <p className="mt-3">
              En conséquence, les produits personnalisés commandés sur notre site ne sont pas soumis au droit de rétractation
              de 14 jours, dès lors que la fabrication a débuté avec l'accord exprès du Client.
            </p>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 8 — Réclamations et garanties</h2>
            <p>
              En cas de défaut de fabrication (erreur d'impression, défaut qualité), le Client doit contacter le Vendeur dans
              un délai de 48 heures après réception du colis, en fournissant des photos du défaut constaté.
            </p>
            <p className="mt-3">
              Le Vendeur s'engage à reprendre ou remplacer les produits défectueux à ses frais. Aucun remboursement ou échange
              ne sera accepté pour un choix de design ou de taille erroné de la part du Client.
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 9 — Propriété intellectuelle</h2>
            <p>
              Le Client est seul responsable des designs qu'il crée et commande. Il garantit qu'il dispose de tous les droits
              nécessaires sur les visuels utilisés et que ceux-ci ne contreviennent à aucun droit de tiers (droits d'auteur,
              marques, etc.).
            </p>
            <p className="mt-3">
              Le Vendeur se réserve le droit de refuser toute commande dont le contenu serait illicite, offensant,
              ou contraire aux bonnes mœurs.
            </p>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Article 10 — Loi applicable et litiges</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en
              priorité. À défaut, les tribunaux français seront seuls compétents.
            </p>
            <p className="mt-3">
              Pour tout litige de consommation non résolu, le Client peut recourir gratuitement au service de médiation
              conformément à la réglementation en vigueur.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-xl border border-white/10 bg-white/5">
            <h2 className="font-space-grotesk text-xl font-bold text-white mb-3">Contact</h2>
            <p>Pour toute question relative aux présentes CGV :</p>
            <p className="mt-2">
              <strong className="text-white">Email :</strong>{' '}
              <a href="mailto:lgtimprimerie@gmail.com" className="text-accent hover:underline">
                lgtimprimerie@gmail.com
              </a>
            </p>
          </section>

        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link to="/" className="text-accent hover:underline font-medium">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CGV;
