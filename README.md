# Mobile Procure

Mobile Procure is a mobile-first, multi-portal prototype for a digital trust and escrow ecosystem supporting livestock procurement in Zambia. The application now combines a polished front-end experience with Supabase-backed authentication and role-aware navigation across several user journeys.

## Current state of the application

The project has evolved from a static UI mock-up into a more complete front-end experience with:

- a landing experience and portal selection flow
- role-aware login and sign-up screens
- Supabase authentication integration for sign-in, sign-out, session checks, and profile-based redirects
- portal-specific dashboards and workflows for buyers, suppliers, logistics, government, fintech, veterinary, customs, and administrators
- screens for marketplace browsing, orders, escrow, tracking, wallets, certificates, reports, and administration

This is still a prototype rather than a production procurement platform, but the current codebase already includes working client-side auth behavior and portal routing.

## Main portals and workflows

- Buyer: marketplace, catalog, livestock details, order placement, escrow payment, tracking, wallet, and order history
- Supplier: inventory, livestock onboarding, bids, order management, certificate upload, payments, and profile views
- Logistics: deliveries, tracking, QR verification, completed deliveries, and delivery details
- Government: analytics, audits, compliance, reports, transactions, and profile views
- Fintech: escrow monitoring, transactions, settlements, disputes, and account views
- Veterinary: inspections and certificate management
- Admin: user, dispute, and settings screens
- Customs: shipment and verification screens

## Technology

- Front-end: static HTML, CSS, and JavaScript
- Authentication: Supabase JS client with profile-based role checks
- Styling: responsive CSS with Font Awesome icons and Google Fonts
- Assets: local images and shared UI assets under the assets folder

## Getting started

### Prerequisites

- a modern web browser
- a local web server such as XAMPP, WAMP, or Python's built-in HTTP server

### Run with XAMPP

1. Start Apache from the XAMPP Control Panel.
2. Place the project in C:\xampp\htdocs\mobileprocure.
3. Open http://localhost/mobileprocure/ in your browser.

### Run with a simple local server

From the project root, run:

```powershell
python -m http.server 8000
```

Then open http://localhost:8000/.

### Supabase configuration

The authentication flow uses Supabase. A sample configuration file is included at assets/js/supabase-config.example.js.

Create a local file named assets/js/supabase-config.js with your own Supabase URL and anon key:

```js
export const SUPABASE_URL = 'https://your-project-id.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

## Project structure

```text
mobileprocure/
├── index.html                 # Landing page
├── continue-as.html           # Portal selection flow
├── login.html                 # Portal-aware login screen
├── signup.html                # Account creation screen
├── buyer/                     # Buyer workflows
├── supplier/                  # Supplier workflows
├── logistics/                 # Logistics workflows
├── government/                # Government workflows
├── fintech/                   # Fintech workflows
├── veterinary/                # Veterinary workflows
├── customs/                   # Customs workflows
├── admin/                     # Administration workflows
└── assets/
    ├── css/                   # Shared stylesheets
    ├── data/                  # JSON data fixtures
    ├── images/                # Branding and imagery
    └── js/                    # App logic and Supabase integration
```

## Current limitations

The application is still a prototype and should be treated as such:

- authentication depends on a valid Supabase configuration and matching user profiles
- some workflows are UI-driven and do not yet connect to a full production backend
- escrow, payment, tracking, and verification flows are represented in the interface and should be validated carefully before use with real transactions
- real personal, financial, or operational data should not be entered into this demo environment

## Development notes

When extending the project:

- keep portal navigation consistent and role-focused
- place shared behavior in the JavaScript files under assets/js/
- preserve relative asset paths for pages in nested folders
- treat auth and role checks as part of the core experience rather than as an afterthought

## License

No license has been specified for this repository yet. Add an explicit license file before sharing or reusing the project beyond the current team or organisation.
