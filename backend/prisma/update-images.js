const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateImages() {
  console.log('Mise à jour des images HD...\n');

  // Nouvelles URLs HD (w=1200 au lieu de w=500)
  const updates = [
    {
      name: 'T-Shirt Classique Noir',
      mockupFrontUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=90&fit=crop',
      mockupBackUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=90&fit=crop',
    },
    {
      name: 'T-Shirt Classique Blanc',
      mockupFrontUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1200&q=90&fit=crop',
      mockupBackUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=90&fit=crop',
    },
    {
      name: 'T-Shirt Premium Noir',
      mockupFrontUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=90&fit=crop',
      mockupBackUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=90&fit=crop',
    },
    {
      name: 'T-Shirt Premium Blanc',
      mockupFrontUrl: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=1200&q=90&fit=crop',
      mockupBackUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=90&fit=crop',
    },
  ];

  for (const update of updates) {
    try {
      const result = await prisma.product.updateMany({
        where: { name: update.name },
        data: {
          mockupFrontUrl: update.mockupFrontUrl,
          mockupBackUrl: update.mockupBackUrl,
        },
      });

      if (result.count > 0) {
        console.log(`✓ ${update.name} - Images mises à jour`);
      } else {
        console.log(`- ${update.name} - Non trouvé`);
      }
    } catch (error) {
      console.error(`✗ ${update.name} - Erreur:`, error.message);
    }
  }

  console.log('\nMise à jour terminée !');
}

updateImages()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
