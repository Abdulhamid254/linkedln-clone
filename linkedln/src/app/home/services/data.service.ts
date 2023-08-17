//
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private sharedDataSubject = new BehaviorSubject<string | undefined>(
    undefined
  );

  // USED BY THE INITIAL COMPONENT
  setData(data: string) {
    this.sharedDataSubject.next(data);
  }

  // ACCESSED  BY THE OTHER COMPONET
  getDataObservable(): Observable<string | undefined> {
    return this.sharedDataSubject.asObservable();
  }
}
