import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DisputeController } from './dispute.controller';
import { DisputeService } from './dispute.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [DisputeController],
  providers: [DisputeService],
})
export class DisputeModule {}
