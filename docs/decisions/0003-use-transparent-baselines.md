# ADR 0003: Use Transparent Baselines and Measurable Claims

- Status: Accepted
- Date: 2026-06-13

## Context

A polished route visualization is not evidence that an algorithm improves
fulfillment efficiency. The project needs reproducible comparisons and must
avoid overstating simulated results.

## Decision

Every optimization result must be comparable with at least one documented,
transparent baseline. The first baseline is aisle-label sorting. Future
benchmarks will include nearest neighbor, nearest neighbor plus 2-opt, and
exact solutions for small carts.

Distance reduction is the primary simulated metric. Pick-time improvement will
remain an estimate until validated through observed sessions.

## Consequences

- Algorithmic improvement can be quantified and reproduced.
- Weak or unfavorable results remain visible.
- Portfolio claims are more credible.
- Benchmark fixtures and methodology become maintained product artifacts.

## Alternatives considered

- **Present only the optimized route:** Visually compelling but analytically
  weak.
- **Claim time savings from distance alone:** Easy to communicate but not
  sufficiently validated.
