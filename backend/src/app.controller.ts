import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { RawResponse } from './common/decorators/raw-response.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiCommonRequestHeaders,
  ApiErrors,
  ApiRawResponse,
} from './common/swagger/api-documentation.decorators';

@ApiTags('Infraestrutura')
@ApiCommonRequestHeaders()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @RawResponse()
  @Get('health')
  @ApiOperation({
    summary: 'Verificar a disponibilidade da API',
    description:
      'Health check público e sem acesso ao banco. Não expõe configurações ou diagnósticos internos.',
  })
  @ApiRawResponse(200, 'API disponível.', {
    type: 'object',
    required: ['status'],
    properties: { status: { type: 'string', enum: ['ok'], example: 'ok' } },
  })
  @ApiErrors(429, 500)
  getHealth() {
    return this.appService.getHealth();
  }
}
