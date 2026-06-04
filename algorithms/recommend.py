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

# Simplified representation of video metadata matching YouPlus ts/tsx models
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

# Max views for normalization
MAX_VIEWS = max(video["viewCount"] for video in MOCK_CATALOG)


# =====================================================================
# 2. RECOMMENDATION ENGINE ALGORITHM
# =====================================================================

class RecEngine:
    def __init__(self, catalog, alpha=0.5, beta=0.3, gamma=0.1, delta=0.1, half_life_days=14):
        """
        Initializes the Recommendation Engine.
        
        Parameters:
        - catalog: List of dictionaries matching the VideoItem structure.
        - alpha: Weight for Tag Cosine Similarity.
        - beta: Weight for Channel Matching.
        - gamma: Weight for View Count Popularity.
        - delta: Weight for Recency Decay.
        - half_life_days: Half-life in days for user activity decay.
        """
        self.catalog = catalog
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        self.delta = delta
        self.decay_constant = math.log(2) / half_life_days

    def _parse_date(self, date_str):
        return datetime.strptime(date_str, "%Y-%m-%d")

    def build_user_profile(self, my_list, progress_map, current_time=datetime.now()):
        """
        Builds a weighted preference vector for tags and channels.
        
        my_list: list of video IDs (watch list)
        progress_map: dict of videoId -> { "seconds": float, "durationSeconds": float, "updatedAt": int (epoch ms) }
        """
        tag_profile = {}
        channel_profile = {}

        # 1. Process My List (strong, intentional preference indicator)
        for video_id in my_list:
            video = self._find_video_in_catalog(video_id)
            if not video:
                continue
            
            # Since My List does not store action timestamps, we assume a fresh interaction
            weight = 3.0
            
            # Accumulate tag weights
            for tag in video["tags"]:
                tag_profile[tag] = tag_profile.get(tag, 0.0) + weight
                
            # Accumulate channel weights
            channel_id = video["channelId"]
            channel_profile[channel_id] = channel_profile.get(channel_id, 0.0) + weight

        # 2. Process Playback Progress Map
        for video_id, progress in progress_map.items():
            video = self._find_video_in_catalog(video_id)
            if not video:
                continue

            # Calculate interaction age in days to apply temporal decay
            updated_at_dt = datetime.fromtimestamp(progress["updatedAt"] / 1000.0)
            elapsed_days = max(0, (current_time - updated_at_dt).days)
            temporal_decay = math.exp(-self.decay_constant * elapsed_days)

            # Determine watch completeness
            completion_pct = progress["seconds"] / max(1.0, progress["durationSeconds"])
            
            if completion_pct >= 0.90:
                # User completed the video
                base_weight = 2.0
            elif completion_pct >= 0.05:
                # User partially watched it (scaled by watch completion)
                base_weight = 1.0 * completion_pct
            else:
                # Barely watched (skip indicator, negative weight)
                base_weight = -0.5

            effective_weight = base_weight * temporal_decay

            # Accumulate tags
            for tag in video["tags"]:
                tag_profile[tag] = tag_profile.get(tag, 0.0) + effective_weight

            # Accumulate channels
            channel_id = video["channelId"]
            channel_profile[channel_id] = channel_profile.get(channel_id, 0.0) + effective_weight

        # Normalize profiles (L2 normalization for tags)
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
        """
        Calculates the cosine similarity between user profile weights (dict_a)
        and candidate video tags (list_b, where each element is treated as weight 1).
        """
        if not dict_a or not list_b:
            return 0.0
        
        # Dot product
        dot_product = sum(dict_a.get(tag, 0.0) for tag in list_b)
        
        # Candidate vector magnitude (each tag in candidate is 1.0)
        candidate_magnitude = math.sqrt(len(list_b))
        
        # Profile magnitude is already normalized to 1.0 in build_user_profile
        profile_magnitude = 1.0
        
        if dot_product <= 0 or candidate_magnitude == 0:
            return 0.0
        
        return dot_product / (profile_magnitude * candidate_magnitude)

    def recommend(self, my_list, progress_map, limit=5, current_time=datetime.now()):
        """
        Generates candidates, filters, scores, and returns sorted recommendation list.
        """
        # Generate user profiles
        tag_profile, channel_profile = self.build_user_profile(my_list, progress_map, current_time)

        # Separate filters
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
            # 1. Filtering Phase
            # Skip videos currently in-progress (they belong in "Continue Watching")
            if video["id"] in in_progress_ids:
                continue
            # Skip recently completed videos (so they aren't repeated immediately)
            if video["id"] in completed_ids:
                continue

            # 2. Feature Scoring Phase
            
            # Content: Tag Match (Cosine Similarity)
            tag_score = self._calculate_cosine_similarity(tag_profile, video["tags"])

            # Channel Affinity Match
            channel_score = channel_profile.get(video["channelId"], 0.0)

            # Popularity (Log-scaled viewCount)
            pop_score = math.log10(video["viewCount"] + 1) / math.log10(MAX_VIEWS + 1) if video["viewCount"] > 0 else 0

            # Recency Decay
            # 0.1 decay rate per year (365 days) from current date
            pub_date = self._parse_date(video["publishedAt"])
            days_old = max(0, (current_time - pub_date).days)
            recency_score = math.exp(-0.0005 * days_old)  # Slow decay over years

            # 3. Final Scoring Formulation
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

        # Sort by total score descending
        recommendations.sort(key=lambda x: x["scores"]["total"], reverse=True)
        return recommendations[:limit]


# =====================================================================
# 3. PERSONAS AND SIMULATION
# =====================================================================

def run_simulation():
    engine = RecEngine(MOCK_CATALOG)
    current_time = datetime(2026, 6, 4)  # Simulate current date

    print("=" * 70)
    print("YOUPLUS CONTENT RECOMMENDATION SYSTEM SIMULATION")
    print("Current Simulated Date:", current_time.strftime("%Y-%m-%d"))
    print("=" * 70)

    # PERSONA 1: The Astrophysics & Science Geek
    # User saved a space video, recently completed a black hole video, and watched 60% of a physics video.
    p1_my_list = ["uD4izuDMUQA"]  # Saved "Timelapse of the Future" (space, future, science)
    p1_progress_map = {
        "h6fcK_fRYaI": {  # Completed "Geometry of a Black Hole" (space, astrophysics, animation)
            "seconds": 600.0,
            "durationSeconds": 622.0,
            "updatedAt": int((current_time - timedelta(days=2)).timestamp() * 1000)
        },
        "1VPfZ_XzisU": {  # In-progress "Bizarre Behavior of Rotating Bodies" (physics, space)
            "seconds": 270.0,
            "durationSeconds": 450.0,
            "updatedAt": int((current_time - timedelta(days=5)).timestamp() * 1000)
        }
    }

    # PERSONA 2: The Art & Film Essay Enthusiast
    # User saved "Pixar Music" (film, music, analysis), and completed "Vermeer painting" (art, history, analysis).
    p2_my_list = ["DwmIK7QPM2g"]
    p2_progress_map = {
        "BMOSSEM5tPo": {
            "seconds": 960.0,
            "durationSeconds": 968.0,
            "updatedAt": int((current_time - timedelta(days=1)).timestamp() * 1000)
        }
    }

    # PERSONA 3: The Tech & Design Junkie
    # User saved "Apple Designs Software" (design, apple, ux) and completed "iPhone 16 Pro Review".
    p3_my_list = ["wVyu7NB7W3Y"]
    p3_progress_map = {
        "Os2QcRT8a-c": {
            "seconds": 1100.0,
            "durationSeconds": 1104.0,
            "updatedAt": int((current_time - timedelta(days=3)).timestamp() * 1000)
        }
    }

    # PERSONA 4: Completely New User
    p4_my_list = []
    p4_progress_map = {}

    personas = [
        ("The Science & Astrophysics Geek", p1_my_list, p1_progress_map),
        ("The Art & Film Essay Enthusiast", p2_my_list, p2_progress_map),
        ("The Tech & Design Junkie", p3_my_list, p3_progress_map),
        ("New / Anonymous User", p4_my_list, p4_progress_map)
    ]

    for name, my_list, progress_map in personas:
        print(f"\n[PERSONA] {name}")
        print("-" * 50)
        print("  - Saved in My List:", [engine._find_video_in_catalog(i)["title"] for i in my_list if engine._find_video_in_catalog(i)])
        print("  - Watching History:")
        for vid_id, prog in progress_map.items():
            video = engine._find_video_in_catalog(vid_id)
            if video:
                comp = (prog["seconds"] / prog["durationSeconds"]) * 100
                print(f"    * '{video['title']}' ({comp:.1f}% watched)")

        recs = engine.recommend(my_list, progress_map, limit=3, current_time=current_time)
        print("\n  - TOP 3 RECOMMENDATIONS:")
        for idx, item in enumerate(recs):
            video = item["video"]
            scores = item["scores"]
            print(f"    {idx+1}. [{video['category'].upper()}] {video['title']}")
            print(f"       Channel: {video['channelTitle']} | Published: {video['publishedAt']}")
            print(f"       Score: {scores['total']:.3f} (Content Similarity: {scores['tag']:.2f}, Channel Match: {scores['channel']:.2f}, Recency: {scores['recency']:.2f})")
        print("-" * 50)

if __name__ == "__main__":
    run_simulation()
