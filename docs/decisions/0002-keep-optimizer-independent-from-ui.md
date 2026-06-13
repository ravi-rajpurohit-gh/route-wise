# ADR 0002: Keep the Optimizer Independent from the UI

- Status: Accepted
- Date: 2026-06-13

## Context

The first deliverable is an interactive web demonstration, but the core value
is the route optimization behavior. Coupling the algorithm to React would make
benchmarking, testing, and future service extraction harder.

## Decision

Keep domain types, store data, and route optimization in modules that do not
depend on React or browser APIs. React consumes route results and manages only
presentation and interaction state.

## Consequences

- Optimizer tests run without rendering the UI.
- Benchmark tooling can call the optimizer directly.
- A future API service can reuse or port the optimizer with a smaller boundary.
- The UI must translate route results into presentation-specific structures.

## Alternatives considered

- **Implement route logic inside React components:** Faster initially but
  creates poor testability and ownership boundaries.
- **Create a backend immediately:** Adds deployment and contract complexity
  before the optimization claim is validated.
