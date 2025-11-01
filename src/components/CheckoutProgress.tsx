import { type ReactNode } from 'react';
import Stepper, { Step } from './Stepper';

const STEPS = [
  {
    title: 'ตะกร้าสินค้า',
    description: 'ตรวจสอบรายการสินค้าและปรับจำนวนตามต้องการ',
  },
  {
    title: 'ที่อยู่จัดส่ง',
    description: 'กรอกข้อมูลผู้รับและรายละเอียดการจัดส่งให้ครบถ้วน',
  },
  {
    title: 'ชำระเงิน',
    description: 'เลือกวิธีชำระเงินและตรวจสอบยอดรวมอีกครั้ง',
  },
  {
    title: 'คำสั่งซื้อสำเร็จ',
    description: 'ยืนยันการสั่งซื้อและติดตามสถานะการจัดส่ง',
  },
];

interface CheckoutProgressProps {
  currentStep: number;
  extraContent?: ReactNode;
}

export default function CheckoutProgress({ currentStep, extraContent }: CheckoutProgressProps) {
  return (
    <div className="space-y-6">
      <Stepper
        initialStep={currentStep}
        disableStepIndicators
        stepCircleContainerClassName="border border-gray-200 bg-white/90 dark:border-gray-800 dark:bg-[#0b0b10]/90"
        stepContainerClassName="justify-between"
        contentClassName="px-6 py-6 sm:px-8 sm:py-8"
        footerClassName="hidden"
        backButtonText=""
        nextButtonText=""
      >
        {STEPS.map((step, index) => (
          <Step key={step.title}>
            <div className="flex flex-col gap-2 text-center py-6">
              <div className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                ขั้นตอน {index + 1} / {STEPS.length}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
              </div>
            </div>
          </Step>
        ))}
      </Stepper>
      {extraContent}
    </div>
  );
}
