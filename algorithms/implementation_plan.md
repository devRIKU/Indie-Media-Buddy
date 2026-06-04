# Content Recommendation Algorithm Design & Implementation Plan

This document outlines the architecture, mathematical formulation, and python implementation of a personalized content recommendation engine designed for the **YouPlus** streaming service.

---

## Architecture Overview

Since YouPlus uses a privacy-first, serverless design (storing user interactions such as playlist saves and video playback progress in the client's browser `localStorage`), this recommendation engine is optimized to run efficiently client-side or at a edge function with minimal latency and zero database costs.

```
+---------------------------+
| Catalog / Candidate Videos| 
+-------------+-------------+
              |
              v
+-------------+-------------+
|    Candidate Filtering    | <--- Excludes fully watched & in-progress videos
+-------------+-------------+
              |
              v
+-------------+-------------+
|    Profile Similarity     | <--- User Profile Vector (Tags & Channel Affinity)
+-------------+-------------+
              |
              v
+-------------+-------------+
|  Scoring & Rank Engine    | <--- Combines: Similarity + Popularity + Recency
+-------------+-------------+
              |
              v
+-------------+-------------+
|    Top Recommended Rails  |
+---------------------------+
```

---

## Mathematical Formulation

For each candidate video $v$ in the catalog, a recommendation score $S(v)$ is computed:

$$S(v) = \alpha \cdot \text{TagMatch}(v) + \beta \cdot \text{ChannelMatch}(v) + \gamma \cdot \text{Popularity}(v) + \delta \cdot \text{Recency}(v)$$

### 1. Tag Similarity ($\text{TagMatch}$)
A User Tag Vector ($T_{user}$) is dynamically aggregated from user logs:
- **My List Saves**: $+3.0$ weight per tag.
- **Completed Videos** ($\ge 90\%$ watched): $+2.0$ weight per tag.
- **In-Progress Videos** ($5\%$ to $90\%$ watched): $+1.0 \times \text{progress}$ weight per tag.
- **Skip Indicators** ($< 5\%$ watched): $-0.5$ weight per tag.

A temporal decay is applied to interactions based on elapsed time:
$$w_{interaction} = w_{base} \times e^{-\lambda \cdot t_{elapsed}}$$
*(Default half-life $\approx 14$ days, so $\lambda \approx 0.05$)*

The score is the **Cosine Similarity** between the normalized User Tag Vector and the candidate video's tags:
$$\text{TagMatch}(v) = \frac{T_{user} \cdot T_{video}}{\|T_{user}\| \|T_{video}\|}$$

### 2. Channel Affinity ($\text{ChannelMatch}$)
A channel preference vector is constructed using the same weights. If a candidate video belongs to a creator the user has interacted with, it receives a matching score based on that channel's normalized weight in the profile.

### 3. Popularity ($\text{Popularity}$)
Popularity is computed on a normalized log-scale using the video's views to prevent extremely popular videos from dominating, while still providing a quality signal:
$$\text{Popularity}(v) = \frac{\log_{10}(v.\text{viewCount} + 1)}{\log_{10}(\text{maxViews} + 1)}$$

### 4. Recency Decay ($\text{Recency}$)
To promote fresh content, an exponential decay is applied to videos based on their age:
$$\text{Recency}(v) = e^{-0.0005 \cdot \text{daysOld}}$$

---

## Python Reference Implementation (Dummy Demo)

The complete simulation code implementing this logic is included below:

```python
#!/usr/bin/env python3
"""
recommend.py
Content Recommendation Algorithm for YouPlus (Indie-Media-Buddy).
Implements a Hybrid Content-Based Filtering & Recency/Popularity Ranking Engine.
Runs client-side/offline using user logs (ProgressMap and MyList).
"""

import math
from datetime import datetime, timedelta

# =====================================================================
# 1. DATA MODELS & MOCK CATALOG DATA
# =====================================================================

MOCK_CATALOG = [
    # SPOTLIGHT / SCIENCE
    {
        "id": "uD4izuDMUQA",
        "title": "TIMELAPSE OF THE FUTURE: A Journey to the End of Time",
        "channelTitle": "melodysheep",
        "channelId": "melodysheep_id",
        "publishedAt": "2019-03-20",
        "viewCount": 50200000,
        "tags": ["space", "future", "science", "astronomy", "time"],
        "category": "science"
    },
    {
        "id": "L45Q1_psDqk",
        "title": "Is Anything Real?",
        "channelTitle": "Vsauce",
        "channelId": "vsauce_id",
        "publishedAt": "2018-06-25",
        "viewCount": 24500000,
        "tags": ["philosophy", "science", "mind", "reality"],
        "category": "science"
    },
    {
        "id": "1VPfZ_XzisU",
        "title": "The Bizarre Behavior of Rotating Bodies",
        "channelTitle": "Veritasium",
        "channelId": "veritasium_id",
        "publishedAt": "2019-09-19",
        "viewCount": 35400000,
        "tags": ["physics", "space", "mechanics", "science"],
        "category": "science"
    },
    {
        "id": "lFEgohhfxOA",
        "title": "The Egg - A Short Story",
        "channelTitle": "Kurzgesagt - In a Nutshell",
        "channelId": "kurzgesagt_id",
        "publishedAt": "2019-11-30",
        "viewCount": 90200000,
        "tags": ["animation", "philosophy", "life", "kurzgesagt"],
        "category": "science"
    },
    {
        "id": "h6fcK_fRYaI",
        "title": "Geometry of a Black Hole",
        "channelTitle": "Kurzgesagt - In a Nutshell",
        "channelId": "kurzgesagt_id",
        "publishedAt": "2024-09-19",
        "viewCount": 12400000,
        "tags": ["space", "physics", "astrophysics", "science", "animation"],
        "category": "science"
    },
    {
        "id": "spUNpyF58BY",
        "title": "But what is a Fourier Transform? A visual introduction.",
        "channelTitle": "3Blue1Brown",
        "channelId": "threeblueonebrown_id",
        "publishedAt": "2018-01-26",
        "viewCount": 11300000,
        "tags": ["math", "visual", "calculus", "science"],
        "category": "science"
    },
    
    # ESSAYS / ART
    {
        "id": "DwmIK7QPM2g",
        "title": "How Pixar Uses Music to Make You Cry",
        "channelTitle": "Nerdwriter1",
        "channelId": "nerdwriter_id",
        "publishedAt": "2020-05-12",
        "viewCount": 3800000,
        "tags": ["film", "music", "analysis", "pixar", "art"],
        "category": "essays"
    },
    {
        "id": "FdSN4McPgM4",
        "title": "Radiohead's Most Mathematical Song",
        "channelTitle": "Polyphonic",
        "channelId": "polyphonic_id",
        "publishedAt": "2018-04-04",
        "viewCount": 4900000,
        "tags": ["music", "radiohead", "analysis", "rhythm"],
        "category": "essays"
    },
    {
        "id": "uVnUq6CkFOY",
        "title": "The Genius of Christopher Nolan's Editing",
        "channelTitle": "Nerdwriter1",
        "channelId": "nerdwriter_id",
        "publishedAt": "2021-09-18",
        "viewCount": 2100000,
        "tags": ["film", "nolan", "editing", "analysis", "cinema"],
        "category": "essays"
    },
    {
        "id": "BMOSSEM5tPo",
        "title": "Vermeer's 'Girl with a Pearl Earring' - Explained",
        "channelTitle": "The Great Art Explained",
        "channelId": "greatart_id",
        "publishedAt": "2022-12-02",
        "viewCount": 2900000,
        "tags": ["art", "painting", "vermeer", "history", "analysis"],
        "category": "art"
    },
    {
        "id": "Pt6FSNG-eYg",
        "title": "Caravaggio: The Painter Who Got Away With Murder",
        "channelTitle": "The Great Art Explained",
        "channelId": "greatart_id",
        "publishedAt": "2023-04-18",
        "viewCount": 1800000,
        "tags": ["art", "painting", "caravaggio", "history", "biography"],
        "category": "art"
    },

    # DESIGN / TECH / SHOWS
    {
        "id": "Os2QcRT8a-c",
        "title": "iPhone 16 Pro Review: The Subtle Year",
        "channelTitle": "Marques Brownlee",
        "channelId": "mkbhd_id",
        "publishedAt": "2024-09-20",
        "viewCount": 12500000,
        "tags": ["tech", "iphone", "apple", "review", "gadgets"],
        "category": "design"
    },
    {
        "id": "wVyu7NB7W3Y",
        "title": "How Apple Designs Software, Explained by an Insider",
        "channelTitle": "Marques Brownlee",
        "channelId": "mkbhd_id",
        "publishedAt": "2024-06-12",
        "viewCount": 8400000,
        "tags": ["design", "apple", "software", "ux", "tech"],
        "category": "design"
    },
    {
        "id": "xoxhDk-hwzs",
        "title": "Glitter Bomb vs. Package Thief",
        "channelTitle": "Mark Rober",
        "channelId": "markrober_id",
        "publishedAt": "2018-12-17",
        "viewCount": 88900000,
        "tags": ["engineering", "fun", "diy", "science", "prank"],
        "category": "shows"
    },
    {
        "id": "JE0lkVuoZcU",
        "title": "How the World's Tallest Skyscraper Was Built",
        "channelTitle": "Real Engineering",
        "channelId": "realengineering_id",
        "publishedAt": "2022-10-09",
        "viewCount": 3100000,
        "tags": ["engineering", "architecture", "construction", "science"],
        "category": "shows"
    },
    {
        "id": "vNHe5DKd8eg",
        "title": "How Singapore Became an Economic Miracle",
        "channelTitle": "Wendover Productions",
        "channelId": "wendover_id",
        "publishedAt": "2024-01-17",
        "viewCount": 2800000,
        "tags": ["economics", "geography", "history", "documentary"],
        "category": "shows"
    }
]

MAX_VIEWS = max(video["viewCount"] for video in MOCK_CATALOG)

class RecEngine:
    def __init__(self, catalog, alpha=0.5, beta=0.3, gamma=0.1, delta=0.1, half_life_days=14):
        self.catalog = catalog
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        self.delta = delta
        self.decay_constant = math.log(2) / half_life_days

    def _parse_date(self, date_str):
        return datetime.strptime(date_str, "%Y-%m-%d")

    def build_user_profile(self, my_list, progress_map, current_time=datetime.now()):
        tag_profile = {}
        channel_profile = {}

        # 1. Process My List (strong preference indicator)
        for video_id in my_list:
            video = self._find_video_in_catalog(video_id)
            if not video:
                continue
            weight = 3.0
            for tag in video["tags"]:
                tag_profile[tag] = tag_profile.get(tag, 0.0) + weight
            channel_id = video["channelId"]
            channel_profile[channel_id] = channel_profile.get(channel_id, 0.0) + weight

        # 2. Process Playback Progress Map
        for video_id, progress in progress_map.items():
            video = self._find_video_in_catalog(video_id)
            if not video:
                continue

            updated_at_dt = datetime.fromtimestamp(progress["updatedAt"] / 1000.0)
            elapsed_days = max(0, (current_time - updated_at_dt).days)
            temporal_decay = math.exp(-self.decay_constant * elapsed_days)

            completion_pct = progress["seconds"] / max(1.0, progress["durationSeconds"])
            
            if completion_pct >= 0.90:
                base_weight = 2.0
            elif completion_pct >= 0.05:
                base_weight = 1.0 * completion_pct
            else:
                base_weight = -0.5

            effective_weight = base_weight * temporal_decay

            for tag in video["tags"]:
                tag_profile[tag] = tag_profile.get(tag, 0.0) + effective_weight

            channel_id = video["channelId"]
            channel_profile[channel_id] = channel_profile.get(channel_id, 0.0) + effective_weight

        # Normalize tag profiles (L2 normalization)
        tag_magnitude = math.sqrt(sum(val ** 2 for val in tag_profile.values()))
        if tag_magnitude > 0:
            for tag in tag_profile:
                tag_profile[tag] /= tag_magnitude

        # Normalize channel weights (max scaling)
        max_channel_val = max(channel_profile.values()) if channel_profile else 0
        if max_channel_val > 0:
            for ch in channel_profile:
                channel_profile[ch] /= max_channel_val

        return tag_profile, channel_profile

    def _find_video_in_catalog(self, video_id):
        for video in self.catalog:
            if video["id"] == video_id:
                return video
        return None

    def _calculate_cosine_similarity(self, dict_a, list_b):
        if not dict_a or not list_b:
            return 0.0
        
        dot_product = sum(dict_a.get(tag, 0.0) for tag in list_b)
        candidate_magnitude = math.sqrt(len(list_b))
        profile_magnitude = 1.0
        
        if dot_product <= 0 or candidate_magnitude == 0:
            return 0.0
        
        return dot_product / (profile_magnitude * candidate_magnitude)

    def recommend(self, my_list, progress_map, limit=5, current_time=datetime.now()):
        tag_profile, channel_profile = self.build_user_profile(my_list, progress_map, current_time)

        completed_ids = set()
        in_progress_ids = set()

        for vid_id, prog in progress_map.items():
            completion = prog["seconds"] / max(1.0, prog["durationSeconds"])
            if completion >= 0.90:
                completed_ids.add(vid_id)
            elif completion >= 0.05:
                in_progress_ids.add(vid_id)

        recommendations = []

        for video in self.catalog:
            # Filters
            if video["id"] in in_progress_ids or video["id"] in completed_ids:
                continue

            tag_score = self._calculate_cosine_similarity(tag_profile, video["tags"])
            channel_score = channel_profile.get(video["channelId"], 0.0)
            pop_score = math.log10(video["viewCount"] + 1) / math.log10(MAX_VIEWS + 1) if video["viewCount"] > 0 else 0

            pub_date = self._parse_date(video["publishedAt"])
            days_old = max(0, (current_time - pub_date).days)
            recency_score = math.exp(-0.0005 * days_old)

            final_score = (
                self.alpha * tag_score +
                self.beta * channel_score +
                self.gamma * pop_score +
                self.delta * recency_score
            )

            recommendations.append({
                "video": video,
                "scores": {
                    "tag": tag_score,
                    "channel": channel_score,
                    "popularity": pop_score,
                    "recency": recency_score,
                    "total": final_score
                }
            })

        recommendations.sort(key=lambda x: x["scores"]["total"], reverse=True)
        return recommendations[:limit]
```
