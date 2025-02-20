import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateSummaryDto, GenerateSummaryDto } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { UserId } from 'modules/auth/session.decorator';

import SummaryService from './summary.service';

@Controller({
  version: '1',
  path: 'summary',
})
export class SummaryController {
  constructor(private summaryService: SummaryService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: CreateSummaryDto) {
    return this.summaryService.create(data);
  }

  @Post('generate')
  @UseGuards(AuthGuard)
  async generateSummary(
    @Body() data: GenerateSummaryDto,
    @UserId() userId: string,
  ) {
    return this.summaryService.generate(data, userId);
  }
}
