// ./src/domain/usecases/GenerateGraphqlSchemaUseCase.test.ts
import { GenerateGraphqlSchemaUseCase } from './GenerateGraphqlSchemaUseCase';
import { FileRepository } from './adapter-interfaces/FileRepository';
import { EntityDefinitionRepository } from './adapter-interfaces/EntityRelationDefinitionRepository';
import { EntityDefinition } from '../entities/EntityDefinition';
import { camelCase, paramCase, pascalCase, snakeCase } from 'change-case-all';
import { StringConvertor } from './adapter-interfaces/StringConvertor';
import { EntityPropertyDefinitionPrimitive } from '../entities/EntityPropertyDefinition';

describe('GenerateGraphqlSchemaUseCase', () => {
  const ignorePropertyNamesForCreation: string[] = [
    'id',
    'createdAt',
    'updatedAt',
    'createdUserId',
    'updatedUserId',
  ];
  const ignorePropertyNamesForUpdate: string[] = [
    'createdAt',
    'updatedAt',
    'createdUserId',
    'updatedUserId',
  ];
  const entityDefinitions: EntityDefinition[] = [
    {
      name: 'User',
      properties: [
        {
          name: 'id',
          propertyType: 'string',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'name',
          propertyType: 'string',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'gender',
          propertyType: 'string',
          isReference: false,
          isNullable: false,
          acceptableValues: ['Male', 'Female', 'Other', ''],
        },
        {
          name: 'pet',
          propertyType: 'string',
          isReference: false,
          isNullable: true,
          acceptableValues: null,
        },
        {
          name: 'deactivated',
          propertyType: 'boolean',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'createdAt',
          propertyType: 'Date',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'createdUserId',
          targetEntityDefinitionName: 'User',
          isReference: true,
          isUnique: false,
          isNullable: true,
        },
        {
          name: 'updatedAt',
          propertyType: 'Date',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'updatedUserId',
          targetEntityDefinitionName: 'User',
          isReference: true,
          isUnique: false,
          isNullable: true,
        },
      ],
    },
    {
      name: 'Group',
      properties: [
        {
          name: 'id',
          propertyType: 'string',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'name',
          propertyType: 'string',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'createdUserId',
          targetEntityDefinitionName: 'User',
          isReference: true,
          isUnique: false,
          isNullable: true,
        },
      ],
    },
    {
      name: 'UserGroup',
      properties: [
        {
          name: 'id',
          propertyType: 'string',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'userId',
          targetEntityDefinitionName: 'User',
          isReference: true,
          isUnique: false,
          isNullable: false,
        },
        {
          name: 'groupId',
          targetEntityDefinitionName: 'Group',
          isReference: true,
          isUnique: false,
          isNullable: false,
        },
      ],
    },
    {
      name: 'UserProfile',
      properties: [
        {
          name: 'id',
          propertyType: 'string',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'userId',
          targetEntityDefinitionName: 'User',
          isReference: true,
          isUnique: true,
          isNullable: false,
        },
        {
          name: 'nickname',
          isReference: false,
          propertyType: 'string',
          isNullable: false,
          acceptableValues: null,
        },
      ],
    },
    {
      name: 'UserPreference',
      properties: [
        {
          name: 'userId',
          targetEntityDefinitionName: 'User',
          isReference: true,
          isUnique: true,
          isNullable: false,
        },
        {
          name: 'themeColor',
          isReference: false,
          propertyType: 'string',
          isNullable: false,
          acceptableValues: null,
        },
      ],
    },
    {
      name: 'Book',
      properties: [
        {
          name: 'id',
          propertyType: 'string',
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        },
        {
          name: 'title',
          isReference: false,
          propertyType: 'string',
          isNullable: false,
          acceptableValues: null,
        },
      ],
    },
    {
      name: 'UserBook',
      properties: [
        {
          name: 'userId',
          targetEntityDefinitionName: 'User',
          isReference: true,
          isUnique: false,
          isNullable: false,
        },
        {
          name: 'bookId',
          targetEntityDefinitionName: 'Book',
          isReference: true,
          isUnique: false,
          isNullable: false,
        },
      ],
    },
  ];

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
  USER_NOT_FOUND
  GROUP_NOT_FOUND
  USER_GROUP_NOT_FOUND
  USER_PROFILE_NOT_FOUND
  USER_PREFERENCE_NOT_FOUND
  BOOK_NOT_FOUND
  USER_BOOK_NOT_FOUND
}

type Error {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUnknownRuntime {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorPermissionDenied {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorGroupNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserGroupNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserProfileNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserPreferenceNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorBookNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserBookNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

scalar Date

type User {
  id: ID!
  name: String!
  gender: UserGenderType!
  pet: String
  deactivated: Boolean!
  createdAt: Date!
  createdUserId: String
  createdUser: UserResult!
  updatedAt: Date!
  updatedUserId: String
  updatedUser: UserResult!
  createdUserUserList: UserListResult!
  updatedUserUserList: UserListResult!
  createdUserGroupList: GroupListResult!
  userGroupList: UserGroupListResult!
  userProfile: UserProfile
  userPreference: UserPreference
  userBookList: UserBookListResult!
}
enum UserGenderType {
  MALE
  FEMALE
  OTHER
  EMPTY
}
type Group {
  id: ID!
  name: String!
  createdUserId: String
  createdUser: UserResult!
  userGroupList: UserGroupListResult!
}

type UserGroup {
  id: ID!
  userId: String!
  user: UserResult!
  groupId: String!
  group: GroupResult!
}

type UserProfile {
  id: ID!
  userId: String!
  user: UserResult!
  nickname: String!
}

type UserPreference {
  userId: String!
  user: UserResult!
  themeColor: String!
}

type Book {
  id: ID!
  title: String!
  userBookList: UserBookListResult!
}

type UserBook {
  userId: String!
  user: UserResult!
  bookId: String!
  book: BookResult!
}


union UserResult =
    User
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

type UserList {
  itemList: [User!]!
  total: Int!
}

union UserListResult =
    UserList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime

union GroupResult =
    Group
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorGroupNotFound
  | ErrorUserNotFound

type GroupList {
  itemList: [Group!]!
  total: Int!
}

union GroupListResult =
    GroupList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

union UserGroupResult =
    UserGroup
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserGroupNotFound
  | ErrorUserNotFound
  | ErrorGroupNotFound

type UserGroupList {
  itemList: [UserGroup!]!
  total: Int!
}

union UserGroupListResult =
    UserGroupList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound
  | ErrorGroupNotFound

union UserProfileResult =
    UserProfile
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserProfileNotFound
  | ErrorUserNotFound

type UserProfileList {
  itemList: [UserProfile!]!
  total: Int!
}

union UserProfileListResult =
    UserProfileList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

union UserPreferenceResult =
    UserPreference
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserPreferenceNotFound
  | ErrorUserNotFound

type UserPreferenceList {
  itemList: [UserPreference!]!
  total: Int!
}

union UserPreferenceListResult =
    UserPreferenceList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

union BookResult =
    Book
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorBookNotFound

type BookList {
  itemList: [Book!]!
  total: Int!
}

union BookListResult =
    BookList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime

union UserBookResult =
    UserBook
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserBookNotFound
  | ErrorUserNotFound
  | ErrorBookNotFound

type UserBookList {
  itemList: [UserBook!]!
  total: Int!
}

union UserBookListResult =
    UserBookList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound
  | ErrorBookNotFound

type Query {
  user(id: ID!): UserResult!
  userList(createdUserId: ID, updatedUserId: ID): UserListResult!
  group(id: ID!): GroupResult!
  groupList(createdUserId: ID): GroupListResult!
  userGroup(id: ID!): UserGroupResult!
  userGroupList(userId: ID, groupId: ID): UserGroupListResult!
  userProfile(id: ID, userId: ID): UserProfileResult!
  userProfileList: UserProfileListResult!
  userPreference(userId: ID!): UserPreferenceResult!
  userPreferenceList: UserPreferenceListResult!
  book(id: ID!): BookResult!
  bookList: BookListResult!
  userBookList(userId: ID, bookId: ID): UserBookListResult!
}

input CreateUserInput {
  name: String!
  gender: UserGenderType!
  pet: String
  deactivated: Boolean!
  clientMutationId: ID
}

type CreateUserPayload {
  user: User!
  clientMutationId: ID
}

union CreateUserPayloadResult =
    CreateUserPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input UpdateUserInput {
  id: ID!
  name: String!
  gender: UserGenderType!
  pet: String
  deactivated: Boolean!
  clientMutationId: ID
}

type UpdateUserPayload {
  user: User!
  clientMutationId: ID
}

union UpdateUserPayloadResult =
    UpdateUserPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input DeleteUserInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserPayloadResult =
    DeleteUserPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserNotFound

input CreateGroupInput {
  name: String!
  clientMutationId: ID
}

type CreateGroupPayload {
  group: Group!
  clientMutationId: ID
}

union CreateGroupPayloadResult =
    CreateGroupPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input UpdateGroupInput {
  id: ID!
  name: String!
  clientMutationId: ID
}

type UpdateGroupPayload {
  group: Group!
  clientMutationId: ID
}

union UpdateGroupPayloadResult =
    UpdateGroupPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorGroupNotFound
  | ErrorUserNotFound

input DeleteGroupInput {
  id: ID!
  clientMutationId: ID
}

type DeleteGroupPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteGroupPayloadResult =
    DeleteGroupPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorGroupNotFound

input CreateUserGroupInput {
  userId: String!
  groupId: String!
  clientMutationId: ID
}

type CreateUserGroupPayload {
  userGroup: UserGroup!
  clientMutationId: ID
}

union CreateUserGroupPayloadResult =
    CreateUserGroupPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound
  | ErrorGroupNotFound

input UpdateUserGroupInput {
  id: ID!
  userId: String!
  groupId: String!
  clientMutationId: ID
}

type UpdateUserGroupPayload {
  userGroup: UserGroup!
  clientMutationId: ID
}

union UpdateUserGroupPayloadResult =
    UpdateUserGroupPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserGroupNotFound
  | ErrorUserNotFound
  | ErrorGroupNotFound

input DeleteUserGroupInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserGroupPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserGroupPayloadResult =
    DeleteUserGroupPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserGroupNotFound

input CreateUserProfileInput {
  userId: String!
  nickname: String!
  clientMutationId: ID
}

type CreateUserProfilePayload {
  userProfile: UserProfile!
  clientMutationId: ID
}

union CreateUserProfilePayloadResult =
    CreateUserProfilePayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input UpdateUserProfileInput {
  id: ID!
  userId: String!
  nickname: String!
  clientMutationId: ID
}

type UpdateUserProfilePayload {
  userProfile: UserProfile!
  clientMutationId: ID
}

union UpdateUserProfilePayloadResult =
    UpdateUserProfilePayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserProfileNotFound
  | ErrorUserNotFound

input DeleteUserProfileInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserProfilePayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserProfilePayloadResult =
    DeleteUserProfilePayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserProfileNotFound

input CreateUserPreferenceInput {
  userId: String!
  themeColor: String!
  clientMutationId: ID
}

type CreateUserPreferencePayload {
  userPreference: UserPreference!
  clientMutationId: ID
}

union CreateUserPreferencePayloadResult =
    CreateUserPreferencePayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input UpdateUserPreferenceInput {
  userId: String!
  themeColor: String!
  clientMutationId: ID
}

type UpdateUserPreferencePayload {
  userPreference: UserPreference!
  clientMutationId: ID
}

union UpdateUserPreferencePayloadResult =
    UpdateUserPreferencePayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserPreferenceNotFound
  | ErrorUserNotFound

input DeleteUserPreferenceInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserPreferencePayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserPreferencePayloadResult =
    DeleteUserPreferencePayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserPreferenceNotFound

input CreateBookInput {
  title: String!
  clientMutationId: ID
}

type CreateBookPayload {
  book: Book!
  clientMutationId: ID
}

union CreateBookPayloadResult =
    CreateBookPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime

input UpdateBookInput {
  id: ID!
  title: String!
  clientMutationId: ID
}

type UpdateBookPayload {
  book: Book!
  clientMutationId: ID
}

union UpdateBookPayloadResult =
    UpdateBookPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorBookNotFound

input DeleteBookInput {
  id: ID!
  clientMutationId: ID
}

type DeleteBookPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteBookPayloadResult =
    DeleteBookPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorBookNotFound

input CreateUserBookInput {
  userId: String!
  bookId: String!
  clientMutationId: ID
}

type CreateUserBookPayload {
  userBook: UserBook!
  clientMutationId: ID
}

union CreateUserBookPayloadResult =
    CreateUserBookPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound
  | ErrorBookNotFound

input UpdateUserBookInput {
  userId: String!
  bookId: String!
  clientMutationId: ID
}

type UpdateUserBookPayload {
  userBook: UserBook!
  clientMutationId: ID
}

union UpdateUserBookPayloadResult =
    UpdateUserBookPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserBookNotFound
  | ErrorUserNotFound
  | ErrorBookNotFound

input DeleteUserBookInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserBookPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserBookPayloadResult =
    DeleteUserBookPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserBookNotFound

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
  createUserProfile(input: CreateUserProfileInput!): CreateUserProfilePayloadResult!
  updateUserProfile(input: UpdateUserProfileInput!): UpdateUserProfilePayloadResult!
  deleteUserProfile(input: DeleteUserProfileInput!): DeleteUserProfilePayloadResult!
  createUserPreference(input: CreateUserPreferenceInput!): CreateUserPreferencePayloadResult!
  updateUserPreference(input: UpdateUserPreferenceInput!): UpdateUserPreferencePayloadResult!
  deleteUserPreference(input: DeleteUserPreferenceInput!): DeleteUserPreferencePayloadResult!
  createBook(input: CreateBookInput!): CreateBookPayloadResult!
  updateBook(input: UpdateBookInput!): UpdateBookPayloadResult!
  deleteBook(input: DeleteBookInput!): DeleteBookPayloadResult!
  createUserBook(input: CreateUserBookInput!): CreateUserBookPayloadResult!
  updateUserBook(input: UpdateUserBookInput!): UpdateUserBookPayloadResult!
  deleteUserBook(input: DeleteUserBookInput!): DeleteUserBookPayloadResult!
}


`;
      const response = await useCase.run(
        domainEntitiesDirectoryPath,
        ignorePropertyNamesForCreation,
        ignorePropertyNamesForUpdate,
        outputGraphqlSchemaPath,
      );

      expect(response.trim()).toEqual(expectedSchema.trim());
      expect(entityDefinitionRepository.find).toHaveBeenCalledWith(
        domainEntitiesDirectoryPath,
      );
      expect(fileRepository.save).toHaveBeenCalledWith(
        outputGraphqlSchemaPath,
        expectedSchema.trim(),
      );
    });
  });
  describe('generateMutation', () => {
    it('should generate type definitions for all entity definitions', () => {
      const { useCase } = createUseCaseAndMockRepositories();

      const expectedMutation = `
input CreateUserInput {
  name: String!
  gender: UserGenderType!
  pet: String
  deactivated: Boolean!
  clientMutationId: ID
}

type CreateUserPayload {
  user: User!
  clientMutationId: ID
}

union CreateUserPayloadResult =
    CreateUserPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input UpdateUserInput {
  id: ID!
  name: String!
  gender: UserGenderType!
  pet: String
  deactivated: Boolean!
  clientMutationId: ID
}

type UpdateUserPayload {
  user: User!
  clientMutationId: ID
}

union UpdateUserPayloadResult =
    UpdateUserPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input DeleteUserInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserPayloadResult =
    DeleteUserPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserNotFound

input CreateGroupInput {
  name: String!
  clientMutationId: ID
}

type CreateGroupPayload {
  group: Group!
  clientMutationId: ID
}

union CreateGroupPayloadResult =
    CreateGroupPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input UpdateGroupInput {
  id: ID!
  name: String!
  clientMutationId: ID
}

type UpdateGroupPayload {
  group: Group!
  clientMutationId: ID
}

union UpdateGroupPayloadResult =
    UpdateGroupPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorGroupNotFound
  | ErrorUserNotFound

input DeleteGroupInput {
  id: ID!
  clientMutationId: ID
}

type DeleteGroupPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteGroupPayloadResult =
    DeleteGroupPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorGroupNotFound

input CreateUserGroupInput {
  userId: String!
  groupId: String!
  clientMutationId: ID
}

type CreateUserGroupPayload {
  userGroup: UserGroup!
  clientMutationId: ID
}

union CreateUserGroupPayloadResult =
    CreateUserGroupPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound
  | ErrorGroupNotFound

input UpdateUserGroupInput {
  id: ID!
  userId: String!
  groupId: String!
  clientMutationId: ID
}

type UpdateUserGroupPayload {
  userGroup: UserGroup!
  clientMutationId: ID
}

union UpdateUserGroupPayloadResult =
    UpdateUserGroupPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserGroupNotFound
  | ErrorUserNotFound
  | ErrorGroupNotFound

input DeleteUserGroupInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserGroupPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserGroupPayloadResult =
    DeleteUserGroupPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserGroupNotFound

input CreateUserProfileInput {
  userId: String!
  nickname: String!
  clientMutationId: ID
}

type CreateUserProfilePayload {
  userProfile: UserProfile!
  clientMutationId: ID
}

union CreateUserProfilePayloadResult =
    CreateUserProfilePayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input UpdateUserProfileInput {
  id: ID!
  userId: String!
  nickname: String!
  clientMutationId: ID
}

type UpdateUserProfilePayload {
  userProfile: UserProfile!
  clientMutationId: ID
}

union UpdateUserProfilePayloadResult =
    UpdateUserProfilePayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserProfileNotFound
  | ErrorUserNotFound

input DeleteUserProfileInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserProfilePayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserProfilePayloadResult =
    DeleteUserProfilePayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserProfileNotFound

input CreateUserPreferenceInput {
  userId: String!
  themeColor: String!
  clientMutationId: ID
}

type CreateUserPreferencePayload {
  userPreference: UserPreference!
  clientMutationId: ID
}

union CreateUserPreferencePayloadResult =
    CreateUserPreferencePayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

input UpdateUserPreferenceInput {
  userId: String!
  themeColor: String!
  clientMutationId: ID
}

type UpdateUserPreferencePayload {
  userPreference: UserPreference!
  clientMutationId: ID
}

union UpdateUserPreferencePayloadResult =
    UpdateUserPreferencePayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserPreferenceNotFound
  | ErrorUserNotFound

input DeleteUserPreferenceInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserPreferencePayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserPreferencePayloadResult =
    DeleteUserPreferencePayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserPreferenceNotFound

input CreateBookInput {
  title: String!
  clientMutationId: ID
}

type CreateBookPayload {
  book: Book!
  clientMutationId: ID
}

union CreateBookPayloadResult =
    CreateBookPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime

input UpdateBookInput {
  id: ID!
  title: String!
  clientMutationId: ID
}

type UpdateBookPayload {
  book: Book!
  clientMutationId: ID
}

union UpdateBookPayloadResult =
    UpdateBookPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorBookNotFound

input DeleteBookInput {
  id: ID!
  clientMutationId: ID
}

type DeleteBookPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteBookPayloadResult =
    DeleteBookPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorBookNotFound

input CreateUserBookInput {
  userId: String!
  bookId: String!
  clientMutationId: ID
}

type CreateUserBookPayload {
  userBook: UserBook!
  clientMutationId: ID
}

union CreateUserBookPayloadResult =
    CreateUserBookPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound
  | ErrorBookNotFound

input UpdateUserBookInput {
  userId: String!
  bookId: String!
  clientMutationId: ID
}

type UpdateUserBookPayload {
  userBook: UserBook!
  clientMutationId: ID
}

union UpdateUserBookPayloadResult =
    UpdateUserBookPayload
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserBookNotFound
  | ErrorUserNotFound
  | ErrorBookNotFound

input DeleteUserBookInput {
  id: ID!
  clientMutationId: ID
}

type DeleteUserBookPayload {
  id: ID!
  clientMutationId: ID
}

union DeleteUserBookPayloadResult =
    DeleteUserBookPayload
  | ErrorNotFound
  | ErrorUnknownRuntime
  | ErrorPermissionDenied
  | ErrorUserBookNotFound

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
  createUserProfile(input: CreateUserProfileInput!): CreateUserProfilePayloadResult!
  updateUserProfile(input: UpdateUserProfileInput!): UpdateUserProfilePayloadResult!
  deleteUserProfile(input: DeleteUserProfileInput!): DeleteUserProfilePayloadResult!
  createUserPreference(input: CreateUserPreferenceInput!): CreateUserPreferencePayloadResult!
  updateUserPreference(input: UpdateUserPreferenceInput!): UpdateUserPreferencePayloadResult!
  deleteUserPreference(input: DeleteUserPreferenceInput!): DeleteUserPreferencePayloadResult!
  createBook(input: CreateBookInput!): CreateBookPayloadResult!
  updateBook(input: UpdateBookInput!): UpdateBookPayloadResult!
  deleteBook(input: DeleteBookInput!): DeleteBookPayloadResult!
  createUserBook(input: CreateUserBookInput!): CreateUserBookPayloadResult!
  updateUserBook(input: UpdateUserBookInput!): UpdateUserBookPayloadResult!
  deleteUserBook(input: DeleteUserBookInput!): DeleteUserBookPayloadResult!
}


`;

      const mutation = useCase.generateMutation(
        entityDefinitions,
        ignorePropertyNamesForCreation,
        ignorePropertyNamesForUpdate,
      );

      expect(mutation.trim()).toEqual(expectedMutation.trim());
    });
  });
  describe('generateTypes', () => {
    it('should generate type definitions for all entity definitions', () => {
      const { useCase } = createUseCaseAndMockRepositories();

      const expectedTypeDefs = `
scalar Date

type User {
  id: ID!
  name: String!
  gender: UserGenderType!
  pet: String
  deactivated: Boolean!
  createdAt: Date!
  createdUserId: String
  createdUser: UserResult!
  updatedAt: Date!
  updatedUserId: String
  updatedUser: UserResult!
  createdUserUserList: UserListResult!
  updatedUserUserList: UserListResult!
  createdUserGroupList: GroupListResult!
  userGroupList: UserGroupListResult!
  userProfile: UserProfile
  userPreference: UserPreference
  userBookList: UserBookListResult!
}
enum UserGenderType {
  MALE
  FEMALE
  OTHER
  EMPTY
}
type Group {
  id: ID!
  name: String!
  createdUserId: String
  createdUser: UserResult!
  userGroupList: UserGroupListResult!
}

type UserGroup {
  id: ID!
  userId: String!
  user: UserResult!
  groupId: String!
  group: GroupResult!
}

type UserProfile {
  id: ID!
  userId: String!
  user: UserResult!
  nickname: String!
}

type UserPreference {
  userId: String!
  user: UserResult!
  themeColor: String!
}

type Book {
  id: ID!
  title: String!
  userBookList: UserBookListResult!
}

type UserBook {
  userId: String!
  user: UserResult!
  bookId: String!
  book: BookResult!
}

`;

      const typeDefs = useCase.generateTypes(entityDefinitions);

      expect(typeDefs.trim()).toEqual(expectedTypeDefs.trim());
    });
  });
  describe('generateErrorTypes', () => {
    it('should generate error type definitions', () => {
      const { useCase } = createUseCaseAndMockRepositories();

      const expectedTypeDefs = `enum ErrorCode {
  UNKNOWN_RUNTIME
  PERMISSION_DENIED
  NOT_FOUND
  USER_NOT_FOUND
  GROUP_NOT_FOUND
  USER_GROUP_NOT_FOUND
  USER_PROFILE_NOT_FOUND
  USER_PREFERENCE_NOT_FOUND
  BOOK_NOT_FOUND
  USER_BOOK_NOT_FOUND
}

type Error {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUnknownRuntime {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorPermissionDenied {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorGroupNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserGroupNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserProfileNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserPreferenceNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorBookNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

type ErrorUserBookNotFound {
  errorCode: ErrorCode!
  message: String
  stack: String
}

`;

      const typeDefs = useCase.generateErrorTypes(entityDefinitions);

      expect(typeDefs.trim()).toEqual(expectedTypeDefs.trim());
    });
  });
  describe('generateQuery', () => {
    it('should generate query definitions for all entity definitions', () => {
      const { useCase } = createUseCaseAndMockRepositories();

      const expectedQueryDefs = `


union UserResult =
    User
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

type UserList {
  itemList: [User!]!
  total: Int!
}

union UserListResult =
    UserList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime

union GroupResult =
    Group
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorGroupNotFound
  | ErrorUserNotFound

type GroupList {
  itemList: [Group!]!
  total: Int!
}

union GroupListResult =
    GroupList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

union UserGroupResult =
    UserGroup
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserGroupNotFound
  | ErrorUserNotFound
  | ErrorGroupNotFound

type UserGroupList {
  itemList: [UserGroup!]!
  total: Int!
}

union UserGroupListResult =
    UserGroupList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound
  | ErrorGroupNotFound

union UserProfileResult =
    UserProfile
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserProfileNotFound
  | ErrorUserNotFound

type UserProfileList {
  itemList: [UserProfile!]!
  total: Int!
}

union UserProfileListResult =
    UserProfileList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

union UserPreferenceResult =
    UserPreference
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserPreferenceNotFound
  | ErrorUserNotFound

type UserPreferenceList {
  itemList: [UserPreference!]!
  total: Int!
}

union UserPreferenceListResult =
    UserPreferenceList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound

union BookResult =
    Book
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorBookNotFound

type BookList {
  itemList: [Book!]!
  total: Int!
}

union BookListResult =
    BookList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime

union UserBookResult =
    UserBook
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserBookNotFound
  | ErrorUserNotFound
  | ErrorBookNotFound

type UserBookList {
  itemList: [UserBook!]!
  total: Int!
}

union UserBookListResult =
    UserBookList
  | ErrorNotFound
  | ErrorPermissionDenied
  | ErrorUnknownRuntime
  | ErrorUserNotFound
  | ErrorBookNotFound

type Query {
  user(id: ID!): UserResult!
  userList(createdUserId: ID, updatedUserId: ID): UserListResult!
  group(id: ID!): GroupResult!
  groupList(createdUserId: ID): GroupListResult!
  userGroup(id: ID!): UserGroupResult!
  userGroupList(userId: ID, groupId: ID): UserGroupListResult!
  userProfile(id: ID, userId: ID): UserProfileResult!
  userProfileList: UserProfileListResult!
  userPreference(userId: ID!): UserPreferenceResult!
  userPreferenceList: UserPreferenceListResult!
  book(id: ID!): BookResult!
  bookList: BookListResult!
  userBookList(userId: ID, bookId: ID): UserBookListResult!
}


`;

      const queryDefs = useCase.generateQuery(entityDefinitions);

      expect(queryDefs.trim()).toEqual(expectedQueryDefs.trim());
    });
  });

  describe('mapToGraphQLType', () => {
    const entity = {
      name: 'User',
      properties: [],
    };

    it.each`
      propertyType | expected
      ${'boolean'} | ${'Boolean'}
      ${'number'}  | ${'Int'}
      ${'string'}  | ${'String'}
      ${'Date'}    | ${'Date'}
    `(
      'maps $propertyType to $expected',
      ({
        propertyType,
        expected,
      }: {
        propertyType: EntityPropertyDefinitionPrimitive['propertyType'];
        expected: string;
      }) => {
        const property: EntityPropertyDefinitionPrimitive = {
          name: 'test',
          propertyType: propertyType,
          isReference: false,
          isNullable: false,
          acceptableValues: null,
        };
        const { useCase } = createUseCaseAndMockRepositories();
        expect(useCase.mapToGraphQLType(entity, property)).toEqual(expected);
      },
    );

    it('maps type with acceptableValues to custom type', () => {
      const property: EntityPropertyDefinitionPrimitive = {
        name: 'gender',
        propertyType: 'string',
        isReference: false,
        isNullable: false,
        acceptableValues: ['Male', 'Female', 'Other', ''],
      };
      const { useCase } = createUseCaseAndMockRepositories();
      expect(useCase.mapToGraphQLType(entity, property)).toEqual(
        'UserGenderType',
      );
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
  describe(`pascalCaseToScreamingSnakeCase`, () => {
    test.each`
      input                 | expected
      ${'PermissionDenied'} | ${'PERMISSION_DENIED'}
      ${'SomeOtherValue'}   | ${'SOME_OTHER_VALUE'}
      ${'YetAnotherName'}   | ${'YET_ANOTHER_NAME'}
    `(
      'should convert $input to $expected',
      ({ input, expected }: { input: string; expected: string }) => {
        const { useCase } = createUseCaseAndMockRepositories();
        expect(useCase.pascalCaseToScreamingSnakeCase(input)).toBe(expected);
      },
    );
  });

  const createUseCaseAndMockRepositories = () => {
    const fileRepository = createMockFileRepository();
    const entityDefinitionRepository =
      createMockEntityRelationDefinitionRepository();
    const stringConvertor = createMockStringConvertor();
    const useCase = new GenerateGraphqlSchemaUseCase(
      fileRepository,
      entityDefinitionRepository,
      stringConvertor,
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
  const createMockStringConvertor = () => {
    const stringConvertor: StringConvertor = {
      camelCase: (str: string): string => camelCase(str),
      snakeCase: (str: string): string => snakeCase(str),
      pascalCase: (str: string): string => pascalCase(str),
      paramCase: (str: string): string => paramCase(str),
      kebabCase: (str: string): string => paramCase(str),
      screamSnakeCase: (str: string): string => snakeCase(str).toUpperCase(),
    };
    return {
      camelCase: jest.fn((str: string) => stringConvertor.camelCase(str)),
      snakeCase: jest.fn((str: string) => stringConvertor.snakeCase(str)),
      pascalCase: jest.fn((str: string) => stringConvertor.pascalCase(str)),
      paramCase: jest.fn((str: string) => stringConvertor.paramCase(str)),
      kebabCase: jest.fn((str: string) => stringConvertor.kebabCase(str)),
      screamSnakeCase: jest.fn((str: string) =>
        stringConvertor.screamSnakeCase(str),
      ),
    };
  };
});
