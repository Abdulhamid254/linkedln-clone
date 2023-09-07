import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  body = '';
  private dataSubscription!: Subscription;
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataSubscription = this.dataService
      .getDataObservable()
      .subscribe((postBody) => {
        this.body = postBody || '';
      });
  }

  ngOnDestroy() {
    // Unsubscribe from the observable to prevent memory leaks
    this.dataSubscription.unsubscribe();
  }
}
