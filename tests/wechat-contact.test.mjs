import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]); }
for(const file of ['app','components','lib'].flatMap(files).filter(file=>/\.(tsx?|jsx?)$/.test(file))) {
  assert.ok(!/open\.kakao\.com|kakaoUrl|\bxyzteam\b|카카오톡/.test(fs.readFileSync(file,'utf8')),file);
}
const site=fs.readFileSync('lib/site.ts','utf8');
assert.ok(site.includes('discordUsername: "supremeteam"'));
assert.ok(site.includes('telegramUsername: "supremeteam11"'));
assert.ok(site.includes('https://www.discord.com/users/1555261040894279790'));
assert.ok(site.includes('https://t.me/KRsupremeteam'));
assert.ok(site.includes('contactUrl: "/inquiry"'));
const contact=fs.readFileSync('components/ui/ContactChannels.tsx','utf8');
assert.ok(contact.includes('site.discordUrl') && contact.includes('site.telegramUrl'));
for (const file of ['components/ui/ContactChannels.tsx', 'components/layout/Footer.tsx', 'components/layout/FloatingContact.tsx']) {
  const source = fs.readFileSync(file, 'utf8');
  assert.ok(source.includes('site.discordUrl'), file);
  assert.ok(source.includes('site.telegramUrl'), file);
  assert.ok(!source.includes('위챗'), file);
}
const inquiry=fs.readFileSync('app/inquiry/page.tsx','utf8');
assert.ok(inquiry.includes('<ContactChannels />'));
assert.ok(!inquiry.includes('InquiryBoard'));
const api=fs.readFileSync('app/api/inquiry/route.ts','utf8');
assert.ok(api.includes('status: 410'));
assert.ok(!api.includes('createInquiry'));
assert.ok(api.includes('getInquiryList'));
const payment=fs.readFileSync('components/home/HomePaymentGuide.tsx','utf8');
assert.ok(payment.includes('카카오페이'));
assert.ok(payment.includes('https://contents.kakaopay.com/contents/1040'));
console.log('PASS: Discord and Telegram-only contact with exact destination URLs, closed new inquiries, preserved records and payment methods.');
