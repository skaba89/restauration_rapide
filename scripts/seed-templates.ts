// Seed the Guinée Savane exclusive template for KFM DELICE
import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding Restaurant Templates...');

  // Create the Guinée Savane exclusive template
  const guineeSavaneTemplate = await db.restaurantTemplate.upsert({
    where: { slug: 'guinee-savane' },
    update: {
      name: 'Guinée Savane',
      description: 'Template exclusif pour KFM DELICE - Inspiré des savanes guinéennes avec des motifs traditionnels et des tons chauds de la terre.',
      themeConfig: JSON.stringify({
        colors: {
          primary: '#D4A574', // Savanna gold
          secondary: '#8B4513', // Earth brown
          accent: '#228B22', // Forest green
          background: '#FFF8DC', // Corn silk
          text: '#2D2D2D',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Poppins',
          body: 'Inter',
        },
        layout: {
          headerStyle: 'transparent',
          footerStyle: 'full',
          heroStyle: 'full',
          cardStyle: 'rounded',
        },
        patterns: {
          borders: true,
          backgrounds: true,
          pattern: 'kente',
        },
      }),
      components: JSON.stringify({
        hero: true,
        featured: true,
        menu: true,
        gallery: true,
        reviews: true,
        contact: true,
        social: true,
        newsletter: true,
        reservations: true,
        delivery: true,
      }),
      images: JSON.stringify({
        logo: '/templates/guinee-savane/logo.svg',
        banner: '/templates/guinee-savane/banner.jpg',
        backgrounds: [
          '/templates/guinee-savane/bg-1.jpg',
          '/templates/guinee-savane/bg-2.jpg',
        ],
      }),
      customCss: `
/* Guinée Savane Custom Styles */

/* Kente-inspired border pattern */
.kente-border {
  border-image: linear-gradient(90deg, #D4A574, #8B4513, #228B22, #D4A574) 1;
}

.kente-border-top {
  border-top: 4px solid;
  border-image: linear-gradient(90deg, #D4A574, #8B4513, #228B22, #D4A574) 1;
}

.kente-border-bottom {
  border-bottom: 4px solid;
  border-image: linear-gradient(90deg, #D4A574, #8B4513, #228B22, #D4A574) 1;
}

/* Tribal pattern overlay */
.tribal-pattern {
  background-image: url('/patterns/tribal.svg');
  background-repeat: repeat;
}

/* African-inspired gradient backgrounds */
.savanna-gradient {
  background: linear-gradient(135deg, #D4A574 0%, #8B4513 50%, #228B22 100%);
}

.earth-gradient {
  background: linear-gradient(180deg, #FFF8DC 0%, #D4A574 100%);
}

/* Custom button styles */
.btn-savanna {
  background: linear-gradient(135deg, #D4A574, #8B4513);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-savanna::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #D4A574, #228B22, #8B4513);
}

/* Card with African motif */
.card-african {
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #D4A574, #8B4513, #228B22) border-box;
}

/* Section divider with pattern */
.divider-african {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    #D4A574 0px,
    #D4A574 10px,
    transparent 10px,
    transparent 15px,
    #8B4513 15px,
    #8B4513 25px,
    transparent 25px,
    transparent 30px,
    #228B22 30px,
    #228B22 40px
  );
}

/* Hero section styling */
.hero-savanna {
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.9), rgba(139, 69, 19, 0.8));
  position: relative;
}

.hero-savanna::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: repeating-linear-gradient(
    90deg,
    #D4A574,
    #D4A574 20px,
    #FFF8DC 20px,
    #FFF8DC 40px
  );
}

/* Font styling */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
}

body {
  font-family: 'Inter', sans-serif;
}
      `,
      isPremium: true,
      isExclusive: true,
      isActive: true,
    },
    create: {
      id: 'template-guinee-savane',
      name: 'Guinée Savane',
      slug: 'guinee-savane',
      description: 'Template exclusif pour KFM DELICE - Inspiré des savanes guinéennes avec des motifs traditionnels et des tons chauds de la terre.',
      themeConfig: JSON.stringify({
        colors: {
          primary: '#D4A574',
          secondary: '#8B4513',
          accent: '#228B22',
          background: '#FFF8DC',
          text: '#2D2D2D',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Poppins',
          body: 'Inter',
        },
        layout: {
          headerStyle: 'transparent',
          footerStyle: 'full',
          heroStyle: 'full',
          cardStyle: 'rounded',
        },
        patterns: {
          borders: true,
          backgrounds: true,
          pattern: 'kente',
        },
      }),
      components: JSON.stringify({
        hero: true,
        featured: true,
        menu: true,
        gallery: true,
        reviews: true,
        contact: true,
        social: true,
        newsletter: true,
        reservations: true,
        delivery: true,
      }),
      images: JSON.stringify({
        logo: '/templates/guinee-savane/logo.svg',
        banner: '/templates/guinee-savane/banner.jpg',
        backgrounds: [
          '/templates/guinee-savane/bg-1.jpg',
          '/templates/guinee-savane/bg-2.jpg',
        ],
      }),
      customCss: `
/* Guinée Savane Custom Styles */
.kente-border {
  border-image: linear-gradient(90deg, #D4A574, #8B4513, #228B22, #D4A574) 1;
}
.savanna-gradient {
  background: linear-gradient(135deg, #D4A574 0%, #8B4513 50%, #228B22 100%);
}
      `,
      isPremium: true,
      isExclusive: true,
      isActive: true,
    },
  });

  console.log('Created template:', guineeSavaneTemplate);

  // Create additional standard templates
  const modernOrangeTemplate = await db.restaurantTemplate.upsert({
    where: { slug: 'modern-orange' },
    update: {
      name: 'Modern Orange',
      description: 'Un template moderne et élégant avec des accents orange vifs, parfait pour les restaurants contemporains.',
      themeConfig: JSON.stringify({
        colors: {
          primary: '#F97316',
          secondary: '#EA580C',
          accent: '#FFC107',
          background: '#FFFFFF',
          text: '#1F2937',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
        },
        layout: {
          headerStyle: 'fixed',
          footerStyle: 'minimal',
          heroStyle: 'medium',
          cardStyle: 'rounded',
        },
      }),
      components: JSON.stringify({
        hero: true,
        featured: true,
        menu: true,
        gallery: false,
        reviews: true,
        contact: true,
        social: true,
        newsletter: false,
        reservations: true,
        delivery: true,
      }),
      isPremium: false,
      isExclusive: false,
      isActive: true,
    },
    create: {
      id: 'template-modern-orange',
      name: 'Modern Orange',
      slug: 'modern-orange',
      description: 'Un template moderne et élégant avec des accents orange vifs, parfait pour les restaurants contemporains.',
      themeConfig: JSON.stringify({
        colors: {
          primary: '#F97316',
          secondary: '#EA580C',
          accent: '#FFC107',
          background: '#FFFFFF',
          text: '#1F2937',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
        },
        layout: {
          headerStyle: 'fixed',
          footerStyle: 'minimal',
          heroStyle: 'medium',
          cardStyle: 'rounded',
        },
      }),
      components: JSON.stringify({
        hero: true,
        featured: true,
        menu: true,
        gallery: false,
        reviews: true,
        contact: true,
        social: true,
        newsletter: false,
        reservations: true,
        delivery: true,
      }),
      isPremium: false,
      isExclusive: false,
      isActive: true,
    },
  });

  console.log('Created template:', modernOrangeTemplate);

  // Create Dark Elegant template
  const darkElegantTemplate = await db.restaurantTemplate.upsert({
    where: { slug: 'dark-elegant' },
    update: {
      name: 'Dark Elegant',
      description: 'Un template sombre et sophistiqué pour les restaurants haut de gamme.',
      themeConfig: JSON.stringify({
        colors: {
          primary: '#D4AF37',
          secondary: '#1A1A1A',
          accent: '#C9A227',
          background: '#0F0F0F',
          text: '#FFFFFF',
          textMuted: '#9CA3AF',
        },
        fonts: {
          heading: 'Playfair Display',
          body: 'Lato',
        },
        layout: {
          headerStyle: 'fixed',
          footerStyle: 'full',
          heroStyle: 'full',
          cardStyle: 'square',
        },
      }),
      components: JSON.stringify({
        hero: true,
        featured: true,
        menu: true,
        gallery: true,
        reviews: true,
        contact: true,
        social: false,
        newsletter: true,
        reservations: true,
        delivery: false,
      }),
      isPremium: true,
      isExclusive: false,
      isActive: true,
    },
    create: {
      id: 'template-dark-elegant',
      name: 'Dark Elegant',
      slug: 'dark-elegant',
      description: 'Un template sombre et sophistiqué pour les restaurants haut de gamme.',
      themeConfig: JSON.stringify({
        colors: {
          primary: '#D4AF37',
          secondary: '#1A1A1A',
          accent: '#C9A227',
          background: '#0F0F0F',
          text: '#FFFFFF',
          textMuted: '#9CA3AF',
        },
        fonts: {
          heading: 'Playfair Display',
          body: 'Lato',
        },
        layout: {
          headerStyle: 'fixed',
          footerStyle: 'full',
          heroStyle: 'full',
          cardStyle: 'square',
        },
      }),
      components: JSON.stringify({
        hero: true,
        featured: true,
        menu: true,
        gallery: true,
        reviews: true,
        contact: true,
        social: false,
        newsletter: true,
        reservations: true,
        delivery: false,
      }),
      isPremium: true,
      isExclusive: false,
      isActive: true,
    },
  });

  console.log('Created template:', darkElegantTemplate);

  // Create Fresh Green template
  const freshGreenTemplate = await db.restaurantTemplate.upsert({
    where: { slug: 'fresh-green' },
    update: {
      name: 'Fresh Green',
      description: 'Un template frais et naturel avec des tons verts, idéal pour les restaurants bio et végétariens.',
      themeConfig: JSON.stringify({
        colors: {
          primary: '#22C55E',
          secondary: '#16A34A',
          accent: '#84CC16',
          background: '#F0FDF4',
          text: '#1F2937',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Nunito',
          body: 'Open Sans',
        },
        layout: {
          headerStyle: 'static',
          footerStyle: 'minimal',
          heroStyle: 'small',
          cardStyle: 'pill',
        },
      }),
      components: JSON.stringify({
        hero: true,
        featured: false,
        menu: true,
        gallery: true,
        reviews: true,
        contact: true,
        social: true,
        newsletter: true,
        reservations: true,
        delivery: true,
      }),
      isPremium: false,
      isExclusive: false,
      isActive: true,
    },
    create: {
      id: 'template-fresh-green',
      name: 'Fresh Green',
      slug: 'fresh-green',
      description: 'Un template frais et naturel avec des tons verts, idéal pour les restaurants bio et végétariens.',
      themeConfig: JSON.stringify({
        colors: {
          primary: '#22C55E',
          secondary: '#16A34A',
          accent: '#84CC16',
          background: '#F0FDF4',
          text: '#1F2937',
          textMuted: '#6B7280',
        },
        fonts: {
          heading: 'Nunito',
          body: 'Open Sans',
        },
        layout: {
          headerStyle: 'static',
          footerStyle: 'minimal',
          heroStyle: 'small',
          cardStyle: 'pill',
        },
      }),
      components: JSON.stringify({
        hero: true,
        featured: false,
        menu: true,
        gallery: true,
        reviews: true,
        contact: true,
        social: true,
        newsletter: true,
        reservations: true,
        delivery: true,
      }),
      isPremium: false,
      isExclusive: false,
      isActive: true,
    },
  });

  console.log('Created template:', freshGreenTemplate);

  console.log('Template seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
