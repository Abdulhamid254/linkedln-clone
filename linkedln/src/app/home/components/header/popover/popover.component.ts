import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit, OnDestroy {
  userFullImagePath: string | undefined;
  private userImagePathSubscription: Subscription | undefined;

  fullName$ = new BehaviorSubject<string | undefined>(undefined);
  fullName = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.userFullName
      .pipe(take(1))
      .subscribe((fullName: string | undefined) => {
        if (fullName) {
          this.fullName = fullName;
          this.fullName$.next(fullName);
        }
      });

    this.userImagePathSubscription =
      this.authService.userFullImagePath.subscribe(
        (fullImagePath: string | undefined) => {
          this.userFullImagePath = fullImagePath;
        }
      );
  }

  onSignOut() {
    this.authService.logout();
  }

  ngOnDestroy() {
    // this.userSubscription?.unsubscribe();
    this.userImagePathSubscription?.unsubscribe();
  }
}
