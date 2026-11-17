import { DocumentBuilder } from '@nestjs/swagger';

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Lydian API')
    .setDescription(
      'API REST backend-centric para gerenciamento de perfil, músicas, setlists e sessões de prática. Todas as respostas, exceto o health check, usam o envelope `{ data, meta? }`. A autenticação usa exclusivamente cookies HttpOnly.',
    )
    .setVersion('1.0')
    .addTag('Infraestrutura', 'Saúde e disponibilidade da API')
    .addTag('Autenticação', 'Criação de conta e gerenciamento da sessão')
    .addTag('Perfil', 'Perfil do usuário autenticado')
    .addTag('Músicas', 'Catálogo pessoal de músicas')
    .addTag('Setlists', 'Repertórios e suas músicas')
    .addTag('Sessões de prática', 'Registro de estudos musicais')
    .addTag('Assets', 'Uploads privados por URLs assinadas')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      description: 'JWT de acesso armazenado em cookie HttpOnly.',
    })
    .addCookieAuth(
      'refresh_token',
      {
        type: 'apiKey',
        in: 'cookie',
        description: 'Refresh token armazenado em cookie HttpOnly.',
      },
      'refreshCookie',
    )
    .build();
}
