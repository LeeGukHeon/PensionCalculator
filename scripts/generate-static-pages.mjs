import fs from "node:fs";
import path from "node:path";
import { GUIDE_POSTS } from "../src/utils/guideData.js";
import { SITE_URL, SITE_NAME } from "../src/constants/site.js";

const OUTPUT_ROOT = path.resolve("public");
const GUIDE_CONTENT_ROOT = path.resolve("public/content/guides");
const POLICY_CONTENT_ROOT = path.resolve("public/content/policies");

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInline(text) {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return output;
}

function isTableRow(line) {
  return line.includes("|") && /^\|?.+\|.+\|?$/.test(line);
}

function parseTableCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function markdownToSimpleHtml(markdown) {
  const lines = markdown.split("\n");
  const html = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      closeLists();
      continue;
    }

    if (line === "---") {
      closeLists();
      html.push("<hr />");
      continue;
    }

    if (line.startsWith("### ")) {
      closeLists();
      html.push(`<h3>${formatInline(line.replace("### ", ""))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      closeLists();
      html.push(`<h2>${formatInline(line.replace("## ", ""))}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      closeLists();
      html.push(`<h1>${formatInline(line.replace("# ", ""))}</h1>`);
      continue;
    }

    if (isTableRow(line) && i + 1 < lines.length && /^\|?\s*[:\-\s|]+\|?\s*$/.test(lines[i + 1].trim())) {
      closeLists();
      const headers = parseTableCells(line);
      const tableRows = [];
      i += 2;
      while (i < lines.length && isTableRow(lines[i].trim())) {
        tableRows.push(parseTableCells(lines[i].trim()));
        i += 1;
      }
      i -= 1;

      const thead = `<thead><tr>${headers.map((cell) => `<th>${formatInline(cell)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${tableRows
        .map((row) => `<tr>${row.map((cell) => `<td>${formatInline(cell)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inUl) {
        closeLists();
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${formatInline(line.replace(/^-\s+/, ""))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${formatInline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${formatInline(line)}</p>`);
  }

  closeLists();
  return html.join("\n");
}

function wrapPage({ title, description, canonicalPath, contentHtml }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <style>
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif; background: #f8fafc; color: #0f172a; }
      .container { max-width: 860px; margin: 0 auto; padding: 24px; }
      .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; }
      h1,h2,h3 { line-height: 1.4; margin-top: 28px; margin-bottom: 12px; }
      p,li { line-height: 1.9; color: #334155; }
      ul,ol { padding-left: 20px; }
      a { color: #2563eb; text-decoration: none; }
      .top-link { display: inline-block; margin-bottom: 16px; }
      .notice { margin-top: 24px; font-size: 14px; color: #64748b; }
      hr { border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
      th { background: #f1f5f9; }
      code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <main class="container">
      <div class="card">
        <a class="top-link" href="/guide">← 가이드 목록</a>
        ${contentHtml}
        <p class="notice">정확한 계산 및 최신 기준은 <a href="/">연금계산기 메인</a>에서 확인하세요.</p>
      </div>
    </main>
  </body>
</html>`;
}

function writeRouteHtml(routePath, html) {
  const filePath = path.join(OUTPUT_ROOT, routePath, "index.html");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, "utf8");
}

function generateGuideListPage() {
  const items = GUIDE_POSTS.map(
    (post) => `<li><a href="/guide/${post.id}">${escapeHtml(post.title)}</a> <small>(${escapeHtml(post.date)})</small></li>`,
  ).join("\n");

  const contentHtml = `<h1>연금 가이드</h1>\n<p>국민연금, 기초연금, 노후자금 관련 장문 가이드 목록입니다.</p>\n<ul>${items}</ul>`;
  const html = wrapPage({
    title: `연금 가이드 | ${SITE_NAME}`,
    description:
      "국민연금, 기초연금, 노후자금 관련 장문 가이드를 한 곳에서 확인하세요.",
    canonicalPath: "/guide",
    contentHtml,
  });
  writeRouteHtml("guide", html);
}

function generateGuideDetailPages() {
  for (const post of GUIDE_POSTS) {
    const markdownPath = path.join(GUIDE_CONTENT_ROOT, `${post.slug}.md`);
    const markdown = fs.readFileSync(markdownPath, "utf8");
    const htmlBody = markdownToSimpleHtml(markdown);
    const html = wrapPage({
      title: `${post.title} | 연금 가이드`,
      description: post.description,
      canonicalPath: `/guide/${post.id}`,
      contentHtml: htmlBody,
    });
    writeRouteHtml(path.join("guide", String(post.id)), html);
  }
}

function generatePolicyPages() {
  const policyConfig = [
    {
      file: "privacy.md",
      route: "privacy",
      title: `개인정보처리방침 | ${SITE_NAME}`,
      description: "연금계산기 서비스의 개인정보 처리 방침과 쿠키 운영 정책입니다.",
    },
    {
      file: "terms.md",
      route: "terms",
      title: `이용약관 | ${SITE_NAME}`,
      description: "연금계산기 서비스 이용 약관과 책임 범위를 안내합니다.",
    },
    {
      file: "contact.md",
      route: "contact",
      title: `문의하기 | ${SITE_NAME}`,
      description: "오류 제보, 기능 건의, 제휴 문의를 위한 공식 문의 채널입니다.",
    },
  ];

  for (const policy of policyConfig) {
    const markdown = fs.readFileSync(path.join(POLICY_CONTENT_ROOT, policy.file), "utf8");
    const htmlBody = markdownToSimpleHtml(markdown);
    const html = wrapPage({
      title: policy.title,
      description: policy.description,
      canonicalPath: `/${policy.route}`,
      contentHtml: htmlBody,
    });
    writeRouteHtml(policy.route, html);
  }
}

generateGuideListPage();
generateGuideDetailPages();
generatePolicyPages();

console.log("Generated static route HTML pages for guide and policy routes.");
