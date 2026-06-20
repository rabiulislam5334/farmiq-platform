import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
