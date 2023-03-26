import { EntityPropertyDefinition } from './EntityPropertyDefinition';

export type EntityDefinition = {
  typeName: string;
  properties: EntityPropertyDefinition[];
};
