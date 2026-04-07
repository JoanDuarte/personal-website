#!/bin/bash
# Upload new knowledge base documents to ElevenLabs and link them to the agent.
#
# SEQUENCING (from eng review):
#   1. Push updated agent config (prompt, first_message, settings) via CLI
#   2. Upload new KB docs via API
#   3. PATCH agent to link new KB docs
#   4. Pull updated config back to local
#   5. Verify
#
# Old KB docs (3boWShDiRhHIhIuSoNNp, Ds4PtY0IAGkNkfPyQwhI, mqqpMY5PMd5SLwRuudXM)
# are NOT deleted here. Delete them manually 48h after acceptance tests pass.

set -euo pipefail

# Prerequisites check
for cmd in jq curl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd is required but not installed."
    exit 1
  fi
done

if [ ! -f flare-product-kb.md ] || [ ! -f joan-founder-kb.md ]; then
  echo "ERROR: KB markdown files not found. Run from the repo root."
  exit 1
fi

# Export API key
export XI_API_KEY=$(cat ~/.elevenlabs/api_key 2>/dev/null || true)
if [ -z "$XI_API_KEY" ]; then
  echo "ERROR: No API key found at ~/.elevenlabs/api_key"
  exit 1
fi

# Get current agent ID
AGENT_ID=$(jq -r '.agents[0].id' agents.json)
if [ -z "$AGENT_ID" ] || [ "$AGENT_ID" = "null" ]; then
  echo "ERROR: Could not read agent ID from agents.json"
  exit 1
fi
echo "Agent ID: $AGENT_ID"

# Step 1: Push updated config (prompt, first_message, settings)
echo ""
echo "=== Step 1: Pushing updated agent config ==="
elevenlabs agents push
echo "Config pushed."

# Step 2: Upload new Flare Product document
echo ""
echo "=== Step 2: Uploading Flare Product KB ==="
DOC1_ID=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/knowledge-base/text" \
  -H "xi-api-key: $XI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --rawfile text flare-product-kb.md '{text: $text, name: "Flare Product"}')" \
  | jq -r '.id')
if [ -z "$DOC1_ID" ] || [ "$DOC1_ID" = "null" ]; then
  echo "ERROR: Flare Product upload failed"
  exit 1
fi
echo "Flare Product doc ID: $DOC1_ID"

# Step 3: Upload new Joan Founder document
echo ""
echo "=== Step 3: Uploading Joan Founder KB ==="
DOC2_ID=$(curl -s -X POST "https://api.elevenlabs.io/v1/convai/knowledge-base/text" \
  -H "xi-api-key: $XI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --rawfile text joan-founder-kb.md '{text: $text, name: "Joan Founder"}')" \
  | jq -r '.id')
if [ -z "$DOC2_ID" ] || [ "$DOC2_ID" = "null" ]; then
  echo "ERROR: Joan Founder upload failed"
  exit 1
fi
echo "Joan Founder doc ID: $DOC2_ID"

# Step 4: Patch agent to reference new docs
echo ""
echo "=== Step 4: Linking KB docs to agent ==="
PATCH_RESULT=$(curl -s -w "\n%{http_code}" -X PATCH "https://api.elevenlabs.io/v1/convai/agents/$AGENT_ID" \
  -H "xi-api-key: $XI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg d1 "$DOC1_ID" --arg d2 "$DOC2_ID" \
    '{conversation_config: {agent: {prompt: {knowledge_base: [
      {type: "text", name: "Flare Product", id: $d1, usage_mode: "auto"},
      {type: "text", name: "Joan Founder", id: $d2, usage_mode: "auto"}
    ]}}}}')")
HTTP_CODE=$(echo "$PATCH_RESULT" | tail -1)
if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Agent PATCH failed with HTTP $HTTP_CODE"
  echo "$PATCH_RESULT" | head -n -1
  exit 1
fi
echo "KB docs linked to agent."

# Step 5: Verify
echo ""
echo "=== Step 5: Verifying ==="
KB_COUNT=$(curl -s "https://api.elevenlabs.io/v1/convai/agents/$AGENT_ID" \
  -H "xi-api-key: $XI_API_KEY" \
  | jq '.conversation_config.agent.prompt.knowledge_base | length')
echo "Knowledge base documents: $KB_COUNT (expected: 2)"
if [ "$KB_COUNT" != "2" ]; then
  echo "WARNING: Expected 2 KB documents, got $KB_COUNT"
fi

# Step 6: Pull updated config back to local
echo ""
echo "=== Step 6: Pulling updated config ==="
elevenlabs agents pull --update
echo "Config pulled."

echo ""
echo "=== DONE ==="
echo "New KB doc IDs: $DOC1_ID, $DOC2_ID"
echo ""
echo "NEXT STEPS:"
echo "  1. Run acceptance tests (see design doc)"
echo "  2. After 48h of successful testing, delete old KB docs:"
echo "     curl -X DELETE 'https://api.elevenlabs.io/v1/convai/knowledge-base/3boWShDiRhHIhIuSoNNp' -H 'xi-api-key: \$XI_API_KEY'"
echo "     curl -X DELETE 'https://api.elevenlabs.io/v1/convai/knowledge-base/Ds4PtY0IAGkNkfPyQwhI' -H 'xi-api-key: \$XI_API_KEY'"
echo "     curl -X DELETE 'https://api.elevenlabs.io/v1/convai/knowledge-base/mqqpMY5PMd5SLwRuudXM' -H 'xi-api-key: \$XI_API_KEY'"
