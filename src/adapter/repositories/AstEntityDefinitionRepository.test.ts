// ./src/adapter/repositories/AstEntityDefinitionRepository.test.ts
import { AstEntityDefinitionRepository } from '../../adapter/repositories/AstEntityDefinitionRepository';

describe('AstEntityDefinitionRepository', () => {
  describe('find', () => {
    it('should return an array of entity definitions when the path is found', async () => {
      const repository = new AstEntityDefinitionRepository();
      const path = './src/adapter/repositories/_testdata';
      const result = await repository.find(path);
      expect(result).toEqual([
        {
          properties: [
            {
              isReference: false,
              name: 'id',
              propertyType: 'string',
            },
            {
              isReference: false,
              name: 'name',
              propertyType: 'string',
            },
          ],
          typeName: 'User',
        },
      ]);
    });
  });
});
