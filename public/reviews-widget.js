(function () {
  // ====== HELPERS ======
  function formatReviewDate(unixSeconds) {
    const d = new Date(unixSeconds * 1000);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function starsHTML(n) {
    const full = "★".repeat(Math.round(n));
    const empty = "☆".repeat(5 - Math.round(n));
    return `<span class="grw-stars">${full}${empty}</span>`;
  }

  function cardStarsHTML(n) {
    const full = "★".repeat(n);
    const empty = "☆".repeat(5 - n);
    return `<div class="grw-stars-inline">${full}${empty}</div>`;
  }

  function truncateAuthorName(name) {
    if (!name) return "Google user";
    return name.length > 25 ? name.slice(0, 22) + "..." : name;
  }

  function truncateTo4Lines(text) {
    if (!text) return { truncated: "<i>No comment provided</i>", needsMore: false };
    
    // Remove HTML tags for counting
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    // Calculate approximate characters for 4 lines (line-height: 1.3, font-size: 0.95em)
    // Roughly 15-20 characters per line depending on card width
    const charsPerLine = 18;
    const maxChars = charsPerLine * 4;
    
    if (cleanText.length <= maxChars) {
      return { truncated: text, needsMore: false };
    }
    
    // Truncate to fit approximately 4 lines
    const truncated = cleanText.slice(0, maxChars - 3) + "...";
    return { truncated, needsMore: true, fullText: text };
  }

  function getBackendOrigin() {
    const s =
      document.currentScript ||
      Array.from(document.getElementsByTagName("script")).find((el) =>
        (el.src || "").includes("reviews-widget.js")
      );
    try {
      return new URL(s.src).origin;
    } catch (_) {
      return window.location.origin;
    }
  }

  // ====== RENDER ONE WIDGET ======
  async function renderOne(container) {
    const placeId = container.getAttribute("data-place-id");
    const width = container.getAttribute("data-width") || "100%";
    const height = container.getAttribute("data-height") || "auto";
    const backendOverride = container.getAttribute("data-backend");
    const backend = backendOverride || getBackendOrigin();

    container.innerHTML = `<div style="padding:16px;font-family:Arial,sans-serif;color:#555">Loading reviews…</div>`;
    container.style.display = "block";
    container.style.width = width;
    container.style.height = height;
    container.style.overflow = "visible";

    try {
      const res = await fetch(
        `${backend}/api/reviews?place_id=${encodeURIComponent(placeId)}`
      );
      const data = await res.json();

      if (!data || !data.reviews || !Array.isArray(data.reviews)) {
        container.innerHTML =
          `<div style="padding:16px;font-family:Arial,sans-serif;color:#777">No reviews found.</div>`;
        return;
      }

      // ====== TEMPLATE ======
      const html = `
<style>
/* ==== WIDGET WRAPPER ==== */
.grw-wrap {
  font-family: Arial, Helvetica, sans-serif;
  background:#fff;
  border-radius:clamp(12px,2vw,20px);
  box-shadow:0 6px 18px rgba(0,0,0,.06);
  padding:clamp(12px,2vw,24px);
  overflow:hidden;
  width:100%;
  box-sizing:border-box;
}
/* ==== HEADER ==== */
.grw-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:clamp(8px,1.5vw,16px);
}
.grw-left h3 {
  margin:0;
  font-size:clamp(14px,2vw,20px);
  color:#1a73e8;
  display:flex;
  align-items:center;
  gap:clamp(4px,1vw,8px);
}
.grw-left h3 img {
  width:clamp(16px,2.5vw,24px);
  height:clamp(16px,2.5vw,24px);
}
.grw-rating-row {
  display:flex;
  align-items:center;
  gap:clamp(4px,1vw,8px);
  margin-top:clamp(4px,1vw,8px);
}
.grw-score { font-size:clamp(14px,1.8vw,18px); font-weight:700; color:#222 }
.grw-stars { color:#ffc107; font-size:clamp(12px,1.5vw,16px); letter-spacing:1px }
.grw-total { color:#6b7280; font-size:clamp(9px,1.1vw,12px) }
.grw-cta {
  background:#1a73e8;
  color:#fff;
  border:none;
  padding:clamp(6px,1.2vw,10px) clamp(8px,1.5vw,16px);
  border-radius:20px;
  font-weight:600;
  cursor:pointer;
  text-decoration:none;
  display:inline-block;
  font-size:clamp(9px,1.1vw,12px);
}
.grw-cta:hover { background:#1664cb }

/* ==== ROW ==== */
.grw-row {
  display:flex;
  gap:clamp(2px,0.5vw,4px);
  padding:clamp(2px,0.5vw,4px) 0;
  width:100%;
  overflow-x:hidden;
}

/* Mobile only - allow horizontal scrolling */
@media (max-width: 768px) {
  .grw-row {
    overflow-x:auto;
  }
  .grw-card {
    flex:0 0 calc(50% - 2px);
  }
  .grw-row::-webkit-scrollbar {
    height:6px;
  }
  .grw-row::-webkit-scrollbar-track {
    background:#f1f1f1;
    border-radius:3px;
  }
  .grw-row::-webkit-scrollbar-thumb {
    background:#c1c1c1;
    border-radius:3px;
  }
  .grw-row::-webkit-scrollbar-thumb:hover {
    background:#a8a8a8;
  }
}

/* ==== CARD ==== */
.grw-card {
  flex:1;
  min-width:0;
  background:#fafafa;
  border:1px solid #eee;
  border-radius:clamp(6px,1vw,10px);
  padding:clamp(8px,1vw,12px);
  min-height:clamp(140px,18vh,200px);
  font-size:clamp(11px,1.3vw,15px);
  position:relative;
  display:flex;
  flex-direction:column;
  gap:clamp(3px,0.6vw,6px);
}
.grw-author {
  display:flex;
  align-items:center;
  gap:clamp(4px,0.8vw,8px);
  margin-bottom:clamp(4px,0.8vw,8px);
  flex-shrink:0;
}
.grw-avatar {
  width:clamp(24px,3.5vw,32px);
  height:clamp(24px,3.5vw,32px);
  border-radius:50%;
  object-fit:cover;
  background:#e5e7eb;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:bold;
  color:#555;
  font-size:0.9em;
}
.grw-name {
  font-weight:700;
  color:#222;
  font-size:1.2em;
  line-height:1.1;
  max-width:100%;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  cursor:help;
}
.grw-date {
  font-size:0.9em;
  color:#6b7280;
  margin-top:1px;
}
.grw-stars-inline {
  color:#ffc107;
  margin:2px 0 4px 0;
  letter-spacing:1px;
  font-size:1.1em;
  flex-shrink:0;
}

/* ==== TEXT ==== */
.grw-text {
  font-size:0.95em;
  color:#374151;
  line-height:1.3;
  max-height:5.2em;
  overflow-y:auto;
  overflow-x:hidden;
  position:relative;
  word-wrap:break-word;
  word-break:break-word;
  text-align:left;
  flex:1;
  padding-right:8px;
}
.grw-text.expanded {
  max-height: 160px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding-right: 8px !important;
}
.grw-text a {
  color:#1a73e8;
  text-decoration:none;
  cursor:pointer;
}
.grw-read-more {
  color:#1a73e8;
  cursor:pointer;
  font-size:0.85em;
  display:inline;
  transition:color 0.2s ease;
  font-weight:600;
  margin-left:2px;
}
.grw-read-more:hover {
  text-decoration:underline;
  color:#1664cb;
}

/* ==== SMALL SCROLLBAR ==== */
.grw-text::-webkit-scrollbar {
  width:4px;
}
.grw-text::-webkit-scrollbar-track {
  background:#f1f1f1;
  border-radius:2px;
}
.grw-text::-webkit-scrollbar-thumb {
  background:#c1c1c1;
  border-radius:2px;
}
.grw-text::-webkit-scrollbar-thumb:hover {
  background:#a8a8a8;
}

/* ==== FOOTER ==== */
.grw-footer {
  text-align:center;
  margin-top:clamp(4px,0.8vw,8px);
}
.grw-link {
  background:transparent;
  color:#1a73e8;
  padding:clamp(4px,0.8vw,8px) clamp(8px,1.5vw,16px);
  border:1px solid #e0e0e0;
  border-radius:clamp(6px,1vw,12px);
  text-decoration:none;
  font-weight:500;
  display:inline-block;
  font-size:clamp(9px,1.1vw,12px);
  transition:all 0.2s ease;
}
.grw-link:hover {
  background:#f8f9fa;
  border-color:#1a73e8;
  color:#1664cb;
}
</style>

<div class="grw-wrap" style="max-width:${width};width:100%">
  <div class="grw-header">
    <div class="grw-left">
      <h3><img src="${data.logo_path || '/g.jpg'}" alt="Google"/> Reviews</h3>
      <div class="grw-rating-row">
        <span class="grw-score">${data.rating ?? "-"}</span>
        ${starsHTML(data.rating || 0)}
        <span class="grw-total">(${data.user_ratings_total ?? 0})</span>
      </div>
    </div>
    <a class="grw-cta" href="${data.url}" target="_blank" rel="noopener">Review us on Google</a>
  </div>

  <div class="grw-row">
    ${data.reviews.slice(0, 5).map((r) => {
      const avatar = r.profile_photo_url || null;

      const avatarHTML = avatar
        ? `<img class="grw-avatar" src="${avatar}" alt="${r.author_name}"/>`
        : `<div class="grw-avatar">${(r.author_name || "U")[0]}</div>`;

      const when =
        typeof r.time === "number"
          ? formatReviewDate(r.time)
          : r.relative_time_description || "";

      const reviewText = r.text || "<i>No comment provided</i>";
      const authorName = truncateAuthorName(r.author_name);
      const fullAuthorName = r.author_name || "Google user";
      const { truncated, needsMore, fullText } = truncateTo4Lines(reviewText);

      const text = needsMore
        ? `<div class="grw-text">
             ${truncated}<span class="grw-read-more" data-full-text="${fullText.replace(/"/g, '&quot;')}">Read more</span>
           </div>`
        : `<div class="grw-text">${truncated}</div>`;

      return `
      <div class="grw-card">
        <div class="grw-author">
          ${avatarHTML}
          <div>
            <div class="grw-name" title="${fullAuthorName}">${authorName}</div>
            <div class="grw-date">${when}</div>
          </div>
        </div>
        ${cardStarsHTML(r.rating || 0)}
        ${text}
      </div>`;
    }).join("")}
  </div>

  <div class="grw-footer">
    <a class="grw-link" href="${data.url}" target="_blank" rel="noopener">View all reviews</a>
  </div>
</div>
`;

      container.innerHTML = html;
      
      // Add click event listeners for "Read more" buttons
      container.querySelectorAll('.grw-read-more').forEach(button => {
        button.addEventListener('click', function() {
          const fullText = this.getAttribute('data-full-text');
          const textElement = this.parentElement;
          
          // Replace content and add expanded class
          textElement.innerHTML = fullText;
          textElement.classList.add('expanded');
          
          // Force style update
          textElement.style.maxHeight = '160px';
          textElement.style.overflowY = 'auto';
          textElement.style.paddingRight = '8px';
        });
      });
      
    } catch (e) {
      container.innerHTML =
        `<div style="padding:16px;font-family:Arial,sans-serif;color:#b91c1c">Failed to load reviews.</div>`;
    }
  }

  // ====== INIT ALL ======
  async function init() {
    const blocks = document.querySelectorAll(".google-reviews-widget");
    if (!blocks.length) return;
    for (const el of blocks) await renderOne(el);
  }

  init();
})();