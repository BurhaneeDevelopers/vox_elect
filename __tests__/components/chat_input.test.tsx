/**
 * Component tests for chat input
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInput as ChatInput } from '@/components/chat/chat_input';

// Mock stores and hooks
jest.mock('@/stores/chat_store', () => ({
  use_chat_store: () => ({
    active_zip: null,
    set_location_context: jest.fn(),
    clear_location_context: jest.fn(),
    voice_state: 'idle',
  }),
}));

jest.mock('@/hooks/use_voice', () => ({
  use_voice: () => ({
    is_supported: true,
    start_listening: jest.fn(),
    stop_listening: jest.fn(),
    speak: jest.fn(),
    stop_speaking: jest.fn(),
  }),
}));

describe('chat_input', () => {
  const mock_on_send = jest.fn();
  const mock_on_cancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field', () => {
    render(<ChatInput on_send={mock_on_send} is_loading={false} />);
    expect(screen.getByPlaceholderText(/Ask Elora/i)).toBeInTheDocument();
  });

  it('sends message on Enter key', async () => {
    render(<ChatInput on_send={mock_on_send} is_loading={false} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mock_on_send).toHaveBeenCalledWith('Test message');
    });
  });

  it('does not send on Shift+Enter', () => {
    render(<ChatInput on_send={mock_on_send} is_loading={false} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

    expect(mock_on_send).not.toHaveBeenCalled();
  });

  it('disables input when loading', () => {
    render(<ChatInput on_send={mock_on_send} is_loading={true} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows quick prompts when empty', () => {
    render(<ChatInput on_send={mock_on_send} is_loading={false} />);
    expect(screen.getByText(/How do I register to vote/i)).toBeInTheDocument();
  });

  it('limits input length', () => {
    render(<ChatInput on_send={mock_on_send} is_loading={false} />);
    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    
    const long_text = 'a'.repeat(3000);
    fireEvent.change(input, { target: { value: long_text } });

    expect(input.value.length).toBeLessThanOrEqual(2000);
  });

  it('detects ZIP code in message', async () => {
    render(<ChatInput on_send={mock_on_send} is_loading={false} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Elections in 90210' } });

    await waitFor(() => {
      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveTextContent('90210');
      expect(statusElement).toHaveTextContent('detected');
    });
  });
});
