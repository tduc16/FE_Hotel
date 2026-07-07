// Types cho AI Concierge Chatbot
export type ChatIntent =
  | 'CHECK_ROOM_AVAILABILITY'
  | 'ROOM_PRICE'
  | 'ROOM_RECOMMENDATION'
  | 'SERVICE_RECOMMENDATION'
  | 'BOOKING_CONSULTATION'
  | 'BOOKING_LOOKUP'
  | 'BOOKING_GUIDANCE'
  | 'HOTEL_INFORMATION'
  | 'CONTACT_SUPPORT'
  | 'GENERAL_CHAT';

export interface ChatAction {
  label: string;
  url: string;
  primary?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: ChatIntent;
  timestamp: Date;
  isError?: boolean;
  actions?: ChatAction[];
}

export interface ChatbotResponse {
  success: boolean;
  reply: string;
  message: string;
  intent: ChatIntent;
  suggestions: string[];
  quickActions: string[];
  sessionId: string;
  actions?: ChatAction[];
  ctaButtons?: { label: string; action: string }[];
  bookingContext?: Record<string, any>;
}

export interface QuickAction {
  icon: string;
  label: string;
  message: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { icon: '✨', label: 'Tư vấn phòng phù hợp', message: 'Tôi muốn được tư vấn hạng phòng phù hợp với nhu cầu của mình' },
  { icon: '🏨', label: 'Hướng dẫn kiểm tra phòng', message: 'Tôi muốn biết cách kiểm tra phòng và đặt phòng trên website' },
  { icon: '💰', label: 'Xem giá phòng', message: 'Giá các loại phòng là bao nhiêu?' },
  { icon: '🎁', label: 'Dịch vụ khách sạn', message: 'Khách sạn có những dịch vụ gì?' },
  { icon: '📋', label: 'Tra cứu booking', message: 'Tôi muốn tra cứu booking của mình' },
  { icon: '☎', label: 'Liên hệ hỗ trợ', message: 'Tôi cần liên hệ với khách sạn' },
];
