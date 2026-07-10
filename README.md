# Mobile Procure

Mobile Procure is a mobile-first, multi-portal user-interface prototype for a **digital trust and escrow ecosystem for Zambia's livestock procurement**. It demonstrates how buyers, suppliers, logistics providers, regulators, veterinary officers, fintech partners, and administrators can participate in a traceable livestock-procurement journey.

The project currently focuses on the front-end experience: linked HTML screens, responsive layouts, branded assets, and representative procurement data displayed in the interface. It is not yet a production transaction platform.

## Contents

- [Key capabilities](#key-capabilities)
- [Portals and screens](#portals-and-screens)
- [Prototype flow](#prototype-flow)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Current status and limitations](#current-status-and-limitations)
- [Development guidance](#development-guidance)
- [Roadmap](#roadmap)

## Key capabilities

- Role-based portal entry for buyer, supplier, logistics, government, and fintech users.
- Livestock marketplace, catalogue, listing details, order placement, review, and escrow-payment screens.
- Supplier inventory, livestock onboarding, bid/order management, certificate upload, and payment views.
- Logistics delivery management, shipment tracking, delivery details, completed deliveries, and QR-scan interface.
- Government dashboards for traceability, reporting, audits, compliance, transactions, analytics, and profiles.
- Fintech views for escrow monitoring, transaction history, settlements, and dispute handling.
- Veterinary and administrative screens for inspections/certificates and platform administration.
- Responsive, card-based layouts designed for small screens and desktop browsers.

## Portals and screens

| Area | Purpose | Main screens |
| --- | --- | --- |
| Landing | Introduces the product and its trust, verification, tracking, and certificate concepts. | `index.html`, `continue-as.html` |
| Buyer | Browse livestock and complete the buyer side of a procurement transaction. | Dashboard, marketplace, catalogue, livestock details, place order, review, escrow payment, success, orders, tracking, wallet, profile |
| Supplier | Publish livestock and manage fulfilment. | Dashboard, inventory, add livestock, bids, orders, order details, certificate upload, payments, profile |
| Logistics | Coordinate and verify delivery. | Dashboard, deliveries, delivery details, live tracking, QR scan, completed deliveries, profile |
| Government | Monitor the ecosystem and regulatory compliance. | Dashboard, reports, audits, compliance, transactions, analytics, profile |
| Fintech | Support escrow and settlement operations. | Dashboard, transactions, escrow, settlements, disputes, profile |
| Veterinary | Support inspection and certification workflows. | Dashboard, inspections, certificates |
| Administration | Support platform-level operations. | Dashboard, users, disputes, settings |
| Customs | Support shipment verification. | Dashboard, shipments, verification |

## Prototype flow

The primary demonstration flow is:

1. Open the landing page and select **Get Started**.
2. Choose a role from the portal-selection screen.
3. For a buyer journey, open the buyer dashboard or marketplace, select livestock, then continue through order placement, review, escrow payment, and payment confirmation.
4. Use supplier screens to review inventory, fulfil orders, and upload veterinary documents.
5. Use logistics screens to manage a delivery, inspect tracking information, and access the QR-verification interface.
6. Use the fintech and government portals to view the corresponding escrow, settlement, dispute, reporting, audit, and compliance perspectives.

Because authentication is not implemented, the role links that point to `login.html` are visual placeholders. For a working screen-by-screen demo, open the portal dashboards directly (for example `buyer/dashboard.html`).

## Technology

| Layer | Current implementation |
| --- | --- |
| Markup | Static HTML pages |
| Styling | CSS, including a shared landing-page stylesheet and per-page embedded styles |
| Icons | [Font Awesome 6.6.0](https://cdnjs.com/libraries/font-awesome) via CDN |
| Typography | [Poppins](https://fonts.google.com/specimen/Poppins) via Google Fonts |
| Assets | Local PNG/JPG files under `assets/images/` |
| JavaScript | Placeholder files are present under `assets/js/`; no application logic is currently implemented there |
| Backend/data | Not included; JSON files under `assets/data/` are reserved for future mock or application data |

## Getting started

### Prerequisites

You only need a modern web browser. No dependency installation, build step, database, or environment variables are required for the current prototype.

### Run with XAMPP (recommended for this repository location)

1. Start **Apache** from the XAMPP Control Panel.
2. Confirm this repository is located at `C:\xampp\htdocs\mobileprocure`.
3. Open [http://localhost/mobileprocure/](http://localhost/mobileprocure/) in your browser.

### Run with a local static server

From the project root, use any static-file server you prefer. For example, if Python is installed:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000/](http://localhost:8000/).

Serving the files over HTTP is preferred to opening them directly from disk because it more closely matches browser behaviour and will support future API/data loading.

## Project structure

```text
mobileprocure/
├── index.html                 # Product landing page
├── continue-as.html           # Portal/role selector
├── login.html                 # Authentication placeholder
├── register.html              # Registration placeholder
├── buyer/                     # Buyer procurement journey
├── supplier/                  # Supplier inventory and fulfilment journey
├── logistics/                 # Delivery, tracking, and QR workflows
├── government/                # Regulatory reporting and compliance views
├── fintech/                   # Escrow, settlement, and dispute views
├── veterinary/                # Inspection and certificate views
├── customs/                   # Shipment and verification views
├── admin/                     # Platform administration views
└── assets/
    ├── css/                   # Shared and future modular stylesheets
    ├── data/                  # Reserved JSON data files
    ├── images/                # Logo and product imagery
    └── js/                    # Reserved JavaScript modules
```

## Current status and limitations

This is a **UI prototype**, not a secured procurement system. In particular:

- There is no real authentication, authorization, account registration, or session management.
- The login and registration pages are placeholders, and some navigation links are intentionally illustrative.
- Screens use static content; they do not persist user actions or retrieve live livestock, order, certificate, tracking, or payment data.
- Escrow, payment, QR scanning, logistics tracking, verification, reporting, and dispute actions are represented in the UI only; they are not integrated with external services.
- `assets/data/*.json` and `assets/js/*.js` exist as extension points but are currently empty.
- Fonts and icons are loaded from third-party CDNs, so an internet connection is needed for their full visual presentation unless those resources are vendored locally.

Do not enter real personal, financial, livestock, or operational data into this prototype.

## Development guidance

When extending the prototype, keep the following in mind:

- Use relative asset paths appropriate to the page depth: root pages use `assets/...`; portal pages use `../assets/...`.
- Preserve the role-specific navigation patterns so each portal remains understandable as a separate user journey.
- Move repeated embedded CSS into the modular stylesheets in `assets/css/` as the implementation grows.
- Add real JavaScript behavior to the corresponding files in `assets/js/` rather than duplicating scripts throughout HTML pages.
- Treat all user-facing data as untrusted once a backend is introduced; validate it server-side and enforce role permissions on every protected action.
- Integrate payments, identity, verification, and tracking only through approved providers and never expose credentials in client-side files.

## Roadmap

Suggested next implementation steps:

1. Build registration, login, role-based access control, and secure sessions.
2. Define the backend data model for users, livestock, listings, bids, orders, inspections, certificates, shipments, escrow accounts, settlements, and disputes.
3. Populate the JSON fixtures or connect the screens to an API.
4. Implement form validation, loading/error states, and persistent user actions.
5. Integrate real escrow/payment, notification, certificate-verification, QR, and logistics-tracking services.
6. Add automated tests, accessibility checks, security reviews, and deployment configuration.

## License

No license has been specified for this repository. Add an explicit license file before distributing or reusing the project outside the intended team or organisation.
