#!/usr/bin/env node
//./src/index.ts
import { Command } from 'commander';
import { GenerateGraphqlSchemaUseCase } from './domain/usecases/GenerateGraphqlSchemaUseCase';
import { FsFileRepository } from './adapter/repositories/FsFileRepository';
import { AstEntityDefinitionRepository } from './adapter/repositories/AstEntityDefinitionRepository';

const program = new Command();
program
  .name('GraphQL Generator')
  .argument('<inputPath>', 'Path to domain entities dir.')
  .option(`-o, --outputPath <outputPath>`, 'Path to schema.graphql.')
  .description('Generate GraphQL schema from entity definitions')
  .action(async (inputPath: string, options: { outputPath?: string }) => {
    const useCase = new GenerateGraphqlSchemaUseCase(
      new FsFileRepository(),
      new AstEntityDefinitionRepository(),
    );
    const res = await useCase.run(inputPath, options.outputPath ?? null);
    if (!options.outputPath) {
      console.log(res);
    }
  });
program.parse(process.argv);
