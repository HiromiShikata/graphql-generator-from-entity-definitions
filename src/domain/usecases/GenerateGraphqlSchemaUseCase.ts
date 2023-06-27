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

    const schema = `${this.generateErrorTypes(entityDefinitions)}
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
            (
              relatedProperty,
            ): relatedProperty is EntityPropertyDefinitionReferencedObject =>
              relatedProperty.isReference &&
              relatedProperty.targetEntityDefinitionName === entity.name,
          )
          .map((relatedProperty) =>
            relatedProperty.isUnique
              ? `  ${this.uncapitalize(relatedEntity.name)}: ${
                  relatedEntity.name
                }`
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
      const resultType = `union ${entity.name}Result =
    ${entity.name}
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | Error${entity.name}NotFound

type ${entity.name}List {
  items: [${entity.name}!]!
  total: Int!
}

union ${entity.name}ListResult =
    ${entity.name}List
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
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
  generateErrorTypes = (entityDefinitions: EntityDefinition[]): string => {
    const errors = [
      ...ERROR_TYPES,
      ...entityDefinitions.map(
        (entity) =>
          `${this.pascalCaseToScreamingSnakeCase(entity.name)}_NOT_FOUND`,
      ),
    ];
    const errorTypes: string[] = [];
    for (const error of errors) {
      errorTypes.push(`type Error${this.snakeCaseToPascalCase(error)} {
  errorCode: ErrorCode!
  message: String
  stack: String
}
`);
    }
    return `enum ErrorCode {
${errors.map((error) => `  ${error}`).join(`\n`)}
}

${errorTypes.join('\n')}`;
  };
  generateMutation = (entityDefinitions: EntityDefinition[]): string => {
    const mutationTypes: string[] = [];
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
      const notFoundError = entity.properties
        .filter(
          (p): p is EntityPropertyDefinitionReferencedObject => p.isReference,
        )
        .map((p) => `\n  | Error${p.targetEntityDefinitionName}NotFound`)
        .join('');

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
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorNotFound${notFoundError}

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
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorNotFound${notFoundError}
  | Error${entity.name}NotFound

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
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorNotFound
  | Error${entity.name}NotFound
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
  pascalCaseToScreamingSnakeCase = (str: string): string => {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
  };
}
