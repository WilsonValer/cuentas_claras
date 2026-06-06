export type LunchEventStatus = 'PENDING' | 'COMPLETED' | 'ARCHIVED';
export type PaymentStatus = 'PENDING' | 'PAID';
export type PaymentMethod = 'YAPE' | 'PLIN' | 'CASH' | 'TRANSFER' | 'OTHER';

export interface ConsumptionItem {
  id: number;
  participant_id: number;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: number;
  lunch_event_id: number;
  full_name: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  total: number;
  items?: ConsumptionItem[];
}

export interface EventSummary {
  total_general: number;
  total_paid: number;
  total_pending: number;
  participants: number;
  paid_count: number;
  pending_count: number;
  pending_people: Array<{
    participant_id: number;
    full_name: string;
    amount: number;
  }>;
}

export interface LunchEventListItem {
  id: number;
  name: string;
  event_date: string;
  payer_name: string;
  description: string | null;
  status: LunchEventStatus;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  total_general: number;
  total_paid: number;
  total_pending: number;
  pending_people: number;
  participant_count: number;
}

export interface LunchEventDetail {
  id: number;
  name: string;
  event_date: string;
  payer_name: string;
  description: string | null;
  status: LunchEventStatus;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  participants: Participant[];
  summary: EventSummary;
}