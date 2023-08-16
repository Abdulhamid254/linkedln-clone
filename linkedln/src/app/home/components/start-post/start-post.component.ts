import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalComponent } from './modal/modal.component';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-start-post',
  templateUrl: './start-post.component.html',
  styleUrls: ['./start-post.component.scss'],
})
export class StartPostComponent implements OnInit {
  constructor(
    public modalController: ModalController,
    private dataService: DataService
  ) {}

  ngOnInit() {}

  async presentModal() {
    console.log('CREATE POST');
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2',
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log('data exists');
    }
    console.log('data', data);

    // if (!data) return;
    // this.dataService.setData(data.post.body);
  }

  // ngOnDestroy() {
  //   this.userImagePathSubscription.unsubscribe();
  // }
}
