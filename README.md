# boba-bot

A Slack bot that handles all boba business within Botpress built using the ADK. It can generate recommendations, display the top-selling drinks, and note down orders (though someone will have to place the order manually on the delivery app of their choice).

## Use Cases

> **Important:** you must **mention** the bot at the beginning of each command.

### Recommendations

1. A user types `recommendations [--store (store in available list)] [--pref (preference description)]` in the dedicated Slack channel.
2. An AI-generated recommendation will be provided based on
   - the store specified in `--store` if present and among the available list
   - the preference described in `--pref` if present
3. The user then has the option to add the recommended drink to the ongoing order if it is from the same store.

> If you are not happy with a recommendation, simply enter the text again while specifying in `--pref` that you do not want that particular drink.

### Top-sellers

1. A user types `top [--store (store in available list)] [--limit (# of drinks to display, default = 3)]` in the dedicated Slack channel.
2. The top sellers (of the store if specified) are displayed based on past orders.

### Orders

#### Validate interest

1. A user initiates a check to see how many people are interested in ordering via `interested --store (store in available list) --limit (time in any format)`.
2. The bot generates a message declaring the user's intent.
3. If at least `configuration.minBuyers (default = 3)` (including the person who started the order) people show their interested by reacting to the message before the time limit specified in `--limit`, the intent to order passes and the bot sends a confirmation message. Otherwise, the order is cancelled (since it would be better for the orders to be made individually).

#### View menu and place order

1. The bot's confirmation message includes a menu for the selected store with numbered entries.
2. The users who opted in to this order have `configuration.orderTime (default = 30 minutes)` to place their orders via `order (item #) [--specs (plaintext describing ice level, sugar level, extra toppings, etc.)]`.
3. The bot then provides a confirmation number which can be viewed via `view (order #)` and cancelled (before the time limit) via `cancel (order #)`.
4. After the time limit has passed, the bot mentions the user who originally initiated the order with a list that includes all placed orders and anyone who has shown interest but who has yet to place their order.

## Internal Logic

### Stores & menus

- Store names and menu URLs are stored as a Record within the configuration schema.
- Menus are stored in a single table and will be refreshed every Saturday via a background workflow.
- The background workflow first re-indexes the KB, then uses it to update the active status of every drink and add new items.

### Order data

- Order history is kept for one week before a workflow clears the table.
- The # of sales are tracked directly within the menu table.

## Pitfalls

> Lack of unique identifiers for menu items (since they are obtained via web crawling) means that duplicates may be created when updating the menu every week.
