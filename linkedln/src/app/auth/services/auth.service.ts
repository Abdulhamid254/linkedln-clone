import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NewUser } from '../models/newUser.model';
import {
  BehaviorSubject,
  Observable,
  from,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';

import jwt_decode from 'jwt-decode';

import { Role, User } from '../models/user.model';
import { environment } from 'src/environments/environment';
import { UserResponse } from '../models/userResponse.model';
import { Capacitor, Plugins } from '@capacitor/core';
import { GetResult, Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // difference between behaviour subject and subject is that behaviour subject you can call the next method before subscribing to it
  private user$ = new BehaviorSubject<User | null>(null);

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'content-type': 'application/json' }),
  };

  // streams help us dynamically update thing in real time
  get userStream(): Observable<User | null> {
    return this.user$.asObservable();
  }

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

  get userId(): Observable<number | undefined> {
    return this.user$.asObservable().pipe(
      switchMap((user: User | null) => {
        return of(user?.id);
      })
    );
  }

  get userFullName(): Observable<string | undefined> {
    //  we are getting observable user bt we want observable full name that comes from the user
    return this.user$.asObservable().pipe(
      switchMap((user: User | null) => {
        const fullName = user?.firstName + ' ' + user?.lastName;
        return of(fullName);
      })
    );
  }

  get userFullImagePath(): Observable<string | undefined> {
    return this.user$.asObservable().pipe(
      switchMap((user: User | null) => {
        // the double exclamation mark helps us turn the response from a string to a boolean
        const doesAuthorHaveImage = !!user?.imagePath;
        let fullImagePath = this.getDefaultFullImagePath();
        if (doesAuthorHaveImage) {
          fullImagePath = this.getFullImagePath(user.imagePath || ''); //// Use an empty string as a fallback
        }
        return of(fullImagePath);
      })
    );
  }

  constructor(private http: HttpClient, private router: Router) {}

  getDefaultFullImagePath(): string {
    return 'http://localhost:3000/api/feed/image/blank-profile-picture.png';
  }

  getFullImagePath(imageName: string): string {
    return 'http://localhost:3000/api/feed/image/' + imageName;
  }

  getUserImage() {
    return this.http.get(`${environment.baseApiUrl}/user/image`).pipe(take(1));
  }

  getUserImageName(): Observable<{ imageName: string }> {
    return this.http
      .get<{ imageName: string }>(`${environment.baseApiUrl}/user/image-name`)
      .pipe(take(1));
  }

  updateUserImagePath(imagePath: string): Observable<User | null> {
    return this.user$.pipe(
      take(1),
      map((user: User | null) => {
        if (user) {
          user.imagePath = imagePath;
          this.user$.next(user);
        }
        return user;
      })
    );
  }

  uploadUserImage(
    formData: FormData
  ): Observable<{ modifiedFileName: string }> {
    return this.http
      .post<{ modifiedFileName: string }>(
        `${environment.baseApiUrl}/user/upload`,
        formData
      )
      .pipe(
        tap(({ modifiedFileName }) => {
          let user = this.user$.value;
          if (user) {
            user.imagePath = modifiedFileName;
            this.user$.next(user);
          }
        })
      );
  }

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

  // checkin in if token is in storage helps deal with on refresh
  isTokenInStorage(): Observable<boolean> {
    return from(Storage.get({ key: 'token' })).pipe(
      map((data: GetResult) => {
        const tokenValue = data.value as string;
        if (!tokenValue) return false; // Explicitly return false here if token is not present
        // if it makes a pass above
        const decodedToken: UserResponse = jwt_decode(tokenValue);
        // changing it from seconds to milliseconds
        const jwtExpirationInMsSinceUnixEpoch = decodedToken.exp * 1000;
        const isExpired =
          new Date() > new Date(jwtExpirationInMsSinceUnixEpoch);
        if (isExpired) return false; // Explicitly return false here if token is expired
        if (decodedToken.user) {
          this.user$.next(decodedToken.user);
          return true;
        }
        return false; // Explicitly return false here for any other case
      })
    );
  }
  // logout functionality
  logout(): void {
    this.user$.next(null);
    Storage.remove({ key: 'token' });
    this.router.navigateByUrl('/auth');
  }
}
//
