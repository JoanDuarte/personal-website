# Flare — The Social Network You Listen To

Flare is an AI-native voice-first social app. The core thesis is simple: every social app we use today is reactive. You open Instagram, you scroll, you tap, you perform. You open TikTok, you consume. The model is broken because it creates performative behavior, addiction, wrong connections, and miscommunication. Social apps have merged into content apps. Instagram became Reels. TikTok is content-first. Snapchat chases famous people's stories. Connections got lost along the way.

AI changes this equation because AI can be proactive. It can observe your patterns, understand your life, and surface what matters before you even ask. That is the insight Flare is built on.

## How Flare Works

The experience starts when you capture a flare. A flare is a real-time moment: a video, photo, text thought, or mood check-in. No camera roll uploads, no filters, no staging. Everything is captured in the moment. AI analyzes each flare instantly and adds it to your living memory, a growing understanding of who you are, what you care about, and how your life is evolving.

Six AI agents then observe your patterns and your friends' patterns. They work behind the scenes, processing your flares and your friends' flares to generate insights, updates, and connection signals. The agents do not wait for you to ask. They surface what matters proactively.

Your Orb is how you hear from the agents. It speaks to you about your life and your friendships. Think of it as a voice interface to everything the agents have learned. You listen to your Orb the way you would listen to a close friend who somehow knows everything that is going on.

Your profile builds itself. An AI-generated identity sentence captures who you are right now, and an Aura Orb, an animated shader visualization, evolves its colors based on your lifestyle and milestones. Every user's Aura Orb is unique because every user's life is unique.

## The Six AI Agents

Flare runs on six specialized AI agents, each with a distinct role in the system.

Mirror is the self-reflection agent. It observes your own flares over time and reflects back how you are evolving. If you have been posting more about fitness this month than last month, Mirror notices. If your mood check-ins shifted, Mirror catches that pattern.

Lens keeps you updated on what your friends are doing. It watches their flares and surfaces the highlights so you do not have to scroll through a feed to know what is happening in their lives.

Identity generates your profile sentence. Based on your flares, your patterns, and your lifestyle, it writes a single sentence that captures who you are right now. This sentence updates as you change.

Orb controls your visual identity. It determines when your Aura Orb colors should shift based on milestones, lifestyle changes, or significant patterns in your data. The Orb is built with Skia shaders and renders a unique animated visualization for every user.

Bond observes the connection between you and each of your friends. It tracks how your interactions evolve, when you are drifting apart, when you are getting closer. Bond is what makes Flare a social app, not just a personal journal.

Pulse handles factual status updates about friend activity. While Lens provides narrative highlights, Pulse gives you the quick facts: who posted, when, what type of flare.

The key insight about the agents is that users never think about them individually. Users do not say "Mirror generated insight number 47." They think "my Orb told me about Lucas." The agents are the engine. The Orb is the interface.

## What Flare Will Never Build

This is a hard line, not a nice-to-have principle. Flare will never build likes, comments, follower counts, public vanity metrics, algorithmic feeds of strangers' content, or camera roll uploads. These features are what turned social apps into content apps. They incentivize performance over authenticity. Flare exists to reverse that.

## Technical Architecture

Flare is built on a real technical foundation. The backend runs on Supabase with 16 database tables protected by row-level security. There are 17 Edge Functions handling everything from flare processing to agent orchestration. The 6 AI agents run on a two-layer data pipeline: the first layer processes individual flares in real time, the second layer synthesizes patterns across time and across friends.

The mobile app is built with Expo and React Native, shipping to iOS via the App Store with over-the-air updates through EAS. The AI agents use Google Gemini for intelligence. Voice briefings use ElevenLabs Conversational AI. The Aura Orb shader is built with Skia.

State management uses Zustand for client state and React Query for server state. PostHog handles session replay and error tracking.

## Current Status

Flare is in beta testing on iOS with real users providing real feedback. The team is focused on two hard problems: memory and output quality (if the AI gets it wrong, nothing else matters) and orchestrating individual memory with friends' memories to create meaningful social insights. The product is live, functional, and being iterated on daily.

## Where Flare Is Heading

The roadmap includes more flare types beyond the current video, photo, text, and mood options. Voice customization will let users personalize how their Orb sounds. Proactive notifications will bring agent insights outside the app. Group dynamics will extend the Bond agent to friend groups, not just pairs. The progressive unlock system gates features behind engagement thresholds so users discover the product naturally rather than being overwhelmed on day one.

## Who Flare Is For

Flare is built for Gen Z users who are frustrated with performative social apps. People who are tired of curating a fake life for likes. People who want to actually know what their friends are doing without scrolling through a feed of strangers. People who believe that their phone should work for them, not against them.

The brand hook is: "The social network you listen to. Your Orb knows your friendships."
