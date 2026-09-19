import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import ts from "typescript";

const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = join(projectRoot, "src");

const sourceFiles = collectSourceFiles(sourceRoot);
const serviceFiles = sourceFiles.filter((file) => file.endsWith(".service.ts"));
const repositoryFiles = sourceFiles.filter((file) => file.endsWith(".repository.ts"));
const contextFiles = sourceFiles.filter((file) => file.endsWith(".context.ts"));

const serviceSet = new Set(serviceFiles);
const repositorySet = new Set(repositoryFiles);
const contextSet = new Set(contextFiles);
const importsByFile = new Map(
  sourceFiles.map((file) => [file, readImports(file).flatMap((specifier) => resolveImport(file, specifier))]),
);

const errors: string[] = [];
const serviceConsumers = new Map(serviceFiles.map((file) => [file, [] as string[]]));

for (const [file, imports] of importsByFile) {
  const importedServices = imports.filter((dependency) => serviceSet.has(dependency));
  const importedRepositories = imports.filter((dependency) => repositorySet.has(dependency));
  const importedContexts = imports.filter((dependency) => contextSet.has(dependency));
  const importedSourceInfrastructure = imports.filter(isSourceInfrastructure);

  if (isProductionConsumer(file) && importedServices.length > 1) {
    errors.push(`${display(file)} imports more than one service: ${importedServices.map(display).join(", ")}`);
  }

  for (const service of importedServices) {
    if (serviceSet.has(file)) {
      errors.push(`${display(file)} imports another service: ${display(service)}`);
    }

    if (!isTestFile(file)) {
      if (!isProductionConsumer(file)) {
        errors.push(`${display(service)} is imported by non-consumer ${display(file)}`);
      } else {
        serviceConsumers.get(service)?.push(file);
      }
    }
  }

  for (const repository of importedRepositories) {
    if (!serviceSet.has(file) && !contextSet.has(file)) {
      errors.push(`${display(repository)} is imported outside a service or context by ${display(file)}`);
    }
  }

  for (const context of importedContexts) {
    if (!serviceSet.has(file) && !contextSet.has(file) && !isTestFile(file)) {
      errors.push(`${display(context)} is imported outside a service or context by ${display(file)}`);
    }
  }

  for (const infrastructure of importedSourceInfrastructure) {
    if (!repositorySet.has(file) && !isSourceInfrastructure(file)) {
      errors.push(
        `${display(infrastructure)} is imported outside a repository by ${display(file)}`,
      );
    }
  }

  if (repositorySet.has(file) && importedRepositories.length > 0) {
    errors.push(`${display(file)} imports another repository: ${importedRepositories.map(display).join(", ")}`);
  }

  if (isClientComponent(file) && (importedServices.length > 0 || importedRepositories.length > 0)) {
    errors.push(`${display(file)} is a client component that imports the data layer`);
  }
}

for (const [service, consumers] of serviceConsumers) {
  const uniqueConsumers = [...new Set(consumers)];

  if (uniqueConsumers.length !== 1) {
    errors.push(
      `${display(service)} must have exactly one production consumer; found ${uniqueConsumers.length}`,
    );
  }
}

if (errors.length > 0) {
  console.error("Data-layer architecture violations:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Architecture check passed (${serviceFiles.length} service modules).`);
}

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function readImports(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  return source.statements.flatMap((statement) => {
    if (
      (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      return [statement.moduleSpecifier.text];
    }

    return [];
  });
}

function resolveImport(importer: string, specifier: string): string[] {
  const base = specifier.startsWith("@/")
    ? join(sourceRoot, specifier.slice(2))
    : specifier.startsWith(".")
      ? resolve(dirname(importer), specifier)
      : null;

  if (!base) return [];

  const withoutJavaScriptExtension = /\.m?js$/.test(base)
    ? base.slice(0, -extname(base).length)
    : base;
  const candidates = [
    base,
    `${withoutJavaScriptExtension}.ts`,
    `${withoutJavaScriptExtension}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];

  const match = candidates.find((candidate) => existsSync(candidate));
  return match ? [match] : [];
}

function isProductionConsumer(file: string): boolean {
  const projectPath = display(file);
  return (
    projectPath === "src/proxy.ts" ||
    /\/page\.tsx$/.test(projectPath) ||
    /\/route\.ts$/.test(projectPath) ||
    hasDirective(file, "use server")
  );
}

function isClientComponent(file: string): boolean {
  return hasDirective(file, "use client");
}

function hasDirective(file: string, directive: string): boolean {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  return source.statements.some(
    (statement) =>
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === directive,
  );
}

function isTestFile(file: string): boolean {
  return /\.(?:test|spec)\.[^.]+$/.test(file);
}

function isSourceInfrastructure(file: string): boolean {
  return file.startsWith(join(sourceRoot, "db")) || file.startsWith(join(sourceRoot, "lib/supabase"));
}

function display(file: string): string {
  return relative(projectRoot, file);
}
