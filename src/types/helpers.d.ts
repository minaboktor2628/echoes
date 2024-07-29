// Defines a utility type to extract the element type of an array
type ElementTypeFromArray<T> = T extends (infer U)[] ? U : never;
