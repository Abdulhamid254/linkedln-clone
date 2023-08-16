import { Injectable } from '@nestjs/common';
import { FeedPostEntity } from '../models/post.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { FeedPost } from '../models/post.interface';
import { Observable, from } from 'rxjs';
import { PaginationParameters } from '../dto/pagination.parameters.dto';
import { User } from 'src/auth/models/user.interface';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPostEntity)
    private readonly feedPostRepository: Repository<FeedPostEntity>,
  ) {}

  // we are using repository design pattern that allows us not to write design patterns ourselves
  // from keyword helps us transform our promise to observable
  // we need the user here because the user becomes the author
  createPost(user: User, feedPost: FeedPost): Observable<FeedPost> {
    feedPost.author = user;
    return from(this.feedPostRepository.save(feedPost));
  }

  // finding all the posts
  findAllPosts(): Observable<FeedPost[]> {
    return from(this.feedPostRepository.find());
  }

  // find posts
  // by default the take number is 10 is their is none
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  // findPosts(take: number = 10, skip: number = 0): Observable<FeedPost[]> {
  //   return from(
  //     this.feedPostRepository.findAndCount({ take, skip }).then(([posts]) => {
  //       return <FeedPost[]>posts;
  //     }),
  //   );
  // }

  findPosts(
    PaginationParameters: PaginationParameters,
  ): Observable<FeedPost[]> {
    return from(
      this.feedPostRepository
        .findAndCount(PaginationParameters)
        .then(([posts]) => {
          return <FeedPost[]>posts;
        }),
    );
  }

  //updating post

  updatePost(id: number, feedPost: FeedPost): Observable<UpdateResult> {
    return from(this.feedPostRepository.update(id, feedPost));
  }
  //deleting post

  deletePost(id: number): Observable<DeleteResult> {
    return from(this.feedPostRepository.delete(id));
  }

  findPostById(id: number): Observable<FeedPost> {
    return from(
      this.feedPostRepository.findOne({
        where: { id },
        relations: ['author'],
      }),
    );
  }
}
