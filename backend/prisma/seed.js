const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log(' Début du seeding...');

  // 1. Créer un utilisateur admin
  console.log('\n Création de l\'utilisateur admin...');

  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tshirt.com' },
    update: {},
    create: {
      email: 'admin@tshirt.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'LGT',
      role: 'ADMIN'
    }
  });

  console.log(' Admin créé:', admin.email);

  // 2. Créer un utilisateur test normal
  console.log('\n👤 Création de l\'utilisateur test...');

  const userPassword = await bcrypt.hash('user123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user@tshirt.com' },
    update: {},
    create: {
      email: 'user@tshirt.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER'
    }
  });

  console.log(' Utilisateur test créé:', user.email);

  // 3. Créer des produits (t-shirts)
  console.log('\n Création des produits...');

  const products = [
    {
      name: 'T-Shirt Classique Noir',
      description: 'T-shirt 100% coton, coupe classique, couleur noir uni. Parfait pour la personnalisation.',
      basePrice: 0.01,
      mockupFrontUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=90&fit=crop',
      mockupBackUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=90&fit=crop',
      isActive: true
    },
    {
      name: 'T-Shirt Classique Blanc',
      description: 'T-shirt 100% coton, coupe classique, couleur blanc. Idéal pour des designs colorés.',
      basePrice: 0.01,
      mockupFrontUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=1200&q=90&fit=crop',
      mockupBackUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=90&fit=crop',
      isActive: true
    },
    {
      name: 'T-Shirt Premium Noir',
      description: 'T-shirt premium en coton bio, coupe ajustée, qualité supérieure. Couleur noir profond.',
      basePrice: 0.01,
      mockupFrontUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=90&fit=crop',
      mockupBackUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=90&fit=crop',
      isActive: true
    },
    {
      name: 'T-Shirt Premium Blanc',
      description: 'T-shirt premium en coton bio, coupe ajustée, qualité supérieure. Blanc éclatant.',
      basePrice: 0.01,
      mockupFrontUrl: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=1200&q=90&fit=crop',
      mockupBackUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=90&fit=crop',
      isActive: true
    }
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { name: productData.name },
      update: { basePrice: productData.basePrice },
      create: productData
    });
    console.log(` Produit: ${product.name} - ${product.basePrice}€`);
  }

  console.log('\n Seeding terminé avec succès !');
  console.log('\n Comptes créés :');
  console.log('   Admin: admin@tshirt.com / admin123');
  console.log('   User:  user@tshirt.com / user123');
  console.log(`\n ${products.length} produits créés`);
}

main()
  .catch((e) => {
    console.error(' Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
