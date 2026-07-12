import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@CurrentUser() user: any) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
