import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, map, switchMap } from 'rxjs';
import { AuthService } from 'src/auth/services/auth.service';
import { FeedService } from '../services/feed.service';
import { User } from 'src/auth/models/user.interface';
import { FeedPost } from '../models/post.interface';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  // we want access to ur user
  // auth service gives us author id
  // feed service gives us the post id
  constructor(
    private authService: AuthService,
    private feedService: FeedService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // user and params comes from the controllers since we want to use this guard to update and delete a post/feeed
    const { user, params }: { user: User; params: { id: number } } = request;

    if (!user || !params) return false;

    if (user.role === 'admin') return true; // admin can do anything in the app

    const userId = user.id;
    const feedId = params.id;

    // Determining if the logged-in user is the user that created the feed post
    return this.authService.findUserById(userId).pipe(
      switchMap((user: User) =>
        this.feedService.findPostById(feedId).pipe(
          map((feedPost: FeedPost) => {
            const isAuthor = user.id === feedPost.author.id;
            return isAuthor;
          }),
        ),
      ),
    );
  }
}
