import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class GenerateQRDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  transactionId: string;
}
