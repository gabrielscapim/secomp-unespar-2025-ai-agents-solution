import { Tool } from 'openai/resources/responses/responses.js'

export type AgentToolOptions = {
  name: string
  description: string
  parameters: Record<string, any>
  run: (args: Record<string, any>) => string | Promise<string>
}

export class AgentTool {
  name: string
  description: string
  parameters: Record<string, any>
  run: (args: Record<string, any>) => string | Promise<string>

  constructor (options: AgentToolOptions) {
    this.name = options.name
    this.description = options.description
    this.parameters = options.parameters
    this.run = options.run
  }

  toJSON (): Tool {
    return {
      type: 'function',
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      strict: true
    }
  }
}
