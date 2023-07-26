import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Post()
  // THE POST COMES FROM THE BODY WE SEND
  create(@Body() post: FeedPost): Observable<FeedPost> {
    return this.feedService.createPost(post);
  }

  // getting all post
  // @Get()
  // findAll(): Observable<FeedPost[]> {
  //   return this.feedService.findAllPosts();
  // }

  // finding the selected posts
  // take query for how many post we want to take
  // @Get()
  // findSelected(
  //   // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  //   @Query('take') take: number = 1,
  //   // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  //   @Query('skip') skip: number = 1,
  // ): Observable<FeedPost[]> {
  //   // a check for limiting gettin lots of posts
  //   take = take > 20 ? 20 : take;
  //   return this.feedService.findPosts(take, skip);
  // }

  @Get()
  findSelected(
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types,
    @Query('take') take: number = 1,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types,
    @Query('skip') skip: number = 1,
  ): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take; // convert query parameter to a number
    // skip = +skip; // Convert the query parameter to a number
    return this.feedService.findPosts(take, skip);
  }
  //update post
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() feedPost: FeedPost,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, feedPost);
  }

  // deletepost
  @Delete(':id')
  delete(@Param('id') id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }
}
