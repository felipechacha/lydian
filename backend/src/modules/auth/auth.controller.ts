import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCookieService } from './auth-cookie.service';
import {
  RequestPasswordRecoveryDto,
  ResetPasswordDto,
} from './dto/password-recovery.dto';
import { ResetPasswordSessionDto } from './dto/reset-password-session.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthResponseDto, SignupResponseDto } from './dto/auth-responses.dto';
import { SessionUserResponseDto } from './dto/session-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import {
  ApiCommonRequestHeaders,
  ApiDataResponse,
  ApiErrors,
  ApiMutationHeaders,
  ApiRefreshCookie,
} from '../../common/swagger/api-documentation.decorators';

@ApiTags('Autenticação')
@ApiCommonRequestHeaders()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookies: AuthCookieService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('signup')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description:
      'Cria uma nova conta de usuário no sistema e retorna os dados básicos do perfil criado. Limites de envio de e-mail do Supabase são retornados como HTTP 429.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 201,
    description: 'Usuário criado com sucesso.',
    type: SignupResponseDto,
  })
  @ApiErrors(400, 403, 429, 500, 503)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login de usuário',
    description:
      'Valida as credenciais e define os cookies HttpOnly (access_token e refresh_token) no navegador do usuário. Contas que exigem confirmação de e-mail retornam HTTP 403 enquanto não forem confirmadas.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Login realizado com sucesso. Cookies de sessão configurados.',
    type: AuthResponseDto,
    setCookie: true,
  })
  @ApiErrors(400, 401, 403, 429, 500, 503)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(loginDto);

    if (!session) {
      throw new UnauthorizedException('Failed to create session');
    }

    this.authCookies.setSession(
      response,
      session.access_token,
      session.refresh_token,
    );

    return { message: 'Login successful' };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Encerrar sessão',
    description:
      'Remove os cookies de autenticação do navegador, encerrando a sessão atual.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Sessão invalidada e cookies removidos.',
    type: AuthResponseDto,
    setCookie: true,
  })
  @ApiErrors(401, 403, 429, 500, 503)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = request.cookies.access_token;
    if (!accessToken) throw new UnauthorizedException('No access token found');
    await this.authService.logout(accessToken);
    this.authCookies.clearSession(response);
    return { message: 'Logged out' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Renovar tokens de acesso',
    description:
      'Utiliza o refresh_token (enviado via cookie) para gerar um novo par de tokens de sessão.',
  })
  @ApiRefreshCookie()
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    description: 'Tokens renovados com sucesso.',
    type: AuthResponseDto,
    setCookie: true,
  })
  @ApiErrors(401, 403, 429, 500, 503)
  async refresh(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    const session = await this.authService.refresh(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Failed to refresh session');
    }

    this.authCookies.setSession(
      response,
      session.access_token,
      session.refresh_token,
    );

    return { message: 'Token refreshed' };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Solicitar recuperação de senha',
    description:
      'Envia o link pelo Supabase para a URL fixa configurada pelo backend. A resposta não informa se o e-mail está cadastrado. Limite de 5 solicitações por IP a cada 5 minutos.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    type: AuthResponseDto,
    description:
      'Solicitação recebida; mensagem genérica para qualquer e-mail válido.',
  })
  @ApiErrors(400, 403, 429, 500, 503)
  requestPasswordRecovery(@Body() dto: RequestPasswordRecoveryDto) {
    return this.authService.requestPasswordRecovery(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Redefinir senha usando token de recuperação',
    description:
      'Valida TokenHash exclusivamente como recovery, atualiza a senha e revoga refresh tokens globalmente. Não retorna tokens de sessão. Tokens inválidos, expirados ou já utilizados retornam 401.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    type: AuthResponseDto,
    setCookie: true,
    description: 'Senha atualizada e cookies removidos. Faça login novamente.',
  })
  @ApiErrors(400, 401, 403, 429, 500, 503)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.resetPassword(dto);
    this.authCookies.clearSession(response);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('reset-password/session')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Redefinir senha pela sessão de recuperação do template padrão',
    description:
      'Valida o refresh token no Supabase e consome atomicamente uma prova enviada somente no link de recovery, vinculada ao e-mail verificado e com validade de uma hora. Compatível com o envio padrão limitado do Supabase. Uma sessão comum sem a prova do e-mail não autoriza a alteração; provas inválidas, expiradas e reutilizadas são rejeitadas.',
  })
  @ApiMutationHeaders()
  @ApiDataResponse({
    status: 200,
    type: AuthResponseDto,
    setCookie: true,
    description: 'Senha atualizada, sessões revogadas e cookies removidos.',
  })
  @ApiErrors(400, 401, 403, 429, 500, 503)
  async resetPasswordFromSession(
    @Body() dto: ResetPasswordSessionDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.resetPasswordFromSession(dto);
    this.authCookies.clearSession(response);
    return result;
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Perfil do usuário logado',
    description:
      'Retorna as informações do perfil do usuário atualmente autenticado na sessão.',
  })
  @ApiDataResponse({
    status: 200,
    description: 'Identidade da sessão recuperada com sucesso.',
    type: SessionUserResponseDto,
  })
  @ApiErrors(401, 429, 500)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
