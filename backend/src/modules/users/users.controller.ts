import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersService } from './users.service';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { PracticeGoalResponseDto } from './dto/practice-goal-response.dto';
import { UpdatePracticeGoalDto } from './dto/update-practice-goal.dto';
import {
  ApiDataResponse,
  ApiErrors,
  ApiMutationHeaders,
  ApiProtectedController,
} from '../../common/swagger/api-documentation.decorators';

@ApiTags('Perfil')
@ApiProtectedController()
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Obter o perfil do usuário autenticado',
    description:
      'Retorna o perfil de aplicação relacionado ao usuário validado pelo access_token.',
  })
  @ApiDataResponse({
    status: 200,
    description: 'Perfil recuperado com sucesso.',
    type: UserProfileResponseDto,
  })
  @ApiErrors(401, 404, 429, 500)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Atualizar o perfil do usuário autenticado',
    description:
      'Atualiza somente os campos enviados. O ID e o e-mail não podem ser alterados por esta rota.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso.',
    type: UserProfileResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 429, 500)
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Get('practice-goal')
  @ApiOperation({
    summary: 'Obter a meta de prática do usuário',
    description:
      'Retorna a meta diária, a frequência semanal e o timezone usados nos indicadores de prática.',
  })
  @ApiDataResponse({
    status: 200,
    description: 'Meta de prática recuperada com sucesso.',
    type: PracticeGoalResponseDto,
  })
  @ApiErrors(401, 404, 429, 500)
  getPracticeGoal(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getPracticeGoal(user.id);
  }

  @Patch('practice-goal')
  @ApiOperation({
    summary: 'Atualizar a meta de prática do usuário',
    description:
      'Cria ou atualiza os campos enviados da meta pessoal de prática e valida o timezone IANA.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Meta de prática atualizada com sucesso.',
    type: PracticeGoalResponseDto,
  })
  @ApiErrors(400, 401, 403, 404, 429, 500)
  updatePracticeGoal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePracticeGoalDto,
  ) {
    return this.usersService.updatePracticeGoal(user.id, dto);
  }
}
