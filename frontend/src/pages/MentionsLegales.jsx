import { Link } from 'react-router-dom';
import Header from '../components/Header';

const MentionsLegales = () => {
  return (
    <div className="bg-primary min-h-screen">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
            Mentions Légales
          </h1>
          <p className="text-text-muted">Dernière mise à jour : janvier 2026</p>
        </div>

        <div className="space-y-10 text-text-muted leading-relaxed">

          {/* Éditeur */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Éditeur du site</h2>
            <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-2">
              <p><strong className="text-white">Raison sociale :</strong> LGT Imprimerie</p>
              <p><strong className="text-white">Site web :</strong> lgt-imprimerie.com</p>
              <p>
                <strong className="text-white">Email :</strong>{' '}
                <a href="mailto:lgtimprimerie@gmail.com" className="text-accent hover:underline">
                  lgtimprimerie@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Hébergement</h2>
            <p>
              Le site lgt-imprimerie.com est hébergé sur un serveur privé virtuel (VPS).
            </p>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu du site lgt-imprimerie.com (textes, images, graphismes, logo, icônes, sons, logiciels, etc.)
              est la propriété exclusive de LGT Imprimerie, à l'exception des contenus provenant de partenaires ou tiers
              identifiés comme tels.
            </p>
            <p className="mt-3">
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces
              différents éléments est strictement interdite sans l'accord exprès par écrit de LGT Imprimerie.
            </p>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Protection des données personnelles</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés,
              vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données personnelles.
            </p>
            <p className="mt-3">
              Les données collectées lors de la création de votre compte et de vos commandes (nom, prénom, adresse email)
              sont utilisées uniquement dans le cadre de la relation commerciale et ne sont jamais cédées à des tiers à des
              fins commerciales.
            </p>
            <p className="mt-3">
              Pour exercer vos droits ou pour toute question relative à vos données personnelles, contactez-nous à :
              {' '}<a href="mailto:lgtimprimerie@gmail.com" className="text-accent hover:underline">lgtimprimerie@gmail.com</a>
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Cookies</h2>
            <p>
              Le site lgt-imprimerie.com utilise des cookies techniques nécessaires au bon fonctionnement du site
              (authentification, panier). Ces cookies ne collectent pas de données à des fins publicitaires.
            </p>
            <p className="mt-3">
              Vous pouvez configurer votre navigateur pour refuser les cookies, ce qui peut toutefois affecter certaines
              fonctionnalités du site.
            </p>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Limitation de responsabilité</h2>
            <p>
              LGT Imprimerie s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site,
              dont elle se réserve le droit de corriger le contenu à tout moment et sans préavis.
            </p>
            <p className="mt-3">
              LGT Imprimerie décline toute responsabilité pour tout dommage résultant d'une intrusion frauduleuse d'un tiers
              ayant entraîné une modification des informations mises à disposition sur le site.
            </p>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="font-space-grotesk text-2xl font-bold text-white mb-4">Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. Tout litige relatif à leur interprétation
              et/ou à leur exécution relève des juridictions françaises compétentes.
            </p>
          </section>

          {/* Lien CGV */}
          <div className="p-6 rounded-xl border border-white/10 bg-white/5">
            <p>
              Pour consulter nos conditions de vente :{' '}
              <Link to="/cgv" className="text-accent hover:underline font-medium">
                Conditions Générales de Vente →
              </Link>
            </p>
          </div>

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

export default MentionsLegales;
