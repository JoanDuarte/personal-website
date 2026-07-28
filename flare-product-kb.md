# Flare — The Social Network You Listen To

Flare is your social brain: an agent that keeps you close to your friends. It tells you what they are up to in near-real-time, and telling it about your life is the same act that feeds theirs. Voice-first, proactive, never performative.

The thesis starts from what is broken. Every social app today is reactive. You open it, you scroll, you process, you perform. Social apps merged into content apps along the way — Instagram became Reels, TikTok is content-first, Snapchat chases famous people's stories — and connection got lost. AI changes the equation because an agent can be proactive: it can observe your patterns, understand your life, and surface what matters before you ask.

The structural bet is that **the entire product is one conversation with an agent that connects you to humans**. That pattern is proven adjacent — boardy.ai for professional networking, talentpluto.com for hiring — but nobody has built it for close friendships. That white space is the opportunity.

## The Loop

The whole thing takes 30 to 60 seconds.

You open Flare and the Orb is already talking, with one to three fresh things: what your friends have checked in since you last opened, plus a memory hook, like today being Sofi's birthday. The screen follows the voice — a karaoke transcript, the mentioned friend's card sliding in, a map pin when the place matters.

Then it asks you one natural question. Something like "so what are you up to?" Your answer *is* your check-in: captured, analyzed, stored, and shareable under your rules. You can attach a photo inside the same conversation. It closes by pointing at a human — "want me to tell Leo you're at the usual café?"

Tomorrow it knows more, about you and about them.

The structural key is that **the check-in and the listening are the same conversation**. One act supplies both sides of the network. That kills two chronic diseases at once: the separated capture and listen loops, and the supply-side cold start that killed BeReal by demanding fresh posts, while Locket and Retro won by removing upload friction.

## Core Concepts

**Check-in** is the atomic act. You tell the Orb what you are doing, by voice, optionally with a photo. It produces a flare under the hood because the data model persists, but the user-facing verb is talking, not uploading.

**The Aura Orb** is the voice and the visual identity at once. The Skia shader — soft-Voronoi lifestyle territories — is sacred. The framing is that the Orb is *your character*, closer to a Fortnite skin than a logo: per-user visual identity you customize until it feels yours.

**The live canvas** is the screen during a conversation: karaoke transcript, friend cards, photos, static map pins, all driven by the agent through ElevenLabs client tools.

**Residue** is the glanceable timeline of your friends' check-ins, listenable and readable. It is what you browse when you cannot talk.

## The Three Agents

Flare runs three AI agents that generate insights at capture time: **Spark**, **Mirror** and **Bond**.

Users never think about them individually. Nobody says "Mirror generated insight 47." They think "my Orb told me about Lucas." The agents are the engine; the Orb is the interface. V3 shifts generation toward happening live during the conversation, but the agent taxonomy survives as the analysis layer.

## Principles

Each of these defuses a specific failure mode that killed something real.

**Conduit, not companion.** Every session ends pointing at a real human. Flare never competes for parasocial minutes — that lane has lawsuits, shutdowns like Dot, and street-level backlash like the Friend pendant. Flare strengthens human bonds. The agent is the wire, not the endpoint.

**Valuable at N=1.** With zero active friends the Orb still earns the tap: personal memory, spoken journal, reminders. The floor is never silence.

**Memory compounds.** Day 30 beats day 1. It knows more, talks less, hits harder. Conversations get *shorter* over time, not longer. This is the anti-novelty-decay mechanic — Clubhouse and BeReal died of gimmick.

**Voice is the premium, not the toll.** Everything speakable is also glanceable and readable, for the subway, class, the office. Airchat died with the best speech-to-text on the market; transcript polish is not retention.

**Agent-mediated sharing.** You tell the Orb everything; you control what is narratable to whom. The Orb asks what it can pass along. Growth stays invite-gated.

**Proactive with tact.** The agent initiates contact, which Boardy proved works, but Boardy's unsolicited-message PR disaster marks the edge: opt-in, bounded cadence, tone always in the user's favor.

## What Flare Will Never Build

Likes. Comments. Follower counts. Public vanity metrics. Algorithmic feeds of strangers. Camera roll uploads. Continuous location tracking. An AI designed to replace human relationships.

These are not "not yet." They are hostile to the model. Place is what you say or what the photo shows, never a tracked coordinate.

## Who It Is For

People 18 to 30, college through early career, in the US and Latin America. The friendship pattern is 5 to 15 close friends, not 500 acquaintances. They are comfortable with voice — WhatsApp voice notes — and tired of performative posting, follower anxiety and algorithmic strangers. They want to keep close friends in the loop without performing.

Creators, influencers and reach-optimizers are explicitly not the target. The product is hostile to them by design.

## Where It Is Today

Flare is live on iOS with real users. What runs in production is the V2 pipeline: a capture flow plus pre-generated briefings, routed through a seven-flow cascade that decides what the Orb opens with.

The V3 rebuild — the conversation-first home, the live canvas, the check-in written straight from speech — is built and on main, but it ships dark behind feature flags. That is a deploy decision, not a code one.

The hard problems are memory and output quality, because if the AI gets it wrong nothing else matters, and connection speed. Time-to-first-word, meaning tap until the Orb starts talking, is a hard product requirement with a target of one to two seconds.

## Technical Foundation

The backend is Supabase: 29 tables with row-level security, 23 Edge Functions handling everything from check-in processing to agent orchestration. Intelligence runs on Google Gemini 3.1 Flash Lite. Voice is ElevenLabs Conversational AI over bidirectional WebRTC.

The app is Expo and React Native, iOS-only, shipping through the App Store with over-the-air updates via EAS. The Aura Orb is a Skia shader. State is Zustand for client and React Query for server. PostHog owns product analytics and session replay; Sentry owns errors, and the two are deliberately kept separate.

## Brand

The hook is **"The social network you listen to."** The lock is **"Your Orb knows your friendships."**

Both are used verbatim wherever the surface calls for them. They are never reworded.
