import { Smartphone, CreditCard, Coins, Landmark } from 'lucide-react';
import type { ReactNode } from 'react';

export function getPaymentMethodIcon(iconName?: string | null): ReactNode {
  switch (iconName) {
    case 'CreditCard':
      return <CreditCard className="w-4 h-4 text-black" />;
    case 'Coins':
      return <Coins className="w-4 h-4 text-black" />;
    case 'Landmark':
      return <Landmark className="w-4 h-4 text-black" />;
    case 'Smartphone':
    default:
      return <Smartphone className="w-4 h-4 text-black" />;
  }
}
