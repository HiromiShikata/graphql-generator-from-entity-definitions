import { EntityPropertyDefinition } from './EntityPropertyDefinition';

export type EntityDefinition = {
  name: string;
  properties: EntityPropertyDefinition[];
};
