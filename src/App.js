import { useState, useEffect } from 'react';
import jsYaml from 'js-yaml';
import './App.css';
import OperationsList from './components/OperationsList';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

SyntaxHighlighter.registerLanguage('yaml', yaml);

const YAML_URL = 'https://raw.githubusercontent.com/Redocly/museum-openapi-example/refs/heads/main/openapi.yaml';

function App() {
  const [apiSpec, setApiSpec] = useState('');
  const [parsedSpec, setParsedSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('claude');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetch(YAML_URL)
      .then(response => response.text())
      .then(yaml => {
        setApiSpec(yaml);
        try {
          const parsed = jsYaml.load(yaml);
          setParsedSpec(parsed);
        } catch (err) {
          console.error('Failed to parse YAML:', err);
          setError('Failed to parse YAML content');
        }
      })
      .catch(err => {
        console.error('Failed to fetch YAML:', err);
        setError('Failed to fetch YAML content');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSpecChange = (e) => {
    const specContent = e.target.value;
    setApiSpec(specContent);
    
    try {
      const parsed = jsYaml.load(specContent);
      setParsedSpec(parsed);
      setError(null);
    } catch (err) {
      console.error('Failed to parse OpenAPI spec:', err);
      setError('Invalid YAML format');
    }
  };

  if (loading) {
    return <div className="loading">Loading API specification...</div>;
  }

  return (
    <div className="app-wrapper">
      <div className="config-bar">
        <div className="provider-select">
          <label>API Provider:</label>
          <select 
            value={selectedProvider} 
            onChange={(e) => setSelectedProvider(e.target.value)}
          >
            <option value="claude">Anthropic (Claude)</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
        <div className="api-key-input">
          <label>API Key:</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
        </div>
      </div>
      <div className="app-container">
        <div className="editor-section">
          <SyntaxHighlighter 
            language="yaml"
            style={vscDarkPlus}
            customStyle={{
              flex: 1,
              margin: 0,
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            {apiSpec}
          </SyntaxHighlighter>
        </div>
        <div className="operations-section">
          {parsedSpec && <OperationsList spec={parsedSpec} apiProvider={selectedProvider} apiKey={apiKey} />}
        </div>
      </div>
    </div>
  );
}

export default App;
