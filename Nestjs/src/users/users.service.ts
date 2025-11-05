import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersService
 * จัดการ Business Logic ที่เกี่ยวกับ User
 * - สร้างผู้ใช้ใหม่ (Create)
 * - ค้นหาผู้ใช้ (Read)
 * - อัพเดตโปรไฟล์ (Update)
 * - ลบบัญชี (Delete)
 * - ตรวจสอบรหัสผ่าน (Validate Password)
 */
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * สร้างผู้ใช้ใหม่
   * - Hash รหัสผ่านด้วย bcrypt (salt rounds = 10)
   * - บันทึกลง MongoDB
   */
  async create(name: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });
    return user.save();
  }

  /**
   * ค้นหาผู้ใช้จากอีเมล
   * ใช้ใน: Login, Register (ตรวจสอบ email ซ้ำ)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * ค้นหาผู้ใช้จาก User ID
   * ใช้ใน: JWT Authentication, Profile Management
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * ตรวจสอบความถูกต้องของรหัสผ่าน
   * - เปรียบเทียบ plaintext password กับ hashed password
   * - ใช้ bcrypt.compare() สำหรับความปลอดภัย
   */
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * อัพเดตข้อมูลโปรไฟล์ผู้ใช้
   * รองรับการอัพเดต:
   * - ข้อมูลพื้นฐาน (name, email)
   * - ที่อยู่จัดส่ง (phone, address, district, city, province, postalCode)
   * - ข้อมูลบัตร (cardName, cardLast4, cardExpiry)
   * - รหัสผ่าน (ต้องใส่ currentPassword ก่อน)
   */
  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // ตรวจสอบว่า email ใหม่ซ้ำกับคนอื่นหรือไม่
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // เตรียมข้อมูลที่จะอัพเดต (เฉพาะฟิลด์ที่ส่งมา)
    const updateData: any = {};

    // อัพเดตข้อมูลพื้นฐาน
    if (updateUserDto.name) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.email) {
      updateData.email = updateUserDto.email;
    }

    // อัพเดตที่อยู่จัดส่ง (ใช้ !== undefined เพื่อให้ส่ง empty string ได้)
    if (updateUserDto.phone !== undefined) {
      updateData.phone = updateUserDto.phone;
    }
    if (updateUserDto.address !== undefined) {
      updateData.address = updateUserDto.address;
    }
    if (updateUserDto.district !== undefined) {
      updateData.district = updateUserDto.district;
    }
    if (updateUserDto.city !== undefined) {
      updateData.city = updateUserDto.city;
    }
    if (updateUserDto.province !== undefined) {
      updateData.province = updateUserDto.province;
    }
    if (updateUserDto.postalCode !== undefined) {
      updateData.postalCode = updateUserDto.postalCode;
    }

    // อัพเดตข้อมูลบัตร
    if (updateUserDto.cardName !== undefined) {
      updateData.cardName = updateUserDto.cardName;
    }
    if (updateUserDto.cardLast4 !== undefined) {
      updateData.cardLast4 = updateUserDto.cardLast4;
    }
    if (updateUserDto.cardExpiry !== undefined) {
      updateData.cardExpiry = updateUserDto.cardExpiry;
    }

    // เปลี่ยนรหัสผ่าน (ต้องยืนยันด้วย current password)
    if (updateUserDto.newPassword) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Current password is required to change password');
      }
      
      // ตรวจสอบรหัสผ่านเดิม
      const isPasswordValid = await this.validatePassword(
        updateUserDto.currentPassword,
        user.password,
      );
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      
      // Hash รหัสผ่านใหม่
      updateData.password = await bcrypt.hash(updateUserDto.newPassword, 10);
    }

    // ใช้ findByIdAndUpdate เพื่อ trigger UPDATE hook (ไม่ใช่ CREATE hook)
    // { new: true } = return ข้อมูลหลังอัพเดต
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();

    if (!updatedUser) {
      throw new BadRequestException('Failed to update user');
    }

    return updatedUser;
  }

  /**
   * ลบบัญชีผู้ใช้
   * - ต้องยืนยันด้วยรหัสผ่านก่อนลบ
   * - ลบถาวร ไม่สามารถกู้คืนได้
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // ยืนยันรหัสผ่านก่อนลบ
    const isPasswordValid = await this.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // ลบบัญชี
    await this.userModel.findByIdAndDelete(userId).exec();
  }
}
