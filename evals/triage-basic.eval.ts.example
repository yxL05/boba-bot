/**
 * Eval: triage-basic
 *
 * Verifies that the triage bot correctly classifies common request types.
 *
 * Evals use the Eval class from @botpress/runtime. Each eval defines a
 * simulated conversation with assertions on the bot's responses and tool usage.
 *
 * Run evals with: adk eval
 * Run a specific eval: adk eval --name triage-basic
 */
import { Eval } from '@botpress/runtime'

export default new Eval({
  name: 'triage-basic',
  description: 'Verify the bot classifies bug reports, feature requests, and questions correctly',
  tags: ['triage', 'classification'],
  type: 'regression',

  conversation: [
    {
      user: 'The login page is showing a 500 error whenever I try to sign in with Google SSO',
      assert: {
        response: [
          {
            llm_judge:
              'Response acknowledges this is a bug or error report and indicates it will be triaged or routed to the appropriate team',
          },
        ],
      },
    },
    {
      user: 'It would be great if we could export dashboard data to CSV',
      assert: {
        response: [
          {
            llm_judge:
              'Response recognizes this as a feature request and indicates it will be forwarded to the product team or logged appropriately',
          },
        ],
      },
    },
    {
      user: 'How do I reset my password?',
      assert: {
        response: [
          {
            llm_judge:
              'Response treats this as a general question and either answers it directly or indicates it will be routed to support',
          },
        ],
      },
    },
  ],
})
