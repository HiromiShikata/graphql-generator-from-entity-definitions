//./src/domain/usecases/adapter-interfaces/EntityRelationDefinitionRepository.ts
import { EntityDefinition } from '../../entities/EntityDefinition';

export interface EntityDefinitionRepository {
  find(path: string): Promise<EntityDefinition[]>;
}
