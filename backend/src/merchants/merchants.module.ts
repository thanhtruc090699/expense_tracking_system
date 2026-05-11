import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { MerchantsApiImpl } from './merchants.impl';
import { MERCHANTS_API_PROVIDER } from './merchants.constants';

@Module({
  imports: [JwtModule],
  controllers: [MerchantsController],
  providers: [
    MerchantsService,
    {
      provide: MERCHANTS_API_PROVIDER,
      useClass: MerchantsApiImpl,
    },
  ],
  exports: [MERCHANTS_API_PROVIDER],
})
export class MerchantsModule {}
