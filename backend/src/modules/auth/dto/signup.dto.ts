import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'O endereço de e-mail para a nova conta',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha da conta (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Felipe Chacha',
    description: 'Nome completo do usuário',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  fullName: string;
}
