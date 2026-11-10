import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, EmptyState, Pagination, StatusBadge } from '../components/ui';
import { luhnFreeCardFormat, money, validateAddress, validateCard, validateEmail, validatePassword } from '../utils/format';

describe('validators', () => {
  it('validates passwords', () => {
    expect(validatePassword('short1')).toBeTruthy();
    expect(validatePassword('allletters')).toBeTruthy();
    expect(validatePassword('Passw0rdx')).toBe('');
  });
  it('validates email', () => {
    expect(validateEmail('nope')).toBeTruthy();
    expect(validateEmail('a@b.co')).toBe('');
  });
  it('validates card', () => {
    expect(Object.keys(validateCard({ number: '1234', expiry: '1/1', cvc: '1' }))).toHaveLength(3);
    expect(validateCard({ number: '4242 4242 4242 4242', expiry: '12/99', cvc: '123' })).toEqual({});
    expect(validateCard({ number: '4242424242424242', expiry: '01/20', cvc: '123' }).expiry).toBe('Card has expired');
  });
  it('validates address', () => {
    expect(validateAddress({ full_name: '', line1: '', city: '', state: '', postal_code: '', country: '', phone: '' }).full_name).toBe('Required');
  });
  it('formats', () => {
    expect(luhnFreeCardFormat('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(money('12.5')).toBe('$12.50');
  });
});

describe('ui kit', () => {
  it('renders badges and status', () => {
    render(<><Badge tone="green">OK</Badge><StatusBadge status="payment_failed" /></>);
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Payment failed')).toBeInTheDocument();
  });
  it('renders empty state', () => {
    render(<EmptyState title="Nothing here" message="Add something" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
  it('hides pagination for a single page', () => {
    const { container } = render(<Pagination page={1} pageSize={10} total={5} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
