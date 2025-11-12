# JamFind P2 Core Features Implementation Plan

## Overview
Building on the solid P1 foundation, P2 focuses on discovery & ranking, creator growth loops, monetization pilots, and production hardening.

## 1. Discovery & Ranking System

### Ranking Modes
- **Hot (time-decay)**: Recent submissions weighted higher
- **Rising (velocity)**: Fast-growing tracks based on submission velocity
- **All-time**: Classic popularity ranking

### Filters & Search
- Genre/mood/region facets
- Search with pagination & infinite scroll
- Cross-platform mirror detection

### Implementation Components
- Enhanced ranking algorithms in `lib/ranking.ts`
- New discovery API endpoints
- Advanced filtering UI components
- Infinite scroll implementation

## 2. Creator Growth Loop

### Share Cards (OG Images)
- Auto-generate artwork when playlists are published
- Dynamic image generation with track metadata
- Social media optimized formats

### Creator Pages
- User profile pages with badges
- Verified creator status
- Weekly Top 10 and Rising badges
- Creator statistics and achievements

### Streaks & Challenges
- Weekly themes (Afrobeats, Amapiano, Gospel)
- Auto-promote winners to homepage
- Gamification with points and rewards

## 3. Monetization Pilots

### Tipping System
- Stripe + Paystack + MTN MoMo integration
- Tip jar on creator pages
- 5–10% platform fee
- Ghana-compatible payment processing

### Featured Placements
- Fixed price during beta
- Transparent "Sponsored" labeling
- Priority placement in discovery

### Brand-safe Ads
- Only on discovery lists
- No ads on player deep-links
- Curated advertiser network

## 4. Trust, Policy & Licensing

### Playback Policy
- Previews or deep-links only
- No full-track streaming without licenses
- Clear UI indicators

### DMCA/Notice Workflow
- Report→review→action SLA
- Transparency log integration
- Automated takedown process

### Terms & Privacy
- Live updates matching actual data collection
- Lawful contact email
- Compliance documentation

## 5. SLOs, Runbooks & On-call

### Service Level Objectives
- Availability 99.9%
- P95 parse <1.5s
- Parse success >97%

### Runbooks
- 429/vendor fail (backoff, circuit break)
- Redis down (degrade refresh)
- Surge traffic (rate-limit, queue drain)

### Status Page
- Simple public page with current metrics
- Parse success and latency monitoring
- Incident communication

## 6. Data & Experiments

### North Star Metrics
- Weekly playlists posted
- % with ≥10 votes

### Core KPIs
- Submit→Publish (%)
- Publish→First Vote time
- Votes/session
- Repeat submitters/week
- Parse success by platform
- Private-link rate
- Mod actions/week

### A/B Tests
- Paste-to-preview vs. paste-to-submit friction
- Default sort (Hot vs. Rising)
- Creator badge nudges on submit success

## 7. Scale & Cost Optimization

### Caching Strategy
- Redis/edge cache playlist objects
- TTL 5–15 min for anonymous traffic
- Cache invalidation strategies

### Image Optimization
- Proxy & cache covers behind CDN
- Lazy-load in lists
- Responsive image formats

### Backoff & Circuit Breakers
- Exponential + jitter on vendor 429/5xx
- Queue retries capped
- Circuit breakers per platform

## Implementation Priority

### Phase 1 (Week 1-2)
1. Enhanced ranking algorithms
2. Discovery filters & search
3. Creator profile pages
4. Basic tipping integration

### Phase 2 (Week 3-4)
1. Share cards & OG images
2. Streaks & challenges
3. Featured placements
4. SLO monitoring

### Phase 3 (Week 5-6)
1. Advanced monetization
2. Trust & policy features
3. Data & experiments framework
4. Scale optimizations

## Technical Architecture Updates

### Database Schema Changes
- Add creator badges table
- Add tipping transactions
- Add challenge participation
- Add experiment tracking

### API Endpoints
- Enhanced discovery endpoints
- Creator profile APIs
- Tipping APIs
- Challenge management APIs

### Frontend Components
- Advanced discovery UI
- Creator profile components
- Tipping interface
- Challenge participation UI

## Success Metrics
- 30% increase in weekly active users
- 25% improvement in playlist discovery
- 15% increase in creator engagement
- 10% revenue from monetization pilots
- 99.9% system availability maintained
