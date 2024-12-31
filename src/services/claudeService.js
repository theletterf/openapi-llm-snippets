import Anthropic from '@anthropic-ai/sdk';

function resolveRef(ref, components) {
  const refPath = ref.replace(/^#\/components\//, '');
  const [type, name] = refPath.split('/');
  return components[type][name];
}

function resolveSchema(schema, components) {
  if (schema.$ref) {
    return resolveRef(schema.$ref, components);
  }
  return schema;
}

function resolveExample(exampleRef, components) {
  if (exampleRef.$ref) {
    return resolveRef(exampleRef.$ref, components);
  }
  return exampleRef;
}

function getRequestBodyExample(operation, components) {
  if (!operation.requestBody || !operation.requestBody.content) return null;

  const contentType = Object.keys(operation.requestBody.content)[0];
  const schema = operation.requestBody.content[contentType].schema;
  let resolvedSchema = resolveSchema(schema, components);

  // Resolve nested $ref if present
  while (resolvedSchema.$ref) {
    resolvedSchema = resolveSchema(resolvedSchema, components);
  }

  // Check for examples in the request body
  const examples = operation.requestBody.content[contentType].examples;
  if (examples) {
    const exampleKeys = Object.keys(examples);
    if (exampleKeys.length > 0) {
      const exampleRef = examples[exampleKeys[0]];
      const resolvedExample = resolveExample(exampleRef, components);
      if (resolvedExample) {
        return resolvedExample.value;
      }
    }
  }

  // Return example or default, or construct a basic example if none are provided
  return resolvedSchema.example || resolvedSchema.default || constructExample(resolvedSchema);
}

function constructExample(schema) {
  if (!schema || typeof schema !== 'object') return null;

  if (schema.type === 'object' && schema.properties) {
    const example = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      example[key] = constructExample(value);
    }
    return example;
  }

  if (schema.type === 'array' && schema.items) {
    return [constructExample(schema.items)];
  }

  // Fallback for primitive types
  return schema.example || schema.default || getDefaultForType(schema.type);
}

function getDefaultForType(type) {
  switch (type) {
    case 'string': return 'example';
    case 'number': return 0;
    case 'integer': return 0;
    case 'boolean': return false;
    case 'array': return [];
    case 'object': return {};
    default: return null;
  }
}

export async function generateCodeSnippet(operation, language, spec, apiKey) {
  const basePath = spec.servers?.[0]?.url || '';

  const requestBodyExample = getRequestBodyExample(operation, spec.components);

  const prompt = `Generate code for a ${language} HTTP request. Do not include markdown code fences (\\\`\\\`\\\` or \\\`\\\`\\\`${language}). Only return the raw code:

Base Path: ${basePath}
Method: ${operation.method}
Path: ${operation.path}
Request Body Example: ${JSON.stringify(requestBodyExample, null, 2)}

Requirements:
- Use popular HTTP libraries
- Include error handling
- Parse the response
- Add helpful comments
- Follow language best practices

Return only the raw code with no markdown formatting or explanations.`;

  const anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error generating code:', error);
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your Claude API key and try again.');
    }
    throw new Error(error.message || 'Failed to generate code snippet');
  }
} 