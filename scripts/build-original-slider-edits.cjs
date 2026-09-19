/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const width = 1448;
const height = 1086;

const asset = (relativePath) => path.join(root, "public", "images", relativePath);
const dataUri = (relativePath) => {
  const extension = path.extname(relativePath).slice(1);
  const mime = extension === "png" ? "image/png" : `image/${extension}`;
  return `data:${mime};base64,${fs.readFileSync(asset(relativePath)).toString("base64")}`;
};

const configs = [
  {
    output: "slider/01-edited.webp",
    background: "slider/01.webp",
    title: "롤 대리",
    subtitle: "목표 티어까지 안전하게",
    inserts: [
      {
        source: "lol/boosting-game-source.webp",
        x: 350,
        y: 566,
        width: 515,
        height: 330,
        points: "368,574 840,584 856,887 350,878",
      },
    ],
    badge: { source: "tier/10-challenger.png", x: 178, y: 822, size: 108 },
  },
  {
    output: "slider/02-edited.webp",
    background: "slider/02.webp",
    title: "롤 듀오",
    subtitle: "함께하는 플레이",
    inserts: [
      {
        source: "lol/duo-game-source.webp",
        x: 350,
        y: 438,
        width: 380,
        height: 365,
        points: "367,452 711,455 715,791 351,781",
      },
      {
        source: "lol/duo-game-source.webp",
        x: 801,
        y: 438,
        width: 405,
        height: 365,
        points: "812,451 1192,449 1207,781 813,792",
        position: "right",
      },
    ],
    badge: { source: "tier/8-master.png", x: 688, y: 654, size: 92 },
  },
  {
    output: "slider/03-edited.webp",
    background: "slider/03.webp",
    title: "롤 계정",
    subtitle: "취향에 맞는 계정",
    inserts: [
      {
        source: "services/account-game-source.webp",
        x: 193,
        y: 420,
        width: 1060,
        height: 382,
        points: "205,432 1239,432 1253,786 194,786",
      },
    ],
  },
  {
    output: "slider/04-edited.webp",
    background: "slider/01.webp",
    title: "롤 육성",
    subtitle: "매크로 없는 100% 수동 육성",
    inserts: [
      {
        source: "lol/leveling-game-source.webp",
        x: 350,
        y: 566,
        width: 515,
        height: 330,
        points: "368,574 840,584 856,887 350,878",
      },
    ],
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

async function build(config) {
  const inserts = config.inserts.map(insertMarkup).join("\n");
  const badge = config.badge
    ? `<image href="${dataUri(config.badge.source)}" x="${config.badge.x}" y="${config.badge.y}" width="${config.badge.size}" height="${config.badge.size}"/>`
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
    ${badge}
    <rect y="650" width="${width}" height="436" fill="url(#lowerShade)"/>
    <g text-anchor="middle" font-family="Noto Serif KR, Malgun Gothic, sans-serif" filter="url(#shadow)">
      <text x="724" y="915" font-size="112" font-weight="800" letter-spacing="-5" fill="url(#goldText)" stroke="#6f4c13" stroke-width="2">${config.title}</text>
      <text x="724" y="982" font-size="38" font-weight="700" letter-spacing="-1" fill="#f2d68b">${config.subtitle}</text>
    </g>
  </svg>`);

  await sharp(asset(config.background))
    .composite([{ input: overlay }])
    .webp({ quality: 90, effort: 6 })
    .toFile(asset(config.output));
  console.log(config.output);
}

Promise.all(configs.map(build)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
