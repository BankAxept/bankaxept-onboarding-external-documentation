# AGENTS.md

External-facing documentation for the BankAxept Onboarding API, built with MkDocs Material and published to GitHub Pages at <https://bankaxept.github.io/bankaxept-onboarding-external-documentation/>.

## Setup and verification

```sh
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
mkdocs build --strict                
mkdocs serve -a 127.0.0.1:48731
```

`mkdocs build --strict` is the authoritative check. It fails on broken internal links/anchors (verify with the grep pattern below, since strict mode does not always catch cross-page anchor targets) and is required before every commit in this repo. CI runs the identical command (`.github/workflows/pull_request.yml`, `.github/workflows/pages.yaml`); keep the `pip install` lines there, in `README.md`, and in your own setup in sync whenever a new MkDocs plugin/dependency is added.

To verify an in-page or cross-page anchor actually resolves (not just that the build didn't warn):

```sh
grep -o 'id="your-anchor"' _site/path/to/page/index.html
```

## Content conventions

These were hard-won over many iterations; follow them by default rather than rediscovering them:

- **Verify facts against the real backend source, don't guess.** The backend implementation repo (GitHub `techcloud0/kundereise-core`) contains the Onboarding API's actual implementation; ask the user for its local path if you need to inspect it directly, it is not necessarily cloned at any particular fixed location. When documenting behavior (validation rules, matching logic, field semantics), grep the real Java source and/or the OpenAPI spec (`onboarding-api/merch-api/src/main/resources/static/openApiSpec.yaml` within that repo) rather than inferring from the docs' own prior wording, which has contained real bugs before.
- **`docs/dictionary.md` is the single source of truth for terminology.** Use the exact terms defined there (e.g. "bank identifier," matching the OpenAPI spec's own parameter naming `GET /v2/banks/{bankIdentifier}`) rather than older or informal variants that may still linger in some prose. If you find inconsistent terminology while editing a page, fix it and/or update the dictionary rather than adding a one-off local rule here.
- **Don't hardcode a single real example organisation, search term, or person's data into permanent docs.** Doing so pigeonholes every integrator into testing against the same narrow fixture, and embedding real people's personal data (e.g. real BRREG board member names/birthdates) in docs isn't appropriate even though the data is technically public. Use fully invented example data (e.g. "Ola Nordmann," `000000000`/`Eksempel AS`) for worked examples instead, and describe search/lookup methodology generically rather than naming one company.
- **Cut fluff aggressively.** Prefer short, direct sentences and bullet lists over multi-clause prose; don't restate the same caveat in multiple places; don't add hedging or unnecessary context sentences. When in doubt, cut rather than add.
- **BankAxept's own operating entity is Stø AS.** Don't use it as a generic "test customer" example.

## Code comments

- Default to no comment. Add one only when a reader cannot infer the reason from the code, names, types, or test title.
- Explain *why*: a business constraint, a non-obvious edge case, a dependency limitation, or a workaround's removal condition. Keep it short and self-contained, usually one or two lines beside the relevant code.

## Structural gotchas

- **`docs/index.md` is the homepage** and builds directly to `_site/index.html` (no subdirectory), unlike every other page which builds to `_site/<name>/index.html`. This means relative asset paths on this page must **not** have a leading `../` (e.g. `assets/images/x.svg`, not `../assets/images/x.svg`) — the `../` prefix escapes the deployed GitHub Pages subpath in production even though it appears to work when running `mkdocs serve` locally (which has no subpath to escape, so the browser silently self-corrects).
- **Renamed/removed pages need a redirect**, configured via the `redirects` plugin in `mkdocs.yml` (`redirect_maps`), so old bookmarked/linked URLs 302 to the new location instead of 404ing. Add an entry whenever a page is renamed or merged into another page.
- **Raw HTML blocks containing nested Markdown** (e.g. a `<details>` block with headings/links/code fences inside) require the `md_in_html` extension (already enabled) **and** a `markdown="1"` attribute on the containing tag, otherwise the nested content renders as literal unprocessed text instead of being parsed.
- **One CSS/JS file per concern** under `docs/assets/{stylesheets,javascripts}/`, registered in `mkdocs.yml`'s `extra_css`/`extra_javascript`, rather than one large shared file.
- **Material icon/emoji shortcodes (e.g. `:material-open-in-new:`) do not render in `nav:` titles** in this setup — confirmed they output as literal text. Use plain Unicode characters (e.g. `↗`) in nav labels instead.
- External links in the top nav (tabs/sidebar) open in a new tab via `docs/assets/javascripts/external-nav-links.js`. In-text content links to external sites currently do **not**.

## Issue/PR workflow

- One branch and one PR per GitHub issue; keep PRs scoped narrowly rather than bundling unrelated changes, even when related work is discussed in the same conversation.
- Open PRs as **drafts** (`gh pr create --draft`) so reviewers aren't pinged until the content is actually ready. Let the user/human decide when to mark it ready (`gh pr ready <number>`) rather than doing so unilaterally; ask if it's unclear.
- Use GitHub's native sub-issues for tracking: `gh issue create --parent <number>` links a new issue under a parent/epic directly. If `gh issue edit <n> --parent <p>` fails with an organization SAML SSO error, run `gh auth refresh -h github.com -s repo,read:org`.
- When a Copilot or human review comment reveals that existing *issue text* (not just the PR) was wrong (e.g. written before a fact was corrected later in conversation), fix the issue description too, not just the code/docs — don't leave stale/incorrect issue text for future reference.
