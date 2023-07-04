#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
//./src/index.ts
const commander_1 = require('commander');
const GenerateGraphqlSchemaUseCase_1 = require('./domain/usecases/GenerateGraphqlSchemaUseCase');
const FsFileRepository_1 = require('./adapter/repositories/FsFileRepository');
const AstEntityDefinitionRepository_1 = require('./adapter/repositories/AstEntityDefinitionRepository');
const ChangeCaseStringConvertor_1 = require('./adapter/repositories/ChangeCaseStringConvertor');
const commaSeparatedList = (value, _previous) => {
  return value.split(',');
};
const program = new commander_1.Command();
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
  .action(async (inputPath, options) => {
    const useCase =
      new GenerateGraphqlSchemaUseCase_1.GenerateGraphqlSchemaUseCase(
        new FsFileRepository_1.FsFileRepository(),
        new AstEntityDefinitionRepository_1.AstEntityDefinitionRepository(),
        new ChangeCaseStringConvertor_1.ChangeCaseStringConvertor(),
      );
    const res = await useCase.run(
      inputPath,
      options.ignorePropertyNamesForCreation ?? [],
      options.ignorePropertyNamesForUpdate ?? [],
      options.outputPath ?? null,
    );
    console.log(res);
  });
program.parse(process.argv);
//# sourceMappingURL=index.js.map
