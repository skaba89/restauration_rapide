import { z } from 'zod';

const expenseSchema = z.object({
  organizationId: z.string().optional(),
  category: z.enum(['supplies', 'utilities', 'rent', 'salaries', 'maintenance', 'marketing', 'other']),
  description: z.string(),
  amount: z.number().positive(),
  date: z.string().optional(),
  receipt: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export type Expense = z.infer<typeof expenseSchema>;

export interface ExpenseWithTotal extends Expense {
  id: string;
  status: 'pending' | 'approved' | 'paid';
}

// Expense categories
const CATEGORY_CONFIG = {
  supplies: { label: 'Fournitures', color: 'bg-blue-100 text-blue-700' },
  utilities: { label: 'Services publics', color: 'bg-yellow-100 text-yellow-700' },
  rent: { label: 'Loyer', color: 'bg-purple-100 text-purple-700' },
  salaries: { label: 'Salaires', color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-700' },
  marketing: { label: 'Marketing', color: 'bg-pink-100 text-pink-700' },
  other: { label: 'Autre', color: 'bg-gray-100 text-gray-700' },
};

export class ExpenseService {
  static async getExpenses(organizationId: string): Promise<Expense[]> {

    return [];
  }

  static async getExpenseStats(organizationId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    pending: number;
    approved: number;
  }> {
    const expenses = await this.getExpenses(organizationId);
    
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const byCategory = expenses.reduce((acc, e) => {
      const category = e.category;
      acc[category] = (acc[category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const pending = expenses.filter(e => e.status === 'pending').length;
    const approved = expenses.filter(e => e.status === 'approved').length;

    return {
      total,
      byCategory,
      pending,
      approved,
    };
  }
}

export default ExpenseService;