import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { PaginationParameters } from '../dto/pagination.parameters.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { IsCreatorGuard } from '../guards/is-creator.guard';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  // safeguarding the routes

  // THE POST COMES FROM THE BODY WE SEND
  // can only create a post if you are logged in thats why wehave added the req.user
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() feedPost: FeedPost, @Request() req): Observable<FeedPost> {
    return this.feedService.createPost(req.user, feedPost);
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

  @UseGuards(JwtGuard)
  @Get()
  findSelected(
    @Query('take') take = 1,
    @Query('skip') skip = 1,
  ): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take;
    return this.feedService.findPosts(take, skip);
  }

  // @Get()
  // findSelected(
  //   // eslint-disable-next-line @typescript-eslint/no-inferrable-types,
  //   @Query('take') take: number = 1,
  //   // eslint-disable-next-line @typescript-eslint/no-inferrable-types,
  //   @Query('skip') skip: number = 1,
  // ): Observable<FeedPost[]> {
  //   take = take > 20 ? 20 : take; // convert query parameter to a number
  //   // skip = +skip; // Convert the query parameter to a number
  //   return this.feedService.findPosts(take, skip);
  // }

  // @Get()
  // findSelected(
  //   @Query() getFeedPostParameters: PaginationParameters,
  // ): Observable<FeedPost[]> {
  //   // console.log(getFeedPostParameters);
  //   return this.feedService.findPosts(getFeedPostParameters);
  // }

  //update post
  // is creator guard emphasizes you have to be creator of the guard to edit or delete it
  @UseGuards(JwtGuard, IsCreatorGuard)
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() feedPost: FeedPost,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, feedPost);
  }

  // deletepost
  @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }
}
