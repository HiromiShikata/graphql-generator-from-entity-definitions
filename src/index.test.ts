import { execSync } from 'child_process';

describe('commander program', () => {
  it('should output file contents', () => {
    const output = execSync(
      'npx ts-node ./src/index.ts ./src/adapter/repositories/_testdata -o ./tmp/schema.graphql',
    ).toString();
    expect(output.trim()).toBe(`enum ErrorCode {
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
  id: ID!
  name: String!
  pet: String
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

type Query {
  user(id: ID!): UserResult!
  userList: UserListResult!
}

input CreateUserInput {
  name: String!
  pet: String
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
  pet: String
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

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayloadResult!
  updateUser(input: UpdateUserInput!): UpdateUserPayloadResult!
  deleteUser(input: DeleteUserInput!): DeleteUserPayloadResult!
}`);
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
        !(error.stderr instanceof Buffer)
      ) {
        throw error;
      }

      expect(error.stderr.toString()).toContain(
        `error: missing required argument 'inputPath'`,
      );
    }
  });
  it('should output help', () => {
    const output = execSync('npx ts-node ./src/index.ts -h').toString();
    expect(output.trim()).toBe(`Usage: GraphQL Generator [options] <inputPath>

Generate GraphQL schema from entity definitions

Arguments:
  inputPath                  Path to domain entities dir.

Options:
  -o, --output <outputPath>  Path to schema.graphql.
  -h, --help                 display help for command`);
  });
});
