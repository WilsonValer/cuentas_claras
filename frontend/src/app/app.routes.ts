import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CreateEventPageComponent } from './pages/create-event-page/create-event-page.component';
import { EventDetailPageComponent } from './pages/event-detail-page/event-detail-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'events/new', component: CreateEventPageComponent },
  { path: 'events/:id', component: EventDetailPageComponent },
  { path: '**', redirectTo: '' }
];