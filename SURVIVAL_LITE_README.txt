History Survival Lite v1 - classroom concurrency optimization

Base: HistorySurvival HUD v2 full replacement

Changes
- Embedded Base64 images removed from the three game HTML files.
- Images moved to assets/game-media and shared by content hash.
- Duplicate images are stored once and browser-cacheable.
- Opaque PNG/JPEG images may use WebP quality 88 when smaller.
- Transparent sprites use lossless WebP when smaller.
- Existing HUD v2, game logic, touch controls, ranking and save paths are preserved.

Deployment
Extract and replace the entire history-survival repository contents, then Commit and Push in GitHub Desktop.
Do NOT upload only the HTML files; assets/game-media is required.
