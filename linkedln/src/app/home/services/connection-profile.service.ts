import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/auth/models/user.model';
import { environment } from 'src/environments/environment';
import { FriendRequest, FriendRequestStatus } from '../models/FriendRequest';

@Injectable({
  providedIn: 'root',
})
export class ConnectionProfileService {
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getConnectionUser(id: number): Observable<User> {
    return this.http.get<User>(`${environment.baseApiUrl}/user/${id}`);
  }
  getFriendRequestStatus(id: number): Observable<FriendRequestStatus> {
    return this.http.get<FriendRequestStatus>(
      `${environment.baseApiUrl}/user/friend-request/status${id}`
    );
  }

  addConnectionUser(id: number): Observable<FriendRequest | { error: string }> {
    return this.http.post<FriendRequest | { error: string }>(
      `${environment.baseApiUrl}/user/friend-request/send/${id}`,
      {},
      this.httpOptions
    );
  }
}
