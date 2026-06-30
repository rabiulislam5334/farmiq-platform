import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request, Response } from 'express';

interface SslcommerzCallbackBody {
  tran_id: string;
  val_id?: string;
  status?: string;
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  initiate(@Req() req: Request, @Body() dto: InitiatePaymentDto) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.paymentService.initiate(userId, dto);
  }

  // SSLCommerz সাকসেস ডাটা POST বডিতে পাঠায়
  @Post('success')
  async handleSuccess(
    @Body() body: SslcommerzCallbackBody,
    @Res() res: Response,
  ) {
    const { tran_id, val_id } = body;

    try {
      await this.paymentService.handleSuccess(tran_id, val_id as string);
      return res.redirect(
        `${process.env.CLIENT_URL}/payment/success?tran_id=${tran_id}`,
      );
    } catch {
      return res.redirect(
        `${process.env.CLIENT_URL}/payment/fail?tran_id=${tran_id}`,
      );
    }
  }

  // SSLCommerz ফেইল ডাটা POST বডিতে পাঠায়
  @Post('fail')
  async handleFail(@Body() body: SslcommerzCallbackBody, @Res() res: Response) {
    const { tran_id } = body;
    await this.paymentService.handleFail(tran_id);

    return res.redirect(
      `${process.env.CLIENT_URL}/payment/fail?tran_id=${tran_id}`,
    );
  }

  // IPN Webhook — ব্যাকগ্রাউন্ডে ডাটাবেজ আপডেট নিশ্চিত করে
  @Post('ipn')
  async handleIpn(@Body() body: SslcommerzCallbackBody, @Res() res: Response) {
    const { tran_id, val_id, status } = body;

    if (status === 'VALID' || status === 'VALIDATED') {
      try {
        await this.paymentService.handleSuccess(tran_id, val_id as string);
      } catch {
        // already updated থাকলে error ignore করবে
      }
    } else {
      await this.paymentService.handleFail(tran_id);
    }

    return res.status(HttpStatus.OK).send('IPN Received');
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getHistory(@Req() req: Request) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.paymentService.getHistory(userId);
  }
}
