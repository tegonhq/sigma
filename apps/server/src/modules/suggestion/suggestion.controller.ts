import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateSuggestionDto, GenerateSummaryDto } from '@tegonhq/sigma-sdk';

import { AuthGuard } from 'modules/auth/auth.guard';
import { UserId } from 'modules/auth/session.decorator';

import SuggestionService from './suggestion.service';

@Controller({
  version: '1',
  path: 'suggestion',
})
export class SuggestionController {
  constructor(private suggestionService: SuggestionService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() data: CreateSuggestionDto) {
    return this.suggestionService.create(data);
  }

  @Post('suggest')
  @UseGuards(AuthGuard)
  async getSuggestion(
    @Body() data: GenerateSummaryDto,
    @UserId() userId: string,
  ) {
    return this.suggestionService.getSuggestion(data, userId);
  }
}
