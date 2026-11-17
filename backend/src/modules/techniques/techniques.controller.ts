import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiArrayDataResponse,
  ApiErrors,
  ApiProtectedController,
} from '../../common/swagger/api-documentation.decorators';
import { ListTechniquesQueryDto } from './dto/list-techniques-query.dto';
import { TechniqueResponseDto } from './dto/technique-response.dto';
import { TechniquesService } from './techniques.service';

@ApiTags('Técnicas')
@ApiProtectedController()
@Controller('techniques')
export class TechniquesController {
  constructor(private readonly techniquesService: TechniquesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar técnicas musicais',
    description:
      'Retorna o catálogo ativo de técnicas, com filtros opcionais por categoria e texto.',
  })
  @ApiArrayDataResponse({
    status: 200,
    description: 'Catálogo de técnicas recuperado com sucesso.',
    type: TechniqueResponseDto,
  })
  @ApiErrors(400, 401, 429, 500)
  findAll(@Query() query: ListTechniquesQueryDto) {
    return this.techniquesService.findAll(query);
  }
}
