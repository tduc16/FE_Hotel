// Types cho AI Concierge Chatbot
export type ChatIntent =
  | 'CHECK_ROOM_AVAILABILITY'
  | 'ROOM_PRICE'
  | 'ROOM_RECOMMENDATION'
  | 'SERVICE_RECOMMENDATION'
  | 'BOOK_ROOM'
  | 'BOOKING_LOOKUP'
  | 'BOOKING_CANCEL'
  | 'HOTEL_INFORMATION'
  | 'CONTACT_SUPPORT'
  | 'GENERAL_CHAT';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: ChatIntent;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatbotResponse {
  success: boolean;
  reply: string;
  intent: ChatIntent;
  suggestions: string[];
  sessionId: string;
}

export interface QuickAction {
  icon: string;
  label: string;
  message: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { icon: '🏨', label: 'Tìm phòng trống', message: 'Cho tôi xem các phòng trống hiện có' },
  { icon: '💰', label: 'Xem giá phòng', message: 'Giá các loại phòng là bao nhiêu?' },
  { icon: '✨', label: 'Gợi ý phòng phù hợp', message: 'Hãy gợi ý phòng phù hợp cho tôi' },
  { icon: '🎁', label: 'Dịch vụ khách sạn', message: 'Khách sạn có những dịch vụ gì?' },
  { icon: '📋', label: 'Tra cứu booking', message: 'Tôi muốn tra cứu booking của mình' },
  { icon: '☎', label: 'Liên hệ hỗ trợ', message: 'Tôi cần liên hệ với khách sạn' },
];
