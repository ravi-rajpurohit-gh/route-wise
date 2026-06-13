# Changelog

All notable changes to RouteWise are documented in this file.

The project follows the principles of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and will use semantic versioning once releases begin.

## [Unreleased]

### Added

- Interactive route-optimization application with a responsive store map.
- Weighted store graph and scaled map-unit-to-feet distance model.
- Dijkstra shortest paths between store locations.
- Nearest-neighbor sequencing with chilled and frozen items deferred.
- Aisle-order comparison baseline and displayed savings.
- Pick-progress interaction.
- Automated tests for route completeness, start/end correctness, cold-item
  sequencing, and baseline improvement.
- Production-oriented project documentation, decision records, and quality
  standards.

### Fixed

- Corrected displayed route metrics by applying an explicit map-to-feet scale.
- Added TypeScript-aware linting after the initial configuration failed to
  parse TypeScript source.

### Security

- Separated runtime and development dependencies. Runtime dependency audit
  reports zero known vulnerabilities as of June 13, 2026.
