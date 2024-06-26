import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthCheckModule } from './health-check/health-check.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule, HealthCheckModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
