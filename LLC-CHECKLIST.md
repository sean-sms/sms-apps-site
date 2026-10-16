# Switching to SMS Apps LLC

Everything is branded **SMS Apps** today. "SMS Apps" is a trade name until the LLC exists;
legally the apps are still Sean's. Once the LLC is formed, work through this list in one
sitting. Each app also has its own list in its repository.

## Company basics (Sean)

- [x] Check "SMS Apps" is available in the state's business registry; a USPTO search too.
- [x] Form the LLC (approved Oct 15, 2026; Sean is his own registered agent); get an EIN (IRS, free, online) and a business bank account: still to do.
- [ ] Registered agent or business address, so the home address stays private.
- [ ] Request a D-U-N-S number (free; about one to two weeks).

## Apple

- [ ] Ask Apple Developer Support to convert the individual account to an organization
      (needs the LLC, the D-U-N-S number, and a website on the company's domain: sms-apps.com).
      Apps, bundle IDs, the team ID (8NF5KDHNAQ) and App Groups carry over.
- [ ] App Store Connect → each app → App Information → Copyright: "2026 SMS Apps LLC".
- [ ] EU trader details (Digital Services Act), if any app is sold or earns money in the EU:
      the LLC's address, phone and email.
- [ ] Agreements, Tax and Banking: the LLC's bank account and tax details.

## Website (this repository)

- [x] Footers: `© 2026 SMS Apps` → `© 2026 SMS Apps LLC` (every page).
- [ ] Privacy pages: "Desk Cockpit, by SMS Apps" can stay; add the LLC's legal name and
      business address under Contact if required where you sell.
- [x] `index.html` JSON-LD: `"legalName": "SMS Apps LLC"` on the Organization.

## Apps

- [ ] **Desk Cockpit** (`~/Developer/FocusDash`): the `COMPANY_LEGAL_NAME` build setting →
      `SMS Apps LLC`; see its `LLC-CHECKLIST.md`.
- [ ] **EarlyWire** (`~/Developer/DailyBriefs`): `Docs/site` footers and the terms page,
      which should name the LLC as the party ("SMS Apps LLC is not liable…").
- [ ] Other apps as they're published: visible author or copyright text → SMS Apps.

Bundle IDs of published apps (`com.seanmscott.DailyBriefs`, `SMS.*`) can't change and don't
need to; nobody sees them.
