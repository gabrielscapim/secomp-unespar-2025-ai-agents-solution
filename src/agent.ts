import OpenAI from 'openai'
import { AgentTool } from './tool'
import { ResponseInput } from 'openai/resources/responses/responses.js'

export type AgentOptions = {
  openai: OpenAI
  model: string
  instructions: string
  tools?: AgentTool[]
}

export class Agent {
  private openai: OpenAI
  private model: string
  private instructions: string
  private tools: AgentTool[]

  constructor (options: AgentOptions) {
    this.openai = options.openai
    this.model = options.model
    this.instructions = options.instructions
    this.tools = options.tools ?? []
  }

  private async runCompletion (input: ResponseInput): Promise<ResponseInput> {
    const response = await this.openai.responses.create({
      model: this.model,
      instructions: this.instructions,
      input,
      tools: this.tools.map(tool => tool.toJSON())
    })

    return response.output
  }

  async run (input: string): Promise<ResponseInput> {
    const response = await this.runCompletion([{
      role: 'user',
      content: input
    }])

    const hasFunctionCall = response.some(item => item.type === 'function_call')

    if (!hasFunctionCall) {
      return response
    }

    const nonReasoningResponses = response.filter(item => item.type !== 'reasoning')

    for (const message of nonReasoningResponses) {
      if (message.type === 'function_call') {
        const tool = this.tools.find(tool => tool.name === message.name)
        const toolResult = await tool?.run(JSON.parse(message.arguments))

        response.push({
          type: 'function_call_output',
          call_id: message.call_id,
          output: toolResult ?? 'Tool not found'
        })
      }

      const newCompletion = await this.runCompletion([
        {
          role: 'user',
          content: input
        },
        ...response
      ])

      return [
        ...response,
        ...newCompletion
      ]
    }

    return response
  }
}
