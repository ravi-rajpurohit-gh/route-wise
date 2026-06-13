# Contributing to RouteWise

RouteWise is maintained as a production-minded engineering case study. Changes
should improve product credibility, measurable performance, correctness, or
maintainability.

## Engineering principles

- Prefer measurable claims over visual-only demonstrations.
- Keep the optimization domain independent from the presentation layer.
- State assumptions and limitations explicitly.
- Use deterministic fixtures for repeatable tests and benchmarks.
- Keep changes focused; avoid unrelated refactors.
- Record important architectural decisions as ADRs.
- Record investigations and fixes in `docs/ENGINEERING_NOTES.md`.
- Update `CHANGELOG.md` for meaningful behavior or capability changes.

## Development workflow

1. Read `docs/PRODUCT_BRIEF.md` and `docs/PROJECT_TRACKER.md`.
2. Define expected behavior and acceptance criteria.
3. Add or update tests before considering the change complete.
4. Implement the smallest coherent change.
5. Run the complete quality gate:

   ```bash
   npm run check
   ```

6. Update relevant documentation.

## Definition of done

A change is complete when:

- Acceptance criteria are satisfied.
- Tests cover new or changed domain behavior.
- Lint, tests, and production build pass.
- User-facing metrics remain defensible.
- Relevant documentation and decision records are current.
- Known limitations and follow-up work are recorded.

## Commit guidance

Use focused commits with imperative messages, for example:

```text
Add generated-cart benchmark harness
Document store graph versioning decision
Fix cold-item sequencing after reroute
```

Do not commit generated build output, local environment files, or secrets.
