import { EntityDefinition } from '../../entities/EntityDefinition';

export interface EntityDefinitionRepository {
  find(path: string): Promise<EntityDefinition[]>;
}
