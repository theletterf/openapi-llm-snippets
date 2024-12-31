import * as claudeService from './claudeService';
import * as openaiService from './openaiService';

export function generateCodeSnippet(operation, language, spec, apiProvider, apiKey) {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  switch (apiProvider) {
    case 'claude':
      return claudeService.generateCodeSnippet(operation, language, spec, apiKey);
    case 'openai':
      return openaiService.generateCodeSnippet(operation, language, spec, apiKey);
    default:
      throw new Error('Invalid API provider');
  }
} 