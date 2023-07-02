import { ChangeCaseStringConvertor } from './ChangeCaseStringConvertor';

describe('ChangeCaseStringConvertor', () => {
  let convertor: ChangeCaseStringConvertor;

  beforeEach(() => {
    convertor = new ChangeCaseStringConvertor();
  });

  test.each`
    method               | expected
    ${'camelCase'}       | ${'testString'}
    ${'paramCase'}       | ${'test_string'}
    ${'pascalCase'}      | ${'TestString'}
    ${'kebabCase'}       | ${'test-string'}
    ${'screamSnakeCase'} | ${'TEST_STRING'}
  `(
    'should convert to $method',
    ({
      method,
      expected,
    }: {
      method: keyof ChangeCaseStringConvertor;
      expected: string;
    }) => {
      const result = convertor[method]('Test String');
      expect(result).toBe(expected);
    },
  );
});
