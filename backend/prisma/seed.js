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
      basePrice: 19.99,
      mockupFrontUrl: 'https://via.placeholder.com/500x600/000000/FFFFFF?text=T-Shirt+Noir+Face',
      mockupBackUrl: 'https://via.placeholder.com/500x600/000000/FFFFFF?text=T-Shirt+Noir+Dos',
      isActive: true
    },
    {
      name: 'T-Shirt Classique Blanc',
      description: 'T-shirt 100% coton, coupe classique, couleur blanc. Idéal pour des designs colorés.',
      basePrice: 19.99,
      mockupFrontUrl: 'https://via.placeholder.com/500x600/FFFFFF/000000?text=T-Shirt+Blanc+Face',
      mockupBackUrl: 'https://via.placeholder.com/500x600/FFFFFF/000000?text=T-Shirt+Blanc+Dos',
      isActive: true
    },
    {
      name: 'T-Shirt Premium Noir',
      description: 'T-shirt premium en coton bio, coupe ajustée, qualité supérieure. Couleur noir profond.',
      basePrice: 29.99,
      mockupFrontUrl: 'https://via.placeholder.com/500x600/1a1a1a/FFFFFF?text=T-Shirt+Premium+Noir',
      mockupBackUrl: 'https://via.placeholder.com/500x600/1a1a1a/FFFFFF?text=T-Shirt+Premium+Dos',
      isActive: true
    },
    {
      name: 'T-Shirt Premium Blanc',
      description: 'T-shirt premium en coton bio, coupe ajustée, qualité supérieure. Blanc éclatant.',
      basePrice: 29.99,
      mockupFrontUrl: 'https://via.placeholder.com/500x600/f5f5f5/333333?text=T-Shirt+Premium+Blanc',
      mockupBackUrl: 'https://via.placeholder.com/500x600/f5f5f5/333333?text=T-Shirt+Premium+Dos',
      isActive: true
    }
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData
    });
    console.log(` Produit créé: ${product.name} - ${product.basePrice}€`);
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
