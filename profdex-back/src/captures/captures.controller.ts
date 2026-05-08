import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CapturesService } from './captures.service';
import { CreateCaptureDto } from './dto/create-capture.dto';

@UseGuards(JwtAuthGuard)
@Controller('captures')
export class CapturesController {
  constructor(private captures: CapturesService) {}

  @Post()
  create(@Body() dto: CreateCaptureDto, @Request() req: { user: { id: string } }) {
    return this.captures.create(req.user.id, dto.professorId);
  }

  @Get()
  findAll(@Request() req: { user: { id: string } }) {
    return this.captures.findAll(req.user.id);
  }
}
