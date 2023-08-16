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

  setData(data: string) {
    this.sharedDataSubject.next(data);
  }

  getDataObservable(): Observable<string | undefined> {
    return this.sharedDataSubject.asObservable();
  }
}
