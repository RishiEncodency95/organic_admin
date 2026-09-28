const fs = require('fs');

const SITE_URL = 'https://bharatorganicexpo.com';
const API_KEY = process.env.PAGESPEED_API_KEY || 'AIzaSyDAkRG0nCY2vs3SFRGF5xI9ufFattuKHIg';
const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

const paths = [
  "/",
  "/about-expo",
  "/why-visit",
  "/exhibitor-registration",
  "/contact-us",
  "/exhibition-categories",
  "/visitor-registration",
  "/participate-as-exhibitor",
  "/sponsorship-opportunities",
  "/floor-plan",
  "/conference-seminars",
  "/b2b-matchmaking",
  "/organic-certification",
  "/exhibitor-list",
  "/venue-pragati-maidan",
  "/travel-accommodation",
  "/advisory-board",
  "/supporting-organizations",
  "/media-press-releases",
  "/photo-video-gallery",
  "/downloads-brochures",
  "/faq",
  "/privacy-policy",
  "/terms-conditions",
  "/refund-cancellation",
  "/awards-recognition",
  "/startup-pavilion",
  "/export-buyer-lounge"
];

async function run() {
  const results = [];
  console.log(`Starting real PageSpeed fetch for ${paths.length} URLs...`);
  
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    const url = `${SITE_URL}${p}`;
    console.log(`[${i+1}/${paths.length}] Fetching ${url}...`);
    
    try {
      const res = await fetch(`${ENDPOINT}?url=${url}&key=${API_KEY}&strategy=mobile&category=performance&category=seo`);
      
      if (!res.ok) {
        console.error(`Failed ${url}: ${res.status} ${await res.text()}`);
        // If quota exceeded, we can't continue the rest
        if (res.status === 429) {
          console.error("Quota exceeded! Stopping.");
          break;
        }
        continue;
      }
      
      const data = await res.json();
      const lhouse = data.lighthouseResult;
      if (!lhouse) continue;
      
      const perfScore = (lhouse.categories.performance?.score || 0) * 100;
      const seoScore = (lhouse.categories.seo?.score || 0) * 100;
      
      const lcp = lhouse.audits['largest-contentful-paint']?.numericValue / 1000 || 0;
      const cls = lhouse.audits['cumulative-layout-shift']?.numericValue || 0;
      
      results.push({ path: p, perfScore, seoScore, lcp, cls });
      console.log(`  -> Perf: ${perfScore}, SEO: ${seoScore}, LCP: ${lcp.toFixed(2)}s, CLS: ${cls.toFixed(3)}`);
      
    } catch (err) {
      console.error(`Error on ${url}:`, err.message);
    }
    
    // sleep to avoid rapid quota limit
    await new Promise(r => setTimeout(r, 2000));
  }
  
  fs.writeFileSync('pagespeed_results.json', JSON.stringify(results, null, 2));
  console.log('Done! Saved to pagespeed_results.json');
}

run();
