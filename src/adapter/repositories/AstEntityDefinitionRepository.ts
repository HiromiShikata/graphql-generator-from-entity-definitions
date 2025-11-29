// ./src/adapter/repositories/AstEntityDefinitionRepository.ts
import { EntityDefinitionRepository } from '../../domain/usecases/adapter-interfaces/EntityRelationDefinitionRepository';
import { EntityDefinition } from '../../domain/entities/EntityDefinition';
import { getEntityDefinitions } from 'ast-to-entity-definitions/bin/adapter/entry-points/function/index';

export class AstEntityDefinitionRepository implements EntityDefinitionRepository {
  find = async (path: string): Promise<EntityDefinition[]> => {
    return await getEntityDefinitions(path);
  };
}
