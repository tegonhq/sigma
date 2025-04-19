# Agent SDK

The Agent SDK provides a framework for building AI agents that can interact with various services and APIs. It implements the ReAct (Reasoning, Acting, Observing) prompting technique to enable LLM-powered agents to solve complex tasks through iterative reasoning and action.

## Architecture

### BaseAgent

The BaseAgent class is the foundation of the agent architecture, providing a CLI interface and core functionality for all agent implementations. It handles common tasks like command registration, logging, and context management.

#### Key Features:

- **CLI interface** with standard commands:
  - `skills`: Lists agent capabilities and available skills
  - `about`: Provides information about what the agent does
  - `terms`: Shows domain-specific terminology the agent understands
  - `ask`: Executes the agent with a user message and streams responses
- Logging system using Pino
- Version tracking from package.json
- Context management for maintaining state between invocations

#### Abstract Methods:

- `ask()`: Main method that processes user input and returns responses
- `skills()`: Returns available skills/capabilities
- `terms()`: Returns domain-specific terminology
- `about()`: Returns agent purpose description

### ReactBaseAgent

The ReactBaseAgent extends BaseAgent to implement the ReAct (Reasoning, Acting, Observing) prompting technique. This approach enables an LLM-powered agent to reason through multi-step tasks by iteratively:

1. Thinking about how to approach a problem
2. Deciding on an action to take
3. Observing the result
4. Repeating until the task is complete

### BaseSkills and APIBaseSkills

The SDK provides base classes for implementing agent capabilities:

- `BaseSkills`: Abstract class for defining agent skills
- `APIBaseSkills`: Extension of BaseSkills specifically for API-based integrations

## Extending ReactBaseAgent

You can create custom integrations by extending the ReactBaseAgent class. Here's a simplified example:

```ts
import { ReactBaseAgent } from '@tegonhq/agent-sdk';
import { GithubSkills } from './github-skills';
import { JARGON } from './jargon';

export class GithubAgent extends ReactBaseAgent {
  skills(): Array<any> {
    const githubSkills = new GithubSkills({});
    const skills = githubSkills.skills();
    return Object.keys(skills).map((key) => ({ ...skills[key], name: key }));
  }

  // Provide domain-specific terminology
  terms(): string {
    return JARGON;
  }

  // Implementation of the runSkill method that executes actions
  async runSkill(
    skillName: string,
    parameters: any,
    integrationConfig: Record<string, string>,
  ): Promise<string> {
    const githuSkills = new GithubSkills(integrationConfig);
    return githuSkills.runSkill(skillName, parameters);
  }
}
```

## BaseSkills

The BaseSkills class provides an abstraction for implementing skill capabilities that agents can use. It separates skill definitions from the agent implementation.

### Key Features:

- Constructor that takes integration configuration
- Abstract methods for defining and executing skills

### Abstract Methods:

- `skills()`: Returns a map of available skills with their definitions
- `runSkill()`: Executes a specific skill with provided parameters

## APIBaseSkills

The APIBaseSkills class extends BaseSkills to provide a foundation for API-based integrations. It handles common API concerns like headers and base URLs.

### Key Features:

- Constructor that initializes headers and base URL
- Abstract methods for API configuration

### Abstract Methods:

- `getBaseURL()`: Determines the base URL for API requests
- `getHeaders()`: Generates headers for API requests using integration configuration
