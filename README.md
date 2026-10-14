# bankaxept-onboarding-external-documentation

## Running locally

```sh
python3 -m venv .venv && source .venv/bin/activate
pip install mkdocs-material mkdocs-glightbox mkdocs-redirects
mkdocs build --strict                # same check as CI
mkdocs serve -a 127.0.0.1:48731      # http://127.0.0.1:48731
```
