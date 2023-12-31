import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../start-post/modal/modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
  constructor(public modalController: ModalController) {}

  ngOnInit() {}

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalComponent,
      cssClass: 'my-custom-class2',
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    if (data) {
      console.log('data exists!');
    }
    console.log('role: ', role, 'data:', data);
  }
}
