import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersApiImpl } from './users.impl';
import { USERS_API_PROVIDER } from './users.constants';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_API_PROVIDER,
      useClass: UsersApiImpl,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
