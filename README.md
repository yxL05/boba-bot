# boba-bot

A Slack bot that handles all boba business within Botpress built using the ADK. It can generate recommendations, display the top-selling drinks, and note down orders (though someone will have to place the order manually on the delivery app of their choice).

## Use Cases

> **Important:** you must **mention** the bot at the beginning of each command.

### List of stores and menus

#### Stores

> Example prompt: `What are the available stores?`

#### Menu

> Example prompt: `What is the menu for [store]?`

- Each menu item has a # that should be used when placing an order

### Recommendations

> Example prompt: `Recommend a drink from [store] based on these criteria: [desc]`

An AI-generated recommendation will be provided based on

- the specified store if among the available list
- the provided description if present

### Top-sellers

> Example prompt: `Show me the top [#] selling drinks from [store].`

The top sellers (of the store if specified) are displayed based on # of past orders.

### Orders

#### Start a vote

> Example prompt: `Start a vote for boba day at [store] with [#] min buyers and a time limit of [time].`

The bot generates a message that people can react to if they are interested in ordering.

- If the message gets `min buyers - 1` reactions (since the person who started the vote is included by default) within `time limit`, the vote succeeds and the bot proceeds to taking orders.

#### Place order

> Example prompt: `Order [qty] no. [drink # from menu] with [desc (e.g., less ice, half sugar, toppings)]`

- The users who opted in have `configuration.orderTime (default = 30 minutes)` to place their orders.
- The bot then provides a confirmation number for that order which can be viewed or cancelled (before the time limit).
  > Example prompt: `Cancel order [#]` or `View order [#]` or `View all my orders`
- After the time limit has passed, the bot mentions the user who originally initiated the order with the order list and anyone who opted in but didn't submit an order.

## Internal Logic

### Stores & menus

- Store names and menu URLs are stored in a table that can only be updated manually.
- Menus are stored in a single table and will be refreshed every Saturday via a background workflow.
- The background workflow first re-indexes the KB, then uses it to update the active status of every drink and add new items.

### Order data

- The order history is cleared when the menus are updated.
- The # of sales are tracked directly within the menu table.

## Limitations

> Lack of unique identifiers for menu items (since they are obtained via web crawling) means that duplicates may be created when updating the menu every week.

> The bot does not support back-and-forth conversations that hold context but rather single commands.
