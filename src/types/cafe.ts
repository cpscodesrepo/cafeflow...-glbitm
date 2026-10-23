export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type CafeCategory = 
  | 'All'
  | 'Beverages & Chai'
  | 'Quick Snacks'
  | 'South Indian'
  | 'Rolls & Burgers'
  | 'Meals & Combos'
  | 'Maggi & Noodles';

export type MainCategory = 'Beverage' | 'Fast Food' | 'Other';
export type MainCategoryPrefix = 'BV' | 'FF' | 'OT';

export interface MenuItem {
  id: string;
  name: string;
  hindiName?: string;
  category: CafeCategory;
  mainCategory?: MainCategory;
  price: number;
  prepTimeMinutes: number;
  isVeg: boolean;
  isAvailable: boolean;
  popular?: boolean;
  description: string;
  counter: 'Counter 1' | 'Counter 2';
  imagePlaceholderColor?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

export interface TokenOrder {
  id: string; // e.g. "BV-001", "FF-002", "GLB-148"
  tokenNumber: number; // sequential number e.g. 1
  tokenCode: string; // e.g. "BV-001"
  categoryPrefix: MainCategoryPrefix; // BV | FF | OT
  category: MainCategory;
  studentName: string;
  courseName: string; // e.g. "B.Tech CSE", "B.Tech AI & ML"
  rollNumber?: string;
  phone?: string;
  department?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  counter: 'Counter 1' | 'Counter 2';
  paymentMethod: 'UPI' | 'Canteen Card' | 'Cash at Counter';
  paymentStatus: 'paid' | 'pay_at_counter';
  createdAt: string; // ISO string
  expiresAt: string; // ISO string (e.g., 45 minutes from issue)
  estimatedMinutes: number;
  readyAt?: string;
  completedAt?: string;
  pickupPin: string;
  specialInstructions?: string;
  isDemoToken?: boolean;
}

export interface CafeStats {
  todayTokensCount: number;
  activeOrdersCount: number;
  readyOrdersCount: number;
  avgWaitMinutes: number;
  totalRevenue: number;
}
