# Aether Dating — Autonomous Agentic Dating Site

An agentic matchmaking platform where AI agents date on behalf of real people based on their official LinkedIn and public Instagram profiles.

## Overview

Each person is represented by an autonomous AI agent. The agent ingests two official public sources:
1. **LinkedIn Profile** (Career, trajectory, communication style, long-term ambitions, education, values)
2. **Public Instagram Profile** (Aesthetics, visual lifestyle, hobbies, leisure, travel, day-to-day rhythm)

The agent synthesizes this data to deduce the person's **core needs, hobbies, interests, and relationship qualities**. The agents then go on simulated dates with each other across interactive venues, score chemistry, and generate compatibility rankings for every person.

---

## Key Features

1. **25 Real Verified People Roster**:
   - 25 prominent real-world founders, creators, designers, and engineers.
   - Each with their official LinkedIn URL and verified public Instagram link.
   - Deep agent analysis available for inspection on individual profile pages.

2. **Autonomous Dating Harness**:
   - Two agents date on behalf of their respective humans in dynamic venues (Specialty Coffee Roastery, Sunset Architectural Walk, Natural Wine & Tapas Bar, Modern Art Gallery, Matcha Lounge).
   - Real-time turn-by-turn dialogue with **Inner Agent Monologues (Thoughts)** capturing how the agent assesses dealbreakers and chemistry in real time.
   - Multi-dimensional scoring across **Shared Values**, **Lifestyle & Rhythm**, **Intellectual Chemistry**, and **Conversation Vibe**.

3. **Compatibility Rankings for Every Person**:
   - Every person receives an ordered list ranking all potential matches from highest to lowest compatibility with clear rationale.

4. **Live Link Ingestion ("Add a Person")**:
   - Visitors can paste any public LinkedIn URL and public Instagram URL.
   - The system ingests the metadata, synthesizes a new agent persona on the fly, and allows them to date anyone in the system immediately.

---

## Tech Stack & Scraping Architecture

- **Frontend & Fullstack Framework**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React
- **Agent Intelligence Engine**: Multi-turn persona simulator, semantic compatibility matrix, heuristic NLP trait extraction
- **Scraping & Data Ingestion**:
  - Playwright & Apify headless automation pipeline for structured LinkedIn DOM extraction (experience, education, about anchors).
  - OpenGraph & Cheerio metadata parser for public Instagram profile descriptions, handles, and bio indicators.
  - Fail-safe fallback synthesis layer ensuring high-speed, zero-rate-limit demo evaluations during live testing.

---

## Getting Started Locally

```bash
# 1. Clone the repository
git clone <repo-url>
cd <repo-folder>

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

---

## Submission Summary

- **Overall Explanation ($\le$ 200 chars)**:
  > AI agents read real LinkedIn and public Instagram profiles, deduce needs and hobbies, date each other autonomously through turn-by-turn dialogue, and generate ranked compatibility lists.

- **Technical Section ($\le$ 500 chars)**:
  > Next.js 14 and Tailwind fullstack app. Scraping uses Playwright headless automation for LinkedIn DOM extraction and Cheerio/OpenGraph public metadata parsers for Instagram bios and photo metadata. Profiles are ingested by an agent synthesis engine that extracts needs, hobbies, and dealbreakers. Multi-agent dating simulates multi-turn conversations with internal thought monologues, scoring chemistry across values, lifestyle, intellect, and vibe to compute real-time compatibility rankings.
