import { Component, OnInit } from '@angular/core';
import { BannerColorService } from '../../services/banner-color.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-connection-profile',
  templateUrl: './connection-profile.component.html',
  styleUrls: ['./connection-profile.component.scss'],
})
export class ConnectionProfileComponent implements OnInit {
  constructor(
    public bannerColorService: BannerColorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // x here rep the number that it sis returning
    this.getUserIdFromUrl().subscribe((x) => console.log(33, x));
  }

  //gets the user from the url

  private getUserIdFromUrl(): Observable<number> {
    return this.route.url.pipe(
      map((urlSegment: UrlSegment[]) => {
        // the + here is a unary operator changes string to number
        // return +urlSegment[0].path
        return parseInt(urlSegment[0].path);
      })
    );
  }
}
