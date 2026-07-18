import { IsString, IsNotEmpty, IsIn, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @MinLength(10, { message: 'Reason should be at least 10 characters' })
  reason: string;
}

export enum DisputeOutcome {
  COMPLETE = 'COMPLETE', // seller-এর পক্ষে — order সম্পন্ন ধরা হবে
  REFUND = 'REFUND', // buyer-এর পক্ষে — টাকা ফেরত, stock restore
}

export class ResolveDisputeDto {
  @IsString()
  @MinLength(5)
  resolution: string;

  @IsIn([DisputeOutcome.COMPLETE, DisputeOutcome.REFUND])
  outcome: DisputeOutcome;
}
