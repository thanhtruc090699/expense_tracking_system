import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersApiImpl } from './users.impl';
import { USERS_API_PROVIDER } from './users.constants';

@Module({
  imports: [JwtModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_API_PROVIDER,
      useClass: UsersApiImpl,
    },
  ],
  exports: [USERS_API_PROVIDER],
})
export class UsersModule {}
