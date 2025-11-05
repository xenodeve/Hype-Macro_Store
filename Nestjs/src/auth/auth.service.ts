import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './auth.dto';

/**
 * AuthService
 * จัดการ Authentication และ Authorization
 * - สมัครสมาชิก (Register)
 * - เข้าสู่ระบบ (Login)
 * - สร้าง JWT Token
 * - ดึงข้อมูล Profile
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * สมัครสมาชิกใหม่
   * 1. ตรวจสอบว่า email ซ้ำหรือไม่
   * 2. สร้าง user ใหม่ (password จะถูก hash ใน UsersService)
   * 3. สร้าง JWT token
   * 4. return user + token สำหรับ login ทันที
   */
  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );

    // สร้าง JWT payload (sub = user ID)
    const payload = { sub: (user as any)._id.toString(), email: user.email, name: user.name };
    const token = this.jwtService.sign(payload);

    // Return user info + token (รวมที่อยู่และข้อมูลบัตรเพื่อ auto-fill)
    return {
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        district: user.district,
        city: user.city,
        province: user.province,
        postalCode: user.postalCode,
        cardName: user.cardName,
        cardLast4: user.cardLast4,
        cardExpiry: user.cardExpiry,
      },
      token,
    };
  }

  /**
   * เข้าสู่ระบบ
   * 1. ตรวจสอบว่ามี user หรือไม่
   * 2. ตรวจสอบรหัสผ่าน (bcrypt compare)
   * 3. สร้าง JWT token
   * 4. return user + token
   */
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // สร้าง JWT payload
    const payload = { sub: (user as any)._id.toString(), email: user.email, name: user.name };
    const token = this.jwtService.sign(payload);

    // Return user info + token (รวมที่อยู่และข้อมูลบัตร)
    return {
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        district: user.district,
        city: user.city,
        province: user.province,
        postalCode: user.postalCode,
        cardName: user.cardName,
        cardLast4: user.cardLast4,
        cardExpiry: user.cardExpiry,
      },
      token,
    };
  }

  /**
   * ดึงข้อมูล Profile ของ user
   * ใช้โดย JwtAuthGuard หลัง verify token สำเร็จ
   */
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: (user as any)._id.toString(),
      name: user.name,
      email: user.email,
    };
  }
}
