import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FarmController } from './farm.controller';
import { FarmService } from './farm.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [FarmController],
  providers: [FarmService],
})
export class FarmModule {}
