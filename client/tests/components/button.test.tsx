import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders its label and responds to clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save changes</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled while a request is in flight', () => {
    render(<Button disabled>Working</Button>);
    expect(screen.getByRole('button', { name: 'Working' })).toBeDisabled();
  });
});
