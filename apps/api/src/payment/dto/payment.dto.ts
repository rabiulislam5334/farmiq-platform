import { IsString, IsEnum } from 'class-validator';

export enum PaymentMethod {
  SSLCOMMERZ = 'SSLCOMMERZ',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export class InitiatePaymentDto {
  @IsString()
  orderId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
