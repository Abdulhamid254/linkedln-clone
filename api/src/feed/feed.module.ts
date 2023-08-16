import { Module } from '@nestjs/common';
import { FeedService } from './services/feed.service';
import { FeedController } from './controllers/feed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedPostEntity } from './models/post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { IsCreatorGuard } from './guards/is-creator.guard';

@Module({
  // used typeorm to use repository design pattern for us to enable us use queries
  imports: [AuthModule, TypeOrmModule.forFeature([FeedPostEntity])],
  providers: [FeedService, IsCreatorGuard],
  controllers: [FeedController],
})
export class FeedModule {}
