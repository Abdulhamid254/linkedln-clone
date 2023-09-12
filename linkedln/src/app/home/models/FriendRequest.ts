/* eslint-disable prettier/prettier */

import { User } from 'src/app/auth/models/user.model';

export type FriendRequest_Status =
  | 'not-sent'
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'waiting-for-current-user-response';

export interface FriendRequestStatus {
  status?: FriendRequest_Status;
}

export type FriendRequestWithImagePath = FriendRequest & { imagePath: string };

export interface FriendRequest {
  id: number;
  creatorId: User;
  receiverId: User;
  status?: FriendRequest_Status;
}
