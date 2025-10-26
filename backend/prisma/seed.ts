import { PrismaClient, UserRole, PriceSource, OrderSide, OrderStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

/**
 * Seed the database with sample data for development and testing
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (be careful in production!)
  if (process.env.NODE_ENV === 'development') {
    console.log('Clearing existing data...');
    await prisma.trade.deleteMany();
    await prisma.order.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.aIPrediction.deleteMany();
    await prisma.price.deleteMany();
    await prisma.farm.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    await prisma.fPO.deleteMany();
  }

  // Hash passwords
  const defaultPassword = await argon2.hash('Demo@123');

  // Create FPOs
  console.log('Creating FPOs...');
  const fpo1 = await prisma.fPO.create({
    data: {
      name: 'Maharashtra Soybean Farmers FPO',
      registrationNo: 'FPO-MH-2023-001',
      region: 'Western Maharashtra',
      district: 'Pune',
      state: 'Maharashtra',
      membersCount: 150,
      contactEmail: 'info@mhsoybean.org',
      contactPhone: '+919876543210',
      description: 'Collective of 150+ soybean farmers in Pune district',
    },
  });

  const fpo2 = await prisma.fPO.create({
    data: {
      name: 'Rajasthan Mustard Growers Union',
      registrationNo: 'FPO-RJ-2023-002',
      region: 'Eastern Rajasthan',
      district: 'Bharatpur',
      state: 'Rajasthan',
      membersCount: 200,
      contactEmail: 'contact@rjmustard.org',
      contactPhone: '+919876543211',
      description: 'Mustard oil producers cooperative',
    },
  });

  // Create Users
  console.log('Creating users...');
  const farmer1 = await prisma.user.create({
    data: {
      name: 'Ramesh Kumar',
      email: 'farmer@demo.com',
      phone: '+919876543210',
      passwordHash: defaultPassword,
      role: UserRole.farmer,
      status: 'active',
      fpoId: fpo1.id,
      emailVerified: true,
      phoneVerified: true,
      kycVerified: true,
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      name: 'Suresh Patel',
      email: 'suresh.patel@demo.com',
      phone: '+919876543211',
      passwordHash: defaultPassword,
      role: UserRole.farmer,
      status: 'active',
      fpoId: fpo1.id,
      emailVerified: true,
      phoneVerified: true,
      kycVerified: true,
    },
  });

  const fpoAdmin = await prisma.user.create({
    data: {
      name: 'Anjali Sharma',
      email: 'fpo@demo.com',
      phone: '+919876543212',
      passwordHash: defaultPassword,
      role: UserRole.fpo_admin,
      status: 'active',
      fpoId: fpo1.id,
      emailVerified: true,
      phoneVerified: true,
      kycVerified: true,
    },
  });

  const marketMaker = await prisma.user.create({
    data: {
      name: 'Trading Corp Ltd',
      email: 'market@demo.com',
      phone: '+919876543213',
      passwordHash: defaultPassword,
      role: UserRole.market_maker,
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      kycVerified: true,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    },
  });

  const regulator = await prisma.user.create({
    data: {
      name: 'Market Regulator',
      email: 'regulator@demo.com',
      phone: '+919876543214',
      passwordHash: defaultPassword,
      role: UserRole.regulator,
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      kycVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@demo.com',
      phone: '+919876543215',
      passwordHash: defaultPassword,
      role: UserRole.super_admin,
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      kycVerified: true,
    },
  });

  // Create Farms
  console.log('Creating farms...');
  await prisma.farm.create({
    data: {
      ownerId: farmer1.id,
      farmName: 'Green Valley Farm',
      cropType: 'soybean',
      area: 10.5,
      locationLat: 18.5204,
      locationLong: 73.8567,
      address: 'Pune, Maharashtra',
      storageCapacity: 500,
    },
  });

  await prisma.farm.create({
    data: {
      ownerId: farmer2.id,
      farmName: 'Sunshine Acres',
      cropType: 'mustard',
      area: 8.0,
      locationLat: 27.2046,
      locationLong: 77.4977,
      address: 'Bharatpur, Rajasthan',
      storageCapacity: 350,
    },
  });

  // Create Historical Price Data
  console.log('Creating historical price data...');
  const commodities = ['soybean', 'mustard'];
  const now = new Date();
  const priceData: any[] = [];

  for (const commodity of commodities) {
    let basePrice = commodity === 'soybean' ? 5500 : 6200;

    // Create 180 days of historical data
    for (let i = 180; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Add some randomness and trend
      const trend = Math.sin(i / 30) * 100;
      const random = (Math.random() - 0.5) * 200;
      const price = basePrice + trend + random;
      const openPrice = price + (Math.random() - 0.5) * 50;
      const highPrice = Math.max(price, openPrice) + Math.random() * 100;
      const lowPrice = Math.min(price, openPrice) - Math.random() * 100;

      priceData.push({
        commodity,
        timestamp: date,
        price: Math.round(price * 100) / 100,
        openPrice: Math.round(openPrice * 100) / 100,
        highPrice: Math.round(highPrice * 100) / 100,
        lowPrice: Math.round(lowPrice * 100) / 100,
        volume: Math.floor(Math.random() * 10000) + 5000,
        source: PriceSource.csv,
        market: 'NCDEX',
        unit: 'quintal',
      });
    }
  }

  await prisma.price.createMany({ data: priceData });

  // Create Sample Orders
  console.log('Creating sample orders...');
  const order1 = await prisma.order.create({
    data: {
      userId: farmer1.id,
      type: 'simulated',
      side: OrderSide.sell,
      commodity: 'soybean',
      price: 5500,
      quantity: 100,
      filledQuantity: 0,
      status: OrderStatus.pending,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: marketMaker.id,
      type: 'simulated',
      side: OrderSide.buy,
      commodity: 'soybean',
      price: 5480,
      quantity: 100,
      filledQuantity: 0,
      status: OrderStatus.pending,
    },
  });

  // Create Sample Contract
  console.log('Creating sample contracts...');
  await prisma.contract.create({
    data: {
      contractHash: 'hash-' + Date.now(),
      buyerId: marketMaker.id,
      sellerId: farmer1.id,
      commodity: 'soybean',
      quantity: 500,
      priceFixed: 5500,
      totalValue: 5500 * 500,
      deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      deliveryLocation: 'Pune, Maharashtra',
      status: 'draft',
      terms: {
        quality: 'Grade A',
        moistureContent: '12% max',
        paymentTerms: '50% advance, 50% on delivery',
      },
    },
  });

  // Create Sample AI Predictions
  console.log('Creating sample AI predictions...');
  const forecastData = [];
  for (let i = 1; i <= 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    forecastData.push({
      date: date.toISOString(),
      price: 5500 + Math.sin(i / 10) * 100 + (Math.random() - 0.5) * 50,
    });
  }

  await prisma.aIPrediction.create({
    data: {
      commodity: 'soybean',
      horizonDays: 30,
      pointForecastJson: forecastData,
      confIntervalsJson: {
        lower: forecastData.map((d: any) => ({ ...d, price: d.price - 100 })),
        upper: forecastData.map((d: any) => ({ ...d, price: d.price + 100 })),
      },
      modelVersion: 'v1.0.0',
      modelType: 'prophet',
      accuracy: 0.85,
    },
  });

  // Create Sample Notifications
  console.log('Creating sample notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: farmer1.id,
        type: 'price_alert',
        title: 'Price Alert: Soybean',
        message: 'Soybean prices have increased by 2% in the last 24 hours',
        isRead: false,
      },
      {
        userId: farmer1.id,
        type: 'system_announcement',
        title: 'Welcome to HPOPRM',
        message: 'Welcome to the Oilseed Hedging Platform! Start by creating your first contract.',
        isRead: false,
      },
    ],
  });

  // Create System Config
  console.log('Creating system configuration...');
  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'maintenance_mode',
        value: { enabled: false },
      },
      {
        key: 'trading_hours',
        value: { start: '09:00', end: '17:00', timezone: 'Asia/Kolkata' },
      },
      {
        key: 'supported_commodities',
        value: ['soybean', 'mustard', 'sunflower', 'groundnut'],
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📝 Demo Accounts:');
  console.log('──────────────────────────────────────');
  console.log('Farmer:       farmer@demo.com / Demo@123');
  console.log('FPO Admin:    fpo@demo.com / Demo@123');
  console.log('Market Maker: market@demo.com / Demo@123');
  console.log('Regulator:    regulator@demo.com / Demo@123');
  console.log('Admin:        admin@demo.com / Demo@123');
  console.log('──────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
