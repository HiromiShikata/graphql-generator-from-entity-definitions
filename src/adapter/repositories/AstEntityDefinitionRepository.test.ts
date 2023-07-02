// ./src/adapter/repositories/AstEntityDefinitionRepository.test.ts
import { AstEntityDefinitionRepository } from './AstEntityDefinitionRepository';

describe('AstEntityDefinitionRepository', () => {
  describe('find', () => {
    it('should return an array of entity definitions when the path is found', async () => {
      const repository = new AstEntityDefinitionRepository();
      const path = './src/adapter/repositories/_testdata';
      const result = await repository.find(path);
      expect(result).toEqual([
        {
          name: 'User',
          properties: [
            {
              acceptableValues: null,
              isNullable: false,
              isReference: false,
              name: 'id',
              propertyType: 'string',
            },
            {
              acceptableValues: null,
              isNullable: false,
              isReference: false,
              name: 'name',
              propertyType: 'string',
            },
            {
              acceptableValues: null,
              isNullable: true,
              isReference: false,
              name: 'pet',
              propertyType: 'string',
            },
            {
              acceptableValues: null,
              isNullable: false,
              isReference: false,
              name: 'createdAt',
              propertyType: 'Date',
            },
            {
              acceptableValues: null,
              isNullable: false,
              isReference: false,
              name: 'createdUserId',
              propertyType: 'string',
            },
          ],
        },
      ]);
    });
  });
});
