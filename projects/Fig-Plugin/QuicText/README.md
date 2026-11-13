## QuickText license admin

The GitHub Pages admin panel is available at `/admin/`. Its static page contains no
password or Supabase service-role key; authentication and license management
(list, create, and delete) are handled by the `admin-licenses` Supabase Edge Function.

From `projects/Fig-Plugin/QuicText`, link the Supabase project and set function
secrets. Use a unique admin password and a random token secret of at least 32
characters. Do not put these values in the website or commit them:

```sh
supabase link --project-ref kmkjuuytbgpozrigspgw
supabase secrets set ADMIN_PASSWORD="replace-with-a-strong-password" ADMIN_TOKEN_SECRET="replace-with-at-least-32-random-characters" ADMIN_ALLOWED_ORIGINS="https://jdip19.github.io,https://jdip19.github.com"
supabase functions deploy admin-licenses --no-verify-jwt
```

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge
Functions at runtime; keep the service-role key out of the repository.

The function validates a signed, eight-hour admin session before listing,
creating, or deleting QuickText license rows in the existing `licenses` table.
The admin table displays all matching rows and confirms before permanently
deleting a license.
The table must permit the admin-issued row fields (`serial_key`, `email`,
`plugin`, `plan`, `license_type`, `unlimited`, `source`, and `device_id`).
Only expose the static panel over HTTPS. GitHub Pages cannot hide static files
behind server-side authentication; the protected function is what prevents
unauthorized license creation.

## i2Snatcher approvals and usage counters

i2Snatcher stores its data in a separate Supabase project (`jfxwmldeikfmiwhjnsgg`).
Its migration and public API function are deployed from `projects/i2Snatcher`.
The existing QuicText admin panel still controls approvals through the protected
`admin-licenses` function. Configure these secrets on the QuicText project:

```text
I2SNATCHER_SUPABASE_URL=https://jfxwmldeikfmiwhjnsgg.supabase.co
I2SNATCHER_SERVICE_ROLE_KEY=<service-role key from the i2Snatcher project>
```

Open `/admin/` to approve or revoke approval for i2Snatcher clients. The
`approved` column is `0` by default and becomes `1` when approved. Existing Firebase
approvals and historical counters are not imported automatically; approve
existing clients again and import prior totals separately if they need to be
preserved.

The extension uses the i2Snatcher project's public publishable key. The
`i2snatcher-api` function uses that project's server-side service-role key;
the QuicText admin function uses the separate `I2SNATCHER_SERVICE_ROLE_KEY`
secret to administer that project's tables. Never put either service-role key
in the extension or the static admin page.

## Run the plugin

Below are the steps to get your plugin running. You can also find instructions at:

  https://www.figma.com/plugin-docs/plugin-quickstart-guide/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

  https://nodejs.org/en/download/

Next, install TypeScript using the command:

  npm install -g typescript

Finally, in the directory of your plugin, get the latest type definitions for the plugin API by running:

  npm install --save-dev @figma/plugin-typings

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (code.ts) into JavaScript (code.js)
for the browser to run.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
    then select "npm: watch". You will have to do this again every time
    you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.
