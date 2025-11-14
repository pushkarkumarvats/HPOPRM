// Mock authentication service for demo mode
export const DEMO_ACCOUNTS = {
  'farmer@demo.com': {
    id: 'demo-farmer-1',
    email: 'farmer@demo.com',
    name: 'Ramesh Kumar',
    role: 'farmer',
    phone: '+919876543210',
    status: 'active',
    fpoId: 'demo-fpo-1',
    emailVerified: true,
    phoneVerified: true,
    kycVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  'fpo@demo.com': {
    id: 'demo-fpo-admin-1',
    email: 'fpo@demo.com',
    name: 'Anjali Sharma',
    role: 'fpo_admin',
    phone: '+919876543212',
    status: 'active',
    fpoId: 'demo-fpo-1',
    emailVerified: true,
    phoneVerified: true,
    kycVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  'market@demo.com': {
    id: 'demo-market-maker-1',
    email: 'market@demo.com',
    name: 'Trading Corp Ltd',
    role: 'market_maker',
    phone: '+919876543213',
    status: 'active',
    emailVerified: true,
    phoneVerified: true,
    kycVerified: true,
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  'admin@demo.com': {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    name: 'System Administrator',
    role: 'super_admin',
    phone: '+919876543214',
    status: 'active',
    emailVerified: true,
    phoneVerified: true,
    kycVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
};

export const DEMO_PASSWORD = 'Demo@123';

export function isDemoAccount(email: string): boolean {
  return email in DEMO_ACCOUNTS;
}

export function authenticateDemoAccount(email: string, password: string) {
  if (!isDemoAccount(email)) {
    throw new Error('Not a demo account');
  }

  if (password !== DEMO_PASSWORD) {
    throw new Error('Invalid password');
  }

  const user = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
  
  return {
    user,
    accessToken: `demo-token-${user.id}`,
    refreshToken: `demo-refresh-${user.id}`,
  };
}

// Mock data for demo mode
export const MOCK_MARKET_DATA = {
  prices: [
    {
      id: '1',
      commodity: 'SOYBEAN',
      price: 4850.50,
      source: 'NCDEX',
      timestamp: new Date().toISOString(),
      changePercent: 2.3,
    },
    {
      id: '2',
      commodity: 'MUSTARD',
      price: 5650.75,
      source: 'NCDEX',
      timestamp: new Date().toISOString(),
      changePercent: -1.2,
    },
    {
      id: '3',
      commodity: 'GROUNDNUT',
      price: 5890.00,
      source: 'NCDEX',
      timestamp: new Date().toISOString(),
      changePercent: 0.8,
    },
  ],
};

export const MOCK_CONTRACTS = [
  {
    id: 'contract-1',
    type: 'FORWARD',
    commodity: 'SOYBEAN',
    quantity: 10,
    price: 4800.00,
    deliveryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'contract-2',
    type: 'FORWARD',
    commodity: 'MUSTARD',
    quantity: 5,
    price: 5700.00,
    deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_ORDERS = [
  {
    id: 'order-1',
    commodity: 'SOYBEAN',
    side: 'BUY',
    quantity: 10,
    price: 4850.00,
    status: 'filled',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-2',
    commodity: 'MUSTARD',
    side: 'SELL',
    quantity: 5,
    price: 5650.00,
    status: 'open',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Welcome to HPOPRM Demo',
    message: 'You are using a demo account. All data is simulated.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Price Alert',
    message: 'Soybean prices increased by 2.3%',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];
