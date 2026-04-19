import { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  Eye,
  Target,
  Users,
  Award,
  Lightbulb,
  HeadphonesIcon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const BASE_URL = 'https://restauration-kfm.onrender.com';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'À Propos de KFM DELICE | Restaurant OS — Conakry, Guinée',
    description:
      'Découvrez l\'histoire de KFM DELICE, restaurant de référence à Conakry en Guinée. Notre mission, notre vision et nos valeurs pour une expérience culinaire guinéenne d\'exception, propulsée par Restaurant OS.',
    alternates: {
      canonical: `${BASE_URL}/about`,
    },
    openGraph: {
      title: 'À Propos de KFM DELICE | Restaurant OS',
      description:
        'Découvrez l\'histoire de KFM DELICE, restaurant de référence à Conakry en Guinée. Notre mission, notre vision et nos valeurs.',
      url: `${BASE_URL}/about`,
      type: 'website',
      locale: 'fr_FR',
    },
  };
}

/* ─────────── Data ─────────── */

const coreValues = [
  {
    icon: Award,
    title: 'Qualité',
    description:
      'Chaque plat est préparé avec des ingrédients frais et locaux, sélectionnés avec le plus grand soin. Nous ne faisons aucun compromis sur la qualité pour offrir à nos clients le meilleur de la cuisine guinéenne.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'Nous adoptons les technologies modernes — de la gestion digitale à la livraison GPS — pour améliorer continuellement l\'expérience de nos clients et l\'efficacité de nos opérations.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Service Client',
    description:
      'La satisfaction de nos clients est au cœur de tout ce que nous faisons. Notre équipe est formée pour offrir un accueil chaleureux et un service attentionné à chaque visite.',
  },
  {
    icon: Sparkles,
    title: 'Authenticité',
    description:
      'Nous célébrons la richesse de la gastronomie guinéenne en respectant les recettes traditionnelles tout en y apportant une touche de modernité. Chaque bouchée raconte notre terroir.',
  },
];

const teamMembers = [
  {
    name: 'Fodé Mamadou Kaba',
    role: 'Fondateur & Directeur Général',
    initials: 'FK',
    description:
      'Passionné de cuisine guinéenne et entrepreneur visionnaire, Fodé a fondé KFM DELICE avec la conviction que la gastronomie guinéenne mérite une scène mondiale. Sa formation en gestion hôtelière et sa connaissance du marché local ont fait de KFM DELICE une référence.',
  },
  {
    name: 'Aminata Condé',
    role: 'Chef Cuisinière Exécutive',
    initials: 'AC',
    description:
      'Formée dans les meilleures écoles culinaires d\'Afrique de l\'Ouest, Aminata apporte créativité et rigueur à la direction de notre cuisine. Elle supervise le menu et veille à l\'authenticité de chaque recette.',
  },
  {
    name: 'Ibrahima Soumah',
    role: 'Directeur des Opérations',
    initials: 'IS',
    description:
      'Expert en logistique et gestion de flux, Ibrahima garantit que chaque commande — sur place ou en livraison — parvienne rapidement et dans des conditions optimales.',
  },
];

/* ─────────── Page Component ─────────── */

export default function AboutPage() {
  return (
    <>
      {/* BreadcrumbList JSON-LD – top */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: BASE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'À Propos',
                item: `${BASE_URL}/about`,
              },
            ],
          }),
        }}
      />

      <article className="min-h-screen bg-white">
        {/* ────── Hero ────── */}
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-100 rounded-full opacity-40 blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Breadcrumb */}
            <nav aria-label="Fil d'Ariane" className="mb-6">
              <ol className="inline-flex items-center gap-2 text-sm text-gray-500">
                <li>
                  <Link href="/" className="hover:text-orange-600 transition-colors">
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-orange-600 font-medium" aria-current="page">
                  À Propos
                </li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              À Propos de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                KFM DELICE
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Restaurant de référence à Conakry, Guinée — propulsé par Restaurant OS.
              Découvrez notre histoire, notre passion et notre engagement pour la cuisine guinéenne d&apos;exception.
            </p>
          </div>
        </section>

        {/* ────── Notre Histoire ────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Heart className="w-8 h-8 text-orange-500" />
              Notre Histoire
            </h2>

            <div className="prose prose-lg prose-gray max-w-none">
              <p>
                KFM DELICE est né en 2020 à Conakry, au cœur de la Guinée, d&apos;une passion
                profonde pour la cuisine guinéenne et d&apos;une volonté de la faire rayonner.
                Fondé par Fodé Mamadou Kaba, ce restaurant a vu le jour dans un petit local du
                quartier de Kaloum avec une idée simple mais ambitieuse : offrir aux habitants
                de Conakry une expérience culinaire qui célèbre le terroir guinéen tout en
                intégrant les standards de qualité et d&apos;hygiène internationaux.
              </p>
              <p>
                Dès les premiers jours, la réputation de KFM DELICE s&apos;est construite grâce
                au bouche-à-oreille. Les plats emblématiques — le riz sauce arachide, le
                poulet fumé braisé, la soupe de poisson fumé et le tô — ont rapidement conquis
                les palais des connaisseurs et des curieux. En trois ans, le restaurant est
                passé d&apos;une table de 20 couverts à un espace moderne de 80 places avec une
                terrasse ouverte et un service de livraison moto.
              </p>
              <p>
                Aujourd&apos;hui, KFM DELICE est devenu bien plus qu&apos;un simple restaurant.
                C&apos;est un écosystème culinaire complet, soutenu par la technologie Restaurant OS,
                qui permet de gérer les commandes, les livraisons, les paiements Mobile Money
                et l&apos;analyse des ventes en temps réel. Nous sommes fiers d&apos;être pionniers
                de la digitalisation de la restauration en Guinée et de montrer la voie à toute
                la région ouest-africaine.
              </p>
            </div>
          </div>
        </section>

        {/* ────── Notre Mission ────── */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              Notre Mission
            </h2>

            <div className="prose prose-lg prose-gray max-w-none">
              <p>
                Notre mission est de fournir la meilleure expérience culinaire possible à
                Conakry, en alliant la richesse de la cuisine traditionnelle guinéenne aux
                avantages de la technologie moderne. Nous voulons que chaque client — qu&apos;il
                dîne sur place, commande en ligne ou passe par notre service de livraison —
                vive un moment de plaisir et de découverte.
              </p>
              <p>
                Grâce à notre partenariat avec Restaurant OS, nous utilisons des outils de
                pointe pour garantir la rapidité du service, la fraîcheur des plats et la
                transparence des paiements. L&apos;intégration de Mobile Money (Orange Money et
                MTN MoMo) rend chaque transaction fluide et sécurisée, sans besoin d&apos;espèces
                ni de carte bancaire — un avantage crucial dans notre contexte local.
              </p>
            </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {[
                { value: '80+', label: 'Places assises' },
                { value: '4.8/5', label: 'Note moyenne' },
                { value: '500+', label: 'Clients/semaine' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm"
                >
                  <p className="text-3xl font-bold text-orange-600 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── Notre Vision ────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Eye className="w-8 h-8 text-orange-500" />
              Notre Vision
            </h2>

            <div className="prose prose-lg prose-gray max-w-none">
              <p>
                Notre vision est de devenir la référence absolue en matière de gestion
                restaurant en Afrique de l&apos;Ouest. Nous ne nous contentons pas de servir de
                bons plats — nous aspirons à redéfinir les standards de l&apos;industrie de la
                restauration en Guinée et au-delà, en prouvant que tradition et modernité
                peuvent cohabiter harmonieusement.
              </p>
              <p>
                À moyen terme, KFM DELICE prévoit d&apos;ouvrir trois nouvelles succursales à
                Conakry (Matam, Dixinn et Ratoma) et une franchise à Kindia. Notre objectif
                à cinq ans est d&apos;étendre notre modèle à la Côte d&apos;Ivoire, au Sénégal et au
                Ghana, en partageant notre savoir-faire et notre plateforme Restaurant OS
                avec d&apos;autres restaurateurs ambitieux.
              </p>
              <p>
                Nous croyons fermement que l&apos;avenir de la restauration en Afrique passe par
                la digitalisation, la formation des talents locaux et le respect de notre
                patrimoine culinaire. KFM DELICE s&apos;engage à être à la pointe de cette
                transformation.
              </p>
            </div>
          </div>
        </section>

        {/* ────── Nos Valeurs ────── */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nos Valeurs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Quatre piliers fondamentaux guident chacune de nos décisions et actions
                au quotidien.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {coreValues.map((value) => (
                <div
                  key={value.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                    <value.icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── Notre Équipe ────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Users className="w-8 h-8 text-orange-500" />
                Notre Équipe
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des professionnels passionnés qui font de KFM DELICE un lieu d&apos;exception
                chaque jour.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.name}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow text-center"
                >
                  {/* Avatar placeholder */}
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-300 rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl font-bold text-white">{member.initials}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-orange-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────── Nos Partenaires ────── */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Partenaires
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Nous travaillons avec les meilleurs partenaires de paiement mobile pour offrir
              une expérience fluide et sécurisée à nos clients en Guinée.
            </p>

            <div className="flex flex-wrap justify-center gap-8">
              {/* Orange Money */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center min-w-[180px]">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-orange-600">OM</span>
                </div>
                <p className="font-semibold text-gray-900">Orange Money</p>
                <p className="text-sm text-gray-500 mt-1">Paiement mobile</p>
              </div>

              {/* MTN MoMo */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center min-w-[180px]">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-yellow-600">Mo</span>
                </div>
                <p className="font-semibold text-gray-900">MTN MoMo</p>
                <p className="text-sm text-gray-500 mt-1">Paiement mobile</p>
              </div>

              {/* Restaurant OS */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center min-w-[180px]">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">R</span>
                </div>
                <p className="font-semibold text-gray-900">Restaurant OS</p>
                <p className="text-sm text-gray-500 mt-1">Plateforme digitale</p>
              </div>
            </div>
          </div>
        </section>

        {/* ────── Contact ────── */}
        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Contactez-nous
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
              Une question, une réservation ou une suggestion ? N&apos;hésitez pas à nous
              contacter — notre équipe se fera un plaisir de vous répondre.
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              {/* Address */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
                <p className="text-gray-600 text-sm">
                  Conakry, Guinée
                  <br />
                  Quartier Kaloum
                </p>
              </div>

              {/* Phone */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
                <a
                  href="tel:+224620000000"
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  +224 620 00 00 00
                </a>
              </div>

              {/* Email */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <a
                  href="mailto:contact@kfmdelice.com"
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  contact@kfmdelice.com
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all hover:shadow-lg hover:shadow-orange-200"
              >
                Voir notre menu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </article>

      {/* BreadcrumbList JSON-LD – bottom */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: BASE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'À Propos',
                item: `${BASE_URL}/about`,
              },
            ],
          }),
        }}
      />
    </>
  );
}
