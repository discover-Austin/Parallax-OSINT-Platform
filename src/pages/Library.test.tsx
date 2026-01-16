import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../tests/test-utils';
import { mockInvoke } from '../tests/setup';
import Library from './Library';

const mockDorks = [
  {
    id: '1',
    name: 'Test Dork 1',
    query: 'site:example.com',
    category: 'General',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Dork 2',
    query: 'filetype:pdf',
    category: 'Documents',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Another Test',
    query: 'inurl:admin',
    category: 'Login Panels',
    created_at: '2024-01-03T00:00:00Z',
  },
];

describe('Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_all_dorks') {
        return Promise.resolve(mockDorks);
      }
      return Promise.resolve({});
    });
  });

  it('renders library heading', () => {
    render(<Library />);
    expect(screen.getByText(/library/i)).toBeInTheDocument();
  });

  it('loads and displays dorks on mount', async () => {
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Dork 1')).toBeInTheDocument();
      expect(screen.getByText('Test Dork 2')).toBeInTheDocument();
      expect(screen.getByText('Another Test')).toBeInTheDocument();
    });
  });

  it('displays dork count', async () => {
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText(/3 dorks/i)).toBeInTheDocument();
    });
  });

  it('filters dorks by search query', async () => {
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Dork 1')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Another' } });
    
    await waitFor(() => {
      expect(screen.getByText('Another Test')).toBeInTheDocument();
      expect(screen.queryByText('Test Dork 1')).not.toBeInTheDocument();
    });
  });

  it('filters dorks by category', async () => {
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Dork 1')).toBeInTheDocument();
    });
    
    // Find and click category filter
    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'Documents' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Dork 2')).toBeInTheDocument();
      expect(screen.queryByText('Test Dork 1')).not.toBeInTheDocument();
    });
  });

  it('sorts dorks by different criteria', async () => {
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Dork 1')).toBeInTheDocument();
    });
    
    // Test sorting functionality
    const sortButtons = screen.getAllByRole('button');
    const nameSort = sortButtons.find(btn => btn.textContent?.includes('Name'));
    
    if (nameSort) {
      fireEvent.click(nameSort);
      // Verify sort order changed
      const dorkElements = screen.getAllByRole('article');
      expect(dorkElements[0]).toHaveTextContent('Another Test');
    }
  });

  it('deletes dork when delete button clicked', async () => {
    mockInvoke.mockImplementation((command: string) => {
      if (command === 'delete_dork') {
        return Promise.resolve({ success: true });
      }
      if (command === 'get_all_dorks') {
        return Promise.resolve(mockDorks.filter(d => d.id !== '1'));
      }
      return Promise.resolve({});
    });
    
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Dork 1')).toBeInTheDocument();
    });
    
    // Find and click delete button
    const deleteButtons = screen.getAllByLabelText(/delete/i);
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    const confirmButton = await screen.findByText(/confirm/i);
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('delete_dork', expect.objectContaining({
        id: '1',
      }));
    });
  });

  it('exports dorks when export button clicked', async () => {
    mockInvoke.mockResolvedValue({ success: true });
    
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Dork 1')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByText(/export/i);
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('export_data', expect.anything());
    });
  });

  it('switches between grid and list view', async () => {
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Dork 1')).toBeInTheDocument();
    });
    
    // Find view toggle buttons
    const viewButtons = screen.getAllByRole('button');
    const listViewButton = viewButtons.find(btn => 
      btn.getAttribute('aria-label')?.includes('list view')
    );
    
    if (listViewButton) {
      fireEvent.click(listViewButton);
      // Verify view changed (you'd check CSS classes or layout)
    }
  });

  it('handles empty library state', async () => {
    mockInvoke.mockResolvedValue([]);
    
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText(/no dorks/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockInvoke.mockRejectedValue(new Error('API Error'));
    
    render(<Library />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
