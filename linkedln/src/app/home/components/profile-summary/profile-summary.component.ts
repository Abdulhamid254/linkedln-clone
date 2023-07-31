import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { Role } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';

type BannerColors = {
  colorOne: string;
  colorTwo: string;
  colorThree: string;
};

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit {
  bannerColors: BannerColors = {
    colorOne: '#a0b4b7',
    colorTwo: '#dbe7e9',
    colorThree: '#bfd3d6',
  };
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.userRole
      .pipe(take(1))
      .subscribe((role: Role | undefined) => {
        if (role) {
          // console.log(9, role);

          return (this.bannerColors = this.getBannerColors(role));
        } else {
          return null;
        }
      });
  }

  // method for getting banner colors
  private getBannerColors(role: Role): BannerColors {
    switch (role) {
      // console.log(10, role);
      case 'admin':
        ``;
        return {
          colorOne: '#daa520',
          colorTwo: '#f0e68c',
          colorThree: '#fafad2',
        };
      case 'premium':
        return {
          colorOne: '#bc8f8f',
          colorTwo: '#c09999',
          colorThree: '#ddadaf',
        };

      default:
        return this.bannerColors;
    }
  }
}
