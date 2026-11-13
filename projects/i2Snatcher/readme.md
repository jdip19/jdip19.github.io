Features
Keyboard Shortcuts (Chrome 114+):
ALT + SHIFT + A: Toggle the i2Snatcher side panel open/closed.
SHIFT + ALT + C: Copy SVG Code.
SHIFT + ALT + D: Download SVG Icon.
If a shortcut does not work, open chrome://extensions/shortcuts and assign an
available shortcut. Chrome reserves some shortcut combinations for browser
features, so the assigned shortcut shown there may differ from the default.
Lightweight and efficient for seamless file handling.

Color Mapping:
After copying an SVG, open the extension side panel to see its detected colors.
Choose a replacement with the color picker or enter a hex value in the MAP
column. Mappings automatically recolor matching parts in later copied or
downloaded SVGs and sync with your browser profile. Lock a row to keep it
visible when other icons are copied; the mapping only recolors SVG
elements whose source color matches. Mappings are separate for each icon pack,
and copying another icon from the same pack adds only new colors without
duplicating existing rows, so equal colors in different packs can have
different replacements. Unlock a
row to remove it from the pinned list, or clear saved mappings with the button
in the panel.
The panel's bottom actions clear mappings for the current pack, clear all
detected and pinned rows, or lock/unlock all currently visible rows.

Supabase approval and counters are stored in project `jfxwmldeikfmiwhjnsgg`.
To deploy the database objects and extension API, run from this directory:

```sh
supabase link --project-ref jfxwmldeikfmiwhjnsgg
supabase db push --remote
supabase functions deploy i2snatcher-api --no-verify-jwt
```

The extension uses the project's public publishable key. The existing
QuicText `/admin/` panel manages approvals through its protected function;
configure `I2SNATCHER_SUPABASE_URL` and `I2SNATCHER_SERVICE_ROLE_KEY` on the
QuicText Supabase project, then redeploy `admin-licenses`. Keep the
i2Snatcher service-role key private and never put it in this extension.

Users without approval see a request screen instead of the icon tools. They
submit a display name alongside their extension client ID; requests appear in
the admin panel for approval. After deploying changes, apply the new
`20261113010000_i2snatcher_display_name.sql` and
`20261113020000_i2snatcher_numeric_approval.sql` migrations, then redeploy
`i2snatcher-api` and the QuicText `admin-licenses` function.

Approval is stored as `approved` with `0` meaning not approved (the default)
and `1` meaning approved. The `20261113020000_i2snatcher_numeric_approval.sql`
migration converts the previous text statuses and updates the usage counter
function. The admin panel can set a client to either value.

To add the name column manually, open the SQL Editor for project
`jfxwmldeikfmiwhjnsgg` and run:

```sql
alter table public.i2snatcher_users
  add column if not exists display_name text;
```

The API rejects new access requests without a non-empty name (maximum 80
characters); existing clients without a saved name must submit one before
their request can be registered.


How to Load the Extension
For Chrome/Edge:
Download the Extension Files:

Ensure all files (manifest.json, JavaScript, images, etc.) are in a single folder.
Enable Developer Mode:

Open Chrome/Edge.
Go to chrome://extensions (or edge://extensions for Edge).
Toggle on Developer Mode in the top-right corner.
Load the Extension:

Click Load unpacked.
Select the folder containing the extension files.
Verify Installation:

The extension icon should now appear in the browser toolbar. Click it to open
i2Snatcher in the browser side panel. Chrome 114 or newer is required. If you
already installed the extension, reload it from the extensions page after
updating these files.

Feedback & Discussion
For feedback or discussion, reach out:
<a href="https://www.linkedin.com/in/jaydip-upadhyay-32b231176/">Jaydip Upadhyay</a>