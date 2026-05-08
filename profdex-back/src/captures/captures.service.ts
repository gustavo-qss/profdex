import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CapturesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, professorId: string) {
    const discovered = await this.prisma.discovery.findUnique({
      where: { userId_professorId: { userId, professorId } },
    });
    if (!discovered) {
      throw new BadRequestException('Professor não foi descoberto ainda');
    }

    return this.prisma.capture.upsert({
      where: { userId_professorId: { userId, professorId } },
      update: {},
      create: { userId, professorId },
      include: { professor: true },
    });
  }

  findAll(userId: string) {
    return this.prisma.capture.findMany({
      where: { userId },
      include: { professor: true },
      orderBy: { capturedAt: 'desc' },
    });
  }
}
