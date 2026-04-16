import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OcrModule } from './ocr/ocr.module';
import { UsersModule } from './users/users.module';
import { BillsModule } from './bills/bills.module';
import { LisaModule } from './lisa/lisa.module';

@Module({
  imports: [OcrModule, UsersModule, BillsModule, LisaModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
