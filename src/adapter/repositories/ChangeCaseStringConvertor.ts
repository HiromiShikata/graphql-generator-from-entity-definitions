import { StringConvertor } from '../../domain/usecases/adapter-interfaces/StringConvertor';
import { camelCase, paramCase, pascalCase, snakeCase } from 'change-case-all';

export class ChangeCaseStringConvertor implements StringConvertor {
  camelCase = (str: string): string => {
    return camelCase(str);
  };

  snakeCase = (str: string): string => {
    return snakeCase(str);
  };

  pascalCase = (str: string): string => {
    return pascalCase(str);
  };

  kebabCase = (str: string): string => {
    return paramCase(str);
  };

  screamSnakeCase = (str: string): string => {
    return snakeCase(str).toUpperCase();
  };
  paramCase = (str: string): string => {
    return paramCase(str);
  };
}
