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
import { ReorderSetlistSongsDto } from './dto/reorder-setlist-songs.dto';
import { AddSongToSetlistDto } from './dto/add-song-to-setlist.dto';
import { CreateSetlistDto } from './dto/create-setlist.dto';
import { ListSetlistsQueryDto } from './dto/list-setlists-query.dto';
import { UpdateSetlistSongDto } from './dto/update-setlist-song.dto';
import { UpdateSetlistDto } from './dto/update-setlist.dto';
import { SetlistsService } from './setlists.service';
import {
  SetlistSummaryResponseDto,
  SetlistDetailResponseDto,
  SetlistResponseDto,
  SetlistSongDeletedResponseDto,
  SetlistSongResponseDto,
} from './dto/setlist-response.dto';
import { SetlistOrderResponseDto } from './dto/reorder-setlist-songs.dto';
import { DeletedResourceDto } from '../../common/swagger/api-response.dto';
import {
  ApiDataResponse,
  ApiErrors,
  ApiMutationHeaders,
  ApiPaginatedResponse,
  ApiProtectedController,
  ApiUuidParam,
} from '../../common/swagger/api-documentation.decorators';

@ApiTags('Setlists')
@ApiProtectedController()
@Controller('setlists')
export class SetlistsController {
  constructor(private readonly setlistsService: SetlistsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar setlists do usuário',
    description:
      'Retorna setlists não removidas pertencentes ao usuário, com paginação, busca por nome e ordenação. Inclui quantidade de músicas, duração conhecida, durações ausentes e até quatro capas, sem consultas de detalhe por item.',
  })
  @ApiPaginatedResponse(
    SetlistSummaryResponseDto,
    'Setlists recuperadas com sucesso.',
  )
  @ApiErrors(400, 401, 429, 500)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListSetlistsQueryDto,
  ) {
    return this.setlistsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter uma setlist com suas músicas',
    description:
      'Retorna a setlist do usuário e suas músicas ordenadas pelo campo position.',
  })
  @ApiUuidParam('id', 'ID da setlist.')
  @ApiDataResponse({
    status: 200,
    description: 'Setlist recuperada com sucesso.',
    type: SetlistDetailResponseDto,
  })
  @ApiErrors(400, 401, 404, 429, 500)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.setlistsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar uma setlist',
    description:
      'Cria uma setlist pertencente ao usuário com visibilidade privada, pública ou não listada.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 201,
    description: 'Setlist criada com sucesso.',
    type: SetlistResponseDto,
  })
  @ApiErrors(400, 401, 403, 409, 429, 500)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSetlistDto,
  ) {
    return this.setlistsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma setlist',
    description:
      'Atualiza nome, descrição ou visibilidade de uma setlist pertencente ao usuário.',
  })
  @ApiUuidParam('id', 'ID da setlist.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Setlist atualizada com sucesso.',
    type: SetlistResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSetlistDto,
  ) {
    return this.setlistsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover uma setlist',
    description: 'Realiza soft delete de uma setlist pertencente ao usuário.',
  })
  @ApiUuidParam('id', 'ID da setlist.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Setlist removida com sucesso.',
    type: DeletedResourceDto,
  })
  @ApiErrors(400, 401, 403, 404, 429, 500)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.setlistsService.remove(user.id, id);
  }

  @Post(':id/songs')
  @ApiOperation({
    summary: 'Adicionar uma música à setlist',
    description:
      'Associa uma música do mesmo usuário. Quando position é omitido, adiciona ao final da setlist.',
  })
  @ApiUuidParam('id', 'ID da setlist.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 201,
    description: 'Música adicionada à setlist.',
    type: SetlistSongResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  addSong(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddSongToSetlistDto,
  ) {
    return this.setlistsService.addSong(user.id, id, dto);
  }

  @Patch(':id/songs/order')
  @ApiOperation({
    summary: 'Reordenar todas as músicas ativas da setlist',
    description:
      'Aplica a lista completa de IDs em uma única transação, verificando ownership e impedindo IDs ausentes, duplicados ou externos. Retorna o ID da setlist; nenhuma posição intermediária fica persistida.',
  })
  @ApiUuidParam('id', 'ID da setlist.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    type: SetlistOrderResponseDto,
    description: 'Ordem atualizada com sucesso.',
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  reorderSongs(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderSetlistSongsDto,
  ) {
    return this.setlistsService.reorderSongs(user.id, id, dto.song_ids);
  }

  @Patch(':id/songs/:songId')
  @ApiOperation({
    summary: 'Atualizar posição ou notas da música na setlist',
    description:
      'Atualiza somente os campos enviados da associação entre a setlist e a música.',
  })
  @ApiUuidParam('id', 'ID da setlist.')
  @ApiUuidParam('songId', 'ID da música associada.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Associação atualizada com sucesso.',
    type: SetlistSongResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  updateSong(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('songId', ParseUUIDPipe) songId: string,
    @Body() dto: UpdateSetlistSongDto,
  ) {
    return this.setlistsService.updateSong(user.id, id, songId, dto);
  }

  @Delete(':id/songs/:songId')
  @ApiOperation({
    summary: 'Remover uma música da setlist',
    description: 'Remove permanentemente a associação, sem apagar a música.',
  })
  @ApiUuidParam('id', 'ID da setlist.')
  @ApiUuidParam('songId', 'ID da música associada.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Música removida da setlist.',
    type: SetlistSongDeletedResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 429, 500)
  removeSong(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('songId', ParseUUIDPipe) songId: string,
  ) {
    return this.setlistsService.removeSong(user.id, id, songId);
  }
}
