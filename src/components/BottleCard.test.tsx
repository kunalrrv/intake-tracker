import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BottleCard from './BottleCard';
import { Bottle, BottleStatus } from '../types';

const mockBottle: Bottle = {
  id: '1',
  name: 'Test Whiskey',
  type: 'Whiskey',
  purchaseDate: '2023-10-01T10:00:00Z',
  price: 50,
  volume: 750,
  status: BottleStatus.UNOPENED,
  uid: 'user123',
};

describe('BottleCard', () => {
  it('renders bottle information correctly', () => {
    render(
      <BottleCard
        bottle={mockBottle}
        onMarkAsFinished={vi.fn()}
        onDelete={vi.fn()}
        currency="$"
      />
    );

    expect(screen.getByText('Test Whiskey')).toBeInTheDocument();
    expect(screen.getByText('Whiskey')).toBeInTheDocument();
    expect(screen.getByText('Oct 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('750ml')).toBeInTheDocument();
  });

  it('calls onMarkAsFinished when the finish button is clicked', () => {
    const handleMarkAsFinished = vi.fn();
    render(
      <BottleCard
        bottle={mockBottle}
        onMarkAsFinished={handleMarkAsFinished}
        onDelete={vi.fn()}
        currency="$"
      />
    );

    const finishButton = screen.getByTitle('Mark as Finished');
    fireEvent.click(finishButton);

    expect(handleMarkAsFinished).toHaveBeenCalledWith('1');
    expect(handleMarkAsFinished).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <BottleCard
        bottle={mockBottle}
        onMarkAsFinished={vi.fn()}
        onDelete={handleDelete}
        currency="$"
      />
    );

    const deleteButton = screen.getByTitle('Delete Record');
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith('1');
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('does not show finish button if bottle is already finished', () => {
    const finishedBottle: Bottle = {
      ...mockBottle,
      status: BottleStatus.FINISHED,
      finishedAt: '2023-10-15T10:00:00Z',
    };

    render(
      <BottleCard
        bottle={finishedBottle}
        onMarkAsFinished={vi.fn()}
        onDelete={vi.fn()}
        currency="$"
      />
    );

    expect(screen.queryByTitle('Mark as Finished')).not.toBeInTheDocument();
    expect(screen.getByText('Finished: Oct 15')).toBeInTheDocument();
  });
});
