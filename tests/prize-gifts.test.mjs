import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "google_ai_vibe_a_thon.html");
const html = fs.readFileSync(pagePath, "utf8");

test("reward pool exposes one prize detail dialog", () => {
  assert.match(html, /id="openPrizeGiftModal"/, "missing prize detail entry button");
  assert.match(html, /id="prizeGiftModal"/, "missing prize detail dialog");
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
});

test("dialog contains the exact three prize tiers and gift inventory", () => {
  for (const tier of ["Top 6 作品奖励", "Top 30 入围奖", "直播连麦作品奖励"]) {
    assert.match(html, new RegExp(tier), `missing tier: ${tier}`);
  }

  for (const gift of [
    "Google 限定城市机能背包",
    "Google Hot Reload 限定感温杯",
    "GDG 出海创想赛限定机能马甲",
    "Google 限定城市户外棒球帽",
    "Goodr 蓝镜户外运动太阳镜",
    "Google 限定全檐户外探索帽",
    "GDG 出海创想赛限定纪念 T 恤",
  ]) {
    assert.match(html, new RegExp(gift, "i"), `missing gift: ${gift}`);
  }
});

test("supplied design concepts are present", () => {
  for (const copy of [
    "Dev go Global",
    "开发者社群互联协作",
    "开发者共创出海赛事内核",
  ]) {
    assert.match(html, new RegExp(copy), `missing design concept: ${copy}`);
  }
});

test("all eight supplied images resolve locally and have alt text", () => {
  const images = [...html.matchAll(/<img\s+[^>]*src="(assets\/prizes\/[^"]+)"[^>]*alt="([^"]+)"[^>]*>/g)];
  const uniqueSources = new Set(images.map(([, src]) => src));

  assert.equal(uniqueSources.size, 8, "all eight supplied prize images should be used");
  for (const [, src, alt] of images) {
    assert.ok(alt.trim().length >= 2, `${src} needs useful alt text`);
    assert.ok(fs.existsSync(path.join(root, src)), `missing local image: ${src}`);
  }
});

test("Q&A group modal regenerates the current WeChat invite through the QR API", () => {
  assert.match(html, /src="https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?size=512x512&amp;margin=16&amp;data=https%3A%2F%2Fweixin\.qq\.com%2Fg%2FAQYAAJp1QrG2HQJP1nM-1pCugECcz9agrkKc32qpvQqvoJ_gAeTCw--alNZUMG3Z"/);
  assert.match(html, /onerror="this\.onerror=null; this\.src='eventgroup\.jpg';"/);
  assert.ok(fs.existsSync(path.join(root, "eventgroup.jpg")), "eventgroup.jpg fallback should exist");
});

test("top navigation removes only the standalone Google lockup", () => {
  const nav = html.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.doesNotMatch(nav, /<!-- Google -->/);
  assert.match(nav, /小红书/);
  assert.match(nav, />GDG</);
  assert.match(nav, /谷歌开发者大会/);
});
