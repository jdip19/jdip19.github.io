## QuickText license admin

The website admin panel is available at `/admin/`. The page contains no admin
password or Supabase service-role key; authentication and license management
are handled by the `admin-licenses` Supabase Edge Function.

From `projects/Fig-Plugin/QuicText`, link the Supabase project and set function
secrets. Use a unique admin password and a random token secret of at least 32
characters. Do not put these values in the website or commit them:

```sh
supabase link --project-ref kmkjuuytbgpozrigspgw
supabase secrets set ADMIN_PASSWORD="replace-with-a-strong-password" ADMIN_TOKEN_SECRET="replace-with-at-least-32-random-characters" ADMIN_ALLOWED_ORIGINS="https://jdip19.github.io,https://jdip19.github.com,https://quiclab.tech,https://www.quiclab.tech"
supabase functions deploy admin-licenses --no-verify-jwt
```

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge
Functions at runtime; keep the service-role key out of the repository.

The function validates a signed, eight-hour admin session before listing,
creating, editing, or deleting QuickText license rows in the existing `licenses` table.
Known production origins are allowed by default; `ADMIN_ALLOWED_ORIGINS` adds
origins and does not replace that default list.
The admin table displays all matching rows and confirms before permanently
deleting a license.
The table must permit the admin-issued row fields (`serial_key`, `email`,
`plugin`, `plan`, `license_type`, `unlimited`, `source`, and `device_id`).
Only expose the static panel over HTTPS. GitHub Pages cannot hide static files
behind server-side authentication; the protected function is what prevents
unauthorized license creation.

### Adding tools and managing rights

The `/admin` dashboard renders its Supabase resources from the server-side
`RESOURCE_REGISTRY` in
[`supabase/functions/admin-licenses/index.ts`](./supabase/functions/admin-licenses/index.ts).
Each resource entry explicitly defines its tool, Supabase project, table,
primary key, visible fields, and view/create/edit/delete permissions. The Edge
Function enforces this allowlist; the browser cannot select arbitrary tables
or columns. The current registry covers QuickText licenses plus i2Snatcher
users, aggregate counters, and read-only usage events.
The dashboard sidebar has an Overview with tool-level record counts and
available usage counters, plus separate QuickText and i2Snatcher submenus.
QuickText key generation has its own submenu. The registry reports the
connected project URLs: `https://kmkjuuytbgpozrigspgw.supabase.co` for
QuickText and `https://jfxwmldeikfmiwhjnsgg.supabase.co` for i2Snatcher.

To add a tool or resource:

1. Add a resource entry to `RESOURCE_REGISTRY`, selecting only the fields
   needed by the dashboard and setting its action permissions.
2. Set `project` to `quicktext` or `i2snatcher`. For another Supabase project,
   add an explicit project identifier and server-side URL/service-role-secret
   mapping in the Edge Function; never send service-role keys to the browser.
3. Configure each field's `type`, `editable`, `create`, and `required`
   properties. Add validation to `validateResourceValue` for any new field or
   special constraints. Keep audit logs and integrity-sensitive records
   read-only unless a safe, specific operation is designed.
4. Deploy the updated `admin-licenses` Edge Function. Viewable registry
   resources and their allowed actions appear in the dashboard automatically.
5. Test each enabled action against the intended project before using it with
   production data.

QuickText keys are generated with the dedicated license form and cannot be
edited; the form is shown above the QuickText license table. Customer details
can be edited and keys can be revoked. The i2Snatcher resource pages show a
setup warning when the secondary project's URL or service-role key is missing,
and display the backend error instead of presenting a failed request as an
empty table. i2Snatcher
users can be created, edited, and deleted; deletion can fail while usage events
reference a user. Usage counters can be corrected, but doing so does not alter
event history. Event history is view-only.

If i2Snatcher records are missing, confirm the `I2SNATCHER_SUPABASE_URL` and
`I2SNATCHER_SERVICE_ROLE_KEY` secrets on the QuickText Supabase project, apply
the i2Snatcher migrations to the i2Snatcher project, and redeploy
`admin-licenses`. The user table requires the display-name and numeric-approval
migrations. A failed resource request now shows the upstream database HTTP
status and PostgREST error code/message in the dashboard. Use that detail to
identify invalid credentials, missing tables/columns, or database connectivity
problems; never share or commit service-role key values.

### Admin dashboard history

- **2026-11-15:** Moved QuickText key generation into the license-management
  page, added i2Snatcher server-credential readiness indicators, and exposed
  resource-load errors in place of misleading empty tables.
- **2026-11-15:** Added a sidebar menu with a combined Overview, tool-specific
  QuickText/i2Snatcher submenus, and per-tool Supabase project URLs and stats.
- **2026-11-15:** Reorganized `/admin` into a multi-tool dashboard driven by a
  server-side resource registry. Added searchable resource tables, allowlisted
  create/edit/delete actions, per-resource action rights, and inline editing.
  Added i2Snatcher usage-event visibility while keeping event history read-only.
- **2026-11-15:** Added `www.quiclab.tech` to the admin function's default CORS
  allowlist; configured origins extend rather than replace the defaults.
- **2026-11-14:** Added i2Snatcher approval and usage-counter administration.
- **2026-10-14:** Added the password-protected QuickText license generator.

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

The plugin TypeScript build intentionally excludes `src/supabase.ts` and
`supabase/functions/**`. Those files run in the Deno/Supabase Edge Functions
runtime (`Deno` globals and `jsr:` imports), not in the Figma plugin's browser
runtime. Deploy Edge Functions with the Supabase CLI; do not add Deno types or
JSR packages to the plugin TypeScript configuration to silence these errors.

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
