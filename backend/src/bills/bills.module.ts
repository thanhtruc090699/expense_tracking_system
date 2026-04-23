import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { BillsApiImpl } from './bills.impl';
import { BILLS_API_PROVIDER } from './bills.constants';

@Module({
  imports: [AuthModule],
  controllers: [BillsController],
  providers: [
    BillsService,
    {
      provide: BILLS_API_PROVIDER,
      useClass: BillsApiImpl,
    },
  ],
  exports: [BillsService],
})
export class BillsModule {}
