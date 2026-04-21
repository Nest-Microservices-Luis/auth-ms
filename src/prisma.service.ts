import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment');
    }

    super({});
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to MongoDB');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
