import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

const RESERVATION_TTL_SECONDS = 15 * 60; // ১৫ মিনিট

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private orderReservationKey(productId: string, orderId: string): string {
    return `inventory:order:${productId}:${orderId}`;
  }

  // এই মুহূর্তে এই product-এর জন্য মোট কত quantity reserved আছে
  // (persistent counter না রেখে সরাসরি existing keys থেকে বের করা হয় —
  //  TTL expire হলে key নিজেই বাদ পড়ে, কোনো drift/sync bug থাকে না)
  async getReservedQuantity(productId: string): Promise<number> {
    const pattern = `inventory:order:${productId}:*`;
    let cursor = '0';
    let total = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        const values = await this.redis.mget(...keys);
        for (const v of values) {
          if (v) total += parseInt(v, 10);
        }
      }
    } while (cursor !== '0');

    return total;
  }

  async reserveStock(
    productId: string,
    orderId: string,
    quantity: number,
    dbQuantity: number,
  ): Promise<boolean> {
    const orderKey = this.orderReservationKey(productId, orderId);

    // Duplicate/retry request protection
    const isAlreadyReserved = await this.redis.exists(orderKey);
    if (isAlreadyReserved) return true;

    const currentReserved = await this.getReservedQuantity(productId);
    const trulyAvailable = dbQuantity - currentReserved;

    if (trulyAvailable < quantity) {
      this.logger.warn(
        `Reservation failed: product=${productId} available=${trulyAvailable} requested=${quantity}`,
      );
      return false;
    }

    await this.redis.set(orderKey, quantity, 'EX', RESERVATION_TTL_SECONDS);
    return true;
  }

  async releaseStock(productId: string, orderId: string): Promise<void> {
    await this.redis.del(this.orderReservationKey(productId, orderId));
  }
}
