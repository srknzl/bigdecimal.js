<!-- Thanks for contributing! A short description of the change and why. -->

## Checklist

- [ ] `npm run compile` then `npm test` pass (tests run against compiled `lib/`)
- [ ] `npm run lint` passes
- [ ] Behavior matches Java's `BigDecimal` (the JDK is the spec) — if the change
      affects arithmetic results, the Java-differential fixtures cover it
      (`npm run generate-test-files`, see `util/README.md`)
- [ ] No runtime dependencies added (the zero-dependency guarantee is non-negotiable)
- [ ] Public API changes have JSDoc (it generates the API reference) and a
      `CHANGELOG.md` entry
