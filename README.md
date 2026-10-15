# bankaxept-onboarding-external-documentation

Published at <https://bankaxept.github.io/bankaxept-onboarding-external-documentation/>.

## Running locally

```sh
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
mkdocs build --strict                # same check as CI
mkdocs serve -a 127.0.0.1:48731      # http://127.0.0.1:48731
```
