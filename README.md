# OpenAPI AI Code Snippets Generator

This is application renders the operations of an OpenAPI file and lets you generate sample code snippets using OpenAI or Claude.

<img width="1840" alt="image" src="https://github.com/user-attachments/assets/6f75f9cf-7c82-418f-9d76-900868a0798c" />

## Prerequisites

- Node.js 16+ installed
- An API key for either:
  - Anthropic's Claude API
  - OpenAI's API

## Installation

1. Clone the repository.
2. Navigate to the project directory:
   ```sh
   cd openapi-llm-snippets
   ```

3. Install the dependencies:
   ```sh
   npm install
   ```
4. Start the development server:
   ```sh
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000` to view the application.
6. Add your API key in the input field and select the language you want to generate the code for.
7. Click on the "Generate" button to generate the code snippet.

## Project structure

The project is organized into several key directories and files:

- `src/`: Contains the main source code for the application.
  - `components/`: React components used throughout the application.
    - `OperationsList.js`: Component for displaying and managing API operations.
  - `services/`: Contains service files for interacting with external APIs.
    - `openaiService.js`: Handles requests to the OpenAI API.
    - `claudeService.js`: Handles requests to the Anthropic Claude API.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.








