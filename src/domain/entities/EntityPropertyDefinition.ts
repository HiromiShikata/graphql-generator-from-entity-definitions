export type EntityPropertyDefinition =
  | EntityPropertyDefinitionPrimitive
  | EntityPropertyDefinitionReferencedObject;

export type EntityPropertyDefinitionPrimitive = {
  name: string;
  propertyType: 'boolean' | 'number' | 'string' | 'Date';
  isReference: false;
  isNullable: boolean;
};
export type EntityPropertyDefinitionReferencedObject = {
  isReference: true;
  name: string;
  propertyType: string;
  isUnique: boolean;
  isNullable: boolean;
};
