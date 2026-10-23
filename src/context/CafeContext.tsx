import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem, TokenOrder, OrderStatus, CafeStats, MainCategory, MainCategoryPrefix } from '../types/cafe';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../data/mockData';
import { findTokenInQueue } from '../services/cafeQueueService';

interface AdminUser {
  email: string;
  name: string;
  role: 'Cafe Manager' | 'Kitchen Lead' | 'Counter Staff';
  counterAssigned: 'All' | 'Counter 1' | 'Counter 2';
}

export interface GenerateTokenInput {
  studentName: string;
  courseName: string;
  category: MainCategory;
  categoryPrefix?: MainCategoryPrefix;
  rollNumber?: string;
  phone?: string;
  department?: string;
  items?: TokenOrder['items'];
  totalAmount?: number;
  counter?: 'Counter 1' | 'Counter 2';
  paymentMethod?: 'UPI' | 'Canteen Card' | 'Cash at Counter';
  paymentStatus?: 'paid' | 'pay_at_counter';
  estimatedMinutes?: number;
  specialInstructions?: string;
}

interface CafeContextType {
  menuItems: MenuItem[];
  tokens: TokenOrder[];
  stats: CafeStats;
  currentServingTokens: { counter1: TokenOrder | null; counter2: TokenOrder | null };
  recentUserTokens: TokenOrder[];
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  generateToken: (orderData: GenerateTokenInput) => TokenOrder;
  updateTokenStatus: (tokenId: string, status: OrderStatus) => void;
  advanceTokenStatus: (tokenId: string) => void;
  serveNextToken: (categoryPrefix?: MainCategoryPrefix) => TokenOrder | null;
  markTokenCompleted: (tokenId: string) => void;
  cancelToken: (tokenId: string) => void;
  removeToken: (tokenId: string) => void;
  refreshTokens: () => void;
  toggleItemStock: (itemId: string) => void;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;
  resetToDefaultData: () => void;
  playChime: () => void;
  getTokenByIdOrNumber: (query: string) => TokenOrder | undefined;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

const ORDERS_KEY = 'cafeflow_orders_glb_v2';
const MENU_KEY = 'cafeflow_menu_glb_v2';
const USER_TOKENS_KEY = 'cafeflow_user_recent_tokens_v2';
const ADMIN_AUTH_KEY = 'cafeflow_admin_auth_v2';

// Web Audio API chime generator for token call / ready alerts
export const playAudioChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play two pleasant tones (C5 -> G5)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.18); // G5
    gain2.gain.setValueAtTime(0.2, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.debug('Audio chime skipped:', err);
  }
};

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<TokenOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_MENU_ITEMS;
  });

  const [userTokenIds, setUserTokenIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(USER_TOKENS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['FF-001', 'OT-001', 'BV-002']; // initial handy demo tracking tokens
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(tokens));
    } catch (e) {
      console.error(e);
    }
  }, [tokens]);

  useEffect(() => {
    try {
      localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
    } catch (e) {
      console.error(e);
    }
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_TOKENS_KEY, JSON.stringify(userTokenIds));
    } catch (e) {
      console.error(e);
    }
  }, [userTokenIds]);

  useEffect(() => {
    try {
      if (adminUser) {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(adminUser));
      } else {
        localStorage.removeItem(ADMIN_AUTH_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [adminUser]);

  /**
   * =========================================================================
   * TOKEN GENERATOR (MOCK / LOCAL STATE SIMULATION)
   * Structured for future Firebase Firestore integration.
   *
   * FUTURE FIREBASE INTEGRATION BLUEPRINT:
   * 1. import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
   * 2. const docRef = await addDoc(collection(db, 'tokens'), newOrderPayload);
   * 3. return { ...newOrderPayload, id: docRef.id };
   * =========================================================================
   */
  const generateToken = (orderData: GenerateTokenInput): TokenOrder => {
    // 1. Resolve Category Prefix
    const prefix: MainCategoryPrefix =
      orderData.categoryPrefix ||
      (orderData.category === 'Beverage'
        ? 'BV'
        : orderData.category === 'Fast Food'
        ? 'FF'
        : 'OT');

    // 2. Determine sequence number for this category (strictly monotonic & unique)
    const existingWithPrefix = tokens.filter(
      (t) => t.categoryPrefix === prefix || t.id.startsWith(prefix)
    );
    const maxNumber = existingWithPrefix.reduce((max, t) => {
      const codeNum = t.tokenCode ? parseInt(t.tokenCode.split('-')[1] || '0', 10) : 0;
      const num = t.tokenNumber || codeNum;
      return Math.max(max, isNaN(num) ? 0 : num);
    }, 0);
    const nextSeqNumber = maxNumber + 1;
    const formattedTokenCode = `${prefix}-${String(nextSeqNumber).padStart(3, '0')}`;

    // 3. Counter routing
    const assignedCounter: 'Counter 1' | 'Counter 2' =
      orderData.counter ||
      (orderData.category === 'Beverage'
        ? 'Counter 1'
        : orderData.category === 'Fast Food'
        ? 'Counter 1'
        : 'Counter 2');

    // 4. Expiry time (strictly 60 minutes from issue)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    // 5. 4-digit pickup PIN
    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: TokenOrder = {
      id: formattedTokenCode,
      tokenCode: formattedTokenCode,
      tokenNumber: nextSeqNumber,
      categoryPrefix: prefix,
      category: orderData.category,
      studentName: orderData.studentName.trim(),
      courseName: orderData.courseName.trim(),
      rollNumber: orderData.rollNumber?.trim() || 'GLB-' + Math.floor(100000 + Math.random() * 900000),
      phone: orderData.phone?.trim() || '',
      department: orderData.courseName.trim(),
      items: orderData.items || [
        {
          itemId: `cat-${prefix.toLowerCase()}`,
          name: `${orderData.category} Order`,
          price: orderData.totalAmount || 0,
          quantity: 1,
          isVeg: true,
        },
      ],
      totalAmount: orderData.totalAmount || 0,
      status: 'pending',
      counter: assignedCounter,
      paymentMethod: orderData.paymentMethod || 'Cash at Counter',
      paymentStatus: orderData.paymentStatus || 'pay_at_counter',
      createdAt: now.toISOString(),
      expiresAt,
      estimatedMinutes: orderData.estimatedMinutes || (orderData.category === 'Beverage' ? 4 : orderData.category === 'Fast Food' ? 6 : 8),
      pickupPin,
      specialInstructions: orderData.specialInstructions,
      isDemoToken: true,
    };

    setTokens((prev) => [newOrder, ...prev]);
    setUserTokenIds((prev) => [formattedTokenCode, ...prev.filter((id) => id !== formattedTokenCode)]);
    return newOrder;
  };

  const updateTokenStatus = (tokenId: string, status: OrderStatus) => {
    setTokens((prev) =>
      prev.map((order) => {
        if (order.id !== tokenId && order.tokenCode !== tokenId) return order;
        const updated = { ...order, status };
        if (status === 'ready' && !order.readyAt) {
          updated.readyAt = new Date().toISOString();
          playAudioChime();
        }
        if (status === 'completed' && !order.completedAt) {
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      })
    );
  };

  const advanceTokenStatus = (tokenId: string) => {
    const order = tokens.find((t) => t.id === tokenId || t.tokenCode === tokenId);
    if (!order) return;

    const sequence: Record<OrderStatus, OrderStatus> = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'completed',
      completed: 'completed',
      cancelled: 'cancelled',
    };

    const nextStatus = sequence[order.status];
    updateTokenStatus(order.id, nextStatus);
  };

  const serveNextToken = (categoryPrefix?: MainCategoryPrefix): TokenOrder | null => {
    const eligible = tokens
      .filter((t) => {
        if (categoryPrefix && t.categoryPrefix !== categoryPrefix) return false;
        return t.status === 'pending' || t.status === 'preparing';
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (eligible.length === 0) return null;

    const candidate = eligible[0];
    const newStatus: OrderStatus = candidate.status === 'pending' ? 'preparing' : 'ready';
    updateTokenStatus(candidate.id, newStatus);
    if (newStatus === 'ready') {
      playAudioChime();
    }
    return { ...candidate, status: newStatus };
  };

  const markTokenCompleted = (tokenId: string) => {
    updateTokenStatus(tokenId, 'completed');
  };

  const cancelToken = (tokenId: string) => {
    updateTokenStatus(tokenId, 'cancelled');
  };

  const removeToken = (tokenId: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== tokenId && t.tokenCode !== tokenId));
    setUserTokenIds((prev) => prev.filter((id) => id !== tokenId));
  };

  const refreshTokens = () => {
    setTokens((prev) => [...prev]);
  };

  const toggleItemStock = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const loginAdmin = (email: string, pass: string): boolean => {
    if (email.trim() && pass.trim()) {
      const user: AdminUser = {
        email: email.trim(),
        name: email.includes('@') ? email.split('@')[0].toUpperCase() : 'Cafe Staff',
        role: 'Cafe Manager',
        counterAssigned: 'All',
      };
      setAdminUser(user);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminUser(null);
  };

  const resetToDefaultData = () => {
    setTokens(INITIAL_ORDERS);
    setMenuItems(INITIAL_MENU_ITEMS);
    setUserTokenIds(['FF-001', 'OT-001', 'BV-002']);
  };

  const getTokenByIdOrNumber = (query: string): TokenOrder | undefined => {
    return findTokenInQueue(tokens, query);
  };

  // Derive active serving tokens for counters
  const readyTokens = tokens.filter((t) => t.status === 'ready');
  const counter1Serving = readyTokens.find((t) => t.counter === 'Counter 1') || 
    tokens.find((t) => t.counter === 'Counter 1' && t.status === 'preparing') || null;
  const counter2Serving = readyTokens.find((t) => t.counter === 'Counter 2') || 
    tokens.find((t) => t.counter === 'Counter 2' && t.status === 'preparing') || null;

  // Derived user recent tokens
  const recentUserTokens = tokens.filter((t) => userTokenIds.includes(t.id));

  // Derived stats
  const activeTokens = tokens.filter((t) => t.status === 'pending' || t.status === 'preparing');
  const readyTokensList = tokens.filter((t) => t.status === 'ready');
  const totalRev = tokens
    .filter((t) => t.status !== 'cancelled')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const stats: CafeStats = {
    todayTokensCount: tokens.length,
    activeOrdersCount: activeTokens.length,
    readyOrdersCount: readyTokensList.length,
    avgWaitMinutes: 7,
    totalRevenue: totalRev,
  };

  return (
    <CafeContext.Provider
      value={{
        menuItems,
        tokens,
        stats,
        currentServingTokens: { counter1: counter1Serving, counter2: counter2Serving },
        recentUserTokens,
        adminUser,
        isAdminAuthenticated: !!adminUser,
        generateToken,
        updateTokenStatus,
        advanceTokenStatus,
        serveNextToken,
        markTokenCompleted,
        cancelToken,
        removeToken,
        refreshTokens,
        toggleItemStock,
        loginAdmin,
        logoutAdmin,
        resetToDefaultData,
        playChime: playAudioChime,
        getTokenByIdOrNumber,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
