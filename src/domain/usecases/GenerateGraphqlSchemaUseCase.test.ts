// ./src/domain/usecases/GenerateGraphqlSchemaUseCase.test.ts
import { GenerateGraphqlSchemaUseCase } from './GenerateGraphqlSchemaUseCase';
import { FileRepository } from './adapter-interfaces/FileRepository';
import { EntityDefinitionRepository } from './adapter-interfaces/EntityRelationDefinitionRepository';
import { EntityDefinition } from '../entities/EntityDefinition';

const entityDefinitions: EntityDefinition[] = [
  {
    typeName: 'User',
    properties: [
      { name: 'id', propertyType: 'string', isReference: false },
      { name: 'name', propertyType: 'string', isReference: false },
      {
        name: 'deactivated',
        propertyType: 'boolean',
        isReference: false,
      },
    ],
  },
  {
    typeName: 'Group',
    properties: [
      { name: 'id', propertyType: 'string', isReference: false },
      { name: 'name', propertyType: 'string', isReference: false },
    ],
  },

  {
    typeName: 'UserGroup',
    properties: [
      { name: 'id', propertyType: 'string', isReference: false },
      {
        name: 'userId',
        propertyType: 'User',
        isReference: true,
        isUnique: false,
      },
      {
        name: 'groupId',
        propertyType: 'Group',
        isReference: true,
        isUnique: false,
      },
    ],
  },
];

describe('GenerateGraphqlSchemaUseCase', () => {
  describe('run', () => {
    it('should generate and save graphql schema file', async () => {
      const { entityDefinitionRepository, fileRepository, useCase } =
        createUseCaseAndMockRepositories();

      entityDefinitionRepository.find.mockResolvedValue(entityDefinitions);
      const domainEntitiesDirectoryPath = '/path/to/domain/entities';
      const outputGraphqlSchemaPath = '/path/to/output/schema.graphql';

      const expectedSchema = `
enum ErrorCode {
  UNKNOWN_RUNTIME
  PERMISSION_DENIED
  NOT_FOUND
}

type UnknownRuntimeError {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type PermissionDeniedError {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type NotFoundError {
  errorCode: ErrorCode!
  message: String
  stack: String
}

scalar Date

type User {
  id: String!
  name: String!
  deactivated: Boolean!
  userGroupList: [UserGroupListResult!]!
}

type Group {
  id: String!
  name: String!
  userGroupList: [UserGroupListResult!]!
}

type UserGroup {
  id: String!
  userId: String!
  user: UserResult!
  groupId: String!
  group: GroupResult!
}


union UserResult =
    User
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type UserList {
  items: [User!]!
  total: Int!
}

union UserListResult =
    UserList
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

union GroupResult =
    Group
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type GroupList {
  items: [Group!]!
  total: Int!
}

union GroupListResult =
    GroupList
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

union UserGroupResult =
    UserGroup
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type UserGroupList {
  items: [UserGroup!]!
  total: Int!
}

union UserGroupListResult =
    UserGroupList
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type Query {
  user(id: ID!): UserResult!
  userList(limit: Int, offset: Int): UserListResult!
  group(id: ID!): GroupResult!
  groupList(limit: Int, offset: Int): GroupListResult!
  userGroup(id: ID!): UserGroupResult!
  userGroupList(limit: Int, offset: Int): UserGroupListResult!
}

input CreateUserInput {
  name: String!
  deactivated: Boolean!
  clientMutationId: String
}

type CreateUserPayload {
  user: User!
  clientMutationId: String
}

union CreateUserPayloadResult =
    CreateUserPayload
  | PermissionDeniedError
  | UnknownRuntimeError

input UpdateUserInput {
  id: ID!
  name: String!
  deactivated: Boolean!
  clientMutationId: String
}

type UpdateUserPayload {
  user: User!
  clientMutationId: String
}

union UpdateUserPayloadResult =
    UpdateUserPayload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input DeleteUserInput {
  id: ID!
  clientMutationId: String
}

type DeleteUserPayload {
  id: ID!
  clientMutationId: String
}

union DeleteUserPayloadResult =
    DeleteUserPayload
  | UnknownRuntimeError
  | PermissionDeniedError
  | NotFoundError

input CreateGroupInput {
  name: String!
  clientMutationId: String
}

type CreateGroupPayload {
  group: Group!
  clientMutationId: String
}

union CreateGroupPayloadResult =
    CreateGroupPayload
  | PermissionDeniedError
  | UnknownRuntimeError

input UpdateGroupInput {
  id: ID!
  name: String!
  clientMutationId: String
}

type UpdateGroupPayload {
  group: Group!
  clientMutationId: String
}

union UpdateGroupPayloadResult =
    UpdateGroupPayload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input DeleteGroupInput {
  id: ID!
  clientMutationId: String
}

type DeleteGroupPayload {
  id: ID!
  clientMutationId: String
}

union DeleteGroupPayloadResult =
    DeleteGroupPayload
  | UnknownRuntimeError
  | PermissionDeniedError
  | NotFoundError

input CreateUserGroupInput {
  userId: String!
  groupId: String!
  clientMutationId: String
}

type CreateUserGroupPayload {
  userGroup: UserGroup!
  clientMutationId: String
}

union CreateUserGroupPayloadResult =
    CreateUserGroupPayload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input UpdateUserGroupInput {
  id: ID!
  userId: String!
  groupId: String!
  clientMutationId: String
}

type UpdateUserGroupPayload {
  userGroup: UserGroup!
  clientMutationId: String
}

union UpdateUserGroupPayloadResult =
    UpdateUserGroupPayload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input DeleteUserGroupInput {
  id: ID!
  clientMutationId: String
}

type DeleteUserGroupPayload {
  id: ID!
  clientMutationId: String
}

union DeleteUserGroupPayloadResult =
    DeleteUserGroupPayload
  | UnknownRuntimeError
  | PermissionDeniedError
  | NotFoundError

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayloadResult!
  updateUser(input: UpdateUserInput!): UpdateUserPayloadResult!
  deleteUser(input: DeleteUserInput!): DeleteUserPayloadResult!
  createGroup(input: CreateGroupInput!): CreateGroupPayloadResult!
  updateGroup(input: UpdateGroupInput!): UpdateGroupPayloadResult!
  deleteGroup(input: DeleteGroupInput!): DeleteGroupPayloadResult!
  createUserGroup(input: CreateUserGroupInput!): CreateUserGroupPayloadResult!
  updateUserGroup(input: UpdateUserGroupInput!): UpdateUserGroupPayloadResult!
  deleteUserGroup(input: DeleteUserGroupInput!): DeleteUserGroupPayloadResult!
}
`;
      const response = await useCase.run(
        domainEntitiesDirectoryPath,
        outputGraphqlSchemaPath,
      );

      expect(response).toEqual(expectedSchema);
      expect(entityDefinitionRepository.find).toHaveBeenCalledWith(
        domainEntitiesDirectoryPath,
      );
      expect(fileRepository.save).toHaveBeenCalledWith(
        outputGraphqlSchemaPath,
        expectedSchema,
      );
    });
  });
  describe('generateMutation', () => {
    it('should generate type definitions for all entity definitions', () => {
      const { useCase } = createUseCaseAndMockRepositories();

      const expectedMutation = `
input CreateUserInput {
  name: String!
  deactivated: Boolean!
  clientMutationId: String
}

type CreateUserPayload {
  user: User!
  clientMutationId: String
}

union CreateUserPayloadResult =
    CreateUserPayload
  | PermissionDeniedError
  | UnknownRuntimeError

input UpdateUserInput {
  id: ID!
  name: String!
  deactivated: Boolean!
  clientMutationId: String
}

type UpdateUserPayload {
  user: User!
  clientMutationId: String
}

union UpdateUserPayloadResult =
    UpdateUserPayload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input DeleteUserInput {
  id: ID!
  clientMutationId: String
}

type DeleteUserPayload {
  id: ID!
  clientMutationId: String
}

union DeleteUserPayloadResult =
    DeleteUserPayload
  | UnknownRuntimeError
  | PermissionDeniedError
  | NotFoundError

input CreateGroupInput {
  name: String!
  clientMutationId: String
}

type CreateGroupPayload {
  group: Group!
  clientMutationId: String
}

union CreateGroupPayloadResult =
    CreateGroupPayload
  | PermissionDeniedError
  | UnknownRuntimeError

input UpdateGroupInput {
  id: ID!
  name: String!
  clientMutationId: String
}

type UpdateGroupPayload {
  group: Group!
  clientMutationId: String
}

union UpdateGroupPayloadResult =
    UpdateGroupPayload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input DeleteGroupInput {
  id: ID!
  clientMutationId: String
}

type DeleteGroupPayload {
  id: ID!
  clientMutationId: String
}

union DeleteGroupPayloadResult =
    DeleteGroupPayload
  | UnknownRuntimeError
  | PermissionDeniedError
  | NotFoundError

input CreateUserGroupInput {
  userId: String!
  groupId: String!
  clientMutationId: String
}

type CreateUserGroupPayload {
  userGroup: UserGroup!
  clientMutationId: String
}

union CreateUserGroupPayloadResult =
    CreateUserGroupPayload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input UpdateUserGroupInput {
  id: ID!
  userId: String!
  groupId: String!
  clientMutationId: String
}

type UpdateUserGroupPayload {
  userGroup: UserGroup!
  clientMutationId: String
}

union UpdateUserGroupPayloadResult =
    UpdateUserGroupPayload
  | PermissionDeniedError
  | UnknownRuntimeError
  | NotFoundError

input DeleteUserGroupInput {
  id: ID!
  clientMutationId: String
}

type DeleteUserGroupPayload {
  id: ID!
  clientMutationId: String
}

union DeleteUserGroupPayloadResult =
    DeleteUserGroupPayload
  | UnknownRuntimeError
  | PermissionDeniedError
  | NotFoundError

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayloadResult!
  updateUser(input: UpdateUserInput!): UpdateUserPayloadResult!
  deleteUser(input: DeleteUserInput!): DeleteUserPayloadResult!
  createGroup(input: CreateGroupInput!): CreateGroupPayloadResult!
  updateGroup(input: UpdateGroupInput!): UpdateGroupPayloadResult!
  deleteGroup(input: DeleteGroupInput!): DeleteGroupPayloadResult!
  createUserGroup(input: CreateUserGroupInput!): CreateUserGroupPayloadResult!
  updateUserGroup(input: UpdateUserGroupInput!): UpdateUserGroupPayloadResult!
  deleteUserGroup(input: DeleteUserGroupInput!): DeleteUserGroupPayloadResult!
}
`;

      const mutation = useCase.generateMutation(entityDefinitions);

      expect(mutation.trim()).toEqual(expectedMutation.trim());
    });
  });
  describe('generateTypes', () => {
    it('should generate type definitions for all entity definitions', () => {
      const { useCase } = createUseCaseAndMockRepositories();

      const expectedTypeDefs = `
scalar Date

type User {
  id: String!
  name: String!
  deactivated: Boolean!
  userGroupList: [UserGroupListResult!]!
}

type Group {
  id: String!
  name: String!
  userGroupList: [UserGroupListResult!]!
}

type UserGroup {
  id: String!
  userId: String!
  user: UserResult!
  groupId: String!
  group: GroupResult!
}

`;

      const typeDefs = useCase.generateTypes(entityDefinitions);

      expect(typeDefs.trim()).toEqual(expectedTypeDefs.trim());
    });
  });
  describe('generateErrorTypes', () => {
    it('should generate error type definitions', () => {
      const { useCase } = createUseCaseAndMockRepositories();

      const expectedTypeDefs = `
enum ErrorCode {
  UNKNOWN_RUNTIME
  PERMISSION_DENIED
  NOT_FOUND
}

type UnknownRuntimeError {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type PermissionDeniedError {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type NotFoundError {
  errorCode: ErrorCode!
  message: String
  stack: String
}

`;

      const typeDefs = useCase.generateErrorTypes();

      expect(typeDefs.trim()).toEqual(expectedTypeDefs.trim());
    });
  });
  describe('generateQuery', () => {
    it('should generate query definitions for all entity definitions', () => {
      const { useCase } = createUseCaseAndMockRepositories();

      const expectedQueryDefs = `
union UserResult =
    User
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type UserList {
  items: [User!]!
  total: Int!
}

union UserListResult =
    UserList
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

union GroupResult =
    Group
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type GroupList {
  items: [Group!]!
  total: Int!
}

union GroupListResult =
    GroupList
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

union UserGroupResult =
    UserGroup
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type UserGroupList {
  items: [UserGroup!]!
  total: Int!
}

union UserGroupListResult =
    UserGroupList
  | NotFoundError
  | PermissionDeniedError
  | UnknownRuntimeError

type Query {
  user(id: ID!): UserResult!
  userList(limit: Int, offset: Int): UserListResult!
  group(id: ID!): GroupResult!
  groupList(limit: Int, offset: Int): GroupListResult!
  userGroup(id: ID!): UserGroupResult!
  userGroupList(limit: Int, offset: Int): UserGroupListResult!
} 
`;

      const queryDefs = useCase.generateQuery(entityDefinitions);

      expect(queryDefs.trim()).toEqual(expectedQueryDefs.trim());
    });
  });

  describe('mapToGraphQLType', () => {
    it('should map "boolean" to "Boolean"', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      expect(useCase.mapToGraphQLType('boolean')).toEqual('Boolean');
    });

    it('should map "number" to "Int"', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      expect(useCase.mapToGraphQLType('number')).toEqual('Int');
    });

    it('should map "string" to "String"', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      expect(useCase.mapToGraphQLType('string')).toEqual('String');
    });

    it('should map "Date" to "Date"', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      expect(useCase.mapToGraphQLType('Date')).toEqual('Date');
    });
  });
  describe('capitalize', () => {
    it('should capitalize the first letter of a non-empty string', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      expect(useCase.capitalize('hello')).toBe('Hello');
      expect(useCase.capitalize('world')).toBe('World');
      expect(useCase.capitalize('JavaScript')).toBe('JavaScript');
    });

    it('should return an empty string for an empty string input', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      expect(useCase.capitalize('')).toBe('');
    });
  });

  describe('uncapitalize', () => {
    it('should return an empty string when given an empty string', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      const input = '';
      const result = useCase.uncapitalize(input);
      expect(result).toBe('');
    });

    it('should convert the first character to lowercase', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      const input = 'Hello World!';

      const result = useCase.uncapitalize(input);
      expect(result).toBe('hello World!');
    });

    it('should not modify the string if the first character is already lowercase', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      const input = 'hello World!';
      const result = useCase.uncapitalize(input);
      expect(result).toBe('hello World!');
    });
  });
  describe('snakeCaseToPascalCase', () => {
    it('converts a snake_case string to PascalCase', () => {
      const { useCase } = createUseCaseAndMockRepositories();
      expect(useCase.snakeCaseToPascalCase('PERMISSION_DENIED')).toBe(
        'PermissionDenied',
      );
      expect(useCase.snakeCaseToPascalCase('SOME_OTHER_VALUE')).toBe(
        'SomeOtherValue',
      );
      expect(useCase.snakeCaseToPascalCase('YET_ANOTHER_NAME')).toBe(
        'YetAnotherName',
      );
      expect(useCase.snakeCaseToPascalCase('a_b_c')).toBe('ABC');
      expect(useCase.snakeCaseToPascalCase('permission_denied')).toBe(
        'PermissionDenied',
      );
    });
  });

  const createUseCaseAndMockRepositories = () => {
    const fileRepository = createMockFileRepository();
    const entityDefinitionRepository =
      createMockEntityRelationDefinitionRepository();
    const useCase = new GenerateGraphqlSchemaUseCase(
      fileRepository,
      entityDefinitionRepository,
    );
    return {
      fileRepository,
      entityDefinitionRepository,
      useCase,
    };
  };

  const createMockFileRepository = () => {
    const repository: FileRepository = {
      save: jest.fn(),
    };
    return {
      save: jest.fn((path: string, content: string) =>
        repository.save(path, content),
      ),
    };
  };

  const createMockEntityRelationDefinitionRepository = () => {
    const repository: EntityDefinitionRepository = {
      find: async (_path: string): Promise<EntityDefinition[]> => {
        return [];
      },
    };
    return {
      find: jest.fn((path: string) => repository.find(path)),
    };
  };
});
