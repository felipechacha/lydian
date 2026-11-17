import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { AddPracticeSongDto } from './dto/add-practice-song.dto';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { ListPracticeSessionsQueryDto } from './dto/list-practice-sessions-query.dto';
import { ListPracticeHistoryQueryDto } from './dto/list-practice-history-query.dto';
import { FinishPracticeSessionDto } from './dto/finish-practice-session.dto';
import { StartPracticeSessionDto } from './dto/start-practice-session.dto';
import { UpdatePracticeSessionDto } from './dto/update-practice-session.dto';
import { UpdatePracticeSongDto } from './dto/update-practice-song.dto';
import { PracticeService } from './practice.service';
import {
  PracticeSessionDetailResponseDto,
  PracticeSessionResponseDto,
  PracticeSessionSongDeletedResponseDto,
  PracticeSessionSongResponseDto,
} from './dto/practice-session-response.dto';
import { DeletedResourceDto } from '../../common/swagger/api-response.dto';
import {
  ApiDataResponse,
  ApiErrors,
  ApiMutationHeaders,
  ApiPaginatedResponse,
  ApiProtectedController,
  ApiUuidParam,
} from '../../common/swagger/api-documentation.decorators';

@ApiTags('Sessões de prática')
@ApiProtectedController()
@Controller('practice-sessions')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar sessões de prática',
    description:
      'Retorna sessões não removidas do usuário com paginação, busca por título/foco e ordenação.',
  })
  @ApiPaginatedResponse(
    PracticeSessionResponseDto,
    'Sessões de prática recuperadas com sucesso.',
  )
  @ApiErrors(400, 401, 429, 500)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPracticeSessionsQueryDto,
  ) {
    return this.practiceService.findAll(user.id, query);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Listar o histórico enriquecido de prática',
    description:
      'Retorna sessões concluídas com músicas e técnicas em uma consulta paginada, com filtros por música e período.',
  })
  @ApiPaginatedResponse(
    PracticeSessionDetailResponseDto,
    'Histórico de prática recuperado com sucesso.',
  )
  @ApiErrors(400, 401, 429, 500)
  findHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPracticeHistoryQueryDto,
  ) {
    return this.practiceService.findHistory(user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter uma sessão de prática',
    description:
      'Retorna a sessão pertencente ao usuário e todas as músicas registradas nela.',
  })
  @ApiUuidParam('id', 'ID da sessão de prática.')
  @ApiDataResponse({
    status: 200,
    description: 'Sessão de prática recuperada com sucesso.',
    type: PracticeSessionDetailResponseDto,
  })
  @ApiErrors(400, 401, 404, 429, 500)
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.practiceService.findOne(user.id, id);
  }
  @Post()
  @ApiOperation({
    summary: 'Criar uma sessão de prática',
    description:
      'Registra uma sessão. Quando início e término são enviados sem duração, a duração é calculada automaticamente.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 201,
    description: 'Sessão de prática criada com sucesso.',
    type: PracticeSessionResponseDto,
  })
  @ApiErrors(400, 401, 403, 429, 500)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePracticeSessionDto,
  ) {
    return this.practiceService.create(user.id, dto);
  }

  @Post('start')
  @ApiOperation({
    summary: 'Iniciar uma sessão já associada a uma música',
    description:
      'Cria a sessão e a associação com uma música do usuário na mesma transação de banco.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 201,
    description: 'Sessão iniciada e associada à música com sucesso.',
    type: PracticeSessionDetailResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartPracticeSessionDto,
  ) {
    return this.practiceService.start(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma sessão de prática',
    description:
      'Atualiza os campos enviados e recalcula a duração quando necessário.',
  })
  @ApiUuidParam('id', 'ID da sessão de prática.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Sessão de prática atualizada com sucesso.',
    type: PracticeSessionResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 429, 500)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePracticeSessionDto,
  ) {
    return this.practiceService.update(user.id, id, dto);
  }

  @Post(':id/finish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finalizar uma sessão de prática',
    description:
      'Persiste sessão, música, segundos, pausas, BPM, avaliações e técnicas em uma única transação.',
  })
  @ApiUuidParam('id', 'ID da sessão de prática.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Sessão finalizada com sucesso.',
    type: PracticeSessionDetailResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  finish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FinishPracticeSessionDto,
  ) {
    return this.practiceService.finish(user.id, id, dto);
  }
  @Delete(':id')
  @ApiOperation({
    summary: 'Remover uma sessão de prática',
    description: 'Realiza soft delete de uma sessão pertencente ao usuário.',
  })
  @ApiUuidParam('id', 'ID da sessão de prática.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Sessão de prática removida com sucesso.',
    type: DeletedResourceDto,
  })
  @ApiErrors(400, 401, 403, 404, 429, 500)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.practiceService.remove(user.id, id);
  }
  @Post(':id/songs')
  @ApiOperation({
    summary: 'Registrar uma música praticada na sessão',
    description:
      'Associa uma música do usuário e registra minutos, notas e avaliação de progresso.',
  })
  @ApiUuidParam('id', 'ID da sessão de prática.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 201,
    description: 'Música registrada na sessão.',
    type: PracticeSessionSongResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  addSong(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPracticeSongDto,
  ) {
    return this.practiceService.addSong(user.id, id, dto);
  }
  @Patch(':id/songs/:songId')
  @ApiOperation({
    summary: 'Atualizar uma música praticada',
    description:
      'Atualiza minutos, notas ou avaliação da música registrada na sessão.',
  })
  @ApiUuidParam('id', 'ID da sessão de prática.')
  @ApiUuidParam('songId', 'ID da música registrada.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Registro da música atualizado com sucesso.',
    type: PracticeSessionSongResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 409, 429, 500)
  updateSong(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('songId', ParseUUIDPipe) songId: string,
    @Body() dto: UpdatePracticeSongDto,
  ) {
    return this.practiceService.updateSong(user.id, id, songId, dto);
  }
  @Delete(':id/songs/:songId')
  @ApiOperation({
    summary: 'Remover uma música da sessão de prática',
    description: 'Remove a associação entre a sessão e a música do usuário.',
  })
  @ApiUuidParam('id', 'ID da sessão de prática.')
  @ApiUuidParam('songId', 'ID da música registrada.')
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Música removida da sessão.',
    type: PracticeSessionSongDeletedResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 429, 500)
  removeSong(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('songId', ParseUUIDPipe) songId: string,
  ) {
    return this.practiceService.removeSong(user.id, id, songId);
  }
}
