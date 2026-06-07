import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ConsumptionItem,
  EventSummary,
  LunchEventDetail,
  LunchEventListItem,
  Participant,
  PaymentMethod
} from '../models/lunch-event.model';

@Injectable({ providedIn: 'root' })
export class LunchEventsApiService {
  private readonly baseUrl = 'https://cuentas-claras-d5qx.onrender.com/api';

  constructor(private readonly http: HttpClient) {}

  listLunchEvents(): Observable<LunchEventListItem[]> {
    return this.http.get<LunchEventListItem[]>(`${this.baseUrl}/lunch-events`);
  }

  createLunchEvent(payload: {
    name: string;
    event_date: string;
    payer_name: string;
    description?: string;
  }): Observable<LunchEventDetail> {
    return this.http.post<LunchEventDetail>(`${this.baseUrl}/lunch-events`, payload);
  }

  getLunchEvent(id: number): Observable<LunchEventDetail> {
    return this.http.get<LunchEventDetail>(`${this.baseUrl}/lunch-events/${id}`);
  }

  deleteLunchEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/lunch-events/${id}`);
  }

  createParticipant(eventId: number, fullName: string): Observable<Participant> {
    return this.http.post<Participant>(`${this.baseUrl}/lunch-events/${eventId}/participants`, {
      full_name: fullName
    });
  }

  deleteParticipant(participantId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/participants/${participantId}`);
  }

  addConsumptionItem(participantId: number, payload: { description: string; price: number }) {
    return this.http.post(`${this.baseUrl}/participants/${participantId}/items`, payload);
  }

  updateConsumptionItem(
    itemId: number,
    payload: { description: string; price: number }
  ): Observable<ConsumptionItem> {
    return this.http.put<ConsumptionItem>(`${this.baseUrl}/items/${itemId}`, payload);
  }

  markPaid(participantId: number, paymentMethod: PaymentMethod) {
    return this.http.patch(`${this.baseUrl}/participants/${participantId}/mark-paid`, {
      payment_method: paymentMethod
    });
  }

  markPending(participantId: number) {
    return this.http.patch(`${this.baseUrl}/participants/${participantId}/mark-pending`, {});
  }

  getSummary(eventId: number): Observable<EventSummary> {
    return this.http.get<EventSummary>(`${this.baseUrl}/lunch-events/${eventId}/summary`);
  }
}
