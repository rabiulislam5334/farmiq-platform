import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';

describe('OrderService', () => {
  let service: OrderService;
  let mockPrisma: any;
  let mockQueue: any;
  let mockInventoryService: any;

  const mockProduct = {
    id: 'product-1',
    sellerId: 'seller-1',
    status: 'ACTIVE',
    price: 35,
    quantity: 100,
  };

  beforeEach(async () => {
    mockPrisma = {
      product: {
        findUnique: jest.fn<(...args: any[]) => Promise<any>>(),
      },
      order: {
        count: jest.fn<(...args: any[]) => Promise<any>>(),
      },
      $transaction: jest.fn<(...args: any[]) => Promise<any>>(),
    };

    mockQueue = {
      add: jest.fn<(...args: any[]) => Promise<any>>(),
    };

    mockInventoryService = {
      reserveStock: jest.fn<(...args: any[]) => Promise<any>>(),
      releaseStock: jest.fn<(...args: any[]) => Promise<any>>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken('order'), useValue: mockQueue },
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('create', () => {
    it('should decrement product stock exactly once (regression test for double-decrement bug)', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.order.count.mockResolvedValue(0);
      mockInventoryService.reserveStock.mockResolvedValue(true);

      // $transaction callback-টা নিজে চালাই, real Prisma transaction simulate করতে
      let stockUpdateCallCount = 0;
      const fakeTx = {
        order: {
          create: jest
            .fn<(...args: any[]) => Promise<any>>()
            .mockResolvedValue({
              id: 'order-1',
              productId: 'product-1',
              quantity: 5,
            }),
        },
        product: {
          updateMany: jest
            .fn<(...args: any[]) => Promise<any>>()
            .mockImplementation(() => {
              stockUpdateCallCount += 1;
              return Promise.resolve({ count: 1 });
            }),
        },
      };
      mockPrisma.$transaction.mockImplementation((callback: any) =>
        callback(fakeTx),
      );

      await service.create('buyer-1', {
        productId: 'product-1',
        quantity: 5,
      } as any);

      // মূল assertion — stock update ঠিক ১ বার হয়েছে, ২ বার না
      expect(stockUpdateCallCount).toBe(1);
      expect(fakeTx.product.updateMany).toHaveBeenCalledTimes(1);
    });

    it('should reject order if requested quantity exceeds available stock', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.create('buyer-1', {
          productId: 'product-1',
          quantity: 999, // stock এর চেয়ে বেশি
        } as any),
      ).rejects.toThrow(BadRequestException);

      // stock check-এ fail করলে Redis reservation বা DB transaction পর্যন্ত পৌঁছানোর কথাই না
      expect(mockInventoryService.reserveStock).not.toHaveBeenCalled();
    });

    it('should reject order if buyer tries to order their own product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        sellerId: 'buyer-1', // buyer নিজেই seller
      });

      await expect(
        service.create('buyer-1', {
          productId: 'product-1',
          quantity: 5,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should release Redis reservation if DB transaction fails', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.order.count.mockResolvedValue(0);
      mockInventoryService.reserveStock.mockResolvedValue(true);

      // DB transaction ব্যর্থ হচ্ছে simulate করছি (যেমন race condition-এ stock শেষ)
      mockPrisma.$transaction.mockRejectedValue(
        new BadRequestException('Stock unavailable'),
      );

      await expect(
        service.create('buyer-1', {
          productId: 'product-1',
          quantity: 5,
        } as any),
      ).rejects.toThrow(BadRequestException);

      // এটাই মূল assertion — DB fail করলে Redis reservation যেন ঝুলে না থাকে, release হতে হবে
      expect(mockInventoryService.releaseStock).toHaveBeenCalledWith(
        'product-1',
        expect.any(String),
      );
    });

    it('should reject reservation if Redis reservation fails (stock contested by others)', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.order.count.mockResolvedValue(0);
      mockInventoryService.reserveStock.mockResolvedValue(false); // Redis-এ reserve করতে ব্যর্থ

      await expect(
        service.create('buyer-1', {
          productId: 'product-1',
          quantity: 5,
        } as any),
      ).rejects.toThrow(BadRequestException);

      // Reserve fail করলে DB transaction পর্যন্ত পৌঁছানোর কথাই না
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
