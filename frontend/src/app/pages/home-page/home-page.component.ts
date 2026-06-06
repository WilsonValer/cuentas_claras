import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LunchEventListItem } from '../../models/lunch-event.model';
import { LunchEventsApiService } from '../../services/lunch-events-api.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  events: LunchEventListItem[] = [];
  loading = false;
  errorMessage = '';

  constructor(private readonly api: LunchEventsApiService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.listLunchEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los almuerzos.';
        this.loading = false;
      }
    });
  }

  deleteEvent(eventId: number): void {
    if (!confirm('¿Seguro que deseas eliminar este almuerzo?')) {
      return;
    }

    this.api.deleteLunchEvent(eventId).subscribe({
      next: () => this.loadEvents(),
      error: () => {
        this.errorMessage = 'No se pudo eliminar el almuerzo.';
      }
    });
  }
}