import OpenAI from 'openai'
import { Agent } from './agent'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function main () {
  const agent = new Agent({
    openai,
    model: 'gpt-5-mini',
    instructions: 'You are a helpful assistant.'
  })

  const input = 'Hello, how are you?'

  const output = await agent.run(input)

  console.log('Agent output', JSON.stringify(output, null, 2))
}

void main()
