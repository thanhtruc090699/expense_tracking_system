import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const keycloakId = '22746217-41d2-4c23-b1ff-93ea6db377ba';
  
  // Find or create user
  let user = await prisma.user.findUnique({ where: { keycloakId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        keycloakId,
        email: 'test@example.com',
        username: 'testuser',
        currency: 'USD',
      },
    });
    console.log('Created user:', user.id);
  } else {
    console.log('User exists:', user.id);
  }

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-food' },
      update: {},
      create: { id: 'cat-food', name: 'Food', icon: '🍔' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-transport' },
      update: {},
      create: { id: 'cat-transport', name: 'Transport', icon: '🚗' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-shopping' },
      update: {},
      create: { id: 'cat-shopping', name: 'Shopping', icon: '🛍️' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-utilities' },
      update: {},
      create: { id: 'cat-utilities', name: 'Utilities', icon: '💡' },
    }),
  ]);

  // Create merchants
  const merchants = await Promise.all([
    prisma.merchant.upsert({
      where: { id: 'merch-walmart' },
      update: {},
      create: { id: 'merch-walmart', name: 'Walmart', business: 'Retail' },
    }),
    prisma.merchant.upsert({
      where: { id: 'merch-shell' },
      update: {},
      create: { id: 'merch-shell', name: 'Shell Gas Station', business: 'Fuel' },
    }),
    prisma.merchant.upsert({
      where: { id: 'merch-amazon' },
      update: {},
      create: { id: 'merch-amazon', name: 'Amazon', business: 'E-commerce' },
    }),
  ]);

  // Create expenses with items
  const expense1 = await prisma.expense.create({
    data: {
      userId: user.id,
      merchantId: 'merch-walmart',
      totalAmount: 85.50,
      expenseDate: new Date('2026-04-25'),
      note: 'Grocery shopping',
      expenseItems: {
        create: [
          { itemName: 'Milk', quantity: 2, unitPrice: 5.50, totalPrice: 11.00, categoryId: 'cat-food' },
          { itemName: 'Bread', quantity: 3, unitPrice: 3.25, totalPrice: 9.75, categoryId: 'cat-food' },
          { itemName: 'Detergent', quantity: 1, unitPrice: 15.00, totalPrice: 15.00, categoryId: 'cat-utilities' },
          { itemName: 'Snacks', quantity: 5, unitPrice: 2.50, totalPrice: 12.50, categoryId: 'cat-food' },
        ],
      },
    },
  });
  console.log('Created expense 1:', expense1.id);

  const expense2 = await prisma.expense.create({
    data: {
      userId: user.id,
      merchantId: 'merch-shell',
      totalAmount: 45.00,
      expenseDate: new Date('2026-04-24'),
      note: 'Gas fill-up',
      expenseItems: {
        create: [
          { itemName: 'Unleaded Gas', quantity: 10, unitPrice: 4.50, totalPrice: 45.00, categoryId: 'cat-transport' },
        ],
      },
    },
  });
  console.log('Created expense 2:', expense2.id);

  const expense3 = await prisma.expense.create({
    data: {
      userId: user.id,
      merchantId: 'merch-amazon',
      totalAmount: 129.99,
      expenseDate: new Date('2026-04-20'),
      note: 'Online shopping',
      expenseItems: {
        create: [
          { itemName: 'Electronics', quantity: 1, unitPrice: 99.99, totalPrice: 99.99, categoryId: 'cat-shopping' },
          { itemName: 'Books', quantity: 2, unitPrice: 15.00, totalPrice: 30.00, categoryId: 'cat-shopping' },
        ],
      },
    },
  });
  console.log('Created expense 3:', expense3.id);

  // Create budgets
  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: 'cat-food',
      amount: 500.00,
      notifyThreshold: 80.00,
      endDate: new Date('2026-05-31'),
    },
  });
  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: 'cat-transport',
      amount: 200.00,
      notifyThreshold: 75.00,
    },
  });

  console.log('✓ Test data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
