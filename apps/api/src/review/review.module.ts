import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
