CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "perfis" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "nome" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "descricao" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "perfis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "perfis_slug_key" ON "perfis"("slug");

INSERT INTO "perfis" ("id", "nome", "slug", "descricao") VALUES
  ('perfil-admin', 'Administrador', 'admin', 'Cadastro de usuarios e perfis'),
  ('perfil-coordenador', 'Coordenador', 'coordenador', 'Acesso gerencial do sistema'),
  ('perfil-almoxarife', 'Almoxarife', 'almoxarife', 'Operacao de estoque e emprestimos'),
  ('perfil-tecnico', 'Tecnico', 'tecnico', 'Consulta e solicitacoes de ferramentas')
ON CONFLICT ("slug") DO UPDATE SET
  "nome" = EXCLUDED."nome",
  "descricao" = EXCLUDED."descricao",
  "ativo" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "perfilId" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'perfil'
  ) THEN
    EXECUTE '
      UPDATE "usuarios"
      SET "perfilId" = CASE "perfil"::text
        WHEN ''coordenador'' THEN ''perfil-coordenador''
        WHEN ''almoxarife'' THEN ''perfil-almoxarife''
        WHEN ''tecnico'' THEN ''perfil-tecnico''
        ELSE ''perfil-tecnico''
      END
      WHERE "perfilId" IS NULL
    ';
  ELSE
    UPDATE "usuarios" SET "perfilId" = 'perfil-tecnico' WHERE "perfilId" IS NULL;
  END IF;
END $$;

ALTER TABLE "usuarios" ALTER COLUMN "perfilId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND table_name = 'usuarios' AND constraint_name = 'usuarios_perfilId_fkey'
  ) THEN
    ALTER TABLE "usuarios"
    ADD CONSTRAINT "usuarios_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "perfil";
DROP TYPE IF EXISTS "Perfil";
