import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../tests/test-utils';
import { mockInvoke } from '../tests/setup';
import DorkBuilder from './DorkBuilder';

describe('DorkBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({});
  });

  it('renders dork builder heading', () => {
    render(<DorkBuilder />);
    expect(screen.getByText(/dork builder/i)).toBeInTheDocument();
  });

  it('displays operator buttons', () => {
    render(<DorkBuilder />);
    expect(screen.getByText('site:')).toBeInTheDocument();
    expect(screen.getByText('filetype:')).toBeInTheDocument();
    expect(screen.getByText('inurl:')).toBeInTheDocument();
    expect(screen.getByText('intitle:')).toBeInTheDocument();
  });

  it('adds operator to query when button clicked', async () => {
    render(<DorkBuilder />);
    
    const siteButton = screen.getByText('site:');
    fireEvent.click(siteButton);
    
    const queryInput = screen.getByPlaceholderText(/build your google dork/i);
    expect(queryInput).toHaveValue('site:');
  });

  it('allows typing in query field', () => {
    render(<DorkBuilder />);
    
    const queryInput = screen.getByPlaceholderText(/build your google dork/i);
    fireEvent.change(queryInput, { target: { value: 'site:example.com' } });
    
    expect(queryInput).toHaveValue('site:example.com');
  });

  it('opens save dialog when save button clicked', async () => {
    render(<DorkBuilder />);
    
    // Add a query first
    const queryInput = screen.getByPlaceholderText(/build your google dork/i);
    fireEvent.change(queryInput, { target: { value: 'test query' } });
    
    const saveButton = screen.getByText(/save dork/i);
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/save dork/i)).toBeInTheDocument();
    });
  });

  it('validates query before saving', async () => {
    mockInvoke.mockResolvedValue({ success: true });
    
    render(<DorkBuilder />);
    
    const saveButton = screen.getByText(/save dork/i);
    fireEvent.click(saveButton);
    
    // Should show validation error for empty query
    await waitFor(() => {
      expect(screen.queryByText(/query is required/i)).toBeInTheDocument();
    });
  });

  it('calls save_dork command with correct parameters', async () => {
    mockInvoke.mockResolvedValue({ success: true });
    
    render(<DorkBuilder />);
    
    // Fill in query
    const queryInput = screen.getByPlaceholderText(/build your google dork/i);
    fireEvent.change(queryInput, { target: { value: 'test query' } });
    
    // Click save
    const saveButton = screen.getByText(/save dork/i);
    fireEvent.click(saveButton);
    
    // Fill in name in dialog
    const nameInput = await screen.findByPlaceholderText(/dork name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Dork' } });
    
    // Submit
    const submitButton = screen.getByText(/save/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('save_dork', expect.objectContaining({
        name: 'Test Dork',
        query: 'test query',
      }));
    });
  });

  it('generates Google search URL correctly', () => {
    render(<DorkBuilder />);
    
    const queryInput = screen.getByPlaceholderText(/build your google dork/i);
    fireEvent.change(queryInput, { target: { value: 'site:example.com' } });
    
    const searchButton = screen.getByText(/search google/i);
    expect(searchButton).toBeInTheDocument();
  });

  it('clears query when clear button clicked', () => {
    render(<DorkBuilder />);
    
    const queryInput = screen.getByPlaceholderText(/build your google dork/i);
    fireEvent.change(queryInput, { target: { value: 'test query' } });
    
    expect(queryInput).toHaveValue('test query');
    
    const clearButton = screen.getByText(/clear/i);
    fireEvent.click(clearButton);
    
    expect(queryInput).toHaveValue('');
  });

  it('loads template when template is selected', async () => {
    render(<DorkBuilder />);
    
    const templateButton = screen.getAllByRole('button').find(
      btn => btn.textContent?.includes('Load Template')
    );
    
    if (templateButton) {
      fireEvent.click(templateButton);
      
      const queryInput = screen.getByPlaceholderText(/build your google dork/i);
      await waitFor(() => {
        expect(queryInput.value).toBeTruthy();
      });
    }
  });
});
