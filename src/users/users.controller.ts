import { Controller, Put, Delete, Body, Request, UseGuards, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.updateProfile(req.user.userId, updateUserDto);
    
    // Return user without password
    return {
      id: (updatedUser as any)._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      district: updatedUser.district,
      city: updatedUser.city,
      province: updatedUser.province,
      postalCode: updatedUser.postalCode,
      cardName: updatedUser.cardName,
      cardLast4: updatedUser.cardLast4,
      cardExpiry: updatedUser.cardExpiry,
    };
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Request() req, @Body('password') password: string) {
    if (!password) {
      throw new BadRequestException('Password is required to delete account');
    }
    
    await this.usersService.deleteAccount(req.user.userId, password);
    
    return {
      message: 'Account deleted successfully',
    };
  }
}
