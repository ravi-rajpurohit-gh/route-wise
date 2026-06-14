# RouteWise

RouteWise is a store fulfillment routing application for constraint-aware in-store
pick-path optimization. It converts a shopping cart and a store's walkable
layout into a sequenced route from entry to checkout, then compares that route
with a transparent aisle-order baseline.

## Why this exists

An aisle label answers "where is this item?" It does not answer "what is the
most efficient order in which to collect my entire cart?" That difference
matters for delivery shoppers, store associates, and time-sensitive customers.

The initial product hypothesis is:

> A constraint-aware route can materially reduce walking distance versus aisle
> sorting without compromising product-handling rules.

## Current vertical slice

- Mobile-first Shop, Search, Cart, and Route experience
- Store-first product availability and store-specific placement resolution
- Cart quantity, remove, save-for-later, restore, and clear actions
- Added-order, aisle-order, and recommended-route choices
- Current-device persistence for store, cart, saved items, and preferred order
- Guided picking with picked and cannot-find actions
- Weighted graph routing with measurable aisle-order comparison

## Live demonstration

[Open RouteWise on Vercel](https://route-wise-mocha.vercel.app/)

The deployed application is the product demonstration. The repository documentation records architecture, decisions, evidence, and remaining production work.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run check
```

## Current capabilities

RouteWise lets a shopper select a store, search its available products, manage a persistent cart, choose a shopping order, and follow a store-specific pick route that updates as items are picked or cannot be found. The current routing strategy remains under active benchmark validation.

## Project documentation

| Document | Purpose |
| --- | --- |
| [Product brief](docs/PRODUCT_BRIEF.md) | Problem, target user, boundaries, and success metrics |
| [Architecture](docs/ARCHITECTURE.md) | System boundaries, domain model, and technical direction |
| [Project tracker](docs/PROJECT_TRACKER.md) | Milestones, current priorities, and delivery status |
| [Engineering notes](docs/ENGINEERING_NOTES.md) | Investigations, implementation rationale, and fixes |
| [Decision records](docs/decisions/README.md) | Durable records for important technical decisions |
| [Contributing guide](CONTRIBUTING.md) | Engineering workflow and quality expectations |
| [Changelog](CHANGELOG.md) | User-visible and operationally meaningful changes |
| [Portfolio case study](docs/CASE_STUDY.md) | Problem, solution, architecture, evidence, limitations, and production path |

## Status

RouteWise is currently in the **claim-validation** phase. The next milestone is
to benchmark generated carts, add 2-opt route improvement, and compare the
heuristic with exact solutions for small carts.
