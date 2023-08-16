import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnDestroy {
  body = '';
  private dataSubscription!: Subscription;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataSubscription = this.dataService
      .getDataObservable()
      .subscribe((postBody: string | undefined) => {
        this.body = postBody || '';
      });
  }

  ngOnDestroy() {
    // Unsubscribe from the observable to prevent memory leaks
    this.dataSubscription.unsubscribe();
  }
}
