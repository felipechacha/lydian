import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'Operação realizada com sucesso' })
  message: string;
}

export class UserProfileDto {
  @ApiProperty({
    example: 'uuid-123-abc',
    description: 'ID único do usuário no banco de dados',
  })
  id: string;

  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'E-mail do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'authenticated',
    description: 'Papel/Nível de acesso do usuário',
  })
  role: string;
}

export class SignupResponseDto {
  @ApiProperty({
    example: 'uuid-456-def',
    description: 'ID do usuário recém criado',
  })
  id: string;

  @ApiProperty({ example: 'usuario@exemplo.com' })
  email: string;

  @ApiProperty({ example: 'Felipe Chacha' })
  fullName: string;
}
