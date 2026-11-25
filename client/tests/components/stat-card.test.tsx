import { render, screen } from '@testing-library/react';
import { Wallet } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { StatCard } from '@/components/dashboard/StatCard';

describe('StatCard', () => {
  it('shows the value, hint and trend direction', () => {
    render(
      <StatCard
        label="Fees collected"
        value="KES 120,000"
        hint="12 invoices open"
        trend={{ value: -4.5, label: 'of invoiced' }}
        icon={Wallet}
      />,
    );

    expect(screen.getByText('Fees collected')).toBeInTheDocument();
    expect(screen.getByText('KES 120,000')).toBeInTheDocument();
    expect(screen.getByText('12 invoices open')).toBeInTheDocument();
    expect(screen.getByText('4.5%')).toBeInTheDocument();
    expect(screen.getByText('4.5%')).toHaveClass('stat-trend-down');
  });
});
