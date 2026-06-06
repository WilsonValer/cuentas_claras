import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LunchEventsApiService } from '../../services/lunch-events-api.service';

@Component({
  selector: 'app-create-event-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-event-page.component.html',
  styleUrl: './create-event-page.component.scss'
})
export class CreateEventPageComponent {
  saving = false;
  errorMessage = '';
  form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: LunchEventsApiService,
    private readonly router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(180)]],
      event_date: ['', Validators.required],
      payer_name: ['', [Validators.required, Validators.maxLength(140)]],
      description: ['']
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.api.createLunchEvent(this.form.getRawValue()).subscribe({
      next: (event) => {
        this.saving = false;
        this.router.navigate(['/events', event.id]);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'No se pudo crear el almuerzo.';
      }
    });
  }
}
