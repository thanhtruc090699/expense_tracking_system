import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LisaController } from './lisa.controller';
import { LisaService } from './lisa.service';

@Module({
  imports: [ConfigModule],
  controllers: [LisaController],
  providers: [LisaService],
})
export class LisaModule {}