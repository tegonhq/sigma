import { MCPTool, SchemaProperty } from './types';

/**
 * Converts a single MCP tool to a concise plain text format
 */
function toolToPlainText(tool: MCPTool): string {
  let text = `FUNCTION: ${tool.name}\n`;
  text += `DESCRIPTION: ${tool.description}\n`;

  // Process input parameters
  const { properties, required = [] } = tool.inputSchema;

  if (Object.keys(properties).length === 0) {
    text += 'PARAMS: None\n';
  } else {
    text += 'PARAMS:\n';

    for (const [paramName, paramProps] of Object.entries(properties)) {
      // Determine if param is required
      const isRequired = required.includes(paramName) ? 'REQUIRED' : 'OPTIONAL';

      // Get type info
      const typeInfo = getTypeInfo(paramProps);

      // Get default value if present
      const defaultInfo = getDefaultInfo(paramProps);

      // Get description if present
      const description =
        'description' in paramProps ? paramProps.description : '';
      const descriptionInfo = description ? ` ${description}` : '';

      // Format parameter info
      text += `- ${paramName} (${typeInfo}) [${isRequired}]${defaultInfo}${descriptionInfo}\n`;

      // Handle nested objects (exercises, sets, etc.)
      if (
        !('anyOf' in paramProps) &&
        paramProps.type === 'array' &&
        paramProps.items &&
        paramProps.items.properties
      ) {
        text += '  CONTAINS:\n';
        const nestedProps = paramProps.items.properties;
        const nestedRequired = paramProps.items.required || [];

        for (const [nestedName, rawNestedProp] of Object.entries(nestedProps)) {
          const nestedProp = rawNestedProp as SchemaProperty;
          const isNestedRequired = nestedRequired.includes(nestedName)
            ? 'REQUIRED'
            : 'OPTIONAL';
          const nestedTypeInfo = getTypeInfo(nestedProp);
          const nestedDefaultInfo = getDefaultInfo(nestedProp);

          // Get description if present
          const nestedDescription =
            'description' in nestedProp ? nestedProp.description : '';
          const nestedDescriptionInfo = nestedDescription
            ? ` ${nestedDescription}`
            : '';

          // Format parameter info
          text += `  - ${nestedName} (${nestedTypeInfo}) [${isNestedRequired}]${nestedDefaultInfo}${nestedDescriptionInfo}\n`;

          // Handle doubly nested objects (like sets within exercises)
          if (
            !('anyOf' in nestedProp) &&
            nestedProp.type === 'array' &&
            nestedProp.items &&
            nestedProp.items.properties
          ) {
            text += '    CONTAINS:\n';
            const deepProps = nestedProp.items.properties;
            const deepRequired = nestedProp.items.required || [];

            for (const [deepName, deepProp] of Object.entries(deepProps)) {
              const isDeepRequired = deepRequired.includes(deepName)
                ? 'REQUIRED'
                : 'OPTIONAL';
              const deepTypeInfo = getTypeInfo(deepProp as SchemaProperty);
              const deepDefaultInfo = getDefaultInfo(
                deepProp as SchemaProperty,
              );

              text += `    - ${deepName} (${deepTypeInfo}) [${isDeepRequired}]${deepDefaultInfo}\n`;
            }
          }
        }
      }
    }
  }

  return text;
}

/**
 * Helper function to extract type information
 */
function getTypeInfo(prop: SchemaProperty): string {
  if ('anyOf' in prop) {
    return determineAnyOfType(prop.anyOf);
  }

  // Convert prop.type to string (it can be string or string[])
  let typeInfo = Array.isArray(prop.type) ? prop.type.join('|') : prop.type;

  // Handle array types with additional info on items
  if (
    (Array.isArray(prop.type)
      ? prop.type.includes('array')
      : prop.type === 'array') &&
    prop.items
  ) {
    if (prop.items.type) {
      typeInfo = `array of ${prop.items.type}`;
    }
  }

  // Handle string with pattern
  if (
    (Array.isArray(prop.type)
      ? prop.type.includes('string')
      : prop.type === 'string') &&
    prop.pattern
  ) {
    typeInfo = `string [format: ${simplifyPattern(prop.pattern)}]`;
  }

  // Handle enum types
  if (prop.enum) {
    typeInfo = `enum: ${prop.enum.join('|')}`;
  }

  // Handle numeric constraints
  const isNumber = Array.isArray(prop.type)
    ? prop.type.includes('number') || prop.type.includes('integer')
    : prop.type === 'number' || prop.type === 'integer';

  if (isNumber && (prop.minimum !== undefined || prop.maximum !== undefined)) {
    const minPart = prop.minimum !== undefined ? prop.minimum : '';
    const maxPart = prop.maximum !== undefined ? prop.maximum : '';

    // Get a string representation of the type for display
    const typeDisplay = Array.isArray(prop.type)
      ? prop.type.join('|')
      : prop.type;

    if (minPart !== '' && maxPart !== '') {
      typeInfo = `${typeDisplay} [${minPart}-${maxPart}]`;
    } else if (minPart !== '') {
      typeInfo = `${typeDisplay} [min: ${minPart}]`;
    } else if (maxPart !== '') {
      typeInfo = `${typeDisplay} [max: ${maxPart}]`;
    }
  }

  // Handle string with minLength
  if (
    (Array.isArray(prop.type)
      ? prop.type.includes('string')
      : prop.type === 'string') &&
    prop.minLength
  ) {
    typeInfo = `string [min length: ${prop.minLength}]`;
  }

  return typeInfo;
}

/**
 * Helper function to simplify regex patterns for display
 */
function simplifyPattern(pattern: string): string {
  // For ISO date pattern, simplify to a more readable format
  if (pattern.includes('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z')) {
    return 'YYYY-MM-DDThh:mm:ssZ';
  }
  return 'custom pattern';
}

/**
 * Helper function to extract default value
 */
function getDefaultInfo(prop: SchemaProperty): string {
  if ('anyOf' in prop) {
    return '';
  }

  if (prop.default !== undefined) {
    return ` default=${prop.default}`;
  }
  return '';
}

/**
 * Helper function to determine type from anyOf schema
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function determineAnyOfType(anyOf: any[]): string {
  // Common pattern in this schema: anyOf with null or another type
  const types = new Set<string>();

  anyOf.forEach((item) => {
    if (item.type === 'null') {
      types.add('null');
    } else if (item.type) {
      types.add(item.type);
    } else if (item.anyOf) {
      types.add(determineAnyOfType(item.anyOf));
    }
  });

  return Array.from(types).join('|');
}

/**
 * Main function to convert all MCP tools to plain text
 */
export function convertMCPToolsToPlainText(tools: MCPTool[]): string {
  let result = '';

  tools.forEach((tool, index) => {
    result += toolToPlainText(tool);

    // Add separator between tools (except for the last one)
    if (index < tools.length - 1) {
      result += '\n------------------\n\n';
    }
  });

  return result;
}

/**
 * Function to get a compact reference list of all available functions
 */
export function getCompactFunctionList(tools: MCPTool[]): string {
  return tools
    .map((tool) => {
      const nameParts = tool.name.split('--');
      const action = nameParts[1];
      return `${tool.name}: ${action}`;
    })
    .join('\n');
}
