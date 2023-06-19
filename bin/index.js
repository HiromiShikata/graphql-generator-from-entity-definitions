#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//./src/index.ts
const commander_1 = require("commander");
const GenerateGraphqlSchemaUseCase_1 = require("./domain/usecases/GenerateGraphqlSchemaUseCase");
const FsFileRepository_1 = require("./adapter/repositories/FsFileRepository");
const AstEntityDefinitionRepository_1 = require("./adapter/repositories/AstEntityDefinitionRepository");
const program = new commander_1.Command();
program
    .name('GraphQL Generator')
    .argument('<inputPath>', 'Path to domain entities dir.')
    .option(`-o, --outputPath <outputPath>`, 'Path to schema.graphql.')
    .description('Generate GraphQL schema from entity definitions')
    .action(async (inputPath, options) => {
    const useCase = new GenerateGraphqlSchemaUseCase_1.GenerateGraphqlSchemaUseCase(new FsFileRepository_1.FsFileRepository(), new AstEntityDefinitionRepository_1.AstEntityDefinitionRepository());
    const res = await useCase.run(inputPath, options.outputPath ?? null);
    console.log(res);
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map