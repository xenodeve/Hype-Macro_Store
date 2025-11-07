import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifySlipDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class SlipVerificationResult {
  success: boolean;
  message: string;
  data?: {
    sendingBank: string;
    receivingBank: string;
    transRef: string;
    transDate: string;
    transTime: string;
    amount: string;
    isValid: boolean;
    orderId: string;
    imageUrl: string;
  };
}
