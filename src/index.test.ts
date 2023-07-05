import { execSync } from 'child_process';

describe('commander program', () => {
  it('should output file contents', async () => {
    const output = execSync(
      'npx ts-node ./src/index.ts ./src/adapter/repositories/_testdata -o ./tmp/schema.graphql --ignorePropertyNamesForCreation id,createdAt,updatedAt,createdUserId,updatedUserId --ignorePropertyNamesForUpdate createdAt,updatedAt,createdUserId,updatedUserId',
    ).toString();
    const expectedContent = `enum ErrorCode {
  UNKNOWN_RUNTIME
  PERMISSION_DENIED
  NOT_FOUND
  USER_NOT_FOUND
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

scalar Date

type User {
  id: ID!
  name: String!
  pet: String
  createdAt: Date!
  createdUserId: String
  createdUser: UserResult!
  gender: UserGenderType!
  createdUserUserList: UserListResult!
}
enum UserGenderType {
  EMPTY
  MAKE
  FEMALE
  OTHER
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

type Query {
  user(id: ID!): UserResult!
  userList(createdUserId: ID): UserListResult!
}

input CreateUserInput {
  name: String!
  pet: String
  gender: UserGenderType!
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
  pet: String
  gender: UserGenderType!
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

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayloadResult!
  updateUser(input: UpdateUserInput!): UpdateUserPayloadResult!
  deleteUser(input: DeleteUserInput!): DeleteUserPayloadResult!
}`;
    expect(output.trim()).toBe(expectedContent);
    const schema = execSync('cat ./tmp/schema.graphql').toString();
    expect(schema.trim()).toBe(expectedContent);
  });

  it('should output error message without input path', () => {
    try {
      execSync('npx ts-node ./src/index.ts').toString();
      throw new Error(`should throw Error`);
    } catch (error) {
      if (
        !error ||
        typeof error !== 'object' ||
        !('stderr' in error) ||
        error.stderr === null ||
        typeof error.stderr !== 'object'
      ) {
        throw error;
      }
      expect(error.stderr.toString()).toContain(
        `error: missing required argument 'inputPath'`,
      );
    }
  });
  it('should output help', () => {
    const output = execSync('npx ts-node ./src/index.ts --help', {
      encoding: 'utf8',
      maxBuffer: 1024 * 1000,
    });
    expect(output.trim()).toBe(`Usage: GraphQL Generator [options] <inputPath>

Generate GraphQL schema from entity definitions

Arguments:
  inputPath                                                          Path to domain entities dir.

Options:
  -o, --outputPath <outputPath>                                      Path to schema.graphql.
  --ignorePropertyNamesForCreation <ignorePropertyNamesForCreation>  Option to specify property names to be ignored when creating an object from the command line.
  --ignorePropertyNamesForUpdate <ignorePropertyNamesForUpdate>      Option to specify property names to be ignored when updating an object from the command line.
  -h, --help                                                         display help for command`);
  });
});
