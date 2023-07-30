import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanLoad,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
// observer is an object representing the observer that is passed to the Observable constructor. Observers are used to receive and handle values emitted by an Observable and can interact with the observable to send new values or report errors and completi
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) {}
  canLoad():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isUserLoggedIn.pipe(
      take(1),
      // ie if they have already logged in and refreshed the page the token can be gotten from storage and home page loaded
      // switch map nneded so that if they already have atoken in storage this will call another method & that will returntrue or false as well
      // CHECKING IF USER IS LOGGED IN
      switchMap((isUserLoggedIn: boolean): Observable<true> => {
        if (isUserLoggedIn) {
          return new Observable<true>((observer) => {
            observer.next(true);
            observer.complete();
          });
        } else {
          // Handle the case when user is not logged in, possibly by returning an empty observable or an error observable.
          // For example:
          return new Observable<true>((observer) => {
            observer.error('User not logged in');
          });
        }
      }),
      // we tap into it and whatever that boolean type is we can do something
      //if they are not logged in we want to reroute them to the login
      tap((isUserLoggedIn: boolean) => {
        if (!isUserLoggedIn) {
          this.router.navigateByUrl('/auth');
        }
      })
    );
  }
}
