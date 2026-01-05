import { Injectable } from '@angular/core';
import { ApiService } from './services/api.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(
    public api: ApiService
  ) { }
}
