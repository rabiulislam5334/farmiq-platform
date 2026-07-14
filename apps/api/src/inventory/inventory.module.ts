import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { InventoryService } from './inventory.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const url =
          configService.get<string>('REDIS_URL') ?? 'redis://localhost:6381';
        return new Redis(url);
      },
      inject: [ConfigService],
    },
    InventoryService,
  ],
  // REDIS_CLIENT ও এক্সপোর্ট করে দিলাম যেন দরকার হলে অন্য মডিউলও সরাসরি ব্যবহার করতে পারে
  exports: ['REDIS_CLIENT', InventoryService],
})
export class InventoryModule {}
