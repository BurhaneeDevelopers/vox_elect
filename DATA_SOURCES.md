# Elora Data Sources

## Overview

All election data in Elora is sourced from authoritative public APIs. This document catalogs each source, endpoint patterns, rate limits, and attribution requirements.

---

## 1. Google Civic Information API

**Base URL:** `https://civicinfo.googleapis.com/civicinfo/v2`
**Env Var:** `GOOGLE_CIVIC_API_KEY`
**Purpose:** Voter registration info, polling locations, elected officials by address

### Key Endpoints

| Endpoint | Description |
|---|---|
| `GET /voterinfo?address={addr}&electionId={id}` | Polling location, ballot info for address |
| `GET /representatives?address={addr}` | Elected officials by address |
| `GET /elections` | Upcoming elections list |

### Rate Limits
- Free tier: 25,000 requests/day
- Recommended: cache responses per ZIP code (1 hour TTL)

### Attribution
> "Powered by Google Civic Information API"

---

## 2. OpenStates API

**Base URL:** `https://v3.openstates.org/api/v1`
**Env Var:** `OPENSTATES_API_KEY`
**Purpose:** State legislature data, bill tracking, state legislators by location

### Key Endpoints

| Endpoint | Description |
|---|---|
| `GET /people?jurisdiction={state}&include=links` | State legislators |
| `GET /bills?jurisdiction={state}&q={query}` | Bill search |
| `GET /jurisdictions` | All supported jurisdictions |

### Rate Limits
- Free tier: 1,000 requests/day
- Registered accounts: 10,000 requests/day

### Attribution
> "Legislative data from OpenStates.org"

---

## 3. FEC API (Federal Election Commission)

**Base URL:** `https://api.open.fec.gov/v1`
**Env Var:** `FEC_API_KEY` (public key available at api.data.gov)
**Purpose:** Campaign finance data, candidate filings

### Key Endpoints

| Endpoint | Description |
|---|---|
| `GET /candidates?q={name}&election_year={year}` | Candidate search |
| `GET /candidate/{candidate_id}/totals` | Fundraising totals |
| `GET /elections?cycle={year}&office={type}` | Election listings |

### Rate Limits
- Default: 1,000 requests/hour per API key
- DEMO_KEY: 30 requests/hour (for development)

### Attribution
> "Campaign finance data from FEC.gov (open.fec.gov)"

---

## 4. Ballotpedia

**Base URL:** `https://ballotpedia.org/api/v1` (limited public API) / HTML scraping
**Purpose:** Candidate bios, ballot measure summaries
**Note:** No official bulk API; use Ballotpedia's MediaWiki API for structured data

### Usage Pattern
- Query via MediaWiki action API for structured article content
- Always cite Ballotpedia as source in responses
- Respect robots.txt and rate limits (max 1 req/sec)

### Attribution
> "Candidate and ballot measure information from Ballotpedia.org"

---

## 5. Vote.gov

**Base URL:** Public content only (no dedicated API)
**Purpose:** Registration deadlines, voting methods by state
**Pattern:** Use curated static data (updated at build time) + link to official state pages

---

## Caching Strategy

| Data Type | Cache TTL | Storage |
|---|---|---|
| Polling locations by ZIP | 24 hours | In-memory (Zustand session) |
| Elected officials by ZIP | 24 hours | In-memory |
| Election calendar | 1 hour | TanStack Query |
| Candidate data | 6 hours | TanStack Query |
| State legislature data | 6 hours | TanStack Query |

---

## Fallback Behavior

If any API is unavailable:
1. Return cached data if available
2. Display graceful error: "Live data is temporarily unavailable. Here's what I know from official sources…"
3. Link user to official source directly (e.g., vote.gov, state election website)
