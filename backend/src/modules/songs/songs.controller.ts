import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { CreateSongDto } from './dto/create-song.dto';
import { ListSongsQueryDto } from './dto/list-songs-query.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { UpdateSongTechniquesDto } from './dto/update-song-techniques.dto';
import { SongsService } from './songs.service';
import { SongResponseDto } from './dto/song-response.dto';
import { DeletedResourceDto } from '../../common/swagger/api-response.dto';
import {
  ApiDataResponse,
  ApiErrors,
  ApiMutationHeaders,
  ApiPaginatedResponse,
  ApiProtectedController,
  ApiUuidParam,
} from '../../common/swagger/api-documentation.decorators';

@ApiTags('Músicas')
@ApiProtectedController()
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar músicas do usuário',
    description:
      'Retorna somente músicas não removidas pertencentes ao usuário. Suporta paginação, busca por título/artista e ordenação.',
  })
  @ApiPaginatedResponse(SongResponseDto, 'Músicas recuperadas com sucesso.')
  @ApiErrors(400, 401, 429, 500)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListSongsQueryDto,
  ) {
    return this.songsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter uma música do usuário',
    description:
      'Busca a música simultaneamente pelo ID e pelo usuário autenticado.',
  })
  @ApiUuidParam('id', 'ID da música.')
  @ApiDataResponse({
    status: 200,
    description: 'Música recuperada com sucesso.',
    type: SongResponseDto,
  })
  @ApiErrors(400, 401, 404, 429, 500)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.songsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar uma música',
    description:
      'Cria uma música vinculada automaticamente ao usuário autenticado.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 201,
    description: 'Música criada com sucesso.',
    type: SongResponseDto,
  })
  @ApiErrors(400, 401, 403, 409, 429, 500)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSongDto) {
    return this.songsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma música',
    description:
      'Atualiza somente os campos enviados de uma música pertencente ao usuário.',
  })
  @ApiUuidParam('id', 'ID da música.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Música atualizada com sucesso.',
    type: SongResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSongDto,
  ) {
    return this.songsService.update(user.id, id, dto);
  }

  @Patch(':id/techniques')
  @ApiOperation({
    summary: 'Substituir as técnicas de uma música',
    description:
      'Valida o catálogo ativo e substitui integralmente as técnicas associadas à música do usuário.',
  })
  @ApiUuidParam('id', 'ID da música.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Técnicas da música atualizadas com sucesso.',
    type: SongResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  updateTechniques(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSongTechniquesDto,
  ) {
    return this.songsService.updateTechniques(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover uma música',
    description:
      'Realiza soft delete. O registro permanece no banco, mas deixa de aparecer nas consultas.',
  })
  @ApiUuidParam('id', 'ID da música.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Música removida com sucesso.',
    type: DeletedResourceDto,
  })
  @ApiErrors(400, 401, 403, 404, 429, 500)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.songsService.remove(user.id, id);
  }
}
