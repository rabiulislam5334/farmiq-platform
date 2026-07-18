import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  Logger,
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
  private readonly logger = new Logger(PaymentController.name);

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

    // tran_id/val_id ছাড়া কারো সরাসরি এই endpoint hit করে fake success trigger করার চেষ্টা ঠেকায়
    if (!tran_id || !val_id) {
      this.logger.warn(
        `Rejected /payment/success call — missing tran_id or val_id`,
      );
      return res.redirect(
        `${process.env.CLIENT_URL}/payment/fail?reason=invalid_request`,
      );
    }

    try {
      await this.paymentService.handleSuccess(tran_id, val_id);
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

    if (!tran_id) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
    }

    await this.paymentService.handleFail(tran_id);

    return res.redirect(
      `${process.env.CLIENT_URL}/payment/fail?tran_id=${tran_id}`,
    );
  }

  // IPN Webhook — ব্যাকগ্রাউন্ডে ডাটাবেজ আপডেট নিশ্চিত করে
  @Post('ipn')
  async handleIpn(@Body() body: SslcommerzCallbackBody, @Res() res: Response) {
    const { tran_id, val_id, status } = body;

    // tran_id ছাড়া কিছুই করার নেই, সরাসরি reject
    if (!tran_id) {
      this.logger.warn('Rejected IPN call — missing tran_id');
      return res.status(HttpStatus.BAD_REQUEST).send('Missing tran_id');
    }

    if (status === 'VALID' || status === 'VALIDATED') {
      // val_id ছাড়া success claim করলে সেটাকে বিশ্বাস করা হবে না —
      // val_id না থাকলে paymentService.handleSuccess() পর্যন্ত পৌঁছাতেই দেওয়া হচ্ছে না,
      // কারণ real verification সেখানেই sslcz.validate() দিয়ে হয়, val_id ছাড়া সেটা করা যায় না
      if (!val_id) {
        this.logger.warn(
          `Rejected IPN success claim for ${tran_id} — missing val_id`,
        );
        return res.status(HttpStatus.BAD_REQUEST).send('Missing val_id');
      }

      try {
        await this.paymentService.handleSuccess(tran_id, val_id);
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
