import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ConsumptionItem,
  LunchEventDetail,
  Participant,
  PaymentMethod
} from '../../models/lunch-event.model';
import { LunchEventsApiService } from '../../services/lunch-events-api.service';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './event-detail-page.component.html',
  styleUrl: './event-detail-page.component.scss'
})
export class EventDetailPageComponent implements OnInit {
  event: LunchEventDetail | null = null;
  loading = false;
  errorMessage = '';

  paymentMethods: PaymentMethod[] = ['YAPE', 'PLIN', 'CASH', 'TRANSFER', 'OTHER'];
  paymentMethodByParticipant: Record<number, PaymentMethod> = {};
  editingItemId: number | null = null;
  editItemDraft: { description: string; price: number } = { description: '', price: 0 };
  deletingParticipantId: number | null = null;
  savingItemId: number | null = null;

  participantForm;
  itemForm;

  private eventId = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly api: LunchEventsApiService
  ) {
    this.participantForm = this.fb.nonNullable.group({
      fullName: ['', Validators.required]
    });

    this.itemForm = this.fb.nonNullable.group({
      participantId: [0, Validators.min(1)],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.eventId || Number.isNaN(this.eventId)) {
      this.errorMessage = 'ID de almuerzo invalido.';
      return;
    }

    this.loadEvent();
  }

  loadEvent(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getLunchEvent(this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
        this.paymentMethodByParticipant = {};

        if (event.participants.length && this.itemForm.value.participantId === 0) {
          this.itemForm.patchValue({ participantId: event.participants[0].id });
        }

        event.participants.forEach((participant) => {
          this.paymentMethodByParticipant[participant.id] = participant.payment_method || 'YAPE';
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo cargar el detalle del almuerzo.';
      }
    });
  }

  addParticipant(): void {
    if (this.participantForm.invalid || !this.event) {
      this.participantForm.markAllAsTouched();
      return;
    }

    const fullName = this.participantForm.getRawValue().fullName;
    this.api.createParticipant(this.event.id, fullName).subscribe({
      next: () => {
        this.participantForm.reset();
        this.loadEvent();
      },
      error: () => {
        this.errorMessage = 'No se pudo registrar el participante.';
      }
    });
  }

  addItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const value = this.itemForm.getRawValue();
    this.api
      .addConsumptionItem(value.participantId, {
        description: value.description,
        price: Number(value.price)
      })
      .subscribe({
        next: () => {
          this.itemForm.patchValue({ description: '', price: 0 });
          this.loadEvent();
        },
        error: () => {
          this.errorMessage = 'No se pudo registrar el consumo.';
        }
      });
  }

  deleteParticipant(participant: Participant): void {
    if (this.deletingParticipantId || !this.event) {
      return;
    }

    const shouldDelete = window.confirm(`Eliminar a ${participant.full_name} y todos sus consumos?`);
    if (!shouldDelete) {
      return;
    }

    this.deletingParticipantId = participant.id;
    this.api.deleteParticipant(participant.id).subscribe({
      next: () => {
        this.deletingParticipantId = null;
        if (this.itemForm.value.participantId === participant.id) {
          this.itemForm.patchValue({ participantId: 0 });
        }
        this.loadEvent();
      },
      error: () => {
        this.deletingParticipantId = null;
        this.errorMessage = 'No se pudo eliminar el participante.';
      }
    });
  }

  beginEditItem(item: ConsumptionItem): void {
    this.editingItemId = item.id;
    this.editItemDraft = {
      description: item.description,
      price: Number(item.price)
    };
  }

  cancelEditItem(): void {
    this.editingItemId = null;
    this.savingItemId = null;
    this.editItemDraft = { description: '', price: 0 };
  }

  saveItem(item: ConsumptionItem): void {
    if (this.savingItemId) {
      return;
    }

    const description = this.editItemDraft.description.trim();
    const price = Number(this.editItemDraft.price);

    if (!description || Number.isNaN(price) || price < 0) {
      this.errorMessage = 'Ingresa una descripcion y precio validos para el consumo.';
      return;
    }

    this.savingItemId = item.id;
    this.api.updateConsumptionItem(item.id, { description, price }).subscribe({
      next: () => {
        this.cancelEditItem();
        this.loadEvent();
      },
      error: () => {
        this.savingItemId = null;
        this.errorMessage = 'No se pudo actualizar el consumo.';
      }
    });
  }

  markPaid(participant: Participant): void {
    const method = this.paymentMethodByParticipant[participant.id] || 'YAPE';

    this.api.markPaid(participant.id, method).subscribe({
      next: () => this.loadEvent(),
      error: () => {
        this.errorMessage = 'No se pudo marcar el pago.';
      }
    });
  }

  markPending(participant: Participant): void {
    this.api.markPending(participant.id).subscribe({
      next: () => this.loadEvent(),
      error: () => {
        this.errorMessage = 'No se pudo marcar como pendiente.';
      }
    });
  }
}
