# YouPlus Content Recommendation System

This subfolder contains the design and simulation of the personalized content recommendation algorithm for the **YouPlus** streaming service.

## Recommendation Engine Architecture

Since YouPlus stores personal user logs locally (in `localStorage`) to maintain absolute privacy and avoid backend database complexity, this algorithm is designed to execute client-side or at edge routes using minimal compute resources.

### Scoring Formula

For any candidate video $v$ in the catalog, the recommendation score $S(v)$ is calculated as:

$$S(v) = \alpha \cdot \text{TagMatch}(v) + \beta \cdot \text{ChannelMatch}(v) + \gamma \cdot \text{Popularity}(v) + \delta \cdot \text{Recency}(v)$$

#### 1. Content-Similarity / Tag Match ($\text{TagMatch}$)
We construct a **User Profile Tag Vector** by parsing the user's interaction logs:
- **My List additions** (high signal): $+3.0$ weight to all tags of that video.
- **Completed videos** ($\ge 90\%$ progress): $+2.0$ weight to all tags of that video.
- **In-progress videos** ($5\% \text{ to } 90\%$ progress): $+1.0 \times \text{progress}$ weight.
- **Barely-watched / Skip indicators** ($< 5\%$ progress): $-0.5$ weight.

A temporal decay (half-life of 14 days) is applied to all interaction weights to ensure recommendation freshness:
$$w_{interaction} = w_{base} \times e^{-\lambda \cdot t_{elapsed}}$$

We then calculate the **Cosine Similarity** between the normalized User Tag Profile and the candidate video's tag list.

#### 2. Channel Affinity ($\text{ChannelMatch}$)
The User Channel Profile is built using the same weights as tags. If a candidate video's `channelId` exists in the user's channel profile, we add the normalized weight of that channel to boost videos from creators the user watches frequently.

#### 3. View Popularity ($\text{Popularity}$)
Popularity is computed as a normalized log-scale value of the video's views relative to the maximum views in the catalog:
$$\text{Popularity}(v) = \frac{\log_{10}(v.\text{viewCount} + 1)}{\log_{10}(\text{maxViews} + 1)}$$

#### 4. Recency Decay ($\text{Recency}$)
To prevent older videos from dominating the feed, we apply a slow exponential decay over time from the date the video was published:
$$\text{Recency}(v) = e^{-0.0005 \cdot \text{daysOld}}$$

---

## Code Structure

- [recommend.py](file:///c:/Users/S%20chatterjee/Coding%20Stuff/YouPlus/youplus-app/algorithms/recommend.py): A pure-Python implementation of the algorithm with:
  - Mock catalog data matching the TS models.
  - Four simulation personas:
    1. **Science Geek** (prefers space, physics, mathematics).
    2. **Art & Film Critic** (prefers art, analysis, music).
    3. **Tech Enthusiast** (prefers tech, design, gadgets).
    4. **Anonymous User** (receives popular/fresh fallback content).
  - Clean CLI representation showing the raw scores.

---

## How to Run

Execute the simulation directly in a terminal:

```bash
python algorithms/recommend.py
```

No external Python dependencies (like NumPy or scikit-learn) are required. All calculations use Python's built-in `math` and standard library modules.
