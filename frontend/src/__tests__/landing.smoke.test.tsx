import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';

test('renders landing page headline', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  expect(screen.getByText(/Oilseed Hedging Platform/i)).toBeInTheDocument();
});
