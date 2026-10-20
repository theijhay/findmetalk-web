# The same gates as .github/workflows/ci.yml. `make ci` runs all of them and
# must pass before every push.

export NEXT_TELEMETRY_DISABLED := 1

.PHONY: install dev contract typecheck lint test build bundle-check audit secrets ci

install:
	npm ci

dev:
	npm run dev

# TR-8: the copied API contract and the generated types are up to date.
contract:
	npm run -s contract:check

typecheck:
	npx tsc --noEmit

lint:
	npx eslint .

test:
	npm test

build:
	npx next build

# iOS 15 (iPhone 7, 6s, first SE) cannot parse class static blocks, and one in
# any client bundle stops the whole app from starting there.
bundle-check:
	@found=$$(grep -lE 'static[[:space:]]*\{' .next/static/chunks/*.js || true); \
	if [ -n "$$found" ]; then echo "Class static blocks iOS 15 cannot parse:"; echo "$$found"; exit 1; fi; \
	echo "No class static blocks in $$(ls .next/static/chunks/*.js | wc -l) client bundles."

# What ships to users, at high or critical.
audit:
	npm audit --omit=dev --audit-level=high

# Secrets anywhere in git history.
secrets:
	docker run --rm -v "$(CURDIR):/repo" zricethezav/gitleaks:v8.24.3 git /repo --redact --no-banner --exit-code 1

ci: contract typecheck lint test build bundle-check audit secrets
