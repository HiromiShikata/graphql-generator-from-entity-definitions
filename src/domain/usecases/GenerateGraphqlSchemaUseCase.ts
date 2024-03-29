import { FileRepository } from './adapter-interfaces/FileRepository';
import { EntityDefinitionRepository } from './adapter-interfaces/EntityRelationDefinitionRepository';
import { EntityDefinition } from '../entities/EntityDefinition';
import { shouldBeNever } from '../../_shared/utility';
import {
  EntityPropertyDefinitionPrimitive,
  EntityPropertyDefinitionReferencedObject,
} from '../entities/EntityPropertyDefinition';
import { EntityPropertyDefinition } from 'ast-to-entity-definitions/bin/domain/entities/EntityPropertyDefinition';
import { StringConvertor } from './adapter-interfaces/StringConvertor';
const ERROR_TYPES = ['UNKNOWN_RUNTIME', 'PERMISSION_DENIED', 'NOT_FOUND'];

export class GenerateGraphqlSchemaUseCase {
  constructor(
    readonly fileRepository: FileRepository,
    readonly entityDefinitionRepository: EntityDefinitionRepository,
    readonly stringConvertor: StringConvertor,
  ) {}

  run = async (
    domainEntitiesDirectoryPath: string,
    ignorePropertyNamesForCreation: string[],
    ignorePropertyNamesForUpdate: string[],
    outputGraphqlSchemaPath: string | null,
  ): Promise<string> => {
    const entityDefinitions: EntityDefinition[] =
      await this.entityDefinitionRepository.find(domainEntitiesDirectoryPath);

    const schema = `${this.generateErrorTypes(entityDefinitions)}
${this.generateTypes(entityDefinitions)}
${this.generateQuery(entityDefinitions)}
${this.generateMutation(
  entityDefinitions,
  ignorePropertyNamesForCreation,
  ignorePropertyNamesForUpdate,
)}
`.trim();
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
          ? `String${property.isNullable ? '' : '!'}`
          : name === 'id'
            ? 'ID!'
            : this.mapToGraphQLType(entity, property) +
              (property.isNullable ? '' : '!');
        properties.push(`  ${name}: ${type}`);
        if (property.isReference) {
          properties.push(
            `  ${property.name.replace(/Id$/, '')}: ${
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
              : `  ${
                  relatedProperty.name.replace(/Id$/, '') !==
                  this.stringConvertor.camelCase(entity.name)
                    ? `${relatedProperty.name.replace(/Id$/, '')}${
                        relatedEntity.name
                      }`
                    : this.uncapitalize(relatedEntity.name)
                }List: ${relatedEntity.name}ListResult!`,
          ),
      );

      typeDefs.push(`type ${entity.name} {
${properties.join('\n')}${
        relatedEntities.length > 0 ? '\n' + relatedEntities.join('\n') : ``
      }
}
`);
      typeDefs.push(`${entity.properties
        .filter((p): p is EntityPropertyDefinitionPrimitive => !p.isReference)
        .filter(
          (
            p,
          ): p is EntityPropertyDefinitionPrimitive & {
            acceptableValues: [];
          } => !!p.acceptableValues && p.acceptableValues?.length > 0,
        )
        .map(
          (p) => `enum ${entity.name}${this.stringConvertor.pascalCase(
            p.name,
          )}Type {
${p.acceptableValues
  .map((v) => `  ${v ? this.stringConvertor.screamSnakeCase(v) : 'EMPTY'}`)
  .join('\n')}
}`,
        )
        .join('\n')}
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
  | Error${entity.name}NotFound${entity.properties
    .filter((p): p is EntityPropertyDefinitionReferencedObject => p.isReference)
    .reduce((prev: EntityPropertyDefinitionReferencedObject[], curr) => {
      if (
        curr.targetEntityDefinitionName === entity.name ||
        prev.find(
          (p) =>
            p.targetEntityDefinitionName === curr.targetEntityDefinitionName,
        )
      ) {
        return prev;
      }
      return [...prev, curr];
    }, [])
    .map((p) => `\n  | Error${p.targetEntityDefinitionName}NotFound`)
    .join('')}

type ${entity.name}List {
  itemList: [${entity.name}!]!
  total: Int!
}

union ${entity.name}ListResult =
    ${entity.name}List
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime${entity.properties
    .filter((p): p is EntityPropertyDefinitionReferencedObject => p.isReference)
    .reduce((prev: EntityPropertyDefinitionReferencedObject[], curr) => {
      if (
        curr.targetEntityDefinitionName === entity.name ||
        prev.find(
          (p) =>
            p.targetEntityDefinitionName === curr.targetEntityDefinitionName,
        )
      ) {
        return prev;
      }
      return [...prev, curr];
    }, [])

    .map((p) => `\n  | Error${p.targetEntityDefinitionName}NotFound`)
    .join('')}
`;
      resultTypes.push(resultType);
    }

    const queryMethods = entityDefinitions.map((entity) => {
      const queryListParameter = entity.properties.find(
        (p) => p.isReference && !p.isUnique,
      )
        ? `(${entity.properties
            .filter(
              (p): p is EntityPropertyDefinitionReferencedObject =>
                p.isReference && !p.isUnique,
            )
            .map((p) => `${p.name}: ID`)
            .join(', ')})`
        : ``;
      const queryOneParameters = entity.properties.filter(
        (p) =>
          p.name === 'id' || (p.isReference && p.isUnique && !p.isNullable),
      );
      return `${
        queryOneParameters.length === 0
          ? ''
          : queryOneParameters.length === 1
            ? `  ${this.uncapitalize(entity.name)}(${
                queryOneParameters[0].name
              }: ID!): ${entity.name}Result!\n`
            : `  ${this.uncapitalize(entity.name)}(${queryOneParameters
                .map((p) => `${p.name}: ID`)
                .join(', ')}): ${entity.name}Result!\n`
      }  ${this.uncapitalize(entity.name)}List${queryListParameter}: ${
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

type Error {
  errorCode: ErrorCode!
  message: String
  stack: String
}

${errorTypes.join('\n')}`;
  };
  generateMutation = (
    entityDefinitions: EntityDefinition[],
    ignorePropertyNamesForCreation: string[],
    ignorePropertyNamesForUpdate: string[],
  ): string => {
    const mutationTypes: string[] = [];
    for (const entity of entityDefinitions) {
      const uncapitalizedEntityName = this.uncapitalize(entity.name);
      const generateLineForPropertyFromEntityPropertyDefinition = (
        property: EntityPropertyDefinition,
      ): string => {
        if (property.isReference) {
          return `  ${this.uncapitalize(
            property.targetEntityDefinitionName,
          )}Id: String!`;
        } else if (property.name === 'id') {
          return '  id: ID!';
        } else {
          return (
            `  ${property.name}: ${this.mapToGraphQLType(entity, property)}` +
            (property.isNullable ? '' : '!')
          );
        }
      };
      const propertiesForCreation = entity.properties
        .filter(
          (property) => !ignorePropertyNamesForCreation.includes(property.name),
        )
        .map((property) =>
          generateLineForPropertyFromEntityPropertyDefinition(property),
        )
        .join('\n');

      const propertiesForUpdate = entity.properties
        .filter(
          (property) => !ignorePropertyNamesForUpdate.includes(property.name),
        )
        .map((property) =>
          generateLineForPropertyFromEntityPropertyDefinition(property),
        )
        .join('\n');
      const notFoundErrorForCreation = entity.properties
        .filter(
          (p): p is EntityPropertyDefinitionReferencedObject => p.isReference,
        )
        .reduce((prev: EntityPropertyDefinitionReferencedObject[], curr) => {
          if (
            prev.find(
              (p) =>
                p.targetEntityDefinitionName ===
                curr.targetEntityDefinitionName,
            )
          ) {
            return prev;
          }
          return [...prev, curr];
        }, [])
        .map((p) => `\n  | Error${p.targetEntityDefinitionName}NotFound`)
        .join('');

      const notFoundErrorForUpdate = entity.properties
        .filter(
          (p): p is EntityPropertyDefinitionReferencedObject => p.isReference,
        )
        .reduce((prev: EntityPropertyDefinitionReferencedObject[], curr) => {
          if (
            curr.targetEntityDefinitionName === entity.name ||
            prev.find(
              (p) =>
                p.targetEntityDefinitionName ===
                curr.targetEntityDefinitionName,
            )
          ) {
            return prev;
          }
          return [...prev, curr];
        }, [])
        .map((p) => `\n  | Error${p.targetEntityDefinitionName}NotFound`)
        .join('');

      const mutationType = `input Create${entity.name}Input {
${propertiesForCreation}
  clientMutationId: ID
}

type Create${entity.name}Payload {
  ${uncapitalizedEntityName}: ${entity.name}!
  clientMutationId: ID
}

union Create${entity.name}PayloadResult =
    Create${entity.name}Payload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime${notFoundErrorForCreation}

input Update${entity.name}Input {
${propertiesForUpdate}
  clientMutationId: ID
}

type Update${entity.name}Payload {
  ${uncapitalizedEntityName}: ${entity.name}!
  clientMutationId: ID
}

union Update${entity.name}PayloadResult =
    Update${entity.name}Payload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | Error${entity.name}NotFound${notFoundErrorForUpdate}

input Delete${entity.name}Input {
  id: ID!
  clientMutationId: ID
}

type Delete${entity.name}Payload {
  id: ID!
  clientMutationId: ID
}

union Delete${entity.name}PayloadResult =
    Delete${entity.name}Payload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
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
    entity: EntityDefinition,
    property: EntityPropertyDefinitionPrimitive,
  ): string => {
    if (property.acceptableValues && property.acceptableValues.length > 0) {
      return `${entity.name}${this.stringConvertor.pascalCase(
        property.name,
      )}Type`;
    }
    const propertyType = property.propertyType;
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
