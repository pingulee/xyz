/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const width = 1536;
const height = 1024;

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
    background: "lol/leveling-game-source.webp",
    title: "롤 육성",
    subtitle: "매크로 없는 100% 수동 육성",
    frame: true,
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
  const overlay = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="lowerShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#050504" stop-opacity="0"/>
        <stop offset=".48" stop-color="#050504" stop-opacity=".18"/>
        <stop offset="1" stop-color="#050504" stop-opacity=".9"/>
      </linearGradient>
      <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#fff5c8"/>
        <stop offset=".35" stop-color="#f4d47f"/>
        <stop offset=".6" stop-color="#c18b31"/>
        <stop offset="1" stop-color="#f0c866"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-40%" width="140%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
        <feOffset dy="6"/>
        <feComponentTransfer><feFuncA type="linear" slope=".85"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${inserts}
    ${ranks}
    <rect y="610" width="${width}" height="414" fill="url(#lowerShade)"/>
    ${frame}
    <g text-anchor="middle" font-family="Noto Sans KR, Malgun Gothic, sans-serif" filter="url(#shadow)">
      <text x="768" y="828" font-size="112" font-weight="700" letter-spacing="-5" fill="url(#goldText)" stroke="#6f4c13" stroke-width="2">${config.title}</text>
      <text x="768" y="909" font-size="44" font-weight="700" letter-spacing="-1" fill="#f2d68b">${config.subtitle}</text>
    </g>
  </svg>`);

  const resizedBackground = await sharp(asset(config.background))
    .resize(width, height, { fit: "cover", position: "center" })
    .toBuffer();

  await sharp(resizedBackground)
    .composite([{ input: overlay }])
    .webp({ quality: 90, effort: 6 })
    .toFile(asset(config.output));
  console.log(config.output);
}

Promise.all(configs.map(build)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
