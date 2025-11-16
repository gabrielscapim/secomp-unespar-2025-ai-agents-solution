import OpenAI from 'openai'
import { Agent } from './agent'
import { AgentTool } from './tool'
import cepPromise from 'cep-promise'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function main () {
  const searchAddressTool = new AgentTool({
    name: 'search_address',
    description: 'Searches for an address by postal code (CEP).',
    parameters: {
      type: 'object',
      properties: {
        cep: {
          type: 'string',
          description: 'The postal code (CEP) to search for.'
        }
      },
      additionalProperties: false,
      required: ['cep']
    },
    run: async (args) => {
      const cep = await cepPromise(args.cep)

      return `Address found: ${cep.street}, ${cep.neighborhood}, ${cep.city} - ${cep.state}, ${cep.cep}`
    }
  })

  const addressAgent = new Agent({
    openai,
    model: 'gpt-5-mini',
    instructions: 'You are an agent that can provide address information.',
    tools: [searchAddressTool]
  })

  const queryAddressAgentTool = new AgentTool({
    name: 'query_address_agent',
    description: 'Queries the address agent to get address information.',
    parameters: {
      type: 'object',
      properties: {
        cep: {
          type: 'string',
          description: 'The postal code (CEP) to search for.'
        }
      },
      additionalProperties: false,
      required: ['cep']
    },
    run: async (args) => {
      const response = await addressAgent.run(`What is the address for the postal code ${args.cep}?`)

      return JSON.stringify(response[response.length - 1])
    }
  })

  const mainAgent = new Agent({
    openai,
    model: 'gpt-5-mini',
    instructions: 'You are a helpful assistant.',
    tools: [queryAddressAgentTool]
  })

  const input = 'Olá, qual o endereço do cep 87083280?'

  const output = await mainAgent.run(input)

  console.log('Agent output', JSON.stringify(output, null, 2))
}

void main()
