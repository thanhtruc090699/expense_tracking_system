import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'b7ae37fc-d80c-4c6a-8bdd-1e4e70cc4d07';
  const keycloakId = '125a6591-9c62-4483-86f2-d584d66cfd44';
  
  console.log('\n🌱 Starting database seed...\n');
  
  // Find or create user
  let user = await prisma.user.findUnique({ 
    where: { keycloakId },
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        keycloakId,
        email: 'test@example.com',
        username: 'testuser',
        currency: 'EUR',
      },
    });
    console.log('✅ Created user:', user.id);
  } else {
    console.log('✅ User exists:', user.id);
  }

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Food' },
      update: {},
      create: { name: 'Food', icon: '🍔' },
    }),
    prisma.category.upsert({
      where: { name: 'Toiletries' },
      update: {},
      create: { name: 'Toiletries', icon: '🧴' },
    }),
    prisma.category.upsert({
      where: { name: 'Clothes' },
      update: {},
      create: { name: 'Clothes', icon: '👕' },
    }),
    prisma.category.upsert({
      where: { name: 'Subscriptions' },
      update: {},
      create: { name: 'Subscriptions', icon: '📺' },
    }),
    prisma.category.upsert({
      where: { name: 'Transport' },
      update: {},
      create: { name: 'Transport', icon: '🚗' },
    }),
    prisma.category.upsert({
      where: { name: 'Entertainment' },
      update: {},
      create: { name: 'Entertainment', icon: '🎬' },
    }),
    prisma.category.upsert({
      where: { name: 'Utilities' },
      update: {},
      create: { name: 'Utilities', icon: '💡' },
    }),
  ]);

  const categoryMap: Record<string, string> = {};
  categories.forEach(cat => {
    categoryMap[cat.name.toLowerCase()] = cat.id;
  });
  console.log(`✅ Created/found ${categories.length} categories`);

  // Create merchants
  const merchants = await Promise.all([
    prisma.merchant.upsert({
      where: { name: 'REWE' },
      update: {},
      create: { name: 'REWE', business: 'Supermarket' },
    }),
    prisma.merchant.upsert({
      where: { name: 'dm' },
      update: {},
      create: { name: 'dm', business: 'Drugstore' },
    }),
    prisma.merchant.upsert({
      where: { name: 'H&M' },
      update: {},
      create: { name: 'H&M', business: 'Clothing Store' },
    }),
    prisma.merchant.upsert({
      where: { name: 'Netflix' },
      update: {},
      create: { name: 'Netflix', business: 'Streaming Service' },
    }),
    prisma.merchant.upsert({
      where: { name: 'Aral' },
      update: {},
      create: { name: 'Aral', business: 'Gas Station' },
    }),
    prisma.merchant.upsert({
      where: { name: 'Cinema City' },
      update: {},
      create: { name: 'Cinema City', business: 'Cinema' },
    }),
    prisma.merchant.upsert({
      where: { name: 'Amazon' },
      update: {},
      create: { name: 'Amazon', business: 'E-commerce' },
    }),
    prisma.merchant.upsert({
      where: { name: 'Spotify' },
      update: {},
      create: { name: 'Spotify', business: 'Music Streaming' },
    }),
  ]);

  const merchantMap: Record<string, string> = {};
  merchants.forEach(merch => {
    merchantMap[merch.name] = merch.id;
  });
  console.log(`✅ Created/found ${merchants.length} merchants`);

  // Delete existing expenses for this user to avoid duplicates
  await prisma.expense.deleteMany({
    where: { userId: user.id },
  });
  console.log('🗑️  Cleared existing expenses for user');

  // Create expenses with items for June 2026
  const expensesData = [
    {
      merchantId: merchantMap['REWE'],
      totalAmount: 67.89,
      expenseDate: new Date('2026-06-02'),
      note: 'Weekly groceries',
      items: [
        { itemName: 'Milk', quantity: 2, unitPrice: 3.49, totalPrice: 6.98, categoryName: 'Food' },
        { itemName: 'Bread', quantity: 2, unitPrice: 2.49, totalPrice: 4.98, categoryName: 'Food' },
        { itemName: 'Eggs', quantity: 1, unitPrice: 4.29, totalPrice: 4.29, categoryName: 'Food' },
        { itemName: 'Chicken Breast', quantity: 1, unitPrice: 12.99, totalPrice: 12.99, categoryName: 'Food' },
        { itemName: 'Rice', quantity: 2, unitPrice: 3.99, totalPrice: 7.98, categoryName: 'Food' },
        { itemName: 'Tomatoes', quantity: 1, unitPrice: 2.89, totalPrice: 2.89, categoryName: 'Food' },
        { itemName: 'Cheese', quantity: 1, unitPrice: 5.49, totalPrice: 5.49, categoryName: 'Food' },
        { itemName: 'Yogurt', quantity: 4, unitPrice: 1.25, totalPrice: 5.00, categoryName: 'Food' },
        { itemName: 'Pasta', quantity: 2, unitPrice: 2.15, totalPrice: 4.30, categoryName: 'Food' },
        { itemName: 'Bag', quantity: 1, unitPrice: 0.50, totalPrice: 0.50, categoryName: null },
        { itemName: 'Receipt Fee', quantity: 1, unitPrice: 0.49, totalPrice: 0.49, categoryName: null },
      ],
    },
    {
      merchantId: merchantMap['dm'],
      totalAmount: 34.56,
      expenseDate: new Date('2026-06-03'),
      note: 'Personal care items',
      items: [
        { itemName: 'Shampoo', quantity: 1, unitPrice: 5.99, totalPrice: 5.99, categoryName: 'Toiletries' },
        { itemName: 'Toothpaste', quantity: 2, unitPrice: 2.49, totalPrice: 4.98, categoryName: 'Toiletries' },
        { itemName: 'Deodorant', quantity: 1, unitPrice: 3.99, totalPrice: 3.99, categoryName: 'Toiletries' },
        { itemName: 'Face Cream', quantity: 1, unitPrice: 12.99, totalPrice: 12.99, categoryName: 'Toiletries' },
        { itemName: 'Tissues', quantity: 2, unitPrice: 1.49, totalPrice: 2.98, categoryName: 'Toiletries' },
        { itemName: 'Plastic Bags', quantity: 1, unitPrice: 0.99, totalPrice: 0.99, categoryName: null },
        { itemName: 'Donation', quantity: 1, unitPrice: 2.64, totalPrice: 2.64, categoryName: null },
      ],
    },
    {
      merchantId: merchantMap['H&M'],
      totalAmount: 89.97,
      expenseDate: new Date('2026-06-05'),
      note: 'New clothes',
      items: [
        { itemName: 'T-Shirt', quantity: 2, unitPrice: 14.99, totalPrice: 29.98, categoryName: 'Clothes' },
        { itemName: 'Jeans', quantity: 1, unitPrice: 39.99, totalPrice: 39.99, categoryName: 'Clothes' },
        { itemName: 'Socks', quantity: 3, unitPrice: 4.99, totalPrice: 14.97, categoryName: 'Clothes' },
        { itemName: 'Belt', quantity: 1, unitPrice: 5.03, totalPrice: 5.03, categoryName: null },
      ],
    },
    {
      merchantId: merchantMap['Netflix'],
      totalAmount: 17.99,
      expenseDate: new Date('2026-06-01'),
      note: 'Monthly subscription',
      items: [
        { itemName: 'Premium Plan', quantity: 1, unitPrice: 17.99, totalPrice: 17.99, categoryName: 'Subscriptions' },
      ],
    },
    {
      merchantId: merchantMap['Spotify'],
      totalAmount: 9.99,
      expenseDate: new Date('2026-06-01'),
      note: 'Music subscription',
      items: [
        { itemName: 'Individual Plan', quantity: 1, unitPrice: 9.99, totalPrice: 9.99, categoryName: 'Subscriptions' },
      ],
    },
    {
      merchantId: merchantMap['Aral'],
      totalAmount: 65.50,
      expenseDate: new Date('2026-06-04'),
      note: 'Tank full',
      items: [
        { itemName: 'Super Plus', quantity: 35.5, unitPrice: 1.845, totalPrice: 65.50, categoryName: 'Transport' },
      ],
    },
    {
      merchantId: merchantMap['Cinema City'],
      totalAmount: 32.00,
      expenseDate: new Date('2026-06-07'),
      note: 'Movie night',
      items: [
        { itemName: 'Movie Ticket', quantity: 2, unitPrice: 12.00, totalPrice: 24.00, categoryName: 'Entertainment' },
        { itemName: 'Popcorn', quantity: 1, unitPrice: 5.50, totalPrice: 5.50, categoryName: 'Entertainment' },
        { itemName: 'Soda', quantity: 2, unitPrice: 1.25, totalPrice: 2.50, categoryName: null },
      ],
    },
    {
      merchantId: merchantMap['Amazon'],
      totalAmount: 156.78,
      expenseDate: new Date('2026-06-06'),
      note: 'Online order',
      items: [
        { itemName: 'USB Cable', quantity: 2, unitPrice: 8.99, totalPrice: 17.98, categoryName: null },
        { itemName: 'Phone Case', quantity: 1, unitPrice: 15.99, totalPrice: 15.99, categoryName: null },
        { itemName: 'Headphones', quantity: 1, unitPrice: 89.99, totalPrice: 89.99, categoryName: 'Entertainment' },
        { itemName: 'Book', quantity: 1, unitPrice: 12.99, totalPrice: 12.99, categoryName: 'Entertainment' },
        { itemName: 'Shipping', quantity: 1, unitPrice: 3.99, totalPrice: 3.99, categoryName: null },
        { itemName: 'Gift Wrap', quantity: 1, unitPrice: 2.99, totalPrice: 2.99, categoryName: null },
      ],
    },
    {
      merchantId: merchantMap['REWE'],
      totalAmount: 45.23,
      expenseDate: new Date('2026-06-09'),
      note: 'Midweek shopping',
      items: [
        { itemName: 'Fruits', quantity: 1, unitPrice: 8.99, totalPrice: 8.99, categoryName: 'Food' },
        { itemName: 'Vegetables', quantity: 1, unitPrice: 7.49, totalPrice: 7.49, categoryName: 'Food' },
        { itemName: 'Orange Juice', quantity: 2, unitPrice: 3.49, totalPrice: 6.98, categoryName: 'Food' },
        { itemName: 'Coffee', quantity: 1, unitPrice: 7.99, totalPrice: 7.99, categoryName: 'Food' },
        { itemName: 'Cookies', quantity: 2, unitPrice: 2.99, totalPrice: 5.98, categoryName: 'Food' },
        { itemName: 'Water', quantity: 2, unitPrice: 1.49, totalPrice: 2.98, categoryName: 'Food' },
        { itemName: 'Misc', quantity: 1, unitPrice: 4.82, totalPrice: 4.82, categoryName: null },
      ],
    },
  ];

  let expenseCount = 0;
  for (const expenseData of expensesData) {
    await prisma.expense.create({
      data: {
        userId: user.id,
        merchantId: expenseData.merchantId,
        totalAmount: expenseData.totalAmount,
        expenseDate: expenseData.expenseDate,
        note: expenseData.note,
        expenseItems: {
          create: expenseData.items.map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            categoryId: item.categoryName ? categoryMap[item.categoryName.toLowerCase()] : null,
          })),
        },
      },
    });
    expenseCount++;
    console.log(`✅ Created expense ${expenseCount}/${expensesData.length}: ${expenseData.note}`);
  }

  // Create budgets
  await prisma.budget.deleteMany({ where: { userId: user.id } });
  
  const budgets = await Promise.all([
    prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: categoryMap['food'],
        amount: 300.00,
        notifyThreshold: 80.00,
        endDate: new Date('2026-06-30'),
      },
    }),
    prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: categoryMap['toiletries'],
        amount: 100.00,
        notifyThreshold: 75.00,
      },
    }),
    prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: categoryMap['clothes'],
        amount: 150.00,
        notifyThreshold: 80.00,
      },
    }),
    prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: categoryMap['subscriptions'],
        amount: 50.00,
        notifyThreshold: 90.00,
      },
    }),
  ]);
  console.log(`✅ Created ${budgets.length} budgets`);

  console.log('\n✅ Test data seeded successfully!\n');
  console.log('Summary:');
  console.log(`  - User: ${user.username} (${user.email})`);
  console.log(`  - Categories: ${categories.length}`);
  console.log(`  - Merchants: ${merchants.length}`);
  console.log(`  - Expenses: ${expenseCount}`);
  console.log(`  - Budgets: ${budgets.length}`);
  console.log('\n💡 You can now test the /expenses/spendingSummary endpoint\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
