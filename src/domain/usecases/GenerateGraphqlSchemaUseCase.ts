import { FileRepository } from './adapter-interfaces/FileRepository';
import { EntityDefinitionRepository } from './adapter-interfaces/EntityRelationDefinitionRepository';
import { EntityDefinition } from '../entities/EntityDefinition';
import { shouldBeNever } from '../../_shared/utility';
import {
  EntityPropertyDefinitionPrimitive,
  EntityPropertyDefinitionReferencedObject,
} from '../entities/EntityPropertyDefinition';
const ERROR_TYPES = ['UNKNOWN_RUNTIME', 'PERMISSION_DENIED', 'NOT_FOUND'];

export class GenerateGraphqlSchemaUseCase {
  constructor(
    readonly fileRepository: FileRepository,
    readonly entityDefinitionRepository: EntityDefinitionRepository,
  ) {}

  run = async (
    domainEntitiesDirectoryPath: string,
    outputGraphqlSchemaPath: string | null,
  ): Promise<string> => {
    const entityDefinitions: EntityDefinition[] =
      await this.entityDefinitionRepository.find(domainEntitiesDirectoryPath);

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
  generateTypes = (entityDefinitions: EntityDefinition[]): string => {
    const typeDefs: string[] = [];
    typeDefs.push(`scalar Date\n\n`);

    for (const entity of entityDefinitions) {
      const properties: string[] = [];

      for (const property of entity.properties) {
        const name = property.name;

        const type = property.isReference
          ? 'String!'
          : name === 'id'
          ? 'ID!'
          : this.mapToGraphQLType(property.propertyType) + '!';
        properties.push(`  ${name}: ${type}`);
        if (property.isReference) {
          properties.push(
            `  ${this.uncapitalize(property.propertyType)}: ${
              property.propertyType
            }Result!`,
          );
        }
      }

      const relatedEntities = entityDefinitions.flatMap((relatedEntity) =>
        relatedEntity.properties
          .filter(
            (
              relatedProperty,
            ): relatedProperty is EntityPropertyDefinitionReferencedObject =>
              relatedProperty.isReference &&
              relatedProperty.propertyType === entity.typeName,
          )
          .map((relatedProperty) =>
            relatedProperty.isUnique
              ? `  ${this.uncapitalize(relatedEntity.typeName)}: ${
                  relatedEntity.typeName
                }!`
              : `  ${this.uncapitalize(relatedEntity.typeName)}List: [${
                  relatedEntity.typeName
                }ListResult!]!`,
          ),
      );

      typeDefs.push(`type ${entity.typeName} {
${properties.join('\n')}${
        relatedEntities.length > 0 ? '\n' + relatedEntities.join('\n') : ``
      }
}

`);
    }

    return typeDefs.join('');
  };
  capitalize = (str: string): string => {
    if (str.length === 0) {
      return str;
    }
    return str[0].toUpperCase() + str.slice(1);
  };

  uncapitalize = (str: string): string => {
    return str.charAt(0).toLowerCase() + str.slice(1);
  };
  generateQuery = (entityDefinitions: EntityDefinition[]): string => {
    const resultTypes: string[] = [];
    for (const entity of entityDefinitions) {
      const resultType = `union ${entity.typeName}Result =
    ${entity.typeName}
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type ${entity.typeName}List {
  items: [${entity.typeName}!]!
  total: Int!
}

union ${entity.typeName}ListResult =
    ${entity.typeName}List
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError
`;
      resultTypes.push(resultType);
    }

    const queryMethods = entityDefinitions.map((entity) => {
      const queryListParameter = entity.properties.find((p) => p.isReference)
        ? `(${entity.properties
            .filter(
              (p): p is EntityPropertyDefinitionReferencedObject =>
                p.isReference,
            )
            .map((p) => `${p.name}: String`)
            .join(', ')})`
        : ``;
      return `  ${this.uncapitalize(entity.typeName)}(id: ID!): ${
        entity.typeName
      }Result!
  ${this.uncapitalize(entity.typeName)}List${queryListParameter}: ${
        entity.typeName
      }ListResult!`;
    });

    const query = `${resultTypes.join(`\n`)}
type Query {
${queryMethods.join('\n')}
}
`;
    return query;
  };
  generateErrorTypes = (): string => {
    const errors = ERROR_TYPES;
    const errorTypes: string[] = [];
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
  generateMutation = (entityDefinitions: EntityDefinition[]): string => {
    const mutationTypes: string[] = [];
    for (const entity of entityDefinitions) {
      const uncapitalizedEntityName = this.uncapitalize(entity.typeName);
      const properties = entity.properties
        .filter((property) => property.name != 'id')
        .map((property) =>
          property.isReference
            ? `  ${this.uncapitalize(property.propertyType)}Id: String!`
            : `  ${property.name}: ${this.mapToGraphQLType(
                property.propertyType,
              )}!`,
        )
        .join('\n');
      const notFoundError = entity.properties.some(
        (property) => property.isReference,
      )
        ? '\n  | NotFoundError'
        : '';

      const mutationType = `input Create${entity.typeName}Input {
${properties}
  clientMutationId: String
}

type Create${entity.typeName}Payload {
  ${uncapitalizedEntityName}: ${entity.typeName}!
  clientMutationId: String
}

union Create${entity.typeName}PayloadResult =
    Create${entity.typeName}Payload
  | PermissionDeniedError
  | UnknownRuntimeError${notFoundError}

input Update${entity.typeName}Input {
  id: ID!
${properties}
  clientMutationId: String
}

type Update${entity.typeName}Payload {
  ${uncapitalizedEntityName}: ${entity.typeName}!
  clientMutationId: String
}

union Update${entity.typeName}PayloadResult =
    Update${entity.typeName}Payload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input Delete${entity.typeName}Input {
  id: ID!
  clientMutationId: String
}

type Delete${entity.typeName}Payload {
  id: ID!
  clientMutationId: String
}

union Delete${entity.typeName}PayloadResult =
    Delete${entity.typeName}Payload
  | UnknownRuntimeError
  | PermissionDeniedError
  | NotFoundError
`;
      mutationTypes.push(mutationType);
    }

    const mutations = entityDefinitions.map((entity) => {
      return `  create${entity.typeName}(input: Create${entity.typeName}Input!): Create${entity.typeName}PayloadResult!
  update${entity.typeName}(input: Update${entity.typeName}Input!): Update${entity.typeName}PayloadResult!
  delete${entity.typeName}(input: Delete${entity.typeName}Input!): Delete${entity.typeName}PayloadResult!`;
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
  mapToGraphQLType = (
    propertyType: EntityPropertyDefinitionPrimitive['propertyType'],
  ): string => {
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
        shouldBeNever(propertyType);
        throw new Error(
          `Invalid property type: ${JSON.stringify(propertyType)}`,
        );
    }
  };
  snakeCaseToPascalCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/_(\w)/g, (_, letter: string) => letter.toUpperCase())
      .replace(/^\w/, (letter) => letter.toUpperCase());
  };
}
