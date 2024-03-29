# Jupiter Notify
![Version](https://img.shields.io/badge/version-2.1.0-brightgreen.svg)

This repository is a website where users can log in using their Discord accounts, to buy and manage their Jupiter Notify memberships. The repository also includes an admin panel from where users with admin permissions, can view the server's members as well as view and edit their individual information. The admin panel also contains a release feature to release a specific amount of memberships, and a console from where admins can view the website's logs.

## How to set up
### Database
We use PostgreSQL as our Database management system.

<br>

##### Table: users -> Stores user's information on log in.
Column name | Type | PK | FK | Unique | Used for
--- | --- | --- | --- | --- | --- |
user_id | text | ✅ | ❌ | ❌ | Discord user id. Used as primary key as it's unique for every Discord user.
cookie_id | text | ❌ | ❌ | ✅ | Unique cookie id used as id for cookie session.
stripe_id | text | ❌ | ❌ | ✅ | Unique stripe id used to link to stripe customer (Stripe customer is created on sign up).
username | text | ❌ | ❌ | ❌ | Discord user's username.
email | text | ❌ | ❌ | ❌ | Discord user's email address.
avatar_url | text | ❌ | ❌ | ❌ | Discord user's avatar url.
created | text | ❌ | ❌ | ❌ | Epoch number that represents user's sign up date.

<br>

##### Table: roles -> Stores role's basic information.
Column name | Type | PK | FK | Unique | Used for
--- | --- | --- | --- | --- | --- |
role_id | text | ✅  | ❌ | ❌ | Role identifier.
name | text | ❌ | ❌ | ✅  | Role name.
color | text | ❌ | ❌ | ❌ | Hex color to represent role.
discord_id | text | ❌ | ❌ | ❌ | Discord role id to link database role to Discord role.

<br>

##### Table: role_permissions -> Stores role's permissions.
Column name | Type | PK | FK | Unique | Used for
--- | --- | --- | --- | --- | --- |
role_id | text | ✅  | ✅  (From table: roles) |❌ | Role identifier.
admin_panel | boolean | ❌ | ❌ | ❌ | Permission to access admin panel.
importance | integer | ❌ | ❌ | ❌ | Role's importance to create priority. '1' is the most important role.
view_members | boolean | ❌ | ❌ | ❌ | Permission to view member's individual information.
modify_members | boolean | ❌ | ❌ | ❌ | Permission to edit member's individual information.
create_releases | boolean | ❌ | ❌ | ❌ | Permission to view, edit and create license releases.
view_console | boolean | ❌ | ❌ | ❌ | Permission to view website's logs.
edit_config | boolean | ❌ | ❌ | ❌ | Permission to edit website's settings.

<br>

##### Table: user_roles -> Stores users who have a role bound to their user id.
Column name | Type | PK | FK | Unique | Used for
--- | --- | --- | --- | --- | --- |
user_id | text | ✅  | ✅  (From table: users) |❌ | User identifier.
role_id | text | ❌ | ✅ (From table: roles) | ❌ | Role id identify role.

<br>

##### Table: settings -> Stores website's configuration settings.
Column name | Type | PK | FK | Unique | Used for
--- | --- | --- | --- | --- | --- |
name | text | ✅ | ❌ | ❌ | Setting name.
value | text | ❌ | ❌ | ❌ | Setting value.

<br>

##### Table: access_tokens -> Stores user's access tokens (1 user can only have 1 access token).
Column name | Type | PK | FK | Unique | Used for
--- | --- | --- | --- | --- | --- |
user_id | text | ✅ | ✅ (From table: users) | ❌ | User identifier.
access_token | text | ❌ | ❌ | ✅ | Access token to be used in external software.
iv | text | ❌ | ❌ | ✅ | IV to encrypt and decrypt software token.
created | text | ❌ | ❌ | ❌ | Epoch number that represents token's creation date.

<br>

##### Table: software_ids -> Stores external software types.
Column name | Type | PK | FK | Unique | Used for
--- | --- | --- | --- | --- | --- |
software_id | text | ✅ | ❌ | ❌ | Software identifier.
name | text | ❌ | ❌ | ✅ | Name of given software.
one_time_use | boolean | ❌ | ❌ | ❌ | Check if API is only used as authorization for given software.

<br>

##### Table: software_instances -> Stores instance ids. Each access token can be bound to each software once.
Column name | Type | PK | FK | Unique | Used for
--- | --- | --- | --- | --- | --- |
access_token | text | ✅ | ✅ (From table: access_tokens) | ❌ | Access token identifier.
software_id | text | ✅ | ✅ (From table: software_ids) | ❌ | Software type identifier.
instance_id | text | ❌ | ❌ | ✅ | Instance identifier. Lets API know if user is using API from same software instance.

<br>

### Settings
Settings are stored in the `.env` file and in the database.

<br>

##### `.env` file.
Setting name | Example | Explanation
--- | --- | ---
DATABASE_URL | postgresql://postgres:postgres@localhost:5432/postgres | Database url where the server connects to.
LOGGER_NAME | logs.log | File name to store website's logs. Will be saved in project's root folder.
LOGGER_MAX_SIZE | 100 | Log file's maximum allowed size in kilobytes. File will be resetted when exceeding said amount.
LOGGER_NEW_LINES | 50 | Amount of lines to keep from old log file before resetting it.

<br>

##### Database table: settings
Setting name | Example | Explanation
--- | --- | ---
ACCESS_TOKEN_TIMEOUT | 100 | Timeout before allowing a user to generate a new access token (in seconds).
COOKIE_KEY | nhv#;P>;)GQ;!4HQ | Key used as global password to cookie sessions. Key is split to an array of many passwords by character ';'.
DISCORD_BOT_TOKEN | | Discord bot's token.
DISCORD_CLIENT_ID | | Discord bot's client id.
DISCORD_CLIENT_SECRET | | Discord bot's client secret.
DISCORD_GUILDS | | Discord servers separated by character ';'. First server id is the main server.
DISCORD_LOGGER_CHANNEL | | Discord channel id where to output logger information.
DISCORD_SUPPORT_CHANNEL | | Discord channel id where to output support tickets from website contact form.
ENCRYPTION_IV_LENGTH | 16 | Length of IV string in encryption.
ENCRYPTION_KEY | dawda0w9e2 | Password/Key used for encryption.
ENCRYPTION_KEY_LENGTH | 32 | Length of encryption key.
IN_STOCK | true | Boolean string value to toggle between allowing users to pay for membership or not. Value will only be true if value.toLowerCase() === 'true'.
LOGGER_MAX_SIZE | 100 | Log file's maximum allowed size in kilobytes. File will be resetted when exceeding said amount.
LOGGER_NEW_LINES | 50 | Amount of lines to keep from old log file before resetting it.
STRIPE_KEY | | Stripe's API key.
STRIPE_PLAN | | Stripe's default membership plan.
STRIPE_PLAN_EUR | | Stripe's EUR plan.
STRIPE_PLAN_GBP | | Stripe's GBP plan.
STRIPE_PLAN_USD | | Stripe's USD plan.
STRIPE_SECRET | | Stripe's API secret.
STRIPE_WEBHOOK | | Stripe's API webhook id.

<br>

### SSL
SSL is only required when hosting server locally. To install the required certificates, follow the steps bellow.

##### Windows:
1. Install mkcert with Chocolatey for example:
   `choco install mkcert`
2. Install locally-trusted certificates:
   `mkcert -install`
3. Create key and certificate files for localhost website:
   `mkcert localhost`
4. Move both `localhost-key.pem` and `localhost.pem` to `ssl` folder in project's directory.

Please find the steps for other operating systems [here](https://github.com/FiloSottile/mkcert).

<br>

### How does the Access Token system work?
Access tokens are used as keys to be used in our external software, to authenticate the user. Server members are allowed to create only one access token. Access tokens can be used only once per external software. Each software has a unique id so that the API can identify from which software the request is getting sent from.

##### How do softwares communicate with the API?
On a member initializing a software instance, this software will ask the user to input their access token. Then the software will make a POST request to `https://jupiternotify.com/api/authorize`, with a JSON in the request's body. This JSON will have keys `softwareId` and `accessToken`, and their corresponding values. If successful, this request will return the status `200` as well as the user's accessToken and the software's token (named as `softwareToken`).

On all later API requests, software will send the `accessToken` and `softwareToken` in the request's body, so that the API can verify the user.

##### How to set up
For each software type, a new row will be needed in the database table `software_ids`. In here, `software_id` will have to be created manually from a uuidv4 generator like [this one](https://www.uuidgenerator.net/version4). The software name will have to be unique from all other rows. `one_time_use` will only be set as true if the software type only requires an initial authorization for a user and doesn't need to interact with the API after authorizing said user.

##### How can users create their access tokens
They will simply need to send a direct message to our Jupiter Bot, with the text `!generate`. To know all the commands that this bot offers, simply type `!help`.
