import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/lib/site";

// 메일 발송. Hostinger SMTP(발신 admin@도메인)를 nodemailer로 쓴다.
// 자격증명은 전부 env — 코드/레포에 넣지 않는다.
//   SMTP_HOST (기본 smtp.hostinger.com), SMTP_PORT (기본 465), SMTP_SECURE (기본 true),
//   SMTP_USER, SMTP_PASS, MAIL_FROM (기본 = SMTP_USER)
const globalForMail = globalThis as typeof globalThis & {
  mailTransport?: Transporter;
};

function getTransport(): Transporter {
  if (!globalForMail.mailTransport) {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) {
      throw new Error("SMTP_USER/SMTP_PASS 미설정 — 메일 발송 불가");
    }
    const port = Number(process.env.SMTP_PORT ?? 465);
    globalForMail.mailTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user, pass },
    });
  }
  return globalForMail.mailTransport;
}

function fromAddress(): string {
  return process.env.MAIL_FROM ?? process.env.SMTP_USER ?? "";
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  await getTransport().sendMail({
    from: fromAddress(),
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

// 공통 레이아웃(간단 인라인). 브랜드 = site.brand.
function wrap(title: string, bodyHtml: string): string {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
    <h2 style="margin:0 0 16px">${site.brand}</h2>
    <p style="font-weight:700;margin:0 0 12px">${title}</p>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="font-size:12px;color:#888">본 메일은 발신 전용입니다. 요청하지 않으셨다면 무시하세요.</p>
  </div>`;
}

export async function sendUsernameEmail(to: string, username: string): Promise<void> {
  await sendMail({
    to,
    subject: `[${site.brand}] 아이디 안내`,
    text: `요청하신 계정의 아이디는 다음과 같습니다: ${username}`,
    html: wrap(
      "아이디 안내",
      `<p>요청하신 계정의 아이디는 다음과 같습니다.</p>
       <p style="font-size:18px;font-weight:800">${username}</p>`,
    ),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendMail({
    to,
    subject: `[${site.brand}] 비밀번호 재설정`,
    text: `아래 링크에서 비밀번호를 재설정하세요(1시간 내 유효):\n${resetUrl}`,
    html: wrap(
      "비밀번호 재설정",
      `<p>아래 버튼을 눌러 비밀번호를 재설정하세요. (1시간 내 유효)</p>
       <p><a href="${resetUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">비밀번호 재설정</a></p>
       <p style="font-size:12px;color:#888;word-break:break-all">${resetUrl}</p>`,
    ),
  });
}
