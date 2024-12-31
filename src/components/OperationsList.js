import React, { useState } from 'react';
import { generateCodeSnippet } from '../services';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LANGUAGES = [
  { id: 'abap', name: 'ABAP' },
  { id: 'ada', name: 'Ada' },
  { id: 'assembly', name: 'Assembly' },
  { id: 'bash', name: 'Bash/Shell' },
  { id: 'basic', name: 'BASIC' },
  { id: 'c', name: 'C' },
  { id: 'cfml', name: 'CFML' },
  { id: 'clojure', name: 'Clojure' },
  { id: 'cobol', name: 'COBOL' },
  { id: 'coffeescript', name: 'CoffeeScript' },
  { id: 'cpp', name: 'C++' },
  { id: 'crystal', name: 'Crystal' },
  { id: 'csharp', name: 'C#' },
  { id: 'd', name: 'D' },
  { id: 'dart', name: 'Dart' },
  { id: 'delphi', name: 'Delphi' },
  { id: 'elixir', name: 'Elixir' },
  { id: 'elm', name: 'Elm' },
  { id: 'erlang', name: 'Erlang' },
  { id: 'f#', name: 'F#' },
  { id: 'fortran', name: 'Fortran' },
  { id: 'go', name: 'Go' },
  { id: 'groovy', name: 'Groovy' },
  { id: 'hack', name: 'Hack' },
  { id: 'haskell', name: 'Haskell' },
  { id: 'haxe', name: 'Haxe' },
  { id: 'idris', name: 'Idris' },
  { id: 'io', name: 'Io' },
  { id: 'java', name: 'Java' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'julia', name: 'Julia' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'lisp', name: 'Lisp' },
  { id: 'lua', name: 'Lua' },
  { id: 'matlab', name: 'MATLAB' },
  { id: 'mercury', name: 'Mercury' },
  { id: 'nim', name: 'Nim' },
  { id: 'objectivec', name: 'Objective-C' },
  { id: 'ocaml', name: 'OCaml' },
  { id: 'pascal', name: 'Pascal' },
  { id: 'perl', name: 'Perl' },
  { id: 'php', name: 'PHP' },
  { id: 'powershell', name: 'PowerShell' },
  { id: 'prolog', name: 'Prolog' },
  { id: 'purescript', name: 'PureScript' },
  { id: 'python', name: 'Python' },
  { id: 'q#', name: 'Q#' },
  { id: 'r', name: 'R' },
  { id: 'racket', name: 'Racket' },
  { id: 'reason', name: 'Reason' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'rust', name: 'Rust' },
  { id: 'scala', name: 'Scala' },
  { id: 'scheme', name: 'Scheme' },
  { id: 'smalltalk', name: 'Smalltalk' },
  { id: 'sql', name: 'SQL' },
  { id: 'swift', name: 'Swift' },
  { id: 'tcl', name: 'Tcl' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'vala', name: 'Vala' },
  { id: 'vbnet', name: 'VB.NET' },
  { id: 'zig', name: 'Zig' }
].sort((a, b) => a.name.localeCompare(b.name));

function OperationsList({ spec, apiProvider, apiKey }) {
  const [loading, setLoading] = useState({});
  const [snippets, setSnippets] = useState({});
  const [error, setError] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState({});
  const [generationTimes, setGenerationTimes] = useState({});

  const handleCopySnippet = (snippet) => {
    navigator.clipboard.writeText(snippet);
  };

  const handleGenerateSnippet = async (operation, language) => {
    const operationKey = `${operation.method}-${operation.path}-${language}`;
    
    if (!language) {
      setError(prev => ({ ...prev, [operationKey]: 'Please select a language' }));
      return;
    }

    if (!apiKey) {
      setError(prev => ({ ...prev, [operationKey]: 'Please enter an API key' }));
      return;
    }

    setLoading(prev => ({ ...prev, [operationKey]: true }));
    setError(prev => ({ ...prev, [operationKey]: null }));

    const startTime = Date.now();

    try {
      const snippet = await generateCodeSnippet(operation, language, spec, apiProvider, apiKey);
      setSnippets(prev => ({ ...prev, [operationKey]: snippet }));
      setGenerationTimes(prev => ({ ...prev, [operationKey]: Date.now() - startTime }));
    } catch (err) {
      console.error('Generation error:', err);
      setError(prev => ({ ...prev, [operationKey]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [operationKey]: false }));
    }
  };

  const operations = [];
  Object.keys(spec.paths || {}).forEach(path => {
    Object.keys(spec.paths[path]).forEach(method => {
      if (method !== 'parameters') {
        operations.push({
          method: method.toUpperCase(),
          path,
          ...spec.paths[path][method]
        });
      }
    });
  });

  return (
    <div className="operations-list">
      {operations.map((operation) => {
        const operationKey = `${operation.method}-${operation.path}`;
        const currentLanguage = selectedLanguages[operationKey];
        const snippetKey = `${operationKey}-${currentLanguage}`;
        const isLoading = loading[snippetKey];
        const currentError = error[snippetKey];
        const currentSnippet = snippets[snippetKey];
        const generationTime = generationTimes[snippetKey];

        return (
          <div key={operationKey} className="operation-pill">
            <div className="operation-header">
              <span className={`method ${operation.method.toLowerCase()}`}>
                {operation.method}
              </span>
              <span className="path">{operation.path}</span>
              <div className="operation-actions">
                <select
                  className="language-select"
                  value={currentLanguage || ''}
                  onChange={(e) => setSelectedLanguages(prev => ({
                    ...prev,
                    [operationKey]: e.target.value
                  }))}
                >
                  <option value="">Select Language</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <button
                  className="generate-button"
                  onClick={() => handleGenerateSnippet(operation, currentLanguage)}
                  disabled={isLoading || !currentLanguage}
                >
                  {isLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
            {currentError && (
              <div className="error-message">{currentError}</div>
            )}
            {currentSnippet && (
              <div className="snippet-container">
                <div className="snippet-header">
                  <span className="generation-time">
                    Generated in {(generationTime / 1000).toFixed(2)}s
                  </span>
                  <button
                    className="copy-button"
                    onClick={() => handleCopySnippet(currentSnippet)}
                  >
                    Copy
                  </button>
                </div>
                <SyntaxHighlighter
                  language={currentLanguage}
                  style={vscDarkPlus}
                >
                  {currentSnippet}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default OperationsList; 