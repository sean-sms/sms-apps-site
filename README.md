# sms-apps.com

The SMS Apps website: the studio home page, each app's page, and the support and privacy
pages App Store Connect links to. Plain files, no build step, no third-party fonts, scripts,
cookies or analytics. Light and dark follow the visitor's system; it works at phone width.

| Path | What |
|---|---|
| `/` | Home: what SMS Apps makes, the app grid, contact |
| `/deskcockpit/` | Desk Cockpit: what it does, how it works, features, early access |
| `/deskcockpit/support/` | FAQ and contact — App Store Connect **Support URL** |
| `/deskcockpit/privacy/` | Desk Cockpit privacy policy — App Store Connect **Privacy Policy URL** |
| `/privacy/` | Studio privacy: the website itself, links to each app's policy |

EarlyWire keeps its own site (earlywire.app, from `Docs/site` in the EarlyWire project) and is
linked from the grid.

## Preview

```bash
python3 -m http.server 8000
```

then open http://localhost:8000. Paths are absolute (`/style.css`), so open the site from its
root, not the files directly.

## Publishing (GitHub Pages, DNS at Bluehost)

One-time setup:

1. Create the GitHub repository (e.g. `sean-sms/sms-apps-site`, public), add it as `origin`
   and push `main`.
2. In the repository: Settings → Pages → Source "Deploy from a branch", branch `main`, folder
   `/ (root)`. The `CNAME` file sets the custom domain to sms-apps.com.
3. At Bluehost, DNS for sms-apps.com:
   - `A` records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `AAAA` records for `@` (optional): 2606:50c0:8000::153, 2606:50c0:8001::153,
     2606:50c0:8002::153, 2606:50c0:8003::153
   - `CNAME` for `www`: `sean-sms.github.io`
   - Remove any other `A` record for `@` (the domain currently points at a parking address).
   - **Leave the `MX` records alone**, so email at Bluehost keeps working.
4. Once DNS has spread (minutes to a few hours), tick **Enforce HTTPS** in Settings → Pages.

After that, every push to `main` publishes.

## Email

support@sms-apps.com is the one address for every app. Create it at Bluehost. Keep
support@earlywire.app as a forwarder to it: older EarlyWire builds, its App Store Connect
record and its Google sign-in screen still name that address.

## Adding an app

Add a card to the grid in `index.html`, a folder `/<app>/` with `index.html`, `support/` and
`privacy/` (copy Desk Cockpit's as a starting point), its icon in `assets/icons/` (square,
full-bleed iOS icons get `class="icon-square"`; Mac icons already have their shape), and the
new URLs in `sitemap.xml`.

## Rules for the copy

Describe only what the app really does today, and check claims against the app before
publishing. Privacy pages must match the code: what's stored, where, and every time the app
goes online.

See `LLC-CHECKLIST.md` for the switch to SMS Apps, LLC.
