import type { RailDefinition } from "./types";

/**
 * Curated channel directory — the editorial backbone of YouPlus.
 * Only premium, well-produced YouTube creators are admitted.
 */
export const PREMIUM_CHANNELS = {
  vox: { id: "UCLXo7UDZvByw2ixzpQCufnA", title: "Vox" },
  veritasium: { id: "UCHnyfMqiRRG1u-2MsSQLbXA", title: "Veritasium" },
  kurzgesagt: { id: "UCsXVk37bltHxD1rDPwtNM8Q", title: "Kurzgesagt – In a Nutshell" },
  mkbhd: { id: "UCBJycsmduvYEL83R_U4JriQ", title: "Marques Brownlee" },
  natgeo: { id: "UCpVm7bg6pXKo1Pr6k5kxG9A", title: "National Geographic" },
  nerdwriter: { id: "UCJIfeSCssxSC_Dhc5s7woww", title: "Nerdwriter1" },
  polyphonic: { id: "UC2T8m5EAvWamBYO0nMo3jqQ", title: "Polyphonic" },
  realengineering: { id: "UCR1IuLEqb6UEA_zQ81kwXfg", title: "Real Engineering" },
  greatart: { id: "UCD-miitqNY3nyukJ4Fnf4_A", title: "The Great Art Explained" },
  smarter: { id: "UC6107grRI4m0o2-emgoDnAA", title: "SmarterEveryDay" },
  primer: { id: "UCKzJFdi57J53Vr_BkTfN3uQ", title: "Primer" },
  wendover: { id: "UC9RM-iSvTu1uPJb8X5yp3EQ", title: "Wendover Productions" },
  johnnyharris: { id: "UCmGSJVG3mCRXVOP4yZrU1Dw", title: "Johnny Harris" },
  bonappetit: { id: "UCbpMy0Fg74eXXkvxJrtEn3w", title: "Bon Appétit" },
  archdaily: { id: "UC9pVZsQq8L3rHFJ52uX8Yvg", title: "ArchDaily" },
  glitch: { id: "UC0b-S9R34y_2qX4s5t4Qp1Q", title: "GLITCH" },
  vsauce: { id: "UC6nSFpj9HTCZ5t4N3Rm3v1g", title: "Vsauce" },
  branch: { id: "UCDPu84k26pLhG9K3aP0aK_g", title: "Branch Education" },
  melodysheep: { id: "UC51t3aCqXzVf1n9v_Nf2V3w", title: "melodysheep" },
  threeblueonebrown: { id: "UCYO_jab_esuFRV4b17AJtAw", title: "3Blue1Brown" },
  markrober: { id: "UCY1kMZp36IQSyNx_9h4mpCg", title: "Mark Rober" },
} as const;

/**
 * Hand-curated rails — the JioHotstar-style stacked shelves.
 * Each row is a coherent editorial pick, not algorithmic chaos.
 */
export const RAILS: RailDefinition[] = [
  {
    slug: "spotlight",
    title: "Spotlight",
    subtitle: "Hand-picked this week",
    style: "poster",
    channelIds: [
      PREMIUM_CHANNELS.melodysheep.id,
      PREMIUM_CHANNELS.glitch.id,
      PREMIUM_CHANNELS.vsauce.id,
      PREMIUM_CHANNELS.veritasium.id,
      PREMIUM_CHANNELS.kurzgesagt.id,
      PREMIUM_CHANNELS.vox.id,
    ],
  },
  {
    slug: "animation",
    title: "Premium Indie Animation",
    subtitle: "Glitch Productions · Kurzgesagt",
    style: "video",
    channelIds: [
      PREMIUM_CHANNELS.glitch.id,
      PREMIUM_CHANNELS.kurzgesagt.id,
    ],
  },
  {
    slug: "science",
    title: "Mind-bending Science",
    subtitle: "Veritasium · Kurzgesagt · Vsauce · Melodysheep",
    style: "poster",
    channelIds: [
      PREMIUM_CHANNELS.veritasium.id,
      PREMIUM_CHANNELS.kurzgesagt.id,
      PREMIUM_CHANNELS.smarter.id,
      PREMIUM_CHANNELS.vsauce.id,
      PREMIUM_CHANNELS.branch.id,
      PREMIUM_CHANNELS.threeblueonebrown.id,
      PREMIUM_CHANNELS.melodysheep.id,
    ],
  },
  {
    slug: "essays",
    title: "Video Essays Worth Your Time",
    subtitle: "Nerdwriter · Polyphonic · Johnny Harris",
    style: "video",
    channelIds: [
      PREMIUM_CHANNELS.nerdwriter.id,
      PREMIUM_CHANNELS.polyphonic.id,
      PREMIUM_CHANNELS.johnnyharris.id,
    ],
  },
  {
    slug: "world",
    title: "The Wider World",
    subtitle: "Geopolitics, cities, infrastructure",
    style: "poster",
    channelIds: [
      PREMIUM_CHANNELS.vox.id,
      PREMIUM_CHANNELS.wendover.id,
      PREMIUM_CHANNELS.johnnyharris.id,
      PREMIUM_CHANNELS.realengineering.id,
    ],
  },
  {
    slug: "design",
    title: "Design, Tech & Things You Touch",
    subtitle: "MKBHD · Mark Rober · ArchDaily",
    style: "video",
    channelIds: [
      PREMIUM_CHANNELS.mkbhd.id,
      PREMIUM_CHANNELS.markrober.id,
      PREMIUM_CHANNELS.archdaily.id,
      PREMIUM_CHANNELS.bonappetit.id,
    ],
  },
  {
    slug: "nature",
    title: "Wild & Quiet",
    subtitle: "Nature documentaries, slow film",
    style: "poster",
    channelIds: [PREMIUM_CHANNELS.natgeo.id, PREMIUM_CHANNELS.kurzgesagt.id],
  },
  {
    slug: "art",
    title: "Art, Explained",
    subtitle: "One painting at a time",
    style: "video",
    channelIds: [PREMIUM_CHANNELS.greatart.id, PREMIUM_CHANNELS.nerdwriter.id],
  },
];

/** Slugs of rails to surface on the home page in this order. */
export const HOME_RAIL_ORDER = [
  "spotlight",
  "animation",
  "science",
  "essays",
  "world",
  "design",
  "nature",
  "art",
];
