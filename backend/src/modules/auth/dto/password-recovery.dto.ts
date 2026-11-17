import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RequestPasswordRecoveryDto {
  @ApiProperty({ example: 'usuario@exemplo.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description:
      'TokenHash do e-mail de recuperação. Validado exclusivamente como recovery no Supabase.',
    maxLength: 2048,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  token_hash: string;

  @ApiProperty({
    description: 'Nova senha; mesmas regras mínimas do cadastro.',
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}
