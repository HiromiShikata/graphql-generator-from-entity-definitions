'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GenerateGraphqlSchemaUseCase = void 0;
const utility_1 = require('../../_shared/utility');
const ERROR_TYPES = ['UNKNOWN_RUNTIME', 'PERMISSION_DENIED', 'NOT_FOUND'];
class GenerateGraphqlSchemaUseCase {
  constructor(fileRepository, entityDefinitionRepository) {
    this.fileRepository = fileRepository;
    this.entityDefinitionRepository = entityDefinitionRepository;
    this.run = async (domainEntitiesDirectoryPath, outputGraphqlSchemaPath) => {
      const entityDefinitions = await this.entityDefinitionRepository.find(
        domainEntitiesDirectoryPath,
      );
      const schema = `${this.generateErrorTypes()}
${this.generateTypes(entityDefinitions)}
${this.generateQuery(entityDefinitions)}
${this.generateMutation(entityDefinitions)}
`;
      if (outputGraphqlSchemaPath) {
        await this.fileRepository.save(outputGraphqlSchemaPath, schema);
      }
      return schema;
    };
    this.generateTypes = (entityDefinitions) => {
      const typeDefs = [];
      typeDefs.push(`scalar Date\n\n`);
      for (const entity of entityDefinitions) {
        const properties = [];
        for (const property of entity.properties) {
          const name = property.name;
          const type = property.isReference
            ? 'String!'
            : name === 'id'
            ? 'ID!'
            : this.mapToGraphQLType(property.propertyType) +
              (property.isNullable ? '' : '!');
          properties.push(`  ${name}: ${type}`);
          if (property.isReference) {
            properties.push(
              `  ${this.uncapitalize(property.targetEntityDefinitionName)}: ${
                property.targetEntityDefinitionName
              }Result!`,
            );
          }
        }
        const relatedEntities = entityDefinitions.flatMap((relatedEntity) =>
          relatedEntity.properties
            .filter(
              (relatedProperty) =>
                relatedProperty.isReference &&
                relatedProperty.targetEntityDefinitionName === entity.name,
            )
            .map((relatedProperty) =>
              relatedProperty.isUnique
                ? `  ${this.uncapitalize(relatedEntity.name)}: ${
                    relatedEntity.name
                  }!`
                : `  ${this.uncapitalize(relatedEntity.name)}List: [${
                    relatedEntity.name
                  }ListResult!]!`,
            ),
        );
        typeDefs.push(`type ${entity.name} {
${properties.join('\n')}${
          relatedEntities.length > 0 ? '\n' + relatedEntities.join('\n') : ``
        }
}

`);
      }
      return typeDefs.join('');
    };
    this.capitalize = (str) => {
      if (str.length === 0) {
        return str;
      }
      return str[0].toUpperCase() + str.slice(1);
    };
    this.uncapitalize = (str) => {
      return str.charAt(0).toLowerCase() + str.slice(1);
    };
    this.generateQuery = (entityDefinitions) => {
      const resultTypes = [];
      for (const entity of entityDefinitions) {
        const resultType = `union ${entity.name}Result =
    ${entity.name}
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type ${entity.name}List {
  items: [${entity.name}!]!
  total: Int!
}

union ${entity.name}ListResult =
    ${entity.name}List
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError
`;
        resultTypes.push(resultType);
      }
      const queryMethods = entityDefinitions.map((entity) => {
        const queryListParameter = entity.properties.find((p) => p.isReference)
          ? `(${entity.properties
              .filter((p) => p.isReference)
              .map((p) => `${p.name}: String`)
              .join(', ')})`
          : ``;
        return `  ${this.uncapitalize(entity.name)}(id: ID!): ${
          entity.name
        }Result!
  ${this.uncapitalize(entity.name)}List${queryListParameter}: ${
          entity.name
        }ListResult!`;
      });
      const query = `${resultTypes.join(`\n`)}
type Query {
${queryMethods.join('\n')}
}
`;
      return query;
    };
    this.generateErrorTypes = () => {
      const errors = ERROR_TYPES;
      const errorTypes = [];
      for (const error of ERROR_TYPES) {
        errorTypes.push(`type ${this.snakeCaseToPascalCase(error)}Error {
  errorCode: ErrorCode!
  message: String
  stack: String
}
`);
      }
      return `
enum ErrorCode {
${errors.map((error) => `  ${error}`).join(`\n`)}
}

${errorTypes.join('\n')}`;
    };
    this.generateMutation = (entityDefinitions) => {
      const mutationTypes = [];
      for (const entity of entityDefinitions) {
        const uncapitalizedEntityName = this.uncapitalize(entity.name);
        const properties = entity.properties
          .filter((property) => property.name != 'id')
          .map((property) =>
            property.isReference
              ? `  ${this.uncapitalize(
                  property.targetEntityDefinitionName,
                )}Id: String!`
              : `  ${property.name}: ${this.mapToGraphQLType(
                  property.propertyType,
                )}` + (property.isNullable ? '' : '!'),
          )
          .join('\n');
        const notFoundError = entity.properties.some(
          (property) => property.isReference,
        )
          ? '\n  | NotFoundError'
          : '';
        const mutationType = `input Create${entity.name}Input {
${properties}
  clientMutationId: String
}

type Create${entity.name}Payload {
  ${uncapitalizedEntityName}: ${entity.name}!
  clientMutationId: String
}

union Create${entity.name}PayloadResult =
    Create${entity.name}Payload
  | PermissionDeniedError
  | UnknownRuntimeError${notFoundError}

input Update${entity.name}Input {
  id: ID!
${properties}
  clientMutationId: String
}

type Update${entity.name}Payload {
  ${uncapitalizedEntityName}: ${entity.name}!
  clientMutationId: String
}

union Update${entity.name}PayloadResult =
    Update${entity.name}Payload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input Delete${entity.name}Input {
  id: ID!
  clientMutationId: String
}

type Delete${entity.name}Payload {
  id: ID!
  clientMutationId: String
}

union Delete${entity.name}PayloadResult =
    Delete${entity.name}Payload
  | UnknownRuntimeError
  | PermissionDeniedError
  | NotFoundError
`;
        mutationTypes.push(mutationType);
      }
      const mutations = entityDefinitions.map((entity) => {
        return `  create${entity.name}(input: Create${entity.name}Input!): Create${entity.name}PayloadResult!
  update${entity.name}(input: Update${entity.name}Input!): Update${entity.name}PayloadResult!
  delete${entity.name}(input: Delete${entity.name}Input!): Delete${entity.name}PayloadResult!`;
      });
      //   const mutations: string[] = [];
      //   for (const entity of entityDefinitions) {
      //     const mutation = `  create${entity.typeName}(input: Create${entity.typeName}Input!): Create${entity.typeName}PayloadResult!
      // update${entity.typeName}(input: Update${entity.typeName}Input!): Update${entity.typeName}PayloadResult!
      // delete${entity.typeName}(input: Delete${entity.typeName}Input!): Delete${entity.typeName}PayloadResult!`;
      //     mutations.push(mutation);
      //   }
      const mutation = `${mutationTypes.join('\n')}
type Mutation {
${mutations.join('\n')}
}`;
      return mutation;
    };
    this.mapToGraphQLType = (propertyType) => {
      switch (propertyType) {
        case 'boolean':
          return 'Boolean';
        case 'number':
          return 'Int';
        case 'string':
          return 'String';
        case 'Date':
          return 'Date';
        default:
          (0, utility_1.shouldBeNever)(propertyType);
          throw new Error(
            `Invalid property type: ${JSON.stringify(propertyType)}`,
          );
      }
    };
    this.snakeCaseToPascalCase = (str) => {
      return str
        .toLowerCase()
        .replace(/_(\w)/g, (_, letter) => letter.toUpperCase())
        .replace(/^\w/, (letter) => letter.toUpperCase());
    };
  }
}
exports.GenerateGraphqlSchemaUseCase = GenerateGraphqlSchemaUseCase;
//# sourceMappingURL=GenerateGraphqlSchemaUseCase.js.map
