'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AstEntityDefinitionRepository = void 0;
const index_1 = require('ast-to-entity-definitions/bin/adapter/entry-points/function/index');
class AstEntityDefinitionRepository {
  constructor() {
    this.find = async (path) => {
      return (0, index_1.getEntityDefinitions)(path);
    };
  }
}
exports.AstEntityDefinitionRepository = AstEntityDefinitionRepository;
//# sourceMappingURL=AstEntityDefinitionRepository.js.map
