#!/usr/bin/env node
//./src/index.ts
import { Command } from 'commander';
import { GenerateGraphqlSchemaUseCase } from './domain/usecases/GenerateGraphqlSchemaUseCase';
import { FsFileRepository } from './adapter/repositories/FsFileRepository';
import { AstEntityDefinitionRepository } from './adapter/repositories/AstEntityDefinitionRepository';

const commaSeparatedList = (value: string, _previous: string[]): string[] => {
  return value.split(',');
};
const program = new Command();
program
  .name('GraphQL Generator')
  .argument('<inputPath>', 'Path to domain entities dir.')
  .option(`-o, --outputPath <outputPath>`, 'Path to schema.graphql.')
  .option(
    `--ignorePropertyNamesForCreation <ignorePropertyNamesForCreation>`,
    'Option to specify property names to be ignored when creating an object from the command line.',
    commaSeparatedList,
  )
  .option(
    `--ignorePropertyNamesForUpdate <ignorePropertyNamesForUpdate>`,
    'Option to specify property names to be ignored when updating an object from the command line.',
    commaSeparatedList,
  )
  .description('Generate GraphQL schema from entity definitions')
  .action(
    async (
      inputPath: string,
      options: {
        outputPath?: string;
        ignorePropertyNamesForCreation?: string[];
        ignorePropertyNamesForUpdate?: string[];
      },
    ) => {
      const useCase = new GenerateGraphqlSchemaUseCase(
        new FsFileRepository(),
        new AstEntityDefinitionRepository(),
      );
      const res = await useCase.run(
        inputPath,
        options.ignorePropertyNamesForCreation ?? [],
        options.ignorePropertyNamesForUpdate ?? [],
        options.outputPath ?? null,
      );
      console.log(res);
    },
  );
program.parse(process.argv);
