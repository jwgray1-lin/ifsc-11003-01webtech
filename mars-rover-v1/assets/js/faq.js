(function(){})()
// mars-rover-v1/assets/js/faq.js
// Client-side Q&A assistant moved to external file for reliability.
/*
  DISCLAIMER / AUTHOR NOTE

  This JavaScript file was created with the assistance of an AI programming assistant.
  The interactive FAQ feature, keyword-based responses, and debugging help were
  produced with AI support. However, the idea to add this feature, the testing,
  and the final code corrections and verification were performed by the project
  author (student). If you have questions about which parts were authored by the
  student versus generated or suggested by the assistant, please contact the
  project author for clarification.

  The author affirms that they have reviewed and understand all code in this file,
  and take full responsibility for its content and functionality.
*/
(function () {
  'use strict';
  try {
    console.log('FAQ assistant script loaded');
    const statusEl = document.getElementById('faq-status');
    if (statusEl) statusEl.textContent = 'Status: script loaded';
    const form = document.getElementById('ask-form');
    const input = document.getElementById('question-input');
    const feed = document.getElementById('qa-feed');
    const clearBtn = document.getElementById('clear-qa');
    const STORAGE_KEY = 'mars_faq_qas_v1';

    if (!form || !input || !feed) {
      console.error('FAQ assistant: required DOM elements not found');
      return;
    }

    function nowIso() { return new Date().toISOString(); }

    function generateResponse(question) {
      const q = String(question || '').trim();
      const lower = q.toLowerCase();
      if (!lower) return escapeHtml('Please enter a question.');

      // Helper to build safe regex for keyword matching (word-boundary)
      function kwRx(kw) {
        const esc = String(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp('\\b' + esc + '\\b', 'i');
      }

      // Keyword map: each entry has keywords (array), answer HTML, and priority.
      const knowledge = [
        {
          id: 'nasa-org',
          keys: ['what does nasa do', 'what is nasa', 'what does nasa', 'nasa'],
          html: `NASA (the National Aeronautics and Space Administration) is the United States civil space agency. NASA leads and funds scientific discovery, space exploration, aeronautics research, and technology development. Its work includes:
            <ul>
              <li>Robotic and human spaceflight missions to study the solar system (rovers, orbiters, landers).</li>
              <li>Earth science programs that monitor our planet's climate, weather, and environment.</li>
              <li>Aeronautics research to improve aviation safety and efficiency.</li>
              <li>Technology development and partnerships with industry and academia to enable future exploration.</li>
              <li>Public data release, education, and outreach so scientists, educators, and the public can use mission data and imagery.</li>
            </ul>
            <p>For official overviews and programs, see <a href="https://www.nasa.gov/" target="_blank" rel="noopener">NASA.gov</a>.</p>`,
          prio: 11
        },
        {
          id: 'what-is-a-rover',
          keys: ['what is a rover', 'rover', 'mars rover', 'what are rovers'],
          html: `A rover is a robotic vehicle designed to move across the surface of another world (like Mars) to study geology, atmosphere, and search for signs of past habitability. Rovers typically carry scientific instruments (cameras, spectrometers, drills), communications equipment, and power systems. They are driven remotely by mission teams and increasingly use autonomous navigation to traverse terrain. Examples include <strong>Curiosity</strong> and <strong>Perseverance</strong>.`,
          prio: 10
        },
        {
          id: 'perseverance-overview',
          keys: ['perseverance', 'what is perseverance', 'what is perseverance doing'],
          html: `Perseverance is a Mars rover launched in 2020 with goals to search for signs of ancient microbial life, collect and cache rock and soil samples for a future sample-return mission, and test technologies for future human exploration. It carries instruments for imaging, spectroscopy, and sample handling, plus the Ingenuity helicopter as a technology demonstrator.`,
          prio: 10
        },
        {
          id: 'rover-mobility',
          keys: ['how do rovers move', 'how rovers move', 'wheels', 'mobility', 'drive'],
          html: `Most Mars rovers use a rocker-bogie suspension with six wheels; each wheel has its own motor so the rover can climb, turn, and handle rough terrain. Navigation combines ground commands from mission teams with onboard autonomy (stereo cameras and hazard detection) so rovers can plan short drives without waiting for Earth.`,
          prio: 8
        },
        {
          id: 'rover-lifespan',
          keys: ['how long do rovers last', 'lifespan', 'mission duration', 'how long'],
          html: `Rovers are designed for mission lifetimes measured in months to years. For example, Curiosity was designed for at least one Mars year (~687 Earth days) and continues to operate many years later. Actual lifetime depends on power, wear to wheels and instruments, and environmental factors.`,
          prio: 7
        },
        {
          id: 'reuse-images',
          keys: ['reuse images', 'reuse nasa images', 'reuse', 'copyright', 'can i use nasa images'],
          html: `Most NASA imagery created by NASA staff is public domain and may be reused without permission, but best practice is to provide attribution (e.g., "NASA/JPL-Caltech"). Third-party images or those with non-NASA contributors may have restrictions — always check the image caption and source. For official guidance, see NASA's media usage policies.`,
          prio: 7
        },
        {
          id: 'report-problem',
          keys: ['report', 'report problem', 'typo', 'contact', 'how to report'],
          html: `To report typos or technical issues with this site, click the "Report a problem" link in the footer or contact the site author (if an email is provided). Include a clear description, the page URL, and a screenshot if possible so the issue can be reproduced and fixed.`,
          prio: 6
        },
        {
          id: 'mission-naming',
          keys: ['how missions are named', 'mission name', 'naming'],
          html: `Mission names are chosen by mission teams and stakeholders and may reflect mission goals, sponsors, or historical references. For example, "Perseverance" was selected via a naming contest and reflects the rover's scientific and exploratory goals.`,
          prio: 5
        },
        {
          id: 'perseverance-sample',
          keys: ['sample', 'sample return', 'cache', 'perseverance'],
          html: `Perseverance is caching samples for a future sample-return mission; details and timelines are managed by NASA mission teams. <a href="https://mars.nasa.gov/mars2020/" target="_blank" rel="noopener">Learn more about Mars 2020 / Perseverance</a>`,
          prio: 10
        },
        {
          id: 'ingenuity',
          keys: ['ingenuity', 'helicopter', 'scout'],
          html: `Ingenuity is a technology demonstration that has completed multiple scouting flights to aid rover operations; its status is maintained by the mission team. <a href="https://mars.nasa.gov/technology/helicopter/" target="_blank" rel="noopener">Read Ingenuity updates</a>`,
          prio: 9
        },
        {
          id: 'curiosity',
          keys: ['curiosity', 'msl'],
          html: `Curiosity is a mobile laboratory that continues to operate on Mars; it collects geochemical and environmental data to study habitability. <a href="https://mars.nasa.gov/msl/" target="_blank" rel="noopener">Curiosity mission page</a>`,
          prio: 8
        },
        {
          id: 'images',
          keys: ['image', 'images', 'photo', 'photos', 'where images'],
          html: `Many mission images are available from NASA's official mission pages and the NASA image library. <a href="https://images.nasa.gov/" target="_blank" rel="noopener">Browse NASA images</a>`,
          prio: 7
        },
        {
          id: 'how-when-what',
          keys: ['how', 'when', 'what', 'details', 'timeline'],
          html: `That's a great question — this site provides summaries. For technical details, check NASA's mission pages or our <a href="mission-history.html">Mission History</a> section. <a href="https://mars.nasa.gov/" target="_blank" rel="noopener">Official Mars program</a>`,
          prio: 5
        }
      ];

      // Score entries based on number of matched keywords.
      const matches = knowledge.map(k => {
        let score = 0;
        const matchedKeys = [];
        k.keys.forEach(key => {
          if (kwRx(key).test(lower)) { score++; matchedKeys.push(key); }
        });
        return { id: k.id, score: score, prio: k.prio, html: k.html, matchedKeys };
      }).filter(m => m.score > 0);

      if (matches.length === 0) {
        return `Thanks for your question — here's a brief answer based on the site data. For in-depth information, consult NASA mission archives or ask a specific follow-up question. <a href="https://mars.nasa.gov/" target="_blank" rel="noopener">NASA Mars</a>`;
      }

      // Sort by score then priority.
      matches.sort((a,b) => (b.score - a.score) || (b.prio - a.prio));

      // If multiple top matches have the same score, combine up to two answers.
      const topScore = matches[0].score;
      const topMatches = matches.filter(m => m.score === topScore).slice(0,2);
      const combined = topMatches.map(m => m.html).join('<hr style="opacity:0.08;margin:0.8rem 0">');

      // Expose last match info for debugging
      try { window.MarsFaqLastMatch = topMatches.map(m => ({id:m.id, matchedKeys:m.matchedKeys, score:m.score})); } catch (e) {}

      return combined;
    }

    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function renderItem(item) {
      const el = document.createElement('div');
      el.className = 'qa-item';
      // If the stored answer contains markup (links), render it as HTML; otherwise escape it.
      const answerHtml = /<[^>]+>/.test(String(item.a || '')) ? String(item.a) : escapeHtml(item.a);
      el.innerHTML = `\n        <div class="question"><strong>Q:</strong> ${escapeHtml(item.q)}</div>\n        <div class="answer"><strong>A:</strong> ${answerHtml}</div>\n        <div class="meta">Answered: ${new Date(item.t).toLocaleString()}</div>\n      `;
      return el;
    }

    function load() {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list = [];
      try { list = raw ? JSON.parse(raw) : []; } catch (e) { list = []; console.warn('FAQ assistant: corrupted storage, clearing'); localStorage.removeItem(STORAGE_KEY); }
      feed.innerHTML = '';
      list.forEach(i => feed.appendChild(renderItem(i)));
    }

    function saveAndRender(q, a) {
      const item = { q: q, a: a, t: nowIso() };
      const raw = localStorage.getItem(STORAGE_KEY);
      let list = [];
      try { list = raw ? JSON.parse(raw) : []; } catch (e) { list = []; }
      list.unshift(item);
      list = list.slice(0,25);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      feed.insertBefore(renderItem(item), feed.firstChild);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      const a = generateResponse(q);
      saveAndRender(q, a);
      input.value = '';
      input.focus();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!confirm('Clear saved Q&A? This cannot be undone.')) return;
        localStorage.removeItem(STORAGE_KEY);
        feed.innerHTML = '';
      });
    }

    // Debug run button (visible on page) — quickly insert a test Q&A
    const debugBtn = document.getElementById('debug-run');
    if (debugBtn) {
      debugBtn.addEventListener('click', function () {
        const q = 'Test: Ingenuity status?';
        const a = generateResponse('ingenuity');
        saveAndRender(q, a);
        if (statusEl) statusEl.textContent = 'Status: ran debug test';
      });
    }

    // initialize
    load();
    console.log('FAQ assistant initialized');
    if (statusEl) statusEl.textContent = 'Status: ready';
    // Expose a tiny debug API for console testing
    try {
      window.MarsFaq = {
        generateResponse: function (q) { return generateResponse(q); },
        saveAndRender: function (q, a) { return saveAndRender(q, a); },
        storageKey: STORAGE_KEY
      };
      console.log('FAQ assistant debug API exposed as window.MarsFaq');
    } catch (e) {
      // non-critical
    }
  } catch (err) {
    console.error('FAQ assistant failed', err);
    try { const s = document.getElementById('faq-status'); if (s) s.textContent = 'Status: failed — see console'; } catch (e) { /* ignore */ }
  }
})();
