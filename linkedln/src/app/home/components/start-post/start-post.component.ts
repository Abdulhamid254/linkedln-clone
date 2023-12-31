import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from './modal/modal.component';
import { DataService } from '../../services/data.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-start-post',
  templateUrl: './start-post.component.html',
  styleUrls: ['./start-post.component.scss'],
})
export class StartPostComponent implements OnInit, OnDestroy {
  userFullImagePath: string | undefined;
  private userImagePathSubscription: Subscription | undefined;
  constructor(
    public modalController: ModalController,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userImagePathSubscription =
      this.authService.userFullImagePath.subscribe(
        (fullImagePath: string | undefined) => {
          this.userFullImagePath = fullImagePath;
        }
      );
  }

  async presentModal() {
    // console.log('CREATE POST');
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2',
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (!data) return;
    this.dataService.setData(data.post.body);
  }

  ngOnDestroy() {
    this.userImagePathSubscription?.unsubscribe();
  }
}
