import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentService } from './payment.service';
import { GenerateQRDto, VerifyPaymentDto } from './payment.dto';
import { VerifySlipDto } from './slip-verification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * สร้าง QR Code สำหรับการชำระเงิน (PromptPay)
   * POST /payments/generate-qr
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate-qr')
  @HttpCode(HttpStatus.OK)
  async generateQR(@Body() generateQRDto: GenerateQRDto) {
    const result = await this.paymentService.generateQRCode(
      generateQRDto.orderId,
      generateQRDto.amount,
    );
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * สร้าง QR Code Bill Payment (โอนเข้าบัญชีธนาคาร)
   * POST /payments/generate-bill-qr
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate-bill-qr')
  @HttpCode(HttpStatus.OK)
  async generateBillQR(@Body() generateQRDto: GenerateQRDto) {
    const result = await this.paymentService.generateBillPaymentQR(
      generateQRDto.orderId,
      generateQRDto.amount,
    );
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * ตรวจสอบสถานะการชำระเงิน
   * GET /payments/status/:orderId
   */
  @Get('status/:orderId')
  async checkStatus(@Param('orderId') orderId: string) {
    const result = await this.paymentService.checkPaymentStatus(orderId);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * ยืนยันการชำระเงิน (สำหรับทดสอบ หรือการยืนยันด้วยตัวเอง)
   * POST /payments/confirm
   */
  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    const order = await this.paymentService.confirmPayment(
      verifyPaymentDto.orderId,
      verifyPaymentDto.transactionId,
    );
    
    return {
      success: true,
      message: 'Payment confirmed successfully',
      data: order,
    };
  }

  /**
   * ยกเลิกการชำระเงิน
   * POST /payments/cancel/:orderId
   */
  @UseGuards(JwtAuthGuard)
  @Post('cancel/:orderId')
  @HttpCode(HttpStatus.OK)
  async cancelPayment(@Param('orderId') orderId: string) {
    const order = await this.paymentService.cancelPayment(orderId);
    
    return {
      success: true,
      message: 'Payment cancelled',
      data: order,
    };
  }

  /**
   * ตรวจสอบสลิปโอนเงิน (Upload File)
   * POST /payments/verify-slip-upload
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify-slip-upload')
  @UseInterceptors(
    FileInterceptor('slip', {
      storage: diskStorage({
        destination: './uploads/slips',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `slip-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async verifySlipUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() verifySlipDto: VerifySlipDto,
  ) {
    if (!file) {
      return {
        success: false,
        message: 'No file uploaded',
      };
    }

    // สร้าง URL ของรูปภาพ (ใช้ path ของไฟล์ที่อัปโหลด)
    const imageUrl = `http://localhost:3000/uploads/slips/${file.filename}`;

    const result = await this.paymentService.verifySlip(
      imageUrl,
      verifySlipDto.orderId,
    );

    return result;
  }

  /**
   * ตรวจสอบสลิปโอนเงิน (URL)
   * POST /payments/verify-slip
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify-slip')
  @HttpCode(HttpStatus.OK)
  async verifySlip(@Body() body: { imageUrl: string; orderId: string }) {
    const result = await this.paymentService.verifySlip(
      body.imageUrl,
      body.orderId,
    );

    return result;
  }
}
