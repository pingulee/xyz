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
    zoom: 1.16,
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
  const titleSize = 156;
  const subtitleSize = 54;
  const titleY = 535;
  const subtitleY = 628;
  const overlay = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width * renderScale}" height="${height * renderScale}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="lowerShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#050504" stop-opacity="0"/>
        <stop offset=".42" stop-color="#050504" stop-opacity=".08"/>
        <stop offset="1" stop-color="#050504" stop-opacity=".48"/>
      </linearGradient>
      <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#fffbe8"/>
        <stop offset=".18" stop-color="#ffe8a1"/>
        <stop offset=".43" stop-color="#d9a33e"/>
        <stop offset=".63" stop-color="#8f5916"/>
        <stop offset=".82" stop-color="#dcae4f"/>
        <stop offset="1" stop-color="#fff0ad"/>
      </linearGradient>
      <linearGradient id="panelStroke" x1="0" y1="0" x2="1" y2="0">
        <stop stop-color="#b67b27" stop-opacity="0"/>
        <stop offset=".2" stop-color="#e9c56b" stop-opacity=".72"/>
        <stop offset=".5" stop-color="#fff0a4"/>
        <stop offset=".8" stop-color="#e9c56b" stop-opacity=".72"/>
        <stop offset="1" stop-color="#b67b27" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="textVignette">
        <stop offset="0" stop-color="#030303" stop-opacity=".82"/>
        <stop offset=".58" stop-color="#030303" stop-opacity=".55"/>
        <stop offset="1" stop-color="#030303" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-25%" y="-50%" width="150%" height="220%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
        <feOffset dy="8"/>
        <feComponentTransfer><feFuncA type="linear" slope=".88"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="goldGlow" x="-30%" y="-80%" width="160%" height="260%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="#dca642" flood-opacity=".48"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${inserts}
    ${ranks}
    <rect y="0" width="${width}" height="${height}" fill="url(#lowerShade)"/>
    <ellipse cx="768" cy="512" rx="650" ry="300" fill="url(#textVignette)"/>
    <g text-anchor="middle" font-family="Gmarket Sans TTF, Gmarket Sans, Noto Sans KR, Malgun Gothic, sans-serif">
      <g fill="none" stroke="url(#panelStroke)" stroke-linecap="round">
        <path d="M350 365 H674" stroke-width="2"/>
        <path d="M862 365 H1186" stroke-width="2"/>
        <path d="M350 674 H1186" stroke-width="2" opacity=".72"/>
      </g>
      <path d="M768 351 l14 14 -14 14 -14 -14z" fill="#d7a644" stroke="#fff0a4" stroke-width="1.5"/>
      <text x="768" y="372" font-size="22" font-weight="700" letter-spacing="8" fill="#f4d887">XYZ PREMIUM SERVICE</text>
      <g font-weight="700" filter="url(#shadow)">
        <text x="768" y="${titleY}" font-size="${titleSize}" letter-spacing="-3" fill="url(#goldText)" stroke="#5b350d" stroke-width="6" stroke-linejoin="round" paint-order="stroke fill" filter="url(#goldGlow)">${config.title}</text>
        <text x="768" y="${titleY - 3}" font-size="${titleSize}" letter-spacing="-3" fill="none" stroke="#fff5c6" stroke-width="1.25" stroke-opacity=".74">${config.title}</text>
        <text x="768" y="${subtitleY}" font-size="${subtitleSize}" letter-spacing="1" fill="#fff4cb" stroke="#3b230b" stroke-width="2" paint-order="stroke fill">${config.subtitle}</text>
      </g>
      <circle cx="350" cy="674" r="4" fill="#efd27b"/>
      <circle cx="1186" cy="674" r="4" fill="#efd27b"/>
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
