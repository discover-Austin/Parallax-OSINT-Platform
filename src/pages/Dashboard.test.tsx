import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../tests/test-utils';
import { mockInvoke } from '../tests/setup';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    mockInvoke.mockImplementation((command: string) => {
      switch (command) {
        case 'get_app_config':
          return Promise.resolve({
            version: '1.0.0',
            license_status: 'active',
            tier: 'free',
          });
        case 'get_all_dorks':
          return Promise.resolve([
            { id: '1', name: 'Test Dork 1', query: 'test query 1' },
            { id: '2', name: 'Test Dork 2', query: 'test query 2' },
          ]);
        case 'get_usage_stats':
          return Promise.resolve({
            ai_generations_today: 3,
            ai_generations_limit: 10,
            dorks_saved: 2,
            dorks_limit: 50,
          });
        default:
          return Promise.resolve({});
      }
    });
  });

  it('renders dashboard heading', async () => {
    render(<Dashboard />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('displays welcome message', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/welcome to parallax/i)).toBeInTheDocument();
    });
  });

  it('shows app version', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/1\.0\.0/)).toBeInTheDocument();
    });
  });

  it('displays license tier', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/free/i)).toBeInTheDocument();
    });
  });

  it('shows saved dorks count', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });

  it('displays AI usage statistics', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/3/)).toBeInTheDocument(); // AI generations
      expect(screen.getByText(/10/)).toBeInTheDocument(); // Limit
    });
  });

  it('renders quick action buttons', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/new dork/i)).toBeInTheDocument();
      expect(screen.getByText(/browse library/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockInvoke.mockRejectedValue(new Error('API Error'));
    
    render(<Dashboard />);
    
    // Should still render without crashing
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('calls get_app_config on mount', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('get_app_config');
    });
  });

  it('calls get_all_dorks on mount', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('get_all_dorks');
    });
  });
});
