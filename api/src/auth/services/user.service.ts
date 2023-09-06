import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { Observable, from, map, of, pipe, switchMap } from 'rxjs';

import { User } from '../models/user.interface';
import { FriendRequestEntity } from '../models/friend-request.entity';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequest_Status,
} from '../models/friend-request.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>,
  ) {}

  // finding the user by Id
  findUserById(id: number): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: { id },
        relations: ['feedPosts'],
      }),
    ).pipe(
      map((user: User) => {
        delete user.password;
        return user;
      }),
    );
  }

  // updating user image by id
  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    const user: User = new UserEntity();
    user.id = id;
    user.imagePath = imagePath;
    return from(this.userRepository.update(id, user));
  }

  // finding image based on userid
  findImageNameByUserId(id: number): Observable<string> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      map((user: User) => {
        delete user.password;
        return user.imagePath;
      }),
    );
  }

  // checking if  request has been sent or received
  hasRequestBeenSentOrReceived(
    creator: User,
    receiver: User,
  ): Observable<boolean> {
    return from(
      this.friendRequestRepository.findOne({
        where: [
          { creator, receiver },
          { creator: receiver, receiver: creator },
        ],
      }),
    ).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if (!friendRequest) return of(false);
        return of(true);
      }),
    );
  }

  // sending a friend request
  sendFriendRequest(
    receiverId: number,
    creator: User,
  ): Observable<FriendRequest | { error: string }> {
    // the creator id & receiver id should not match
    if (receiverId === creator.id)
      return of({ error: 'It is not possible to add yourself!' });

    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        return this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
          switchMap((hasRequestBeenSentOrReceived: boolean) => {
            if (hasRequestBeenSentOrReceived)
              return of({
                error:
                  'A friend request has already been sent or received to your account!',
              });
            const friendRequest: FriendRequest = {
              creator,
              receiver,
              status: 'Pending',
            };
            return from(this.friendRequestRepository.save(friendRequest));
          }),
        );
      }),
    );
  }

  //getting the friend request status.
  getFriendRequestStatus(
    receiverId: number,
    currentUser: User,
  ): Observable<FriendRequestStatus> {
    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        return from(
          this.friendRequestRepository.findOne({
            where: [
              { creator: currentUser, receiver: receiver },
              { creator: receiver, receiver: currentUser },
            ],
            // both the creator and receiver are foreign keys in the user table
            relations: ['creator', 'receiver'],
          }),
        );
      }),
      // switchMap((friendRequest: FriendRequest | undefined) => {
      //   if (friendRequest) {
      //     return of({ status: friendRequest.status } as FriendRequestStatus);
      //   } else {
      //     return of({ status: 'Pending' } as FriendRequestStatus);
      //   }
      // }),
      switchMap((friendRequest: FriendRequest) => {
        if (friendRequest?.receiver.id === currentUser.id) {
          return of({
            status: 'waiting-for-current-user-response' as FriendRequest_Status,
          });
        }
        return of({ status: friendRequest?.status || 'not-sent' });
      }),
    );
  }

  // getting the user who sent the friendReq by id
  getFriendRequestUserById(friendRequestId: number): Observable<FriendRequest> {
    return from(
      this.friendRequestRepository.findOne({
        where: [{ id: friendRequestId }],
      }),
    );
  }

  // Responding to friend requests or updating the friend request response status
  respondToFriendRequest(
    statusResponse: FriendRequest_Status,
    friendRequestId: number,
  ): Observable<FriendRequestStatus> {
    return this.getFriendRequestUserById(friendRequestId).pipe(
      switchMap((friendRequest: FriendRequest) => {
        return from(
          // WE GET EVERYTHING FROM THE FRIEND REQUEST BT WE ONLY WANNA UPDATE THE STATUS
          this.friendRequestRepository.save({
            ...friendRequest,
            status: statusResponse,
          }),
        );
      }),
    );
  }
  // we want to see which user sent req to us
  getFriendRequestsFromRecipients(
    currentUser: User,
  ): Observable<FriendRequest[]> {
    return from(
      this.friendRequestRepository.find({
        where: [{ receiver: currentUser }],
        // relations: ['receiver', 'creator'],
      }),
    );
  }
}
