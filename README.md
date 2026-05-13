# boba-bot

A Slack bot that handles all boba business within Botpress, built using the ADK. It lists stores and their menus, manages boba day votes, and notes down orders (someone will still have to place the order manually on the delivery app of their choice).

## Use Cases

> **Important:** you must **mention** the bot at the beginning of each command.

### List of stores

> Example prompt: `What are the available stores?`

### Menu

> Example prompt: `What is the menu for [store]?`

The bot replies with the store's menu URL.

### Orders

#### Start a vote

> Example prompt: `Start a vote for boba day at [store] with [#] min buyers and a time limit of [time].`

The bot generates a message that people can react to if they are interested in ordering.

- If the message gets `min buyers - 1` reactions (since the person who started the vote is included by default) within `time limit`, the vote succeeds and the bot proceeds to taking orders.

#### Place order

> Example prompt: `Order [qty] [drink name] with [desc (e.g., less ice, half sugar, toppings)]`

- The users who opted in have `configuration.orderTime (default = 30 minutes)` to place their orders.
- The bot provides a confirmation number for each order, which can be viewed or cancelled before the time limit.
  > Example prompt: `Cancel order [#]` or `View order [#]` or `View all my orders`
- After the time limit has passed, the bot mentions the user who originally initiated the order with the full order list and anyone who opted in but didn't submit an order.

## Internal Logic

### Stores & menus

- Store names and menu URLs are stored in a table that can only be updated manually.
- When asked for a menu, the bot looks up the store and replies with its menu URL.

### Order data

- Orders are stored in a table and tracked for the duration of the ordering session.
- Each order stores the drink name as a free-form string extracted from the user's message.

## Limitations

> The bot does not support back-and-forth conversations that hold context but rather single commands.
