import { ChatbotResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const chatbotApiService = {
  async sendMessage(
    message: string,
    sessionId?: string,
    customerToken?: string,
  ): Promise<ChatbotResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (customerToken) {
      headers['Authorization'] = `Bearer ${customerToken}`;
    }

    const res = await fetch(`${API_URL}/chatbot/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, sessionId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.message || `HTTP ${res.status}`);
    }

    return res.json();
  },

  getCustomerToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('customer_access_token');
  },

  getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('chatbot_session_id');
  },

  saveSessionId(sessionId: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chatbot_session_id', sessionId);
    }
  },
};
