export interface StringConvertor {
  camelCase(str: string): string;
  snakeCase(str: string): string;
  pascalCase(str: string): string;
  paramCase(str: string): string;
  kebabCase(str: string): string;
  screamSnakeCase(str: string): string;
}
