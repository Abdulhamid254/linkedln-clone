//
import { User } from 'src/app/auth/models/user.model';

export interface Post {
  id: number;
  body: String;
  createdAt: Date;
  author: User;
  fullImagePath: string;
}
