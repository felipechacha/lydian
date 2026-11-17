import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import {
  ApiDataResponse,
  ApiErrors,
  ApiProtectedController,
} from '../../common/swagger/api-documentation.decorators';
import { PracticeSummaryResponseDto } from './dto/practice-summary-response.dto';
import { PracticeSummaryService } from './practice-summary.service';

@ApiTags('Perfil')
@ApiProtectedController()
@Controller('me/practice-summary')
export class PracticeSummaryController {
  constructor(private readonly summaryService: PracticeSummaryService) {}

  @Get()
  @ApiOperation({
    summary: 'Obter indicadores de prática para Home e Profile',
    description:
      'Agrega todo o histórico concluído no timezone da meta, com totais, sequência, semana, habilidades e conquistas mensuráveis. Dias são atribuídos ao início da sessão; não há limite de 100 sessões.',
  })
  @ApiDataResponse({
    status: 200,
    type: PracticeSummaryResponseDto,
    description: 'Indicadores recuperados com sucesso.',
  })
  @ApiErrors(401, 404, 429, 500)
  getSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.summaryService.getSummary(user.id);
  }
}
