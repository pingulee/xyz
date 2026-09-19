# Homepage slider image sources

The `01-edited.webp` and `02-edited.webp` banners preserve the existing homepage compositions. Their background cleanup and character adjustments were made with the built-in image generator, then the monitor gameplay, typography, and emblems were composited deterministically by `scripts/build-original-slider-edits.cjs`.

- Gameplay shown in the monitor and leveling banner: existing project asset `public/images/lol/leveling-game-source.webp`.
- Enhanced leveling background: `public/images/lol/leveling-game-upscaled.png`, created with the built-in image generator from the existing gameplay screenshot. The edit preserves the central jungle fight while restoring detail and moving typography to a separate deterministic overlay.
- Pantheon visual reference used for the boosting background edit: existing project asset `public/images/services/pantheon-source.webp`.
- Current League ranked emblems used in the account banner:
  - https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-master.png
  - https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-diamond.png
  - https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-challenger.png
  - https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-grandmaster.png
  - https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-platinum.png

CommunityDragon exposes client assets extracted from Riot's distributed files. League of Legends assets belong to Riot Games and are used here only as visual references and promotional artwork for this League-related service.
