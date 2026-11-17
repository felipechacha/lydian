import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordSessionDto {
  @ApiProperty({
    description:
      'Prova de uso único recebida na query recovery_token do link de e-mail.',
    minLength: 64,
    maxLength: 64,
  })
  @IsString()
  @MinLength(64)
  @MaxLength(64)
  recovery_token: string;

  @ApiProperty({
    description:
      'Refresh token da sessão emitida pelo link padrão de recovery do Supabase. Enviar somente no body.',
    maxLength: 2048,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  refresh_token: string;

  @ApiProperty({ description: 'Nova senha.', minLength: 6, maxLength: 128 })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}
