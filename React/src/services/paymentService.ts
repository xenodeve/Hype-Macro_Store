import api from './api';

export interface GenerateQRResponse {
  success: boolean;
  data: {
    qrCodeDataURL: string;
    qrCodeText: string;
    expiresAt: string;
    accountInfo?: {
      accountNumber: string;
      bankName: string;
      accountName: string;
    };
  };
}

export interface PaymentStatusResponse {
  success: boolean;
  data: {
    status: string;
    order: any;
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  data: any;
}

export const paymentService = {
  /**
   * สร้าง QR Code สำหรับการชำระเงิน (PromptPay)
   */
  generateQR: async (orderId: string, amount: number): Promise<GenerateQRResponse> => {
    const response = await api.post('/payments/generate-qr', {
      orderId,
      amount,
    });
    return response.data;
  },

  /**
   * สร้าง QR Code Bill Payment (โอนเข้าบัญชีธนาคาร)
   */
  generateBillQR: async (orderId: string, amount: number): Promise<GenerateQRResponse> => {
    const response = await api.post('/payments/generate-bill-qr', {
      orderId,
      amount,
    });
    return response.data;
  },

  /**
   * ตรวจสอบสถานะการชำระเงิน
   */
  checkPaymentStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },

  /**
   * ยืนยันการชำระเงิน
   */
  confirmPayment: async (orderId: string, transactionId: string): Promise<ConfirmPaymentResponse> => {
    const response = await api.post('/payments/confirm', {
      orderId,
      transactionId,
    });
    return response.data;
  },

  /**
   * ยกเลิกการชำระเงิน
   */
  cancelPayment: async (orderId: string): Promise<any> => {
    const response = await api.post(`/payments/cancel/${orderId}`);
    return response.data;
  },

  /**
   * ตรวจสอบสลิปโอนเงิน (อัปโหลดไฟล์)
   */
  verifySlipUpload: async (file: File, orderId: string): Promise<any> => {
    const formData = new FormData();
    formData.append('slip', file);
    formData.append('orderId', orderId);

    const response = await api.post('/payments/verify-slip-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * ตรวจสอบสลิปโอนเงิน (URL)
   */
  verifySlip: async (imageUrl: string, orderId: string): Promise<any> => {
    const response = await api.post('/payments/verify-slip', {
      imageUrl,
      orderId,
    });
    return response.data;
  },
};
