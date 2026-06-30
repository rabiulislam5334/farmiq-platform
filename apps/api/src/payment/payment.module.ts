import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
