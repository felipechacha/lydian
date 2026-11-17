import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { AssetsService } from './assets.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { GetSignedUrlQueryDto } from './dto/get-signed-url-query.dto';
import {
  SignedReadUrlResponseDto,
  SignedUploadUrlResponseDto,
} from './dto/asset-response.dto';
import {
  ApiDataResponse,
  ApiErrors,
  ApiMutationHeaders,
  ApiProtectedController,
} from '../../common/swagger/api-documentation.decorators';

@ApiTags('Assets')
@ApiProtectedController()
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload-url')
  @ApiOperation({
    summary: 'Gerar URL assinada para upload de avatar ou capa',
    description:
      'Valida tipo e tamanho, cria um caminho privado pertencente ao usuário e retorna uma URL de upload de uso único.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 201,
    description: 'URL assinada de upload gerada com sucesso.',
    type: SignedUploadUrlResponseDto,
  })
  @ApiErrors(400, 401, 403, 429, 500)
  createUploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateUploadUrlDto,
  ) {
    return this.assetsService.createUploadUrl(user.id, dto);
  }

  @Get('signed-url')
  @ApiOperation({
    summary: 'Gerar URL temporária de leitura de um asset privado',
    description:
      'Aceita somente caminhos dentro do diretório do usuário autenticado. A URL expira em dez minutos.',
  })
  @ApiDataResponse({
    status: 200,
    description: 'URL temporária de leitura gerada com sucesso.',
    type: SignedReadUrlResponseDto,
  })
  @ApiErrors(400, 401, 403, 429, 500)
  createReadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetSignedUrlQueryDto,
  ) {
    return this.assetsService.createReadUrl(user.id, query.path);
  }
}
