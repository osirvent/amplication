import { SchemaObject, OpenAPIObject } from "openapi3-ts";
import { removeSchemaPrefix } from "./open-api.util";
import { Module } from "./module.util";

export function createSchemaModules(api: OpenAPIObject): Module[] {
  if (!api?.components?.schemas) {
    return [];
  }
  return Object.entries(api.components.schemas).map(([name, schema]) =>
    schemaToModule(schema, name)
  );
}

function schemaToModule(schema: SchemaObject, name: string): Module {
  return {
    code: schemaToCode(schema, name),
    path: `./${name}.ts`,
  };
}

function schemaToCode(schema: SchemaObject, name?: string): string {
  switch (schema.type) {
    case "string": {
      return "string";
    }
    case "number":
    case "integer": {
      return "number";
    }
    case "object": {
      if (!schema.properties) {
        throw new Error(
          "When schema.type is 'object' schema.properties must be defined"
        );
      }
      const properties = Object.entries(schema.properties).map(
        ([propertyName, property]) => {
          if ("$ref" in property) {
            throw new Error("Not implemented");
          }
          if (schema.required && schema.required.includes(propertyName)) {
            return `${propertyName}: ${schemaToCode(property)}`;
          } else {
            return `${propertyName}?: ${schemaToCode(property)}`;
          }
        }
      );
      return `export type ${name} = {${properties.join("\n")}}`;
    }
    case "array": {
      if (!schema.items) {
        throw new Error(
          "When schema.type is 'array' schema.properties must be defined"
        );
      }
      if (!("$ref" in schema.items)) {
        throw new Error("Not implemented");
      }
      const item = removeSchemaPrefix(schema.items.$ref);
      return `
        import { ${item} } from "./${item}";
        export type ${name} = ${item}[]
        `;
    }
    default: {
      throw new Error("Not implemented");
    }
  }
}
