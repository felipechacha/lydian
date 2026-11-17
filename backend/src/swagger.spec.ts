import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { buildSwaggerConfig } from './swagger.config';

const HTTP_METHODS = ['get', 'post', 'patch', 'delete'] as const;
const PUBLIC_OPERATIONS = new Set([
  'GET /v1/health',
  'POST /v1/auth/signup',
  'POST /v1/auth/login',
  'POST /v1/auth/forgot-password',
  'POST /v1/auth/reset-password',
  'POST /v1/auth/reset-password/session',
]);

interface SwaggerReference {
  $ref: string;
}

interface SwaggerParameter {
  in: string;
  name: string;
  description?: string;
  schema?: { format?: string };
}

interface SwaggerResponse {
  headers?: Record<string, unknown>;
}

interface SwaggerOperation {
  summary?: string;
  description?: string;
  responses?: Record<string, SwaggerResponse | SwaggerReference>;
  security?: Array<Record<string, string[]>>;
  parameters?: Array<SwaggerParameter | SwaggerReference>;
  requestBody?: unknown;
}

type SwaggerPathItem = Partial<
  Record<(typeof HTTP_METHODS)[number], SwaggerOperation>
>;

interface SwaggerDocument {
  paths: Record<string, SwaggerPathItem>;
}

describe('Swagger documentation', () => {
  let app: INestApplication;
  let document: SwaggerDocument;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    document = SwaggerModule.createDocument(
      app,
      buildSwaggerConfig(),
    ) as unknown as SwaggerDocument;
  });

  it('documents every MVP operation', () => {
    expect(readOperations(document)).toHaveLength(43);
  });

  it('provides descriptions, success responses, errors and request IDs', () => {
    for (const { operation, key } of readOperations(document)) {
      assertDocumented(Boolean(operation.summary), `${key} has no summary`);
      assertDocumented(
        Boolean(operation.description),
        `${key} has no description`,
      );
      const statuses = Object.keys(operation.responses ?? {});
      assertDocumented(
        statuses.some((status) => status.startsWith('2')),
        `${key} has no success response`,
      );
      assertDocumented(
        statuses.some((status) => status.startsWith('4')),
        `${key} has no client error response`,
      );
      expect(statuses).toContain('500');
      assertDocumented(
        hasHeaderParameter(operation, 'X-Request-ID'),
        `${key} has no X-Request-ID header`,
      );
      const success = Object.entries(operation.responses ?? {}).find(
        ([status]) => status.startsWith('2'),
      )?.[1];
      assertDocumented(
        Boolean(
          success && '$ref' in success
            ? undefined
            : success?.headers?.['x-request-id'],
        ),
        `${key} success has no request ID response header`,
      );
    }
  });

  it('documents cookie security for every protected operation', () => {
    for (const { operation, key } of readOperations(document)) {
      if (PUBLIC_OPERATIONS.has(key)) {
        expect(operation.security ?? []).toHaveLength(0);
      } else {
        assertDocumented(
          Boolean(operation.security?.length),
          `${key} has no cookie security`,
        );
      }
    }
  });

  it('documents Origin on every mutation', () => {
    for (const { operation, method, key } of readOperations(document)) {
      if (method === 'post' || method === 'patch' || method === 'delete') {
        assertDocumented(
          hasHeaderParameter(operation, 'Origin'),
          `${key} has no Origin header`,
        );
      }
    }
  });

  it('documents every UUID path parameter', () => {
    for (const { operation, key } of readOperations(document)) {
      const path = key.split(' ')[1];
      const names = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
      for (const name of names) {
        const parameter = operation.parameters?.find(
          (item) =>
            !('$ref' in item) && item.in === 'path' && item.name === name,
        );
        assertDocumented(
          Boolean(parameter),
          `${key} has no ${name} path parameter`,
        );
        if (parameter && !('$ref' in parameter)) {
          assertDocumented(
            Boolean(parameter.description),
            `${key} ${name} has no description`,
          );
          assertDocumented(
            'schema' in parameter && parameter.schema?.format === 'uuid',
            `${key} ${name} is not documented as UUID`,
          );
        }
      }
    }
  });

  it('documents request bodies for operations that accept DTOs', () => {
    const bodyOperations = readOperations(document).filter(({ key }) =>
      [
        'POST /v1/auth/signup',
        'POST /v1/auth/login',
        'POST /v1/auth/forgot-password',
        'POST /v1/auth/reset-password',
        'POST /v1/auth/reset-password/session',
        'PATCH /v1/me',
        'PATCH /v1/me/practice-goal',
        'POST /v1/songs',
        'PATCH /v1/songs/{id}',
        'PATCH /v1/songs/{id}/techniques',
        'POST /v1/setlists',
        'PATCH /v1/setlists/{id}',
        'POST /v1/setlists/{id}/songs',
        'PATCH /v1/setlists/{id}/songs/{songId}',
        'PATCH /v1/setlists/{id}/songs/order',
        'POST /v1/practice-sessions',
        'POST /v1/practice-sessions/start',
        'PATCH /v1/practice-sessions/{id}',
        'POST /v1/practice-sessions/{id}/finish',
        'POST /v1/practice-sessions/{id}/songs',
        'PATCH /v1/practice-sessions/{id}/songs/{songId}',
        'POST /v1/assets/upload-url',
      ].includes(key),
    );
    expect(bodyOperations).toHaveLength(22);
    for (const { operation, key } of bodyOperations) {
      assertDocumented(
        Boolean(operation.requestBody),
        `${key} has no request body`,
      );
    }
  });

  it('documents pagination query properties on every list endpoint', () => {
    const listPaths = [
      '/v1/songs',
      '/v1/setlists',
      '/v1/practice-sessions',
      '/v1/practice-sessions/history',
    ];
    for (const path of listPaths) {
      const operation = document.paths[path]?.get;
      assertDocumented(Boolean(operation), `GET ${path} is missing`);
      const names = (operation?.parameters ?? [])
        .filter(
          (parameter) => !('$ref' in parameter) && parameter.in === 'query',
        )
        .map((parameter) => ('$ref' in parameter ? '' : parameter.name));
      expect(names).toEqual(
        expect.arrayContaining([
          'page',
          'limit',
          'search',
          'sort_order',
          'sort_by',
        ]),
      );
    }
  });

  it('documents session cookies returned by auth lifecycle endpoints', () => {
    for (const [path, method] of [
      ['/v1/auth/login', 'post'],
      ['/v1/auth/refresh', 'post'],
      ['/v1/auth/logout', 'post'],
    ] as const) {
      const operation = document.paths[path]?.[method];
      const response = operation?.responses?.['200'];
      assertDocumented(
        Boolean(
          response && !('$ref' in response) && response.headers?.['Set-Cookie'],
        ),
        `${method.toUpperCase()} ${path} has no Set-Cookie response header`,
      );
    }
  });

  it('documents authentication rate limits and email confirmation errors', () => {
    expect(
      Object.keys(document.paths['/v1/auth/signup']?.post?.responses ?? {}),
    ).toEqual(expect.arrayContaining(['400', '429', '503']));
    expect(
      Object.keys(document.paths['/v1/auth/login']?.post?.responses ?? {}),
    ).toEqual(expect.arrayContaining(['401', '403', '429', '503']));
  });

  afterAll(async () => app.close());
});

function readOperations(document: SwaggerDocument) {
  const operations: Array<{
    key: string;
    method: (typeof HTTP_METHODS)[number];
    operation: SwaggerOperation;
  }> = [];
  for (const [path, item] of Object.entries(document.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = item[method];
      if (operation) {
        operations.push({
          key: `${method.toUpperCase()} ${path}`,
          method,
          operation,
        });
      }
    }
  }
  return operations;
}

function hasHeaderParameter(
  operation: SwaggerOperation,
  name: string,
): boolean {
  return Boolean(
    operation.parameters?.some(
      (parameter) =>
        !('$ref' in parameter) &&
        parameter.in === 'header' &&
        parameter.name.toLowerCase() === name.toLowerCase(),
    ),
  );
}

function assertDocumented(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}
