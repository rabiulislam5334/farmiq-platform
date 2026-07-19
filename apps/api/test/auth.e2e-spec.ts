/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ১. সবার আগে Node TLS চেকিং ডিজেবল করতে হবে যেন Prisma মডিউল লোড হওয়ার আগেই এটি পায়
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = `e2e-test-${Date.now()}@farmiq.test`;
  const testPassword = 'TestPassword123!';
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 30000); // ডাটাবেজ হ্যান্ডশেকের জন্য পর্যাপ্ত সময় দেওয়া হলো

  afterAll(async () => {
    try {
      // ডাটাবেজ কানেকশন ফেইল করলেও যেন টেস্ট রানার আটকে না থাকে, তাই try-catch ব্যবহার করা ভালো
      await prisma.user.deleteMany({ where: { email: testEmail } });
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      await app.close();
    }
  }, 15000);

  it('should register a new user', async () => {
    const res = await supertest(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'E2E Test User',
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBeLessThan(300);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.accessToken).toBeDefined();
  }, 15000);

  it('should reject registration with a duplicate email', async () => {
    const res = await supertest(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Duplicate User',
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  }, 15000);

  it('should login with correct credentials', async () => {
    const res = await supertest(app.getHttpServer()).post('/auth/login').send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();

    accessToken = res.body.data.accessToken;
  }, 15000);

  it('should reject login with wrong password', async () => {
    const res = await supertest(app.getHttpServer()).post('/auth/login').send({
      email: testEmail,
      password: 'WrongPassword123!',
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  }, 15000);

  it('should access a protected route with a valid token', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testEmail);
  }, 15000);

  it('should reject access to a protected route without a token', async () => {
    const res = await supertest(app.getHttpServer()).get('/users/me');
    expect(res.status).toBe(401);
  }, 15000);
});
