#!/bin/bash
# Upload the knowledge base documents to ElevenLabs and link them to the agent.
#
# This only touches the knowledge base. It deliberately does NOT push the agent
# config: the previous version ran `elevenlabs agents push` first, which would
# overwrite the live agent's prompt and settings with whatever happens to be in
# agent_configs/ locally. Edit the agent in the ElevenLabs dashboard instead, or
# push the config as a separate, deliberate step.
#
# Uploading creates new documents rather than updating in place, so each run
# leaves the previous ones unreferenced. Orphans are reported at the end; they
# are not deleted automatically.

set -euo pipefail

# file:display name. The name is what shows up in the ElevenLabs dashboard.
#
# One document per subject. joan-founder-kb.md and joan-context-v1.md used to be
# separate entries here; they told the same founder story twice and had drifted
# apart on the details, so retrieval could land on either version. Merged into
# joan-kb.md.
DOCS=(
  "flare-product-kb.md:Flare Product"
  "joan-kb.md:Joan"
)

for cmd in jq curl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd is required but not installed."
    exit 1
  fi
done

for entry in "${DOCS[@]}"; do
  file="${entry%%:*}"
  if [ ! -f "$file" ]; then
    echo "ERROR: $file not found. Run from the repo root."
    exit 1
  fi
done

XI_API_KEY=$(cat ~/.elevenlabs/api_key 2>/dev/null || true)
if [ -z "$XI_API_KEY" ]; then
  echo "ERROR: No API key found at ~/.elevenlabs/api_key"
  exit 1
fi
export XI_API_KEY

AGENT_ID=$(jq -r '.agents[0].id' agents.json)
if [ -z "$AGENT_ID" ] || [ "$AGENT_ID" = "null" ]; then
  echo "ERROR: Could not read agent ID from agents.json"
  exit 1
fi

api() {
  # api <method> <path> [body] -> prints body, fails on non-2xx
  local method="$1" path="$2" body="${3:-}" out code
  out=$(mktemp)
  if [ -n "$body" ]; then
    code=$(curl -s -o "$out" -w "%{http_code}" -X "$method" \
      "https://api.elevenlabs.io/v1$path" \
      -H "xi-api-key: $XI_API_KEY" -H "Content-Type: application/json" -d "$body")
  else
    code=$(curl -s -o "$out" -w "%{http_code}" -X "$method" \
      "https://api.elevenlabs.io/v1$path" -H "xi-api-key: $XI_API_KEY")
  fi
  if [ "${code:0:1}" != "2" ]; then
    echo "ERROR: $method $path returned HTTP $code" >&2
    cat "$out" >&2
    rm -f "$out"
    return 1
  fi
  cat "$out"
  rm -f "$out"
}

echo "Agent: $AGENT_ID"
echo ""
echo "=== Uploading ${#DOCS[@]} documents ==="

KB_JSON="[]"
for entry in "${DOCS[@]}"; do
  file="${entry%%:*}"
  name="${entry#*:}"

  id=$(api POST /convai/knowledge-base/text \
    "$(jq -n --rawfile text "$file" --arg name "$name" '{text: $text, name: $name}')" \
    | jq -r '.id')

  if [ -z "$id" ] || [ "$id" = "null" ]; then
    echo "ERROR: upload failed for $file"
    exit 1
  fi

  echo "  $name  <-  $file  ($id)"
  KB_JSON=$(jq -c --arg id "$id" --arg name "$name" \
    '. + [{type: "text", name: $name, id: $id, usage_mode: "auto"}]' <<<"$KB_JSON")
done

echo ""
echo "=== Linking to agent ==="
api PATCH "/convai/agents/$AGENT_ID" \
  "$(jq -n --argjson kb "$KB_JSON" \
    '{conversation_config: {agent: {prompt: {knowledge_base: $kb}}}}')" >/dev/null
echo "Linked."

echo ""
echo "=== Verifying ==="
LINKED=$(api GET "/convai/agents/$AGENT_ID" \
  | jq -r '.conversation_config.agent.prompt.knowledge_base[]?.name' | sort)
echo "$LINKED" | sed 's/^/  /'

COUNT=$(printf '%s\n' "$LINKED" | grep -c . || true)
if [ "$COUNT" != "${#DOCS[@]}" ]; then
  echo "WARNING: expected ${#DOCS[@]} documents, agent reports $COUNT"
  exit 1
fi

echo ""
echo "=== Orphans ==="
LINKED_IDS=$(api GET "/convai/agents/$AGENT_ID" \
  | jq -r '.conversation_config.agent.prompt.knowledge_base[]?.id')
ORPHANS=$(api GET "/convai/knowledge-base?page_size=100" \
  | jq -r --arg ids "$LINKED_IDS" '
      ($ids | split("\n")) as $linked
      | .documents[] | select(.id as $i | $linked | index($i) | not)
      | "\(.id)  \(.name)"')

if [ -z "$ORPHANS" ]; then
  echo "  none"
else
  echo "$ORPHANS" | sed 's/^/  /'
  echo ""
  echo "  Delete once the new docs test clean:"
  echo "$ORPHANS" | awk '{print "    curl -X DELETE https://api.elevenlabs.io/v1/convai/knowledge-base/"$1" -H \"xi-api-key: $XI_API_KEY\""}'
fi

echo ""
echo "=== DONE ==="
