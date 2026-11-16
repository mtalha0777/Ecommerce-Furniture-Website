import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { isTokenExpired } from './utils/auth';

// The header calls the API on mount. Tests must not depend on a running server.
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

const makeToken = (expSecondsFromNow) => {
  const payload = { id: 'u1', role: '1', exp: Math.floor(Date.now() / 1000) + expSecondsFromNow };
  return `header.${btoa(JSON.stringify(payload))}.signature`;
};

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

describe('isTokenExpired', () => {
  test('missing or malformed tokens count as expired', () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired('not-a-jwt')).toBe(true);
  });

  test('compares the exp claim with the current time', () => {
    expect(isTokenExpired(makeToken(3600))).toBe(false);
    expect(isTokenExpired(makeToken(-60))).toBe(true);
  });
});

describe('routing', () => {
  test('the root path shows the login form', () => {
    renderAt('/');
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  test('a protected page without a token redirects to login', () => {
    renderAt('/cart');
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test('an expired token is cleared and redirected to login', () => {
    sessionStorage.setItem('authToken', makeToken(-60));
    renderAt('/profile');
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(sessionStorage.getItem('authToken')).toBeNull();
  });
});
