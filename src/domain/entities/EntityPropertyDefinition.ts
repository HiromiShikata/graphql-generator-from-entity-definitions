// ./src/domain/entities/EntityPropertyDefinition.ts
export type EntityPropertyDefinition =
  | EntityPropertyDefinitionPrimitive
  | EntityPropertyDefinitionReferencedObject;

export type EntityPropertyDefinitionPrimitive = {
  name: string;
  propertyType: 'boolean' | 'number' | 'string' | 'Date';
  isReference: false;
  isNullable: boolean;
  acceptableValues: string[] | null;
};
export type EntityPropertyDefinitionReferencedObject = {
  isReference: true;
  name: string;
  targetEntityDefinitionName: string;
  isUnique: boolean;
  isNullable: boolean;
};
