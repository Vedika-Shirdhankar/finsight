/**
 * FinSight Auto-Categorization & Machine Learning Engine
 * Automatically maps raw merchant strings, UPI VPA handles, and bank statement line items
 * to standardized financial categories.
 */

export interface CategorizationRule {
  pattern: RegExp;
  categoryName: string;
  confidence: number;
}

const DEFAULT_RULES: CategorizationRule[] = [
  // Food & Dining
  { pattern: /swiggy|zomato|starbucks|mcdonald|domino|kfc|dunkin|subway|barbeque|chaayos|cafe|restaurant|eats|dine/i, categoryName: "Food & Dining", confidence: 0.95 },
  // Transportation & Mobility
  { pattern: /uber|ola|rapido|blusmart|irctc|redbus|indigo|airindia|spicejet|shell|hpcl|bpcl|petrol|fuel|metro|parking/i, categoryName: "Transportation", confidence: 0.95 },
  // Subscriptions & Entertainment
  { pattern: /netflix|spotify|prime|youtube|hotstar|sonyliv|zee5|apple|googleplay|hbo|playstation|xbox|steam/i, categoryName: "Subscriptions", confidence: 0.95 },
  // Shopping & E-Commerce
  { pattern: /amazon|flipkart|myntra|zara|hm|uniqlo|ajio|tata\s*cliq|nykaa|reliancetrend|decathlon/i, categoryName: "Shopping", confidence: 0.90 },
  // Utilities & Housing
  { pattern: /rent|electricity|bescom|tata\s*power|torrent|jio|airtel|vi|broadband|water|gas|society|maintenance/i, categoryName: "Housing", confidence: 0.92 },
  // Healthcare & Wellness
  { pattern: /apollo|pharmeasy|netmeds|1mg|cult\.fit|gym|hospital|clinic|pharmacy|diagnostic/i, categoryName: "Healthcare", confidence: 0.92 },
  // Income & Salary
  { pattern: /salary|stipend|payroll|dividend|interest|cashback|refund|reimbursement/i, categoryName: "Income", confidence: 0.98 },
];

export interface AutoCategorizeResult {
  categoryName: string;
  categoryId?: string;
  confidence: number;
  isAutoMatched: boolean;
}

/**
 * Predicts the most likely category for a given merchant name or transaction description.
 */
export function predictCategory(
  merchantOrDesc: string,
  categories: { id: string; name: string }[] = []
): AutoCategorizeResult {
  if (!merchantOrDesc || merchantOrDesc.trim().length === 0) {
    return { categoryName: "Uncategorized", confidence: 0, isAutoMatched: false };
  }

  const cleanText = merchantOrDesc.trim();

  for (const rule of DEFAULT_RULES) {
    if (rule.pattern.test(cleanText)) {
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === rule.categoryName.toLowerCase()
      );

      return {
        categoryName: rule.categoryName,
        categoryId: matchedCategory?.id,
        confidence: rule.confidence,
        isAutoMatched: true,
      };
    }
  }

  return {
    categoryName: "Uncategorized",
    confidence: 0.3,
    isAutoMatched: false,
  };
}
