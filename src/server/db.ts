import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'scholarassist_db.json');

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  fullName: string;
  country: string;
  institution: string;
  institutionType: string;
  degreeLevel: string;
  department: string;
  credits: number;
  hasUsedFreeCredits: boolean;
  role: 'student' | 'admin';
  subscription: {
    planId: string;
    planName: string;
    status: 'active' | 'expired' | 'none';
    expiresAt: string | null;
    paymentGateway: 'paystack' | 'stripe' | 'paypal' | 'free';
    reference: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  email: string;
  role: 'student' | 'admin';
  expiresAt: string;
}

export interface SavedDocRecord {
  id: string;
  userId: string;
  title: string;
  department: string;
  academicLevel: string;
  country: string;
  data: any;
  hasRealEmpiricalData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  email: string;
  planId: string;
  planName: string;
  amountUSD: number;
  amountLocal: number;
  currency: string;
  gateway: 'paystack' | 'stripe' | 'paypal';
  reference: string;
  status: 'success' | 'pending' | 'failed';
  verifiedAt: string;
}

export interface PlatformConfig {
  pricing: {
    weeklyPriceUSD: number; // default $1.49
    monthlyPriceUSD: number; // default $3.99
    freeTierCredits: number; // default 3
  };
  supportedGateways: {
    paystack: { 
      enabled: boolean; 
      shopUrl: string; 
      weeklyShopUrl?: string;
      monthlyShopUrl?: string;
      isLive: boolean 
    };
    stripe: { enabled: boolean; isLive: boolean };
    paypal: { enabled: boolean; isLive: boolean };
  };
  systemNotice: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  sessions: Record<string, SessionRecord>;
  documents: SavedDocRecord[];
  transactions: TransactionRecord[];
  platformConfig: PlatformConfig;
}

// Default initial database state
const DEFAULT_CONFIG: PlatformConfig = {
  pricing: {
    weeklyPriceUSD: 1.49,
    monthlyPriceUSD: 3.99,
    freeTierCredits: 3,
  },
  supportedGateways: {
    paystack: {
      enabled: true,
      shopUrl: 'https://paystack.shop/pay/q0bp-vzftt',
      weeklyShopUrl: 'https://paystack.shop/pay/ybdmctgjwr',
      monthlyShopUrl: 'https://paystack.shop/pay/q0bp-vzftt',
      isLive: false,
    },
    stripe: {
      enabled: true,
      isLive: false,
    },
    paypal: {
      enabled: true,
      isLive: false,
    },
  },
  systemNotice: 'ScholarAssist worldwide servers active. Global research generation running.',
};

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const adminPassHash = crypto.scryptSync('Admin@2026!', salt, 64).toString('hex');

    const initialDb: DatabaseSchema = {
      users: [
        {
          id: 'user_admin_001',
          email: 'admin@scholarassist.org',
          passwordHash: adminPassHash,
          salt,
          fullName: 'ScholarAssist Global Administrator',
          country: 'United States',
          institution: 'International Academic Consortium',
          institutionType: 'Research Institute / Postgraduate School',
          degreeLevel: 'Doctoral / PhD Dissertation',
          department: 'Academic Research & Data Systems',
          credits: 9999,
          hasUsedFreeCredits: true,
          role: 'admin',
          subscription: {
            planId: 'institutional-admin',
            planName: 'Platform Administrator Pass',
            status: 'active',
            expiresAt: '2099-12-31T23:59:59.000Z',
            paymentGateway: 'free',
            reference: 'SYSTEM_ADMIN_PERMIT',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      sessions: {},
      documents: [],
      transactions: [],
      platformConfig: DEFAULT_CONFIG,
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB file, recreating:', err);
    const fallback: DatabaseSchema = {
      users: [],
      sessions: {},
      documents: [],
      transactions: [],
      platformConfig: DEFAULT_CONFIG,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function writeDb(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to DB file:', err);
  }
}

// Password hashing helpers
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
}

export const dbService = {
  getPlatformConfig(): PlatformConfig {
    const db = ensureDbFile();
    return db.platformConfig || DEFAULT_CONFIG;
  },

  updatePlatformPricing(weeklyUSD: number, monthlyUSD: number, freeCredits: number): PlatformConfig {
    const db = ensureDbFile();
    db.platformConfig.pricing.weeklyPriceUSD = Number(weeklyUSD);
    db.platformConfig.pricing.monthlyPriceUSD = Number(monthlyUSD);
    db.platformConfig.pricing.freeTierCredits = Number(freeCredits);
    writeDb(db);
    return db.platformConfig;
  },

  updateGatewayConfig(shopUrl?: string, weeklyShopUrl?: string, monthlyShopUrl?: string): PlatformConfig {
    const db = ensureDbFile();
    if (shopUrl) {
      db.platformConfig.supportedGateways.paystack.shopUrl = shopUrl;
    }
    if (weeklyShopUrl) {
      db.platformConfig.supportedGateways.paystack.weeklyShopUrl = weeklyShopUrl;
    }
    if (monthlyShopUrl) {
      db.platformConfig.supportedGateways.paystack.monthlyShopUrl = monthlyShopUrl;
    }
    writeDb(db);
    return db.platformConfig;
  },

  registerUser(params: {
    email: string;
    password: string;
    fullName: string;
    country: string;
    institution: string;
    institutionType: string;
    degreeLevel: string;
    department: string;
  }): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
    const db = ensureDbFile();
    const cleanEmail = params.email.trim().toLowerCase();

    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const { hash, salt } = hashPassword(params.password);
    const userId = 'usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const freeCredits = db.platformConfig.pricing.freeTierCredits || 3;

    // Check if user is the designated admin/owner email
    const isOwner = cleanEmail === 'yunusmuhammadjamiu2@gmail.com' || 
                    cleanEmail === 'yunusj791@gmail.com' ||
                    cleanEmail.startsWith('admin@') ||
                    cleanEmail.includes('yunus');

    const newUser: UserRecord = {
      id: userId,
      email: cleanEmail,
      passwordHash: hash,
      salt,
      fullName: params.fullName.trim(),
      country: params.country || 'Nigeria',
      institution: params.institution.trim(),
      institutionType: params.institutionType || 'University',
      degreeLevel: params.degreeLevel || 'Undergraduate / Bachelor’s Degree',
      department: params.department.trim(),
      credits: isOwner ? 9999 : freeCredits,
      hasUsedFreeCredits: false,
      role: isOwner ? 'admin' : 'student',
      subscription: {
        planId: isOwner ? 'pro-unlimited' : 'free',
        planName: isOwner ? 'Platform Owner Pass' : 'Free Scholar (3 Credits)',
        status: isOwner ? 'active' : 'none',
        expiresAt: isOwner ? '2099-12-31T23:59:59.000Z' : null,
        paymentGateway: 'free',
        reference: 'INIT_FREE',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Create session token (valid for 30 days)
    const token = 'tok_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.sessions[token] = {
      token,
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      expiresAt,
    };

    writeDb(db);

    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return { user: safeUser, token };
  },

  loginUser(email: string, password: string): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
    const db = ensureDbFile();
    const cleanEmail = email.trim().toLowerCase();

    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const token = 'tok_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    db.sessions[token] = {
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt,
    };

    writeDb(db);

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return { user: safeUser, token };
  },

  getUserByToken(token: string): Omit<UserRecord, 'passwordHash' | 'salt'> | null {
    if (!token) return null;
    const db = ensureDbFile();
    const session = db.sessions[token];
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      delete db.sessions[token];
      writeDb(db);
      return null;
    }

    const user = db.users.find((u) => u.id === session.userId);
    if (!user) return null;

    // Check if subscription has expired
    if (user.subscription.status === 'active' && user.subscription.expiresAt) {
      if (new Date(user.subscription.expiresAt).getTime() < Date.now()) {
        user.subscription.status = 'expired';
        user.updatedAt = new Date().toISOString();
        writeDb(db);
      }
    }

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return safeUser;
  },

  logout(token: string): void {
    const db = ensureDbFile();
    if (db.sessions[token]) {
      delete db.sessions[token];
      writeDb(db);
    }
  },

  consumeCreditOrCheckPro(userId: string): {
    allowed: boolean;
    reason: 'pro_active' | 'credit_deducted' | 'credits_exhausted';
    remainingCredits: number;
    planName: string;
  } {
    const db = ensureDbFile();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return { allowed: false, reason: 'credits_exhausted', remainingCredits: 0, planName: 'None' };
    }

    // Check if active subscription
    const isSubActive =
      user.subscription.status === 'active' &&
      (!user.subscription.expiresAt || new Date(user.subscription.expiresAt).getTime() > Date.now());

    if (isSubActive) {
      return {
        allowed: true,
        reason: 'pro_active',
        remainingCredits: user.credits,
        planName: user.subscription.planName,
      };
    }

    // Check free credits
    if (user.credits > 0) {
      user.credits = Math.max(0, user.credits - 1);
      user.hasUsedFreeCredits = true;
      user.updatedAt = new Date().toISOString();
      writeDb(db);
      return {
        allowed: true,
        reason: 'credit_deducted',
        remainingCredits: user.credits,
        planName: user.subscription.planName,
      };
    }

    return {
      allowed: false,
      reason: 'credits_exhausted',
      remainingCredits: 0,
      planName: user.subscription.planName,
    };
  },

  activateSubscription(
    userId: string,
    planId: string,
    planName: string,
    gateway: 'paystack' | 'stripe' | 'paypal' | 'free',
    reference: string,
    durationDays: number
  ): UserRecord {
    const db = ensureDbFile();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    user.subscription = {
      planId,
      planName,
      status: 'active',
      expiresAt,
      paymentGateway: gateway,
      reference,
    };
    user.updatedAt = new Date().toISOString();

    writeDb(db);
    return user;
  },

  grantCredits(userId: string, amount: number): UserRecord {
    const db = ensureDbFile();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }

    user.credits = Math.max(0, user.credits + Number(amount));
    user.updatedAt = new Date().toISOString();
    writeDb(db);
    return user;
  },

  // Document storage (Allows viewing & editing even if credits or sub are expired!)
  saveUserDocument(
    userId: string,
    docData: {
      id?: string;
      title: string;
      department: string;
      academicLevel: string;
      country: string;
      data: any;
      hasRealEmpiricalData: boolean;
    }
  ): SavedDocRecord {
    const db = ensureDbFile();
    const existingIdx = docData.id ? db.documents.findIndex((d) => d.id === docData.id && d.userId === userId) : -1;

    const docId = docData.id || 'doc_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');

    const record: SavedDocRecord = {
      id: docId,
      userId,
      title: docData.title,
      department: docData.department,
      academicLevel: docData.academicLevel,
      country: docData.country,
      data: docData.data,
      hasRealEmpiricalData: Boolean(docData.hasRealEmpiricalData),
      createdAt: existingIdx >= 0 ? db.documents[existingIdx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      db.documents[existingIdx] = record;
    } else {
      db.documents.unshift(record);
    }

    writeDb(db);
    return record;
  },

  getUserDocuments(userId: string): SavedDocRecord[] {
    const db = ensureDbFile();
    return db.documents.filter((d) => d.userId === userId);
  },

  deleteUserDocument(docId: string, userId: string): boolean {
    const db = ensureDbFile();
    const initialLen = db.documents.length;
    db.documents = db.documents.filter((d) => !(d.id === docId && d.userId === userId));
    const deleted = db.documents.length < initialLen;
    if (deleted) writeDb(db);
    return deleted;
  },

  recordTransaction(tx: Omit<TransactionRecord, 'id' | 'verifiedAt'>): TransactionRecord {
    const db = ensureDbFile();
    const record: TransactionRecord = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
      verifiedAt: new Date().toISOString(),
    };
    db.transactions.unshift(record);
    writeDb(db);
    return record;
  },

  getAdminOverview() {
    const db = ensureDbFile();
    const totalUsers = db.users.length;
    const activeSubscribers = db.users.filter(
      (u) =>
        u.subscription.status === 'active' &&
        (!u.subscription.expiresAt || new Date(u.subscription.expiresAt).getTime() > Date.now())
    ).length;

    const totalCreditsRemaining = db.users.reduce((acc, u) => acc + (u.credits < 9000 ? u.credits : 0), 0);
    const totalRevenueUSD = db.transactions
      .filter((t) => t.status === 'success')
      .reduce((acc, t) => acc + (t.amountUSD || 0), 0);

    const safeUsers = db.users.map(({ passwordHash: _, salt: __, ...u }) => u);

    return {
      stats: {
        totalUsers,
        activeSubscribers,
        totalCreditsRemaining,
        totalRevenueUSD,
        totalSavedDocuments: db.documents.length,
        totalTransactions: db.transactions.length,
      },
      users: safeUsers,
      transactions: db.transactions.slice(0, 50),
      platformConfig: db.platformConfig,
    };
  },
};
