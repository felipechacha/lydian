// Isolated PostgreSQL: Supabase auth/storage infrastructure is stubbed; all
// application migrations and regression assertions execute unchanged.
const { PGlite } = require('@electric-sql/pglite');
const { pgcrypto } = require('@electric-sql/pglite/contrib/pgcrypto');
const { readFile, readdir } = require('node:fs/promises');
const { resolve } = require('node:path');

async function main() {
  const root = resolve(__dirname, '..');
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create schema auth;
      create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql as 'select null::uuid';
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
    for (const name of (await readdir(resolve(root, 'supabase/migrations'))).sort()) {
      await db.exec(await readFile(resolve(root, 'supabase/migrations', name), 'utf8'));
      console.log('Migration OK:', name);
    }
    for (const name of (await readdir(resolve(root, 'supabase/tests'))).filter((name) => name.endsWith('.sql')).sort()) {
      await db.exec(await readFile(resolve(root, 'supabase/tests', name), 'utf8'));
      console.log('SQL assertions OK:', name);
    }
  } finally {
    await db.close();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
