import { z, defineConfig } from '@botpress/runtime'

export default defineConfig({
    name: 'boba-bot',
    description: 'Boba bot that lists stores and their menu URLs, manages boba day votes, and notes down orders',

    defaultModels: {
        autonomous: 'openai:gpt-4.1-mini-2025-04-14', // Model used by execute() in conversations/workflows
        zai: 'openai:gpt-4.1-2025-04-14', // Model used by Zai (extract, check, label, etc.)
    },

    bot: {
        state: z.object({
            vote: z
                .object({
                    storeId: z.number(),
                    storeName: z.string(),
                    minBuyers: z.number(),
                    timeLimit: z.number(),
                    conversationId: z.string(),
                    messageId: z.string(),
                    reactors: z.array(z.string()),
                    initiatorId: z.string(),
                })
                .nullable(),
            order: z
                .object({
                    sessionId: z.string(),
                    storeId: z.number(),
                    storeName: z.string(),
                    conversationId: z.string(),
                    initiatorId: z.string(),
                    buyers: z.array(z.string()),
                    deadlineMs: z.number(),
                    placedOrderIds: z.array(z.number()),
                })
                .nullable()
                .default(null),
        }),
    },

    configuration: {
        schema: z.object({
            channelId: z.string().describe('ID of the dedicated channel for the bot'),
            confidenceThreshold: z
                .number()
                .min(0)
                .max(1)
                .describe('The threshold confidence for the bot to recognize a request category'),
            orderTime: z
                .number()
                .optional()
                .describe('Time window in milliseconds to place orders after a successful vote (default: 1800000 = 30 min)'),
        }),
    },

    // Integrations extend your agent with actions, channels, and events.
    // Browse available integrations:  adk search <name>  |  adk list --available
    // Install one:                    adk add <integration>  (e.g. adk add browser)
    // See actions/events/channels:    adk info <integration>
  dependencies: {
    integrations: {
      slack: 'slack@5.0.2',
      webchat: 'webchat@0.3.0',
    },
  },
})
