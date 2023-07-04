'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ChangeCaseStringConvertor = void 0;
const change_case_all_1 = require('change-case-all');
class ChangeCaseStringConvertor {
  constructor() {
    this.camelCase = (str) => {
      return (0, change_case_all_1.camelCase)(str);
    };
    this.snakeCase = (str) => {
      return (0, change_case_all_1.snakeCase)(str);
    };
    this.pascalCase = (str) => {
      return (0, change_case_all_1.pascalCase)(str);
    };
    this.kebabCase = (str) => {
      return (0, change_case_all_1.paramCase)(str);
    };
    this.screamSnakeCase = (str) => {
      return (0, change_case_all_1.snakeCase)(str).toUpperCase();
    };
    this.paramCase = (str) => {
      return (0, change_case_all_1.paramCase)(str);
    };
  }
}
exports.ChangeCaseStringConvertor = ChangeCaseStringConvertor;
//# sourceMappingURL=ChangeCaseStringConvertor.js.map
