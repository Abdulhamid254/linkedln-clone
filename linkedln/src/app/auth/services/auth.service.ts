import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NewUser } from '../models/newUser.model';
import { BehaviorSubject, Observable, of, switchMap, take, tap } from 'rxjs';

import jwt_decode from 'jwt-decode';

import { Role, User } from '../models/user.model';
import { environment } from 'src/environments/environment';
import { UserResponse } from '../models/userResponse.model';
import { Capacitor, Plugins } from '@capacitor/core';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // difference between behaviour subject and subject is that behaviour subject you can call the next method before subscribing to it
  private user$ = new BehaviorSubject<User | null>(null);

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'content-type': 'application/json' }),
  };

  // here wea re using switch map to change the $user which is of type behaviour subject to another observable of type boolean
  get isUserLoggedIn(): Observable<boolean> {
    return this.user$.asObservable().pipe(
      switchMap((user: User | null) => {
        // if user is not equal to null
        const isUserAuthenticated = user !== null;
        // of transforms primitive types into observable
        return of(isUserAuthenticated);
      })
    );
  }

  get userRole(): Observable<Role | undefined> {
    return this.user$.asObservable().pipe(
      switchMap((user: User | null) => {
        return of(user?.role); // for after signed out, but still subscribed
      })
    );
  }

  constructor(private http: HttpClient, private router: Router) {}

  // registering usr
  register(newUser: NewUser): Observable<User> {
    return this.http
      .post<User>(
        `${environment.baseApiUrl}/auth/register`,
        newUser,
        this.httpOptions
      )
      .pipe(take(1));
    //pipe and take here enables us not to have an open observables helps prevent memory leaks
  }

  //loggin in user
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        `${environment.baseApiUrl}/auth/login`,
        { email, password },
        this.httpOptions
      )
      .pipe(
        take(1),
        tap((response: { token: string }) => {
          const token = response.token;
          if (Capacitor.isPluginAvailable('Storage')) {
            Storage.set({ key: 'token', value: token });
          } else {
            // Fallback for the web or if the plugin is not available
            localStorage.setItem('token', token);
          }
          // the below approch is done in the frontend...using jwt to get body
          const decodedToken: UserResponse = jwt_decode(response.token); // when we log in we want to call this observable to trigger an event which will update our variable
          this.user$.next(decodedToken.user);
        })
      );
  }
  // like above we are taking the token ad storing it in localstorage
  //capacitor is just a wrapper that allows cross platform functionality
  //tap enables us to do something with the response... we use tap when we want to do something else rather than modifying the response

  // logout functionality
  logout(): void {
    this.user$.next(null);
    Storage.remove({ key: 'token' });
    this.router.navigateByUrl('/auth');
  }
}
//
