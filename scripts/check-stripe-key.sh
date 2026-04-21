#!/usr/bin/env bash

set -euo pipefail

stripe_key="${1:-${STRIPE_API_KEY:-}}"

if [[ -z "${stripe_key}" ]]; then
  echo "Usage: STRIPE_API_KEY=sk_test_... bash scripts/check-stripe-key.sh"
  exit 1
fi

response_file="$(mktemp)"
status_code="$(curl -sS -o "${response_file}" -w '%{http_code}' https://api.stripe.com/v1/account -u "${stripe_key}:" || true)"

if [[ "${status_code}" == "200" ]]; then
  account_id="$(grep -o '"id": *"[^"]*"' "${response_file}" | head -n 1 | cut -d '"' -f 4)"
  echo "Stripe key is valid. Account: ${account_id:-unknown}"
  rm -f "${response_file}"
  exit 0
fi

error_message="$(grep -o '"message": *"[^"]*"' "${response_file}" | head -n 1 | cut -d '"' -f 4)"
echo "Stripe key check failed. HTTP ${status_code}. ${error_message:-Unknown error}"
rm -f "${response_file}"
exit 2