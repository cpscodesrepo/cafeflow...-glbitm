/**
 * CafeFlow Shared Queue Service
 * Provides centralized queue logic, category isolation (BV, FF, OT),
 * position calculations, and estimated waiting time estimation.
 *
 * NOTE: Operates on local mock state. Real-time multi-device synchronization
 * will be connected via Firebase Firestore in a future milestone.
 */

import { TokenOrder, MainCategoryPrefix, OrderStatus } from '../types/cafe';
import { isTokenExpired, TOKEN_EXPIRY_MINUTES } from '../utils/tokenTime';

export const QUEUE_SIMULATION_DISCLAIMER =
  'Simulated Mock Queue: Token data and status updates are managed in local device state. Real-time multi-device synchronization will be enabled upon Firebase integration.';

export interface CategoryQueueSummary {
  prefix: MainCategoryPrefix;
  categoryName: string;
  counter: string;
  currentlyServing: TokenOrder | null;
  totalWaiting: number;
  avgPrepTimePerOrder: number;
}

/**
 * Filter tokens by their category prefix (BV, FF, OT)
 */
export function getTokensByCategory(
  tokens: TokenOrder[],
  prefix: MainCategoryPrefix
): TokenOrder[] {
  return tokens.filter((t) => t.categoryPrefix === prefix || t.id.startsWith(prefix));
}

/**
 * Get the currently serving token for a specific category queue.
 * Prioritizes 'ready' status (standing at counter), followed by 'preparing'.
 */
export function getCurrentlyServingByCategory(
  tokens: TokenOrder[],
  prefix: MainCategoryPrefix
): TokenOrder | null {
  const catTokens = getTokensByCategory(tokens, prefix);
  
  // 1. First look for token marked ready (ready to be picked up)
  const readyToken = catTokens.find((t) => t.status === 'ready' && !isTokenExpired(t.createdAt, TOKEN_EXPIRY_MINUTES));
  if (readyToken) return readyToken;

  // 2. Otherwise look for oldest active preparing order
  const preparingTokens = catTokens.filter(
    (t) => t.status === 'preparing' && !isTokenExpired(t.createdAt, TOKEN_EXPIRY_MINUTES)
  );
  if (preparingTokens.length > 0) {
    return preparingTokens[preparingTokens.length - 1]; // oldest preparing
  }

  return null;
}

/**
 * Calculates how many people are ahead of targetToken in the SAME category queue.
 * Only counts non-expired, pending or preparing orders created before this token.
 */
export function getPeopleAheadInCategory(
  tokens: TokenOrder[],
  targetToken: TokenOrder
): number {
  // If target token is already ready, served, cancelled, or expired, 0 are ahead
  if (
    targetToken.status === 'ready' ||
    targetToken.status === 'completed' ||
    targetToken.status === 'cancelled' ||
    isTokenExpired(targetToken.createdAt, TOKEN_EXPIRY_MINUTES)
  ) {
    return 0;
  }

  const catTokens = getTokensByCategory(tokens, targetToken.categoryPrefix);
  const targetTime = new Date(targetToken.createdAt).getTime();

  const ahead = catTokens.filter((t) => {
    if (t.id === targetToken.id) return false;
    if (t.status !== 'pending' && t.status !== 'preparing') return false;
    if (isTokenExpired(t.createdAt, TOKEN_EXPIRY_MINUTES)) return false;

    const tTime = new Date(t.createdAt).getTime();
    // Created earlier or lower sequence token number
    return tTime < targetTime || (tTime === targetTime && t.tokenNumber < targetToken.tokenNumber);
  });

  return ahead.length;
}

/**
 * Estimates waiting time based on category queue density.
 * Clearly tagged as an estimate.
 */
export function getEstimatedWaitingMinutes(
  tokens: TokenOrder[],
  targetToken: TokenOrder
): { minMinutes: number; maxMinutes: number; formattedText: string } {
  // If ready, 0 mins
  if (targetToken.status === 'ready') {
    return { minMinutes: 0, maxMinutes: 0, formattedText: 'Ready Now for Pickup' };
  }
  if (targetToken.status === 'completed') {
    return { minMinutes: 0, maxMinutes: 0, formattedText: 'Completed' };
  }
  if (targetToken.status === 'cancelled') {
    return { minMinutes: 0, maxMinutes: 0, formattedText: 'Cancelled' };
  }
  if (isTokenExpired(targetToken.createdAt, TOKEN_EXPIRY_MINUTES)) {
    return { minMinutes: 0, maxMinutes: 0, formattedText: 'Validity Expired' };
  }

  const peopleAhead = getPeopleAheadInCategory(tokens, targetToken);

  // Minutes per dish by category
  const prepRates: Record<MainCategoryPrefix, { perOrder: number; base: number }> = {
    BV: { perOrder: 2.5, base: 3 }, // Beverages
    FF: { perOrder: 4.5, base: 5 }, // Fast Food
    OT: { perOrder: 6.0, base: 7 }, // Meals & Combos
  };

  const rate = prepRates[targetToken.categoryPrefix] || { perOrder: 4, base: 5 };
  const rawWait = rate.base + peopleAhead * rate.perOrder;

  const minMinutes = Math.max(1, Math.floor(rawWait * 0.85));
  const maxMinutes = Math.max(minMinutes + 2, Math.ceil(rawWait * 1.15));

  return {
    minMinutes,
    maxMinutes,
    formattedText: `~${minMinutes}–${maxMinutes} Mins (Estimated)`,
  };
}

/**
 * Computes queue summary across all 3 categories (BV, FF, OT)
 */
export function getAllCategorySummaries(tokens: TokenOrder[]): Record<MainCategoryPrefix, CategoryQueueSummary> {
  const categories: { prefix: MainCategoryPrefix; name: string; counter: string; prepTime: number }[] = [
    { prefix: 'BV', name: 'Beverage Queue', counter: 'Counter 1', prepTime: 3 },
    { prefix: 'FF', name: 'Fast Food Queue', counter: 'Counter 1', prepTime: 5 },
    { prefix: 'OT', name: 'Other (Meals) Queue', counter: 'Counter 2', prepTime: 7 },
  ];

  const result: Partial<Record<MainCategoryPrefix, CategoryQueueSummary>> = {};

  categories.forEach((cat) => {
    const catTokens = getTokensByCategory(tokens, cat.prefix);
    const waitingCount = catTokens.filter(
      (t) => (t.status === 'pending' || t.status === 'preparing') && !isTokenExpired(t.createdAt, TOKEN_EXPIRY_MINUTES)
    ).length;

    result[cat.prefix] = {
      prefix: cat.prefix,
      categoryName: cat.name,
      counter: cat.counter,
      currentlyServing: getCurrentlyServingByCategory(tokens, cat.prefix),
      totalWaiting: waitingCount,
      avgPrepTimePerOrder: cat.prepTime,
    };
  });

  return result as Record<MainCategoryPrefix, CategoryQueueSummary>;
}

/**
 * Search token in state by exact code, numeric part, or student identifiers
 */
export function findTokenInQueue(
  tokens: TokenOrder[],
  query: string
): TokenOrder | undefined {
  const cleaned = query.trim().toUpperCase().replace('#', '');
  if (!cleaned) return undefined;

  return tokens.find((t) => {
    // Exact ID or TokenCode: BV-001
    if (t.id.toUpperCase() === cleaned) return true;
    if (t.tokenCode && t.tokenCode.toUpperCase() === cleaned) return true;

    // Without hyphens: BV001
    if (t.tokenCode && t.tokenCode.replace('-', '').toUpperCase() === cleaned) return true;

    // By prefix + number without leading zeros: BV1, FF1, OT1
    if (t.categoryPrefix && `${t.categoryPrefix}${t.tokenNumber}` === cleaned) return true;
    if (t.categoryPrefix && `${t.categoryPrefix}-${t.tokenNumber}` === cleaned) return true;

    // Pure number: "1" or "001"
    if (t.tokenNumber.toString() === cleaned || String(t.tokenNumber).padStart(3, '0') === cleaned) return true;

    // Student identifiers
    if (t.phone && t.phone === cleaned) return true;
    if (t.rollNumber && t.rollNumber.toUpperCase() === cleaned) return true;
    if (t.studentName && t.studentName.toUpperCase().includes(cleaned)) return true;

    return false;
  });
}
