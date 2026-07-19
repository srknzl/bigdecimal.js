# Provenance and licensing

## What this software is derived from

`bigdecimal.js` is a port of `java.math.BigDecimal` from
[OpenJDK](https://github.com/openjdk/jdk). This is not an independent
reimplementation against a published specification — it is a translation of the
OpenJDK implementation. The derivation is visible throughout `src/bigdecimal.ts`:

- the dual compact (`number`) / inflated (`bigint`) significand representation,
  including the `INFLATED` sentinel, is OpenJDK's design;
- internal helpers (`divideAndRound*`, the numbered `add*` / `divide*` overload
  families, `TEN_POWERS_TABLE`, `compactValFor`) correspond directly to their
  OpenJDK counterparts;
- local variable naming (`xs`, `ys`, `rs`, `scl`, `prec`) is retained from the
  OpenJDK source deliberately, so the port stays diffable against upstream;
- much of the API documentation is adapted from the OpenJDK javadoc.

The test material under `test/jdk/` is taken from the OpenJDK repository; see
[`test/jdk/NOTICE.md`](test/jdk/NOTICE.md).

## Licensing

OpenJDK is distributed under the **GNU General Public License, version 2 only,
with the Classpath Exception** (GPLv2+CE). A translation of GPLv2+CE source is a
derivative work of it. The Classpath Exception permits *linking* without the GPL
propagating to the linking program; it does not grant permission to relicense the
OpenJDK source itself under different terms.

This project therefore carries the same terms as its upstream:

```
SPDX-License-Identifier: GPL-2.0-only WITH Classpath-exception-2.0
```

### What this means if you depend on this library

The Classpath Exception is what makes this practically usable. You may depend on
`bigdecimal.js` from a program under **any** license, including a proprietary,
closed-source one, without that program becoming subject to the GPL. The GPL's
obligations attach to this library's own source and to modifications of it — not
to independent modules that merely link against it.

If you modify `bigdecimal.js` itself and distribute the result, those
modifications are covered by the GPL.

### Source header

`src/bigdecimal.ts` preserves the upstream OpenJDK header verbatim — Oracle's
1996–2026 copyright, the instruction not to remove the header, Oracle's express
"Classpath" designation for that file, and IBM's 2001 portions copyright — followed
by this project's own dated translation and modification notice. Only the comment
delimiters carry esbuild's legal-comment marker, so that the notices survive
minification into the UMD bundle; the notice text itself is unmodified.

### Licensing history

Releases up to and including **1.7.0** were published under Apache-2.0. The change
to GPLv2+CE applies to **1.7.1 and later**, correcting the licensing to match the
upstream work this software is derived from.

An earlier revision of this file stated flatly that recipients of those versions
"retain Apache-2.0" for them. That is too strong to assert here, and is listed as
an open item below. The project's own copyright holders cannot retract a grant they
made over what they own, but that is a narrower statement than the whole derivative
being validly Apache-2.0 in the first place — if the Apache-2.0 label was not a
grant this project was in a position to make over OpenJDK-derived material, then
upstream GPL rights in that material are not neutralised by it. Only counsel can
settle what past recipients actually hold.

## Open items

These are recorded rather than resolved, and should be confirmed with counsel.

> **Item 1 is a release gate for 1.7.1, not a follow-up.** The first GPLv2+CE release
> should not ship before it is settled. If consent proves unavailable, the choice
> between a contributor-independent replacement of the affected code and a
> copyrightability/de-minimis analysis is one for counsel — the latter should not be
> assumed informally, however small the contributions look.

1. **Third-party contributions to `src/bigdecimal.ts`.** Two contributors other
   than the project owner have authored code in the ported file, while the project
   was labelled Apache-2.0:

   | Contributor | PR | Change |
   | --- | --- | --- |
   | `guerin olivier` | [#99](https://github.com/srknzl/bigdecimal.js/pull/99) | +106 lines — `compareTo` aliases |
   | `guerin olivier` | [#72](https://github.com/srknzl/bigdecimal.js/pull/72) | +11 / −9 — unsafe-number conversion |
   | `zdu-strong` | [#163](https://github.com/srknzl/bigdecimal.js/pull/163) | +34 lines — `toJSON` |

   These are original, public-API contributions rather than de minimis edits, so
   they are not simply disregardable.

   **Correction.** An earlier revision of this file stated that `CONTRIBUTING.md`
   supplied these contributors' Apache-2.0 grant. That is wrong and the reasoning
   built on it does not hold: `CONTRIBUTING.md` was added on **2026-07-13**, after
   all three pull requests (2022-05-30, 2022-10-05 and 2026-07-07). The actual
   inbound basis is Apache-2.0 §5 together with the Apache project and license
   headers present in the repository when the contributions were submitted.

   Apache-2.0 §2's sublicensing grant is helpful but does not cleanly resolve the
   question on its own. It does not dispose of §3's patent conditions, §4's
   redistribution obligations, the recognised Apache-2.0/GPLv2 incompatibility, or
   the fact that this is same-file incorporation rather than independent-module
   linking. Both the [Apache Foundation](https://www.apache.org/licenses/GPL-compatibility)
   and OpenJDK's [additional licensing guidance](https://github.com/openjdk/jdk/blob/master/ADDITIONAL_LICENSE_INFO)
   treat that situation cautiously. The Classpath Exception addresses linking; it
   does not automatically cure commingled incompatible source.

   The safe resolution, and the one that should happen before the first GPLv2+CE
   release, is written consent from both contributors covering the identified
   commits — confirmed by counsel as covering copyright, relevant patent rights,
   and the authority to grant them.
2. **Exception wording — resolved.** [`LICENSE`](LICENSE) is now a verbatim copy
   of [OpenJDK's own `LICENSE`](https://github.com/openjdk/jdk/blob/master/LICENSE)
   (19,274 bytes). Its "CLASSPATH" EXCEPTION block is 1,405 bytes with SHA-256
   `a918482fadb14b911ad1afeff48849d317c260dc0d6f04bc2c76ac360615ae22`, matching the
   canonical block exactly. An earlier revision assembled the FSF's GPLv2 text plus
   a hand-reproduced exception paragraph; that version was word-correct in its
   operative language but not byte-for-byte canonical, and has been replaced.
3. **What pre-1.7.1 recipients hold.** See the licensing history above. The
   assertion that they simply "retain Apache-2.0" for those versions has been
   withdrawn pending counsel: it conflates a grant this project can make over its
   own contributions with the validity of an Apache-2.0 label applied to
   OpenJDK-derived material.

   The narrow statement that can be supported has three parts, and they should be
   kept separate:

   - Apache-2.0 grants remain effective for the material whose authors were in a
     position to make them.
   - The OpenJDK-derived material is available from its original licensors under
     GPLv2+CE independently of anything this project did; [GPLv2 §6](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
     gives a recipient of a covered work an automatic licence from the original
     licensor, so no recipient is left without terms for that portion.
   - Whether the combined historical package was lawfully redistributable *as
     labelled* is the part that remains unresolved, and it is not something this
     file can settle.
4. **Downstream impact.** Some automated license scanners flag anything matching
   `GPL-2.0` regardless of the Classpath Exception. Consumers whose policy blocks
   on that string may need the exception pointed out to them explicitly.
