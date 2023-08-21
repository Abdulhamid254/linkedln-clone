import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @ViewChild('form') form!: NgForm;

  formValue: any = {};

  @Input() postId?: number;

  userFullImagePath: string | undefined;
  private userSubscription: Subscription | undefined;
  private userImagePathSubscription: Subscription | undefined;

  fullName$ = new BehaviorSubject<string | undefined>(undefined);
  fullName = '';

  constructor(
    public modalController: ModalController,
    private authService: AuthService
  ) {}

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

  onDismiss() {
    this.modalController.dismiss(null, 'dismiss');
  }

  onPost() {
    if (!this.form?.valid) return;
    const body = this.form?.value?.body;
    this.modalController.dismiss(
      {
        post: {
          body,
        },
      },
      'post'
    );
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.userImagePathSubscription?.unsubscribe();
  }
}
