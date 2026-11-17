import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiHeader,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import type { Type } from '@nestjs/common';
import { ApiErrorResponseDto, PaginationMetaDto } from './api-response.dto';

const RESPONSE_HEADERS = {
  'x-request-id': {
    description: 'Identificador da requisição para rastreamento nos logs.',
    schema: { type: 'string', format: 'uuid' },
  },
};

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Requisição inválida, parâmetros incorretos ou falha de validação.',
  401: 'Cookie de autenticação ausente, inválido ou expirado.',
  403: 'Origem não permitida ou acesso negado ao recurso.',
  404: 'Recurso não encontrado para o usuário autenticado.',
  409: 'Conflito com um recurso ou relacionamento já existente.',
  429: 'Limite de requisições excedido.',
  500: 'Erro interno não detalhado para o cliente.',
  503: 'Serviço externo temporariamente indisponível.',
};

interface SuccessResponseOptions {
  status: number;
  description: string;
  type: Type<unknown>;
  setCookie?: boolean;
}

export function ApiDataResponse(options: SuccessResponseOptions) {
  return applyDecorators(
    ApiExtraModels(options.type),
    ApiResponse({
      status: options.status,
      description: options.description,
      headers: options.setCookie
        ? {
            ...RESPONSE_HEADERS,
            'Set-Cookie': {
              description:
                'Cookies HttpOnly de sessão. Pode incluir access_token e refresh_token.',
              schema: { type: 'string' },
            },
          }
        : RESPONSE_HEADERS,
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: { $ref: getSchemaPath(options.type) },
        },
      },
    }),
  );
}

export function ApiArrayDataResponse(options: SuccessResponseOptions) {
  return applyDecorators(
    ApiExtraModels(options.type),
    ApiResponse({
      status: options.status,
      description: options.description,
      headers: RESPONSE_HEADERS,
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(options.type) },
          },
        },
      },
    }),
  );
}

export function ApiPaginatedResponse(type: Type<unknown>, description: string) {
  return applyDecorators(
    ApiExtraModels(type, PaginationMetaDto),
    ApiResponse({
      status: 200,
      description,
      headers: RESPONSE_HEADERS,
      schema: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(type) } },
          meta: { $ref: getSchemaPath(PaginationMetaDto) },
        },
      },
    }),
  );
}

export function ApiRawResponse(
  status: number,
  description: string,
  schema: Record<string, unknown>,
) {
  return ApiResponse({
    status,
    description,
    headers: RESPONSE_HEADERS,
    schema,
  });
}

export function ApiErrors(...statuses: number[]) {
  return applyDecorators(
    ApiExtraModels(ApiErrorResponseDto),
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: ERROR_DESCRIPTIONS[status] ?? 'Falha na requisição.',
        headers: RESPONSE_HEADERS,
        type: ApiErrorResponseDto,
      }),
    ),
  );
}

export function ApiCommonRequestHeaders() {
  return ApiHeader({
    name: 'X-Request-ID',
    required: false,
    description:
      'UUID opcional fornecido pelo cliente. Quando omitido, a API gera um identificador.',
    schema: { type: 'string', format: 'uuid' },
  });
}

export function ApiMutationHeaders() {
  return applyDecorators(
    ApiHeader({
      name: 'Origin',
      required: false,
      description:
        'Origem do cliente. A origem da própria API (Swagger) é aceita automaticamente; origens externas são validadas contra CORS_ORIGIN.',
      schema: {
        type: 'string',
        format: 'uri',
        example: 'http://localhost:4200',
      },
    }),
  );
}

export function ApiProtectedController() {
  return applyDecorators(ApiCookieAuth(), ApiCommonRequestHeaders());
}

export function ApiRefreshCookie() {
  return ApiCookieAuth('refreshCookie');
}

export function ApiUuidParam(name: 'id' | 'songId', description: string) {
  return ApiParam({
    name,
    description,
    format: 'uuid',
    example: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
  });
}
