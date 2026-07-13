import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: 'localhost',
          port: 6381,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'order',
    }),
  ],
  exports: [
    BullModule.registerQueue({
      name: 'order',
    }),
  ],
})
export class QueueModule {}
