import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';

// Explicit mock types দিচ্ছি যাতে TypeScript error না দেয়
const mockRedis = {
  exists: jest.fn<(...args: any[]) => Promise<any>>(),
  scan: jest.fn<(...args: any[]) => Promise<any>>(),
  mget: jest.fn<(...args: any[]) => Promise<any>>(),
  set: jest.fn<(...args: any[]) => Promise<any>>(),
  del: jest.fn<(...args: any[]) => Promise<any>>(),
  multi: jest.fn<(...args: any[]) => any>(), // future-এ multi() ব্যবহার করলে কাজে লাগবে
};

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  describe('reserveStock', () => {
    it('should reserve stock when enough is available', async () => {
      mockRedis.exists.mockResolvedValue(0);
      mockRedis.scan.mockResolvedValue(['0', []]);
      mockRedis.mget.mockResolvedValue([]);
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.reserveStock('product-1', 'order-1', 5, 10);

      expect(result).toBe(true);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'inventory:order:product-1:order-1',
        5,
        'EX',
        15 * 60,
      );
    });

    it('should reject reservation when not enough stock is available', async () => {
      mockRedis.exists.mockResolvedValue(0);
      mockRedis.scan.mockResolvedValue([
        '0',
        ['inventory:order:product-1:order-2'],
      ]);
      mockRedis.mget.mockResolvedValue(['8']);

      const result = await service.reserveStock('product-1', 'order-1', 5, 10);

      expect(result).toBe(false);
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('should return true immediately if this order already has a reservation (idempotency)', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await service.reserveStock('product-1', 'order-1', 5, 10);

      expect(result).toBe(true);
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('releaseStock', () => {
    it('should delete the reservation key', async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.releaseStock('product-1', 'order-1');

      expect(mockRedis.del).toHaveBeenCalledWith(
        'inventory:order:product-1:order-1',
      );
    });
  });

  describe('getReservedQuantity', () => {
    it('should sum quantities across all matching keys', async () => {
      mockRedis.scan.mockResolvedValue([
        '0',
        [
          'inventory:order:product-1:order-1',
          'inventory:order:product-1:order-2',
        ],
      ]);
      mockRedis.mget.mockResolvedValue(['3', '4']);

      const total = await service.getReservedQuantity('product-1');

      expect(total).toBe(7);
    });

    it('should handle pagination across multiple scan cursors', async () => {
      mockRedis.scan
        .mockResolvedValueOnce(['100', ['key1']])
        .mockResolvedValueOnce(['0', ['key2']]);
      mockRedis.mget.mockResolvedValueOnce(['3']).mockResolvedValueOnce(['4']);

      const total = await service.getReservedQuantity('product-1');

      expect(total).toBe(7);
      expect(mockRedis.scan).toHaveBeenCalledTimes(2);
    });
  });
});
