import { StockItem, PurchaseEntry, SalesEntry, RentalOutEntry, DamageEntry } from './types';

export function calculateCurrentStock(
  item: StockItem,
  purchases: PurchaseEntry[],
  sales: SalesEntry[],
  rentals: RentalOutEntry[],
  damages: DamageEntry[]
): number {
  const totalPurchased = purchases
    .filter(p => p.itemCode === item.code)
    .reduce((sum, p) => sum + p.qty, 0);

  const totalSold = sales
    .filter(s => s.itemCode === item.code)
    .reduce((sum, s) => sum + s.qty, 0);

  // Currently out on rent
  const currentlyRented = rentals
    .filter(r => r.itemCode === item.code)
    .reduce((sum, r) => {
      const remaining = r.qty - r.returnedQty;
      return sum + Math.max(0, remaining);
    }, 0);

  const totalDamaged = damages
    .filter(d => d.itemCode === item.code)
    .reduce((sum, d) => sum + d.qty, 0);

  return item.openingStock + totalPurchased - totalSold - currentlyRented - totalDamaged;
}

// Helper to format currency in Taka (৳)
export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD')}`;
}

// Convert English numbers to Bengali numbers for localized feel
export function toBengaliNumber(num: number | string): string {
  const englishToBengaliMap: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return num.toString().replace(/[0-9]/g, (w) => englishToBengaliMap[w] || w);
}
