/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const width = 1536;
const height = 1024;
const renderScale = 2;

const asset = (relativePath) => path.join(root, "public", "images", relativePath);
const dataUri = (relativePath) => {
  const extension = path.extname(relativePath).slice(1);
  const mime = extension === "png" ? "image/png" : `image/${extension}`;
  return `data:${mime};base64,${fs.readFileSync(asset(relativePath)).toString("base64")}`;
};

const configs = [
  {
    output: "slider/01-edited.webp",
    background: "slider/01-pantheon-base.png",
    title: "롤 대리",
    subtitle: "목표 티어까지 안전하게",
    inserts: [
      {
        source: "lol/leveling-game-source.webp",
        x: 342,
        y: 560,
        width: 545,
        height: 334,
        points: "365,568 867,580 881,886 344,884",
      },
    ],
  },
  {
    output: "slider/02-edited.webp",
    background: "slider/02-clean-base.png",
    title: "롤 듀오",
    subtitle: "함께하는 플레이",
    inserts: [
      {
        source: "lol/leveling-game-source.webp",
        x: 360,
        y: 455,
        width: 368,
        height: 276,
        points: "369,458 721,458 721,724 366,724",
      },
      {
        source: "lol/leveling-game-source.webp",
        x: 797,
        y: 455,
        width: 348,
        height: 276,
        points: "800,458 1138,458 1138,724 800,724",
        position: "right",
      },
    ],
  },
  {
    output: "slider/03-edited.webp",
    background: "slider/03.webp",
    title: "롤 계정",
    subtitle: "취향에 맞는 계정",
    accountRanks: true,
  },
  {
    output: "slider/04-edited.webp",
    background: "lol/leveling-game-upscaled.png",
    title: "롤 육성",
    subtitle: "매크로 없는 100% 수동 육성",
    frame: true,
    zoom: 1.16,
    titleSize: 156,
    subtitleSize: 54,
    titleY: 842,
    subtitleY: 936,
  },
];

function insertMarkup(insert, index) {
  const position = insert.position === "right" ? "xMaxYMid" : "xMidYMid";
  return `
    <clipPath id="screen-${index}"><polygon points="${insert.points}"/></clipPath>
    <image href="${dataUri(insert.source)}" x="${insert.x}" y="${insert.y}"
      width="${insert.width}" height="${insert.height}" preserveAspectRatio="${position} slice"
      clip-path="url(#screen-${index})"/>`;
}

function accountRankMarkup(rankData) {
  const ranks = [
    ["master", "MASTER"],
    ["diamond", "DIAMOND"],
    ["challenger", "CHALLENGER"],
    ["grandmaster", "GRANDMASTER"],
    ["platinum", "PLATINUM"],
  ];
  const starts = [222, 431, 640, 849, 1058];

  return ranks.map(([file, label], index) => {
    const x = starts[index];
    return `
      <rect x="${x}" y="445" width="184" height="302" rx="12" fill="#070909" fill-opacity=".92" stroke="#b58a3b" stroke-width="2"/>
      <image href="${rankData[file]}" x="${x + 12}" y="466" width="160" height="174" preserveAspectRatio="xMidYMid meet"/>
      <text x="${x + 92}" y="696" text-anchor="middle" font-family="Noto Sans KR, Malgun Gothic, sans-serif" font-size="24" font-weight="700" fill="#f5dfa1">${label}</text>`;
  }).join("\n");
}

async function build(config) {
  const inserts = (config.inserts || []).map(insertMarkup).join("\n");
  const rankData = config.accountRanks
    ? Object.fromEntries(await Promise.all(
      ["master", "diamond", "challenger", "grandmaster", "platinum"].map(async (rank) => {
        const trimmed = await sharp(asset(`tier/official/${rank}.png`)).trim().png().toBuffer();
        return [rank, `data:image/png;base64,${trimmed.toString("base64")}`];
      }),
    ))
    : null;
  const ranks = config.accountRanks ? accountRankMarkup(rankData) : "";
  const frame = config.frame
    ? `<rect x="34" y="34" width="1468" height="956" rx="18" fill="none" stroke="#c8943f" stroke-width="3" stroke-opacity=".82"/>`
    : "";
  const titleSize = config.titleSize || 136;
  const subtitleSize = config.subtitleSize || 48;
  const titleY = config.titleY || 836;
  const subtitleY = config.subtitleY || 926;
  const ornamentY = subtitleY - 18;
  const overlay = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width * renderScale}" height="${height * renderScale}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="lowerShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#050504" stop-opacity="0"/>
        <stop offset=".48" stop-color="#050504" stop-opacity=".18"/>
        <stop offset="1" stop-color="#050504" stop-opacity=".9"/>
      </linearGradient>
      <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#fff9d9"/>
        <stop offset=".22" stop-color="#ffe59a"/>
        <stop offset=".48" stop-color="#d7a746"/>
        <stop offset=".72" stop-color="#9c651d"/>
        <stop offset="1" stop-color="#f1c660"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-40%" width="140%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
        <feOffset dy="7"/>
        <feComponentTransfer><feFuncA type="linear" slope=".78"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${inserts}
    ${ranks}
    <rect y="570" width="${width}" height="454" fill="url(#lowerShade)"/>
    ${frame}
    <g text-anchor="middle" font-family="Gmarket Sans TTF, Gmarket Sans, Noto Sans KR, Malgun Gothic, sans-serif" font-weight="700" filter="url(#shadow)">
      <text x="768" y="${titleY}" font-size="${titleSize}" letter-spacing="-2" fill="url(#goldText)" stroke="#8b5d1e" stroke-width="2.5" stroke-linejoin="round" paint-order="stroke fill">${config.title}</text>
      <path d="M250 ${ornamentY} H476" stroke="#c9963e" stroke-width="2" stroke-linecap="round" opacity=".72"/>
      <path d="M1060 ${ornamentY} H1286" stroke="#c9963e" stroke-width="2" stroke-linecap="round" opacity=".72"/>
      <circle cx="498" cy="${ornamentY}" r="4" fill="#f4d681"/>
      <circle cx="1038" cy="${ornamentY}" r="4" fill="#f4d681"/>
      <text x="768" y="${subtitleY}" font-size="${subtitleSize}" letter-spacing="0" fill="#fff0b8" stroke="#4a2e0e" stroke-width="1.25" paint-order="stroke fill">${config.subtitle}</text>
    </g>
  </svg>`);

  const zoom = config.zoom || 1;
  const zoomedWidth = Math.round(width * renderScale * zoom);
  const zoomedHeight = Math.round(height * renderScale * zoom);
  let background = sharp(asset(config.background))
    .resize(zoomedWidth, zoomedHeight, { fit: "cover", position: "center" });
  if (zoom > 1) {
    background = background.extract({
      left: Math.round((zoomedWidth - width * renderScale) / 2),
      top: Math.round((zoomedHeight - height * renderScale) / 2),
      width: width * renderScale,
      height: height * renderScale,
    });
  }
  const resizedBackground = await background.toBuffer();

  const rendered = await sharp(resizedBackground)
    .composite([{ input: overlay }])
    .png()
    .toBuffer();

  await sharp(rendered)
    .resize(width, height, { kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 90, effort: 6 })
    .toFile(asset(config.output));
  console.log(config.output);
}

Promise.all(configs.map(build)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
