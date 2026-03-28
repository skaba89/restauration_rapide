// ============================================
// Restaurant OS - Loyalty Program Service
// Points, rewards, tiers, and campaigns
// ============================================

import { logger } from '@/lib/logger';

// ============================================
// Loyalty Types
// ============================================

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type RewardType = 'discount' | 'free_item' | 'cashback' | 'free_delivery' | 'special_access';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface LoyaltyConfig {
  pointsPerFCFA: number; // Points earned per FCFA spent
  minimumOrderForPoints: number;
  pointsExpiryDays: number;
  tiers: LoyaltyTierConfig[];
}

export interface LoyaltyTierConfig {
  tier: LoyaltyTier;
  name: string;
  minPoints: number;
  multiplier: number; // Points multiplier
  benefits: string[];
  color: string;
  icon: string;
}

export interface CustomerLoyalty {
  customerId: string;
  customerName: string;
  customerPhone: string;
  tier: LoyaltyTier;
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalSpent: number;
  ordersCount: number;
  memberSince: Date;
  lastActivity: Date;
  nextTierPoints: number;
  progressToNextTier: number; // 0-100
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';
  points: number;
  balance: number;
  reason: string;
  orderId?: string;
  rewardId?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointsCost: number;
  value: number; // Discount percentage, cashback amount, etc.
  applicableItems?: string[]; // Product IDs for free items
  minTier?: LoyaltyTier;
  maxRedemptions?: number;
  currentRedemptions: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  image?: string;
}

export interface LoyaltyCampaign {
  id: string;
  name: string;
  description: string;
  type: 'points_multiplier' | 'bonus_points' | 'double_points' | 'special_reward';
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  config: {
    multiplier?: number;
    bonusPoints?: number;
    minOrderValue?: number;
    applicableTiers?: LoyaltyTier[];
  };
  targetAudience: {
    tiers?: LoyaltyTier[];
    minOrders?: number;
    inactiveDays?: number;
  };
  stats: {
    participants: number;
    pointsEarned: number;
    rewardsRedeemed: number;
  };
}

export interface ReferralProgram {
  referrerReward: number; // Points
  refereeReward: number; // Points
  refereeDiscount: number; // Percentage
  minOrderValue: number;
  maxReferrals: number;
}

export interface LoyaltyStats {
  totalMembers: number;
  activeMembers: number;
  pointsInCirculation: number;
  pointsEarnedThisMonth: number;
  pointsRedeemedThisMonth: number;
  averagePointsPerMember: number;
  tierDistribution: Record<LoyaltyTier, number>;
  topEarners: Array<{
    customerId: string;
    name: string;
    pointsEarned: number;
  }>;
  topRedeemers: Array<{
    customerId: string;
    name: string;
    pointsRedeemed: number;
  }>;
}

// ============================================
// Loyalty Service Class
// ============================================

class LoyaltyService {
  private config: LoyaltyConfig;
  private customers: Map<string, CustomerLoyalty> = new Map();
  private transactions: LoyaltyTransaction[] = [];
  private rewards: LoyaltyReward[] = [];
  private campaigns: LoyaltyCampaign[] = [];

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializeDemoData();
  }

  /**
   * Get default loyalty configuration
   */
  private getDefaultConfig(): LoyaltyConfig {
    return {
      pointsPerFCFA: 0.01, // 1 point per 100 FCFA
      minimumOrderForPoints: 1000,
      pointsExpiryDays: 365,
      tiers: [
        { tier: 'bronze', name: 'Bronze', minPoints: 0, multiplier: 1, benefits: ['1 point par 100 FCFA'], color: '#CD7F32', icon: '🥉' },
        { tier: 'silver', name: 'Argent', minPoints: 500, multiplier: 1.25, benefits: ['1.25 points par 100 FCFA', '5% de remise'], color: '#C0C0C0', icon: '🥈' },
        { tier: 'gold', name: 'Or', minPoints: 2000, multiplier: 1.5, benefits: ['1.5 points par 100 FCFA', '10% de remise', 'Livraison gratuite'], color: '#FFD700', icon: '🥇' },
        { tier: 'platinum', name: 'Platine', minPoints: 5000, multiplier: 2, benefits: ['2 points par 100 FCFA', '15% de remise', 'Livraison gratuite', 'Accès prioritaire'], color: '#E5E4E2', icon: '💎' },
        { tier: 'diamond', name: 'Diamant', minPoints: 10000, multiplier: 2.5, benefits: ['2.5 points par 100 FCFA', '20% de remise', 'Livraison gratuite', 'Menu exclusif', 'Concierge'], color: '#B9F2FF', icon: '💠' },
      ],
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Demo customers
    const demoCustomers: CustomerLoyalty[] = [
      { customerId: '1', customerName: 'Kouamé Jean', customerPhone: '+225 07 00 00 01', tier: 'gold', currentPoints: 3250, totalPointsEarned: 8750, totalPointsRedeemed: 5500, totalSpent: 585000, ordersCount: 47, memberSince: new Date('2023-01-15'), lastActivity: new Date('2024-03-25'), nextTierPoints: 1750, progressToNextTier: 65 },
      { customerId: '2', customerName: 'Aya Marie', customerPhone: '+225 07 00 00 02', tier: 'silver', currentPoints: 890, totalPointsEarned: 2340, totalPointsRedeemed: 1450, totalSpent: 156000, ordersCount: 28, memberSince: new Date('2023-03-01'), lastActivity: new Date('2024-03-24'), nextTierPoints: 1110, progressToNextTier: 44 },
      { customerId: '3', customerName: 'Koné Ibrahim', customerPhone: '+225 07 00 00 03', tier: 'platinum', currentPoints: 6780, totalPointsEarned: 15200, totalPointsRedeemed: 8420, totalSpent: 1015000, ordersCount: 65, memberSince: new Date('2022-06-15'), lastActivity: new Date('2024-03-25'), nextTierPoints: 3220, progressToNextTier: 68 },
      { customerId: '4', customerName: 'Diallo Fatou', customerPhone: '+225 07 00 00 04', tier: 'bronze', currentPoints: 320, totalPointsEarned: 320, totalPointsRedeemed: 0, totalSpent: 32000, ordersCount: 5, memberSince: new Date('2024-02-01'), lastActivity: new Date('2024-03-20'), nextTierPoints: 180, progressToNextTier: 64 },
      { customerId: '5', customerName: 'Touré Amadou', customerPhone: '+225 07 00 00 05', tier: 'gold', currentPoints: 2890, totalPointsEarned: 7650, totalPointsRedeemed: 4760, totalSpent: 510000, ordersCount: 42, memberSince: new Date('2023-02-10'), lastActivity: new Date('2024-03-23'), nextTierPoints: 2110, progressToNextTier: 58 },
    ];

    demoCustomers.forEach(c => this.customers.set(c.customerId, c));

    // Demo rewards
    this.rewards = [
      { id: '1', name: '5% de réduction', description: '5% de réduction sur votre prochaine commande', type: 'discount', pointsCost: 100, value: 5, isActive: true, startDate: new Date('2024-01-01'), currentRedemptions: 156 },
      { id: '2', name: '10% de réduction', description: '10% de réduction sur votre prochaine commande', type: 'discount', pointsCost: 200, value: 10, minTier: 'silver', isActive: true, startDate: new Date('2024-01-01'), currentRedemptions: 89 },
      { id: '3', name: 'Boisson gratuite', description: 'Une boisson gratuite de votre choix', type: 'free_item', pointsCost: 150, value: 1, minTier: 'bronze', isActive: true, startDate: new Date('2024-01-01'), currentRedemptions: 234 },
      { id: '4', name: 'Dessert gratuit', description: 'Un dessert gratuit de votre choix', type: 'free_item', pointsCost: 250, value: 1, minTier: 'silver', isActive: true, startDate: new Date('2024-01-01'), currentRedemptions: 98 },
      { id: '5', name: 'Livraison gratuite', description: 'Livraison gratuite sur votre prochaine commande', type: 'free_delivery', pointsCost: 100, value: 1, isActive: true, startDate: new Date('2024-01-01'), currentRedemptions: 312 },
      { id: '6', name: 'Cashback 2000 FCFA', description: '2000 FCFA de cashback sur votre compte', type: 'cashback', pointsCost: 400, value: 2000, minTier: 'gold', isActive: true, startDate: new Date('2024-01-01'), currentRedemptions: 45 },
      { id: '7', name: '15% de réduction', description: '15% de réduction - Exclusif Platine', type: 'discount', pointsCost: 350, value: 15, minTier: 'platinum', isActive: true, startDate: new Date('2024-01-01'), currentRedemptions: 23 },
      { id: '8', name: 'Menu dégustation', description: 'Accès au menu dégustation exclusif', type: 'special_access', pointsCost: 500, value: 1, minTier: 'diamond', isActive: true, startDate: new Date('2024-01-01'), currentRedemptions: 8, maxRedemptions: 50 },
    ];

    // Demo campaigns
    this.campaigns = [
      {
        id: '1',
        name: 'Double Points Weekend',
        description: 'Gagnez le double de points chaque weekend',
        type: 'double_points',
        status: 'active',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-04-30'),
        config: { multiplier: 2 },
        targetAudience: { tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] },
        stats: { participants: 245, pointsEarned: 15600, rewardsRedeemed: 89 },
      },
      {
        id: '2',
        name: 'Bonus Bienvenue',
        description: '100 points bonus pour les nouveaux membres',
        type: 'bonus_points',
        status: 'active',
        startDate: new Date('2024-01-01'),
        config: { bonusPoints: 100 },
        targetAudience: { minOrders: 0 },
        stats: { participants: 156, pointsEarned: 15600, rewardsRedeemed: 0 },
      },
    ];
  }

  /**
   * Get loyalty configuration
   */
  getConfig(): LoyaltyConfig {
    return this.config;
  }

  /**
   * Get customer loyalty info
   */
  async getCustomerLoyalty(customerId: string): Promise<CustomerLoyalty | null> {
    return this.customers.get(customerId) || null;
  }

  /**
   * Get all customers with loyalty info
   */
  async getAllCustomers(filters?: { tier?: LoyaltyTier; minPoints?: number }): Promise<CustomerLoyalty[]> {
    let customers = Array.from(this.customers.values());

    if (filters) {
      if (filters.tier) {
        customers = customers.filter(c => c.tier === filters.tier);
      }
      if (filters.minPoints) {
        customers = customers.filter(c => c.currentPoints >= filters.minPoints!);
      }
    }

    return customers.sort((a, b) => b.currentPoints - a.currentPoints);
  }

  /**
   * Calculate tier from points
   */
  private calculateTier(points: number): LoyaltyTier {
    const tiers = [...this.config.tiers].reverse();
    for (const tier of tiers) {
      if (points >= tier.minPoints) {
        return tier.tier;
      }
    }
    return 'bronze';
  }

  /**
   * Calculate points for an order
   */
  calculateOrderPoints(orderAmount: number, customerId?: string): number {
    if (orderAmount < this.config.minimumOrderForPoints) {
      return 0;
    }

    let multiplier = 1;
    if (customerId) {
      const customer = this.customers.get(customerId);
      if (customer) {
        const tierConfig = this.config.tiers.find(t => t.tier === customer.tier);
        if (tierConfig) {
          multiplier = tierConfig.multiplier;
        }
      }
    }

    const basePoints = Math.floor(orderAmount * this.config.pointsPerFCFA);
    return Math.floor(basePoints * multiplier);
  }

  /**
   * Award points for an order
   */
  async awardOrderPoints(
    customerId: string,
    orderId: string,
    orderAmount: number
  ): Promise<LoyaltyTransaction> {
    const customer = this.customers.get(customerId);
    if (!customer) throw new Error('Customer not found');

    const points = this.calculateOrderPoints(orderAmount, customerId);
    const newBalance = customer.currentPoints + points;
    const newTotalEarned = customer.totalPointsEarned + points;

    // Update customer
    customer.currentPoints = newBalance;
    customer.totalPointsEarned = newTotalEarned;
    customer.totalSpent += orderAmount;
    customer.ordersCount++;
    customer.lastActivity = new Date();

    // Check for tier upgrade
    const newTier = this.calculateTier(customer.totalPointsEarned);
    if (newTier !== customer.tier) {
      customer.tier = newTier;
    }

    // Update progress to next tier
    const currentTierIndex = this.config.tiers.findIndex(t => t.tier === customer.tier);
    const nextTier = this.config.tiers[currentTierIndex + 1];
    if (nextTier) {
      customer.nextTierPoints = nextTier.minPoints - customer.totalPointsEarned;
      const progressInTier = customer.totalPointsEarned - this.config.tiers[currentTierIndex].minPoints;
      const pointsToNext = nextTier.minPoints - this.config.tiers[currentTierIndex].minPoints;
      customer.progressToNextTier = Math.round((progressInTier / pointsToNext) * 100);
    } else {
      customer.nextTierPoints = 0;
      customer.progressToNextTier = 100;
    }

    // Create transaction
    const transaction: LoyaltyTransaction = {
      id: `txn-${Date.now()}`,
      customerId,
      customerName: customer.customerName,
      type: 'earned',
      points,
      balance: newBalance,
      reason: `Points gagnés pour la commande ${orderId}`,
      orderId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.pointsExpiryDays * 24 * 60 * 60 * 1000),
    };

    this.transactions.push(transaction);
    return transaction;
  }

  /**
   * Redeem points for a reward
   */
  async redeemReward(
    customerId: string,
    rewardId: string
  ): Promise<{ success: boolean; transaction?: LoyaltyTransaction; message?: string }> {
    const customer = this.customers.get(customerId);
    if (!customer) return { success: false, message: 'Client non trouvé' };

    const reward = this.rewards.find(r => r.id === rewardId);
    if (!reward) return { success: false, message: 'Récompense non trouvée' };

    if (!reward.isActive) return { success: false, message: 'Récompense non disponible' };

    if (customer.currentPoints < reward.pointsCost) {
      return { success: false, message: 'Points insuffisants' };
    }

    if (reward.minTier) {
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      if (tierOrder.indexOf(customer.tier) < tierOrder.indexOf(reward.minTier)) {
        return { success: false, message: `Nécessite le niveau ${reward.minTier}` };
      }
    }

    if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
      return { success: false, message: 'Limite de rachat atteinte' };
    }

    // Redeem points
    const newBalance = customer.currentPoints - reward.pointsCost;
    customer.currentPoints = newBalance;
    customer.totalPointsRedeemed += reward.pointsCost;

    // Update reward
    reward.currentRedemptions++;

    // Create transaction
    const transaction: LoyaltyTransaction = {
      id: `txn-${Date.now()}`,
      customerId,
      customerName: customer.customerName,
      type: 'redeemed',
      points: -reward.pointsCost,
      balance: newBalance,
      reason: `Récompense: ${reward.name}`,
      rewardId,
      createdAt: new Date(),
    };

    this.transactions.push(transaction);

    return { success: true, transaction };
  }

  /**
   * Get available rewards
   */
  async getRewards(customerId?: string): Promise<LoyaltyReward[]> {
    let rewards = this.rewards.filter(r => r.isActive);

    if (customerId) {
      const customer = this.customers.get(customerId);
      if (customer) {
        const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
        const customerTierIndex = tierOrder.indexOf(customer.tier);
        
        rewards = rewards.filter(r => {
          if (!r.minTier) return true;
          return tierOrder.indexOf(r.minTier) <= customerTierIndex;
        });
      }
    }

    return rewards.sort((a, b) => a.pointsCost - b.pointsCost);
  }

  /**
   * Get transactions
   */
  async getTransactions(customerId?: string, limit: number = 50): Promise<LoyaltyTransaction[]> {
    let transactions = [...this.transactions];

    if (customerId) {
      transactions = transactions.filter(t => t.customerId === customerId);
    }

    return transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get campaigns
   */
  async getCampaigns(status?: CampaignStatus): Promise<LoyaltyCampaign[]> {
    let campaigns = [...this.campaigns];

    if (status) {
      campaigns = campaigns.filter(c => c.status === status);
    }

    return campaigns;
  }

  /**
   * Get loyalty statistics
   */
  async getStats(): Promise<LoyaltyStats> {
    const customers = Array.from(this.customers.values());
    const transactions = this.transactions;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const tierDistribution: Record<LoyaltyTier, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
    };

    customers.forEach(c => tierDistribution[c.tier]++);

    const monthTransactions = transactions.filter(t => t.createdAt >= monthStart);
    const earnedThisMonth = monthTransactions
      .filter(t => t.type === 'earned' || t.type === 'bonus')
      .reduce((sum, t) => sum + t.points, 0);
    const redeemedThisMonth = monthTransactions
      .filter(t => t.type === 'redeemed')
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    const sortedByEarned = [...customers].sort((a, b) => b.totalPointsEarned - a.totalPointsEarned);
    const sortedByRedeemed = [...customers].sort((a, b) => b.totalPointsRedeemed - a.totalPointsRedeemed);

    return {
      totalMembers: customers.length,
      activeMembers: customers.filter(c => {
        const daysSinceActivity = (now.getTime() - c.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActivity <= 30;
      }).length,
      pointsInCirculation: customers.reduce((sum, c) => sum + c.currentPoints, 0),
      pointsEarnedThisMonth: earnedThisMonth,
      pointsRedeemedThisMonth: redeemedThisMonth,
      averagePointsPerMember: Math.round(
        customers.reduce((sum, c) => sum + c.currentPoints, 0) / customers.length
      ),
      tierDistribution,
      topEarners: sortedByEarned.slice(0, 5).map(c => ({
        customerId: c.customerId,
        name: c.customerName,
        pointsEarned: c.totalPointsEarned,
      })),
      topRedeemers: sortedByRedeemed.slice(0, 5).map(c => ({
        customerId: c.customerId,
        name: c.customerName,
        pointsRedeemed: c.totalPointsRedeemed,
      })),
    };
  }

  /**
   * Process referral
   */
  async processReferral(
    referrerId: string,
    refereeId: string
  ): Promise<{ referrerTransaction?: LoyaltyTransaction; refereeTransaction?: LoyaltyTransaction }> {
    const referralConfig: ReferralProgram = {
      referrerReward: 200,
      refereeReward: 100,
      refereeDiscount: 10,
      minOrderValue: 5000,
      maxReferrals: 10,
    };

    const referrer = this.customers.get(referrerId);
    const referee = this.customers.get(refereeId);

    const result: { referrerTransaction?: LoyaltyTransaction; refereeTransaction?: LoyaltyTransaction } = {};

    if (referrer) {
      referrer.currentPoints += referralConfig.referrerReward;
      referrer.totalPointsEarned += referralConfig.referrerReward;

      result.referrerTransaction = {
        id: `txn-${Date.now()}-ref`,
        customerId: referrerId,
        customerName: referrer.customerName,
        type: 'bonus',
        points: referralConfig.referrerReward,
        balance: referrer.currentPoints,
        reason: 'Bonus de parrainage',
        createdAt: new Date(),
      };
      this.transactions.push(result.referrerTransaction);
    }

    if (referee) {
      referee.currentPoints += referralConfig.refereeReward;
      referee.totalPointsEarned += referralConfig.refereeReward;

      result.refereeTransaction = {
        id: `txn-${Date.now()}-ref2`,
        customerId: refereeId,
        customerName: referee.customerName,
        type: 'bonus',
        points: referralConfig.refereeReward,
        balance: referee.currentPoints,
        reason: 'Bonus de bienvenue (parrainage)',
        createdAt: new Date(),
      };
      this.transactions.push(result.refereeTransaction);
    }

    return result;
  }
}

// Export singleton instance
export const loyaltyService = new LoyaltyService();
