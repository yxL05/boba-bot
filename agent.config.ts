import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "boba-bot",
  description:
    "Boba bot that generates recommendations, displays the top-selling drinks, and notes down orders",

  defaultModels: {
    autonomous: "openai:gpt-4.1-mini-2025-04-14", // Model used by execute() in conversations/workflows
    zai: "openai:gpt-4.1-2025-04-14", // Model used by Zai (extract, check, label, etc.)
  },

  // Per-bot persistent state - tracks triage statistics across all conversations.
  bot: {
    state: z.object({
      // totalTriaged: z.number().default(0).describe('Total requests triaged'),
      // lastTriagedAt: z.string().optional().describe('ISO timestamp of last triage'),
    }),
  },

  // Per-user persistent state - remembers routing preferences per user.
  // user: {
  //   state: z.object({
  //     preferredCategory: z
  //       .string()
  //       .optional()
  //       .describe("Category this user most often submits"),
  //     requestCount: z
  //       .number()
  //       .default(0)
  //       .describe("Number of requests from this user"),
  //   }),
  // },

  // Integrations extend your agent with actions, channels, and events.
  // Browse available integrations:  adk search <name>  |  adk list --available
  // Install one:                    adk add <integration>  (e.g. adk add browser)
  // See actions/events/channels:    adk info <integration>
  dependencies: {
    integrations: {
      slack: "slack@5.0.2",
      webchat: "webchat@0.3.0",
    },
  },
});
