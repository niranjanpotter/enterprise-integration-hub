(function () {
  'use strict';

  /* ===== Toast ===== */
  var toastTimer = null;
  function showToast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ===== Mobile Nav Drawer ===== */
  window.toggleMobileNav = function (forceState) {
    var drawer = document.getElementById('mobile-nav-drawer');
    var btn = document.getElementById('mobile-menu-btn');
    if (!drawer) return;
    var next = typeof forceState === 'boolean' ? forceState : !drawer.classList.contains('open');
    drawer.classList.toggle('open', next);
    if (btn) btn.setAttribute('aria-expanded', next ? 'true' : 'false');
  };

  /* ===== Sticky CTA Jump Helpers ===== */
  window.jumpToJwtTool = function () {
    window.toggleMobileNav(false);
    var jwtTabBtn = document.querySelector('#util-tabs .seg-btn');
    if (jwtTabBtn) window.switchUtilTab('util-jwt', jwtTabBtn);
    var sec = document.getElementById('dev-utilities');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function () {
      var inp = document.getElementById('jwt-input');
      if (inp) inp.focus();
    }, 350);
  };

  window.jumpToRadarTool = function () {
    window.toggleMobileNav(false);
    var sec = document.getElementById('platform-radar');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ===== Radar Platform Card Expand / Collapse ===== */
  window.toggleRadarCard = function (cardEl) {
    if (!cardEl) return;
    var exp = cardEl.classList.toggle('expanded');
    var btn = cardEl.querySelector('.radar-read-more');
    if (btn) {
      btn.textContent = exp ? 'Show Less ↑' : 'Read More ↓';
      btn.setAttribute('aria-expanded', exp ? 'true' : 'false');
    }
  };

  /* ===== Theme Toggle ===== */
  var savedTheme = localStorage.getItem('eih_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  function syncThemeBtn() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    btn.textContent = isLight ? '🌙' : '☀️';
    btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
  }
  window.toggleTheme = function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('eih_theme', cur);
    syncThemeBtn();
  };

  /* ===== Full Screen (CSS Fixed Overlay + Scroll Restore + ESC) ===== */
  var activeFsEl = null;
  var activeFsBtn = null;
  var savedScrollY = 0;

  window.toggleSectionFs = function (sectionId, btnEl) {
    var el = document.getElementById(sectionId);
    if (!el) return;
    if (activeFsEl === el) {
      el.classList.remove('fs-active');
      document.body.style.overflow = '';
      if (activeFsBtn) activeFsBtn.textContent = '⛶ Full Screen';
      activeFsEl = null;
      activeFsBtn = null;
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
      return;
    }
    if (activeFsEl) {
      activeFsEl.classList.remove('fs-active');
      if (activeFsBtn) activeFsBtn.textContent = '⛶ Full Screen';
    }
    savedScrollY = window.scrollY;
    activeFsEl = el;
    activeFsBtn = btnEl;
    el.classList.add('fs-active');
    document.body.style.overflow = 'hidden';
    if (btnEl) btnEl.textContent = '✕ Exit Full Screen (ESC)';
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.toggleMobileNav(false);
      if (activeFsEl && activeFsBtn) {
        window.toggleSectionFs(activeFsEl.id, activeFsBtn);
      }
    }
  });

  /* ===== 1. Integration Pattern Advisor & ADR Generator ===== */
  var advisorAudience = 'architect';

  window.applyAdvisorPreset = function (key, btn) {
    document.querySelectorAll('.preset-chip').forEach(function (c) { c.classList.toggle('active', c === btn); });
    var map = {
      spike: ['async', 'high', 'fifo', 'aws', 'audit'],
      sfsap: ['bidir', 'med', 'fifo', 'sf-sap', 'audit'],
      etl: ['bulk', 'high', 'atleast', 'legacy', 'cost'],
      aimcp: ['sync', 'med', 'atleast', 'ai-mcp', 'latency']
    };
    var v = map[key];
    if (!v) return;
    document.getElementById('adv-mode').value = v[0];
    document.getElementById('adv-volume').value = v[1];
    document.getElementById('adv-delivery').value = v[2];
    document.getElementById('adv-eco').value = v[3];
    document.getElementById('adv-priority').value = v[4];
    renderAdvisor();
  };

  function computeRecommendation(mode, volume, delivery, eco, priority) {
    var title = '', flow = [], why = '', execPitch = '', deliveryPlan = '', antipatterns = [], mapping = [];
    var sla = { latency: '150–400ms', resilience: '99.95%', complexity: 'Medium' };

    if (eco === 'ai-mcp') {
      title = 'Governed AI Gateway + MCP Tool Proxy + Semantic Cache';
      sla = { latency: '< 50ms (cached) / 1.2s', resilience: '99.9% (multi-LLM)', complexity: 'Medium-High' };
      flow = [
        ['Client / Agent', 'AI Agent / Copilot'],
        ['Gateway', 'API & PII Policy Layer'],
        ['AI Proxy', 'Model Proxy + Semantic Cache'],
        ['Protocol', 'MCP Server / Tools'],
        ['Backend', 'Enterprise System APIs']
      ];
      why = 'Never let an AI agent query your database directly. Put an MCP proxy and gateway in front of your System APIs, strip PII before prompts leave your network, and cache repeated questions so your LLM bill doesn\'t explode. Makes sense?';
      execPitch = 'Keeps customer PII out of public LLMs, cuts AI token bills by 35–60%, and lets you swap OpenAI, Claude, or Gemini without rewriting code.';
      deliveryPlan = 'Plan for 2–3 sprints (1 Architect + 2 Devs). Lock down InfoSec PII redaction rules in week 1, define MCP tool schemas in week 2, and test LLM fallback limits before go-live.';
      antipatterns = [
        'Giving AI agents direct database credentials or a shared super-admin token.',
        'Hardcoding a single LLM provider with no fallback or token budget cap.',
        'Logging raw user prompts containing PII or card numbers into plain log files.'
      ];
      mapping = [
        ['API & AI Governance', 'MuleSoft Omni Gateway + Agent Fabric / Model Proxy', 'AWS Bedrock Guardrails + API Gateway', 'Azure AI Foundry + APIM'],
        ['Agent Tooling', 'MuleSoft MCP Connector + Topic Center', 'Workato Enterprise MCP + VUA', 'OpenAPI / MCP Tool Adapters'],
        ['Audit & Telemetry', 'OpenTelemetry Direct Telemetry', 'CloudWatch + X-Ray', 'OpenTelemetry + Dynatrace / Datadog']
      ];
    } else if (mode === 'bulk') {
      title = 'Asynchronous Bulk Staging + Chunked Batch Pipeline + Idempotent Upsert';
      sla = { latency: 'Batch Window (Mins)', resilience: '99.99% (Replayable)', complexity: 'Medium' };
      flow = [
        ['Source', 'Bulk Extract / S3 / SFTP'],
        ['Ingestion', 'Chunked Streaming Reader'],
        ['Processing', 'Parallel Batch Aggregator'],
        ['Target API', 'Bulk API 2.0 / Staging Table'],
        ['Recovery', 'Dead-Letter Replay + Watermark']
      ];
      why = 'If you try pushing 500,000 rows through a normal REST loop, you\'ll blow up your memory or hit API limits in 10 minutes. Stream the file in chunks, upsert with an External ID, and save your watermark so a crash at row 400,000 doesn\'t start over from row 1.';
      execPitch = 'Moves millions of records overnight within your SLA window with zero duplicate records and automatic recovery if the target system hiccups.';
      deliveryPlan = 'Plan for 2 sprints (1 Lead + 1 Dev + 1 QA). Test early with a real 1M-row file in staging — a 100-row dev test hides every memory bug.';
      antipatterns = [
        'Calling a synchronous REST endpoint row-by-row inside a loop for >10,000 records.',
        'Loading a 2 GB CSV or JSON file entirely into memory instead of streaming it.',
        'Upserting without an External ID or idempotency key (creates duplicates on retry).'
      ];
      mapping = [
        ['Batch Runtime', 'Mule 4 Batch Job + ObjectStore Watermark', 'AWS Step Functions + Glue / Lambda', 'Apache Spark / Azure Data Factory'],
        ['Target Ingestion', 'Salesforce Bulk API 2.0 / SAP OData Batch', 'S3 Staging + Snowflake COPY INTO', 'JDBC Batch Upsert'],
        ['Error Isolation', 'Batch On-Complete + Anypoint MQ DLQ', 'SQS DLQ + S3 Error Bucket', 'Kafka Dead-Letter Topic']
      ];
    } else if (mode === 'bidir') {
      title = 'Event-Driven Bidirectional Sync with Loop-Guard & Idempotency Store';
      sla = { latency: '< 2s Near Real-Time', resilience: '99.95% (DLQ Replay)', complexity: 'High' };
      flow = [
        ['System A', 'CDC / Platform Events'],
        ['Event Mesh', 'Kafka / Anypoint MQ FIFO'],
        ['Orchestrator', 'Loop-Guard + Canonical Map'],
        ['State Store', 'Idempotency Key + Hash'],
        ['System B', 'System API Upsert (Ext ID)']
      ];
      why = 'When Salesforce updates SAP and SAP fires an event right back to Salesforce, you get an infinite ping-pong loop. Filter out your integration service user and check a SHA-256 hash of the payload in Redis or ObjectStore before writing back. Right?';
      execPitch = 'Keeps Salesforce and SAP in sync within 2 seconds while preventing infinite update loops and surprise API overage bills.';
      deliveryPlan = 'Plan for 3–4 sprints (1 Architect + 2 Devs + Salesforce/SAP Admins). Agree on which system owns each field on day 1 before writing any code.';
      antipatterns = [
        'Syncing two systems both ways without ignoring updates made by the integration user.',
        'Relying only on system clocks/timestamps without clear field-ownership rules.',
        'Forgetting event retention limits when SAP goes down for a 12-hour weekend upgrade.'
      ];
      mapping = [
        ['Change Capture', 'Salesforce Pub/Sub API (gRPC) / CDC (ReplayId)', 'Debezium CDC + Amazon MSK (Kafka)', 'SAP Advanced Event Mesh / OData Delta'],
        ['Loop & State Guard', 'ObjectStore v2 / Redis Idempotent Validator', 'DynamoDB Conditional Put (TTL)', 'Redis / Postgres Upsert Hash'],
        ['Resilience', 'Anypoint MQ FIFO + DLQ Replay Flow', 'AWS SQS FIFO + EventBridge Replay', 'Kafka Consumer Offsets + DLT']
      ];
    } else if (mode === 'async' || delivery === 'fifo' || volume === 'high') {
      title = 'Event-Driven Decoupled Mesh (Broker + FIFO + Idempotent Consumer + DLQ)';
      sla = { latency: '< 80ms Ack (202)', resilience: '99.99% (Zero-Loss)', complexity: 'Medium-High' };
      flow = [
        ['Producer', 'Experience API (202 Accepted)'],
        ['Broker', 'Kafka / Anypoint MQ / SQS FIFO'],
        ['Consumer', 'Auto-Scaling Process Workers'],
        ['Guardrail', 'Idempotency + Circuit Breaker'],
        ['Target + DLQ', 'System APIs + Replay Queue']
      ];
      why = 'Don\'t make a customer checkout page wait 6 seconds for a slow ERP. Accept the order onto a durable queue, return HTTP 202 in 80ms, and process it at a safe pace with a Dead-Letter Queue catching anything that fails.';
      execPitch = 'Zero lost customer orders even when your backend ERP goes down for maintenance or traffic spikes 10× on sale day.';
      deliveryPlan = 'Plan for 2–3 sprints (1 Architect + 2 Devs + DevOps). Provision queues and DLQ replay flows via Terraform and run a real poison-message drill before launch.';
      antipatterns = [
        'Holding synchronous HTTP connections open while waiting on slow (>3s) backend systems.',
        'Retrying forever without exponential backoff or a Dead-Letter Queue.',
        'Assuming a queue delivers a message only once without an idempotency check.'
      ];
      mapping = [
        ['Message Broker', 'Anypoint MQ (FIFO) / Confluent Kafka', 'Amazon SQS FIFO / EventBridge / MSK', 'Azure Service Bus / Kafka'],
        ['API Layer', 'API-Led (XAPI → MQ → PAPI → SAPI)', 'API Gateway → SQS → Lambda / ECS', 'Kong / Apigee → Microservices'],
        ['Observability', 'Correlation ID + OpenTelemetry Traces', 'AWS X-Ray + CloudWatch Logs', 'Grafana Tempo + Prometheus']
      ];
    } else {
      title = 'API-Led Synchronous Orchestration with Edge Caching & Circuit Breaker';
      sla = { latency: '120–350ms P95', resilience: '99.9% (Circuit Breaker)', complexity: 'Low-Medium' };
      flow = [
        ['Consumer', 'Web / Mobile / Partner'],
        ['Edge Gateway', 'OAuth2 / JWT + Rate Limit'],
        ['Experience API', 'Channel-Shaped Contract'],
        ['Process API', 'Parallel Scatter-Gather + Cache'],
        ['System APIs', 'Salesforce / SAP / Cloud DB']
      ];
      why = 'When the user needs an answer on screen right now, call independent backends in parallel (Scatter-Gather), cache reference data at the edge, and set strict timeouts so one slow backend doesn\'t hang your whole app.';
      execPitch = 'Cuts screen load times in half while keeping your core Salesforce and SAP APIs reusable across web, mobile, and partner apps.';
      deliveryPlan = 'Plan for 1–2 sprints (2 Devs + 1 QA). Lock the OpenAPI/RAML contract first so frontend and backend teams can build in parallel without waiting.';
      antipatterns = [
        'Calling 4 backend APIs one after another when they could run in parallel.',
        'Exposing raw SAP or database column names directly to a mobile app.',
        'Returning HTTP 200 OK when a critical write actually failed underneath.'
      ];
      mapping = [
        ['API Gateway', 'MuleSoft Omni Gateway / API Manager', 'AWS API Gateway + WAF', 'Apigee / Kong Enterprise'],
        ['Orchestration', 'Mule 4 Scatter-Gather + ObjectStore Cache', 'AWS AppSync / Node/Java Aggregator', 'GraphQL Federation / Spring Boot'],
        ['Security', 'OAuth 2.0 JWT + mTLS + Client ID Enforcement', 'Cognito / Okta + IAM SigV4', 'Entra ID / OAuth 2.0 + mTLS']
      ];
    }

    if (priority === 'latency') {
      why += ' Keep downstream timeouts under 1.5s, enable HTTP connection pooling, and cache read-heavy lookups.';
    } else if (priority === 'audit') {
      why += ' Pass X-Correlation-Id across every hop, log immutable audit trails, and enforce mTLS + RBAC.';
    } else if (priority === 'cost') {
      why += ' Right-size your worker replicas, cache repetitive reads, and don\'t run oversized 24/7 clusters for a job that runs once a night.';
    }

    return { title: title, sla: sla, flow: flow, why: why, execPitch: execPitch, deliveryPlan: deliveryPlan, antipatterns: antipatterns, mapping: mapping };
  }

  var lastAdrMarkdown = '';

  function renderAdvisor() {
    var mode = document.getElementById('adv-mode').value;
    var volume = document.getElementById('adv-volume').value;
    var delivery = document.getElementById('adv-delivery').value;
    var eco = document.getElementById('adv-eco').value;
    var priority = document.getElementById('adv-priority').value;

    var rec = computeRecommendation(mode, volume, delivery, eco, priority);

    document.getElementById('adv-sla-strip').innerHTML =
      '<div class="sla-pill">Target Latency: <span>' + rec.sla.latency + '</span></div>' +
      '<div class="sla-pill">Resilience Tier: <span>' + rec.sla.resilience + '</span></div>' +
      '<div class="sla-pill">Ops Complexity: <span>' + rec.sla.complexity + '</span></div>';

    document.getElementById('adv-flow').innerHTML = rec.flow.map(function (n, idx) {
      return '<div class="flow-node"><div class="flow-node-tag">' + n[0] + '</div><div class="flow-node-name">' + n[1] + '</div></div>' +
        (idx < rec.flow.length - 1 ? '<div class="flow-arrow" aria-hidden="true">→</div>' : '');
    }).join('');

    document.getElementById('adv-pattern-title').textContent = rec.title;
    if (advisorAudience === 'delivery') {
      document.getElementById('adv-why-label').textContent = '2. Delivery Plan & Critical Path';
      document.getElementById('adv-why').textContent = rec.deliveryPlan;
      document.getElementById('adv-pitch-label').textContent = '4. Go-Live Readiness Gate';
      document.getElementById('adv-pitch').textContent = 'Don\'t go live until you have 85%+ unit/MUnit test coverage, a 2× peak load test pass, a working DLQ replay button, and an alert runbook.';
    } else if (advisorAudience === 'exec') {
      document.getElementById('adv-why-label').textContent = '2. Executive / CTO Business Value';
      document.getElementById('adv-why').textContent = rec.execPitch;
      document.getElementById('adv-pitch-label').textContent = '4. Delivery & Governance Next Step';
      document.getElementById('adv-pitch').textContent = 'Run a 2-week proof-of-concept testing throughput, failover, and end-to-end correlation logs before committing the full budget.';
    } else {
      document.getElementById('adv-why-label').textContent = '2. Why This Works in Production';
      document.getElementById('adv-why').textContent = rec.why;
      document.getElementById('adv-pitch-label').textContent = '4. One-Line Summary for Your Team';
      document.getElementById('adv-pitch').textContent = rec.execPitch;
    }

    document.getElementById('adv-antipatterns').innerHTML = rec.antipatterns.map(function (a) { return '<li>' + a + '</li>'; }).join('');
    document.getElementById('adv-map-body').innerHTML = rec.mapping.map(function (row) {
      return '<tr><td><strong>' + row[0] + '</strong></td><td>' + row[1] + '</td><td>' + row[2] + '</td><td>' + row[3] + '</td></tr>';
    }).join('');

    lastAdrMarkdown = [
      '# ADR: ' + rec.title,
      '',
      '**Status:** Proposed  ',
      '**Author:** Enterprise Integration Hub (https://niranjanpotter.dpdns.org)  ',
      '**Context:** Mode=' + mode + ' | Volume=' + volume + ' | Delivery=' + delivery + ' | Ecosystem=' + eco + ' | Priority=' + priority,
      '**Target SLA:** Latency ' + rec.sla.latency + ' | Resilience ' + rec.sla.resilience,
      '',
      '## Decision',
      rec.why,
      '',
      '## Delivery Plan',
      rec.deliveryPlan,
      '',
      '## Business Value',
      rec.execPitch,
      '',
      '## Flow',
      rec.flow.map(function (n) { return n[1]; }).join(' -> '),
      '',
      '## Mistakes to Avoid',
      rec.antipatterns.map(function (a) { return '- ' + a; }).join('\n'),
      '',
      '## Platform Mapping',
      '| Layer | MuleSoft | AWS / Cloud | Enterprise Alt |',
      '| :--- | :--- | :--- | :--- |',
      rec.mapping.map(function (r) { return '| ' + r.join(' | ') + ' |'; }).join('\n')
    ].join('\n');
  }

  window.setAdvisorAudience = function (aud, btn) {
    advisorAudience = aud;
    document.querySelectorAll('#adv-audience-group .seg-btn').forEach(function (b) {
      b.classList.toggle('active', b === btn);
    });
    renderAdvisor();
  };

  window.copyAdrMarkdown = function () {
    if (!lastAdrMarkdown) renderAdvisor();
    navigator.clipboard.writeText(lastAdrMarkdown).then(function () {
      showToast('Copied Markdown ADR to clipboard!');
    }).catch(function () {
      showToast('Copy failed — please copy manually.');
    });
  };

  /* ===== 2. Enterprise Reference Blueprints ===== */
  var BLUEPRINTS = {
    'sf-sap': {
      title: 'Bidirectional Salesforce ↔ SAP S/4HANA Sync',
      summary: 'How we keep CRM and ERP accounts in sync within 2 seconds without triggering an infinite update storm.',
      svg: '<svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Salesforce to SAP Bidirectional Architecture">' +
        '<rect width="920" height="230" rx="12" fill="#0D0D0D"/>' +
        '<rect x="24" y="62" width="150" height="96" rx="12" fill="#161616" stroke="#22c55e" stroke-width="2"/>' +
        '<text x="99" y="102" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">Salesforce CRM</text>' +
        '<text x="99" y="124" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">CDC / Platform Events</text>' +
        '<line x1="174" y1="95" x2="238" y2="95" stroke="#22c55e" stroke-width="2"/><polygon points="238,90 248,95 238,100" fill="#22c55e"/>' +
        '<line x1="248" y1="125" x2="184" y2="125" stroke="#A1A1AA" stroke-width="2"/><polygon points="184,120 174,125 184,130" fill="#A1A1AA"/>' +
        '<rect x="248" y="48" width="180" height="124" rx="12" fill="#161616" stroke="#A1A1AA" stroke-width="1.5"/>' +
        '<text x="338" y="84" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">Event Mesh / MQ</text>' +
        '<text x="338" y="108" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">FIFO + ReplayId Store</text>' +
        '<text x="338" y="132" fill="#22c55e" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">DLQ Auto-Replay</text>' +
        '<line x1="428" y1="110" x2="492" y2="110" stroke="#22c55e" stroke-width="2"/><polygon points="492,105 502,110 492,115" fill="#22c55e"/>' +
        '<rect x="502" y="48" width="188" height="124" rx="12" fill="#161616" stroke="#22c55e" stroke-width="2"/>' +
        '<text x="596" y="84" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">Process &amp; Loop Guard</text>' +
        '<text x="596" y="108" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Filter Integration User</text>' +
        '<text x="596" y="132" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">SHA-256 Payload Hash</text>' +
        '<line x1="690" y1="110" x2="744" y2="110" stroke="#22c55e" stroke-width="2"/><polygon points="744,105 754,110 744,115" fill="#22c55e"/>' +
        '<rect x="754" y="62" width="142" height="96" rx="12" fill="#161616" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="825" y="102" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">SAP S/4HANA</text>' +
        '<text x="825" y="124" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">OData v4 / IDoc</text>' +
        '</svg>',
      cards: [
        ['How We Stop Infinite Loops', 'We use a dedicated integration service user and store a SHA-256 hash of every synced payload. If the hash hasn\'t changed, we drop the echo event right there.'],
        ['What Happens When SAP Is Down', 'We save the Salesforce ReplayId in ObjectStore/Redis and route failed writes into an Anypoint MQ / SQS Dead-Letter Queue so everything replays in order once SAP is back.'],
        ['Real Result', 'Zero duplicate invoices and sync time dropped from a 15-minute batch job down to under 2 seconds.']
      ]
    },
    'cloud-mig': {
      title: 'Zero-Downtime Legacy-to-Cloud-Native Migration',
      summary: 'Move from old EC2/on-prem servers to CloudHub 2.0 or Kubernetes Private Spaces without breaking a single client app.',
      svg: '<svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zero Downtime Cloud Migration Blueprint">' +
        '<rect width="920" height="230" rx="12" fill="#0D0D0D"/>' +
        '<rect x="24" y="68" width="150" height="84" rx="12" fill="#161616" stroke="#22c55e" stroke-width="2"/>' +
        '<text x="99" y="104" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">API Consumers</text>' +
        '<text x="99" y="126" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Zero Client Change</text>' +
        '<line x1="174" y1="110" x2="238" y2="110" stroke="#22c55e" stroke-width="2"/><polygon points="238,105 248,110 238,115" fill="#22c55e"/>' +
        '<rect x="248" y="54" width="190" height="112" rx="12" fill="#161616" stroke="#A1A1AA" stroke-width="1.5"/>' +
        '<text x="343" y="92" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">Edge Gateway / DNS</text>' +
        '<text x="343" y="114" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Weighted Canary</text>' +
        '<text x="343" y="136" fill="#22c55e" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">10% → 50% → 100%</text>' +
        '<line x1="438" y1="86" x2="530" y2="62" stroke="#22c55e" stroke-width="2"/>' +
        '<line x1="438" y1="134" x2="530" y2="158" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,4"/>' +
        '<rect x="530" y="24" width="360" height="74" rx="12" fill="#111f16" stroke="#22c55e" stroke-width="2"/>' +
        '<text x="710" y="54" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">New: CloudHub 2.0 / Kubernetes Private Space</text>' +
        '<text x="710" y="76" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">2+ Replicas · Transit Gateway · OTel Telemetry</text>' +
        '<rect x="530" y="128" width="360" height="74" rx="12" fill="#1f1912" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="710" y="158" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">Old: CloudHub 1.0 / On-Prem Runtime</text>' +
        '<text x="710" y="180" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Kept Warm 48h for 30-Second Rollback</text>' +
        '</svg>',
      cards: [
        ['Fix Networking First', 'Set up your Private Space, Transit Gateway, firewall rules, and static IPs before moving a single API. 90% of migration delays are firewall tickets.'],
        ['Shift Traffic Slowly', 'Send 10% of live traffic first, check P95 latency and error logs, then ramp to 50% and 100%.'],
        ['30-Second Escape Hatch', 'Leave the old workers running on standby for 48 hours after cutover so you can flip DNS back in 30 seconds if anything weird happens.']
      ]
    },
    'ai-mcp': {
      title: 'Enterprise AI & Autonomous Agent Integration (MCP + Model Proxy)',
      summary: 'Let AI agents act on real company data through MCP tools without leaking PII or giving them god-mode database access.',
      svg: '<svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Enterprise AI MCP Governance Blueprint">' +
        '<rect width="920" height="230" rx="12" fill="#0D0D0D"/>' +
        '<rect x="24" y="62" width="150" height="96" rx="12" fill="#161616" stroke="#22c55e" stroke-width="2"/>' +
        '<text x="99" y="102" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">AI Agents</text>' +
        '<text x="99" y="124" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Agentforce / Copilots</text>' +
        '<line x1="174" y1="110" x2="234" y2="110" stroke="#22c55e" stroke-width="2"/><polygon points="234,105 244,110 234,115" fill="#22c55e"/>' +
        '<rect x="244" y="48" width="194" height="124" rx="12" fill="#161616" stroke="#A1A1AA" stroke-width="1.5"/>' +
        '<text x="341" y="84" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">AI Gateway &amp; Proxy</text>' +
        '<text x="341" y="108" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">PII Redaction + Quotas</text>' +
        '<text x="341" y="132" fill="#22c55e" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Semantic Cache + Fallback</text>' +
        '<line x1="438" y1="110" x2="498" y2="110" stroke="#22c55e" stroke-width="2"/><polygon points="498,105 508,110 498,115" fill="#22c55e"/>' +
        '<rect x="508" y="48" width="184" height="124" rx="12" fill="#161616" stroke="#22c55e" stroke-width="2"/>' +
        '<text x="600" y="84" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">MCP Tool Layer</text>' +
        '<text x="600" y="108" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Scoped RBAC Actions</text>' +
        '<text x="600" y="132" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Schema Validation</text>' +
        '<line x1="692" y1="110" x2="744" y2="110" stroke="#22c55e" stroke-width="2"/><polygon points="744,105 754,110 744,115" fill="#22c55e"/>' +
        '<rect x="754" y="62" width="142" height="96" rx="12" fill="#161616" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="825" y="102" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">System APIs</text>' +
        '<text x="825" y="124" fill="#A1A1AA" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">ERP · CRM · Billing</text>' +
        '</svg>',
      cards: [
        ['No Direct DB Access', 'Agents only call strict MCP tools backed by your existing System APIs, so all your OAuth2 rules and audit logs still apply.'],
        ['Cut Your LLM Bill', 'Semantic caching answers repeated questions in under 50ms and automatically fails over if OpenAI or Claude slows down.'],
        ['Mask PII at the Door', 'The gateway strips SSNs, phone numbers, and card digits before a prompt ever leaves your company network.']
      ]
    },
    'cross-2026': {
      title: '2026 Cross-Platform Agentic Mesh (Salesforce gRPC + MuleSoft/Workato MCP + SAP Clean Core)',
      summary: 'Combines Salesforce Pub/Sub gRPC pull streaming, Verified User Access (VUA) / Agent Fabric MCP governance, and SAP S/4HANA Clean Core OData v4.',
      svg: '<svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="2026 Cross-Platform Agentic Mesh Blueprint">' +
        '<rect width="920" height="230" rx="12" fill="#0D0D0D"/>' +
        '<rect x="20" y="54" width="170" height="112" rx="12" fill="#161616" stroke="#22c55e" stroke-width="2"/>' +
        '<text x="105" y="88" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">Salesforce</text>' +
        '<text x="105" y="112" fill="#A1A1AA" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Pub/Sub API (gRPC)</text>' +
        '<text x="105" y="134" fill="#22c55e" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Data Cloud Zero-Copy</text>' +
        '<line x1="190" y1="110" x2="242" y2="110" stroke="#22c55e" stroke-width="2"/><polygon points="242,105 252,110 242,115" fill="#22c55e"/>' +
        '<rect x="252" y="42" width="210" height="136" rx="12" fill="#161616" stroke="#22c55e" stroke-width="2"/>' +
        '<text x="357" y="76" fill="#22c55e" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">Omni / Edge MCP Plane</text>' +
        '<text x="357" y="100" fill="#A1A1AA" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">MuleSoft Agent Fabric (A2A)</text>' +
        '<text x="357" y="122" fill="#A1A1AA" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Workato MCP + VUA (OAuth)</text>' +
        '<text x="357" y="146" fill="#fbbf24" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Human-in-Loop Approvals</text>' +
        '<line x1="462" y1="110" x2="514" y2="110" stroke="#22c55e" stroke-width="2"/><polygon points="514,105 524,110 514,115" fill="#22c55e"/>' +
        '<rect x="524" y="54" width="176" height="112" rx="12" fill="#161616" stroke="#A1A1AA" stroke-width="1.5"/>' +
        '<text x="612" y="88" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">SAP Integration Suite</text>' +
        '<text x="612" y="112" fill="#A1A1AA" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Advanced Event Mesh</text>' +
        '<text x="612" y="134" fill="#22c55e" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">SAP Graph + API Mgmt</text>' +
        '<line x1="700" y1="110" x2="744" y2="110" stroke="#f59e0b" stroke-width="2"/><polygon points="744,105 754,110 744,115" fill="#f59e0b"/>' +
        '<rect x="754" y="54" width="146" height="112" rx="12" fill="#161616" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="827" y="92" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">SAP S/4HANA</text>' +
        '<text x="827" y="116" fill="#A1A1AA" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Clean Core (BTP)</text>' +
        '<text x="827" y="138" fill="#22c55e" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">OData v4 Batch</text>' +
        '</svg>',
      cards: [
        ['Verified User Access (VUA)', 'AI agents call MCP tools using the end user\'s own OAuth 2.0 login instead of a shared super-admin token, so CRM/ERP permissions actually work.'],
        ['gRPC Pull Flow Control', 'Salesforce Pub/Sub API replaces old CometD push streams with HTTP/2 + binary Avro pull batches so your consumer never gets flooded.'],
        ['SAP Clean Core Rule', 'All custom orchestration stays outside S/4HANA on SAP BTP, MuleSoft, or Workato via OData v4 and AEM so ERP upgrades don\'t break.']
      ]
    }
  };

  window.selectBlueprint = function (key, btn) {
    var bp = BLUEPRINTS[key];
    if (!bp) return;
    document.querySelectorAll('#bp-tabs .seg-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    document.getElementById('bp-title').textContent = bp.title;
    document.getElementById('bp-summary').textContent = bp.summary;
    document.getElementById('bp-diagram').innerHTML = bp.svg;
    document.getElementById('bp-cards').innerHTML = bp.cards.map(function (c) {
      return '<div class="result-box"><h3>' + c[0] + '</h3><p>' + c[1] + '</p></div>';
    }).join('');
  };

  /* ===== 3. Delivery Manager Sprint & Effort Estimator ===== */
  var lastDeliveryMd = '';
  window.updateDeliveryEstimator = function () {
    var systems = Math.max(1, Math.min(20, Number(document.getElementById('del-systems').value) || 2));
    var comp = document.getElementById('del-complexity').value;
    var sec = document.getElementById('del-security').value;
    var devs = Math.max(1, Math.min(10, Number(document.getElementById('del-devs').value) || 2));

    var mult = comp === 'erp' ? 1.7 : (comp === 'std' ? 1.2 : 0.85);
    var secDays = sec === 'pci' ? 8 : (sec === 'mtls' ? 4 : 1);
    var apiCount = systems + Math.max(1, Math.ceil(systems / 2)) + 1;
    var devDays = Math.round((apiCount * 5.5 * mult) + secDays);
    var qaDays = Math.round(devDays * 0.35);
    var totalDays = devDays + qaDays;
    var sprints = Math.max(1, Math.ceil(totalDays / (devs * 8.5)));
    var risk = (comp === 'erp' || sec === 'pci' || systems >= 5) ? 'HIGH — Run a 1-Sprint Proof-of-Concept First' : (systems >= 3 ? 'MEDIUM — Lock API Contracts in Week 1' : 'LOW — Standard Agile Track');

    document.getElementById('del-kpis').innerHTML =
      '<div class="result-box"><h3>Estimated Timeline</h3><div class="kpi-val">' + sprints + ' Sprint' + (sprints > 1 ? 's' : '') + '</div><p>' + (sprints * 2) + ' weeks (' + totalDays + ' person-days incl. QA/NFR)</p></div>' +
      '<div class="result-box"><h3>Recommended APIs</h3><div class="kpi-val">' + apiCount + ' APIs</div><p>1 XAPI · ' + Math.max(1, Math.ceil(systems / 2)) + ' PAPI · ' + systems + ' SAPI</p></div>' +
      '<div class="result-box"><h3>Test &amp; NFR Buffer</h3><div class="kpi-val">' + qaDays + ' Days</div><p>Unit/MUnit (85%+), Load Test &amp; Failover</p></div>' +
      '<div class="result-box"><h3>Delivery Risk</h3><div class="big-val" style="font-size:0.96rem;">' + risk + '</div><p>Team: ' + devs + ' Eng + Shared Architect</p></div>';

    lastDeliveryMd = [
      '# Integration Delivery Estimate',
      '- **Connected Systems:** ' + systems + ' | **Complexity:** ' + comp.toUpperCase() + ' | **Security:** ' + sec.toUpperCase() + ' | **Team:** ' + devs + ' Engineers',
      '- **Estimated Timeline:** ' + sprints + ' Sprints (' + (sprints * 2) + ' weeks / ' + totalDays + ' person-days)',
      '- **Recommended API Scope:** ' + apiCount + ' APIs (1 XAPI + ' + Math.max(1, Math.ceil(systems / 2)) + ' PAPI + ' + systems + ' SAPI)',
      '- **QA & NFR Buffer:** ' + qaDays + ' person-days (85%+ unit coverage, load test, DLQ replay drill)',
      '- **Risk Assessment:** ' + risk,
      '_Generated via Enterprise Integration Hub (https://niranjanpotter.dpdns.org)_'
    ].join('\n');
  };

  window.copyDeliveryEstimate = function () {
    if (!lastDeliveryMd) window.updateDeliveryEstimator();
    navigator.clipboard.writeText(lastDeliveryMd).then(function () {
      showToast('Copied Delivery Estimate (Markdown)!');
    }).catch(function () {
      showToast('Copy failed.');
    });
  };

  /* ===== 4. Production Readiness & Resilience Scorecard ===== */
  var CHECKS = [
    { id: 'c1', title: 'Idempotency Keys on Writes', sub: 'So a retry never charges a customer twice', risk: 'Duplicate orders or payments when a network call retries' },
    { id: 'c2', title: 'Dead-Letter Queue + Replay', sub: 'Failed async messages never vanish into thin air', risk: 'Permanent data loss when a downstream ERP goes offline' },
    { id: 'c3', title: 'End-to-End Correlation ID', sub: 'Follow one request across XAPI → PAPI → SAPI', risk: 'Hours wasted grepping logs during a 2 AM production outage' },
    { id: 'c4', title: 'Explicit Timeouts & Circuit Breaker', sub: 'Don\'t let one hung vendor freeze all your threads', risk: 'Thread-pool exhaustion taking down unrelated APIs' },
    { id: 'c5', title: 'Zero Secrets in Code or Logs', sub: 'Vault/Secrets Manager + PII masked in logs', risk: 'Leaked credentials or compliance audit failure' },
    { id: 'c6', title: 'High Availability (2+ Replicas)', sub: 'Zero-downtime deploys and multi-AZ failover', risk: 'Single worker restart drops live customer traffic' },
    { id: 'c7', title: 'Contract-First OpenAPI / RAML', sub: 'Schema validation & versioning before coding', risk: 'Silent payload changes breaking mobile or partner apps' },
    { id: 'c8', title: 'OpenTelemetry Traces & Alerts', sub: 'Know about 5xx spikes before your customer does', risk: 'Customers report outages before your ops team notices' }
  ];

  function renderScorecard() {
    var grid = document.getElementById('score-checks');
    if (grid && !grid.dataset.built) {
      grid.dataset.built = '1';
      grid.innerHTML = CHECKS.map(function (c, i) {
        var pre = i < 4 ? ' checked' : '';
        return '<label class="check-item' + (pre ? ' checked' : '') + '">' +
          '<input type="checkbox" data-check-id="' + c.id + '"' + pre + ' onchange="updateScorecard()">' +
          '<span><span class="check-title">' + c.title + '</span><span class="check-sub">' + c.sub + '</span></span>' +
          '</label>';
      }).join('');
    }
    window.updateScorecard();
  }

  window.updateScorecard = function () {
    var boxes = document.querySelectorAll('#score-checks input[type="checkbox"]');
    var checked = 0, missing = [];
    boxes.forEach(function (box, idx) {
      box.closest('.check-item').classList.toggle('checked', box.checked);
      if (box.checked) checked++;
      else missing.push(CHECKS[idx]);
    });
    var pct = Math.round((checked / CHECKS.length) * 100);
    document.getElementById('score-num').textContent = pct + '/100';
    document.getElementById('score-bar-fill').style.width = pct + '%';

    var gradeEl = document.getElementById('score-grade');
    var riskEl = document.getElementById('score-risk');
    if (pct >= 88) {
      gradeEl.innerHTML = '<span class="status-chip status-ok">🏆 Production-Ready Architecture</span>';
      riskEl.textContent = missing.length ? 'Almost there — just add: ' + missing[0].title + '.' : 'All 8 resilience checks passed. Ship it with confidence!';
    } else if (pct >= 50) {
      gradeEl.innerHTML = '<span class="status-chip status-warn">⚠️ Needs Hardening Before Go-Live</span>';
      riskEl.textContent = 'Biggest risk right now: ' + missing[0].risk + '.';
    } else {
      gradeEl.innerHTML = '<span class="status-chip status-err">🚨 High Outage Risk</span>';
      riskEl.textContent = 'Fix this first: ' + missing[0].risk + '.';
    }
  };

  window.copyScorecardShare = function () {
    var score = document.getElementById('score-num').textContent;
    var txt = 'I just ran the 60-Second Integration Readiness Check on Niranjan\'s workbench and scored ' + score + '.\n\nCheck your API before go-live (100% free & client-side): https://niranjanpotter.dpdns.org/#readiness-audit';
    navigator.clipboard.writeText(txt).then(function () {
      showToast('Copied LinkedIn Scorecard text!');
    }).catch(function () {
      showToast('Copy failed.');
    });
  };

  /* ===== 5. Offline Enterprise Dev Utilities ===== */
  window.switchUtilTab = function (tabId, btn) {
    document.querySelectorAll('#util-tabs .seg-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    ['util-jwt', 'util-cron', 'util-spec', 'util-http'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = id === tabId ? 'block' : 'none';
    });
  };

  function b64UrlDecode(str) {
    var pad = str.replace(/-/g, '+').replace(/_/g, '/');
    while (pad.length % 4) pad += '=';
    return decodeURIComponent(escape(atob(pad)));
  }

  window.inspectJwt = function () {
    var raw = (document.getElementById('jwt-input').value || '').trim();
    var out = document.getElementById('jwt-output');
    var status = document.getElementById('jwt-status');
    if (!raw) {
      out.textContent = 'Paste your JWT token on the left. You\'ll see the header, payload, expiry time, and any security red flags right here — 100% inside your browser.';
      status.innerHTML = '';
      return;
    }
    var parts = raw.split('.');
    if (parts.length < 2) {
      out.textContent = 'That doesn\'t look like a valid JWT — it needs 3 dot-separated parts (header.payload.signature).';
      status.innerHTML = '<span class="status-chip status-err">Invalid JWT</span>';
      return;
    }
    try {
      var header = JSON.parse(b64UrlDecode(parts[0]));
      var payload = JSON.parse(b64UrlDecode(parts[1]));
      var flags = [];
      var now = Math.floor(Date.now() / 1000);
      if (!header.alg || String(header.alg).toLowerCase() === 'none') flags.push('CRITICAL: alg is "none" (anyone can forge an unsigned token!).');
      if (payload.exp) {
        if (payload.exp < now) flags.push('EXPIRED at ' + new Date(payload.exp * 1000).toISOString());
        else flags.push('VALID until ' + new Date(payload.exp * 1000).toISOString());
        if (payload.iat && (payload.exp - payload.iat) > 86400) flags.push('WARNING: Token lives longer than 24 hours (' + Math.round((payload.exp - payload.iat) / 3600) + 'h). Keep access tokens short-lived.');
      } else {
        flags.push('WARNING: No "exp" claim — this token never expires!');
      }
      if (!payload.iss) flags.push('NOTE: Missing "iss" (issuer) claim.');
      if (!payload.aud) flags.push('NOTE: Missing "aud" (audience) claim.');

      var isBad = flags.some(function (f) { return f.startsWith('CRITICAL') || f.startsWith('EXPIRED'); });
      var isWarn = flags.some(function (f) { return f.startsWith('WARNING'); });
      status.innerHTML = '<span class="status-chip ' + (isBad ? 'status-err' : (isWarn ? 'status-warn' : 'status-ok')) + '">' +
        (isBad ? 'Expired / Security Issue' : (isWarn ? 'Valid Token Structure (With Warnings)' : 'Valid Token Structure')) + '</span>';

      out.textContent =
        '=== QUICK CHECK ===\n' + flags.map(function (f) { return '• ' + f; }).join('\n') +
        '\n\n=== HEADER ===\n' + JSON.stringify(header, null, 2) +
        '\n\n=== PAYLOAD ===\n' + JSON.stringify(payload, null, 2);
    } catch (e) {
      out.textContent = 'Couldn\'t decode Base64URL JSON: ' + e.message;
      status.innerHTML = '<span class="status-chip status-err">Decode Error</span>';
    }
  };

  window.loadSampleJwt = function () {
    var hdr = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'idp-prod-2026' })).replace(/=/g, '');
    var now = Math.floor(Date.now() / 1000);
    var pay = btoa(JSON.stringify({
      iss: 'https://auth.enterprise.example.com',
      sub: 'svc-order-orchestrator',
      aud: 'https://api.enterprise.example.com/v1',
      scope: 'orders:write sap:sync',
      iat: now - 120,
      exp: now + 3480
    })).replace(/=/g, '');
    document.getElementById('jwt-input').value = hdr + '.' + pay + '.demoSignatureNotVerifiedLocally';
    window.inspectJwt();
  };

  window.applyCronPreset = function (expr) {
    document.getElementById('cron-input').value = expr;
    window.explainCron();
  };

  window.explainCron = function () {
    var raw = (document.getElementById('cron-input').value || '').trim();
    var out = document.getElementById('cron-output');
    var parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length !== 5 && parts.length !== 6) {
      out.textContent = 'Type a 5-field (Linux/AWS) or 6-field (Quartz / Mule 4 / Spring) cron expression.';
      return;
    }
    var isQuartz = parts.length === 6;
    var sec = isQuartz ? parts[0] : '0';
    var min = isQuartz ? parts[1] : parts[0];
    var hr = isQuartz ? parts[2] : parts[1];
    var dom = isQuartz ? parts[3] : parts[2];
    var mon = isQuartz ? parts[4] : parts[3];
    var dow = isQuartz ? parts[5] : parts[4];

    function desc(val, unit) {
      if (val === '*' || val === '?') return 'every ' + unit;
      if (val.indexOf('*/') === 0) return 'every ' + val.slice(2) + ' ' + unit + 's';
      return unit + ' ' + val;
    }
    var summary = 'Runs at ' + desc(hr, 'hour') + ', ' + desc(min, 'minute') +
      (isQuartz ? ' (second ' + sec + ')' : '') + ', on ' + desc(dom, 'day-of-month') +
      ', ' + desc(mon, 'month') + ', ' + desc(dow, 'day-of-week') + '.';

    out.textContent =
      'Format: ' + (isQuartz ? '6-field Quartz (Mule 4 / Spring / Java)' : '5-field Standard Linux / GitHub Actions / K8s') + '\n' +
      'Plain English: ' + summary + '\n\n' +
      'Field Breakdown:\n' +
      (isQuartz ? '  Seconds      : ' + sec + '\n' : '') +
      '  Minutes      : ' + min + '\n' +
      '  Hours        : ' + hr + '\n' +
      '  Day of Month : ' + dom + '\n' +
      '  Month        : ' + mon + '\n' +
      '  Day of Week  : ' + dow + '\n\n' +
      'Copy-Ready Mule 4 Scheduler XML:\n' +
      '<scheduling-strategy>\n  <cron expression="' + (isQuartz ? raw : '0 ' + raw) + '" timeZone="UTC"/>\n</scheduling-strategy>';
  };

  function inferSchema(val, indent, isRaml) {
    var pad = ' '.repeat(indent);
    if (val === null) return isRaml ? pad + 'type: nil' : pad + 'type: string\n' + pad + 'nullable: true';
    if (Array.isArray(val)) {
      var item = val.length > 0 ? inferSchema(val[0], indent + 2, isRaml) : pad + '  type: object';
      return pad + 'type: array\n' + pad + 'items:\n' + item;
    }
    if (typeof val === 'object') {
      var keys = Object.keys(val);
      if (!keys.length) return pad + 'type: object';
      var lines = [pad + 'type: object', pad + 'properties:'];
      keys.forEach(function (k) {
        lines.push(pad + '  ' + k + ':');
        lines.push(inferSchema(val[k], indent + 4, isRaml));
      });
      return lines.join('\n');
    }
    if (typeof val === 'number') return pad + 'type: ' + (Number.isInteger(val) ? 'integer' : 'number') + '\n' + pad + 'example: ' + val;
    if (typeof val === 'boolean') return pad + 'type: boolean\n' + pad + 'example: ' + val;
    return pad + 'type: string\n' + pad + 'example: ' + JSON.stringify(val);
  }

  window.generateSpec = function (fmt) {
    var raw = (document.getElementById('spec-input').value || '').trim();
    var out = document.getElementById('spec-output');
    try {
      var obj = JSON.parse(raw);
      out.textContent = fmt === 'raml'
        ? '#%RAML 1.0 DataType\n' + inferSchema(obj, 0, true)
        : 'openapi: 3.0.3\ncomponents:\n  schemas:\n    PayloadModel:\n' + inferSchema(obj, 6, false);
    } catch (e) {
      out.textContent = 'That JSON has a syntax error: ' + e.message;
    }
  };

  window.copySpecOutput = function () {
    var txt = document.getElementById('spec-output').textContent || '';
    navigator.clipboard.writeText(txt).then(function () {
      showToast('Copied API schema!');
    }).catch(function () {
      showToast('Copy failed.');
    });
  };

  /* ===== 6. 2026 Cross-Platform Enterprise Radar (MuleSoft · Workato · Salesforce · SAP) ===== */
  var RADAR_DATA = {
    agentic: {
      heading: 'Agentic AI, MCP Governance & Who Actually Runs the Tool',
      insight: 'I learned this the hard way: never let an AI agent call an ERP using a shared "god-mode" token. Use Workato Verified User Access (VUA) or MuleSoft Agent Fabric scoped OAuth so the AI only sees what that specific logged-in user is allowed to see.',
      rows: [
        ['MuleSoft (docs.mulesoft.com)', 'Agent Fabric + Agent Brokers (agent-network.yaml) + A2A (Agent-to-Agent) + MCP Bridges (OAS 3.1/3.2 -> MCP tools)', 'Best when you need deep control across hybrid clouds and multi-agent networks'],
        ['Workato (docs.workato.com)', 'Workato ONE Agent Studio ("Genies") + Enterprise MCP + Verified User Access (VUA) + Slack/Teams Human-in-the-Loop', 'Best when your business team wants fast workflows that still respect user OAuth permissions'],
        ['Salesforce (developer.salesforce.com)', 'Agentforce Topics & Actions + External Services (OpenAPI -> Agent Actions) + Data Cloud grounding', 'Best if your sales & service teams already live inside Salesforce all day'],
        ['SAP (store.sap.com / BTP)', 'SAP BTP AI Core + Side-by-Side Clean Core extensions exposing governed OData v4 / SAP Graph actions', 'Best for SAP-heavy shops that can\'t touch core S/4HANA ABAP']
      ]
    },
    streaming: {
      heading: 'Event Streaming Without Flooding Your Subscribers',
      insight: 'Old CometD push streams will happily dump 50,000 events onto a slow subscriber until it crashes. Salesforce\'s new Pub/Sub API uses gRPC + HTTP/2 + binary Avro so YOUR consumer pulls batches only when it\'s ready. Makes sense?',
      rows: [
        ['MuleSoft', 'Anypoint MQ (FIFO + DLQ) + Kafka Connector + ReplayId saved in ObjectStore v2', 'Rock-solid queue + DLQ replay when you can\'t lose a single message'],
        ['Workato', 'Event Streams + Recipe Triggers + AWS SNS / Azure Event Hub / Kafka connectors', 'Quick event-to-action recipes with visual job history and 1-click rerun'],
        ['Salesforce', 'Pub/Sub API (gRPC + HTTP/2 + Apache Avro) with client Pull Flow Control replacing CometD', 'High-speed streaming into Data Cloud and external microservices'],
        ['SAP Integration Suite', 'SAP Event Mesh & SAP Advanced Event Mesh (AEM) with topic filtering & multi-cloud queues', 'Best way to broadcast S/4HANA business events without polling SAP tables']
      ]
    },
    gateways: {
      heading: 'Gateways That Guard Both APIs and AI Agents',
      insight: 'You don\'t want two separate gateways — one for REST APIs and another for AI agents. MuleSoft Omni Gateway (the new Flex Gateway) and Workato API Edge Gateway let you enforce rate limits, auth, and PII rules in one place.',
      rows: [
        ['MuleSoft', 'Omni Gateway (evolution of Flex Gateway) — one lightweight Envoy gateway for REST, GraphQL, MCP & AI agents', 'Runs anywhere (Kubernetes, VMs, cloud) to protect Mule and non-Mule APIs'],
        ['Workato', 'API Edge Gateway (EGW) — runs inside your private network while managed from Workato cloud + RBAC 2.0', 'Keeps sensitive banking/healthcare payloads inside your firewall'],
        ['Salesforce', 'External Services + Named Credentials + MuleSoft API Manager / Shield Event Monitoring', 'Simple declarative OAuth/mTLS callouts straight from Flow and Agentforce'],
        ['SAP Integration Suite', 'SAP API Management + Developer Hub (rate limits, OAuth, threat protection, OData v4)', 'Standard gateway for governing SAP OData and partner APIs']
      ]
    },
    core: {
      heading: 'Clean Core, Zero-Copy Data & Modern IDEs',
      insight: 'Copying the same customer table into 5 different databases is why teams spend Fridays fixing sync bugs. Use Salesforce Data Cloud Zero-Copy and SAP Clean Core on BTP so the data stays in one place.',
      rows: [
        ['MuleSoft', 'CloudHub 2.0 (Kubernetes Private Spaces) + Anypoint Code Builder (VS Code) + MuleSoft Vibes AI assistant', 'Full pro-code power with Terraform GitOps and OpenTelemetry traces'],
        ['Workato', 'Low-code Recipes + AIRO Connector Builder + Collaborator Groups (RBAC 2.0)', 'Fastest build speed when IT and business teams co-own automations'],
        ['Salesforce', 'Data Cloud Zero-Copy Federation (Snowflake / Databricks / BigQuery) + Apex/Flow hooks', 'Live 360 customer data in Salesforce without copying terabytes of warehouse tables'],
        ['SAP Integration Suite', 'Clean Core side-by-side extensibility on SAP BTP + SAP Graph unified model + OData v4', 'Keeps S/4HANA upgrades clean by banning custom ABAP modifications in the core']
      ]
    }
  };

  var activeRadarKey = 'agentic';
  window.selectRadarPillar = function (key, btn) {
    var d = RADAR_DATA[key];
    if (!d) return;
    activeRadarKey = key;
    document.querySelectorAll('#radar-tabs .seg-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    document.getElementById('radar-heading').textContent = d.heading;
    document.getElementById('radar-insight').textContent = d.insight;
    document.getElementById('radar-tbody').innerHTML = d.rows.map(function (r) {
      return '<tr><td><strong>' + r[0] + '</strong></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>';
    }).join('');
  };

  window.copyRadarMarkdown = function () {
    var d = RADAR_DATA[activeRadarKey];
    if (!d) return;
    var md = [
      '# 2026 Cross-Platform Integration Radar: ' + d.heading,
      '',
      '> ' + d.insight,
      '',
      '| Platform | 2026 What\'s New | When to Pick It |',
      '| :--- | :--- | :--- |',
      d.rows.map(function (r) { return '| ' + r.join(' | ') + ' |'; }).join('\n'),
      '',
      '_From Niranjan\'s Enterprise Integration Hub (https://niranjanpotter.dpdns.org)_'
    ].join('\n');
    navigator.clipboard.writeText(md).then(function () {
      showToast('Copied 4-Platform Comparison (Markdown)!');
    }).catch(function () {
      showToast('Copy failed.');
    });
  };

  /* ===== Init ===== */
  document.addEventListener('DOMContentLoaded', function () {
    syncThemeBtn();
    ['adv-mode', 'adv-volume', 'adv-delivery', 'adv-eco', 'adv-priority'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', function () {
        document.querySelectorAll('.preset-chip').forEach(function (c) { c.classList.remove('active'); });
        renderAdvisor();
      });
    });
    ['del-systems', 'del-complexity', 'del-security', 'del-devs'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', window.updateDeliveryEstimator);
      if (el && el.tagName === 'INPUT') el.addEventListener('input', window.updateDeliveryEstimator);
    });
    renderAdvisor();
    window.selectBlueprint('sf-sap', document.querySelector('#bp-tabs .seg-btn'));
    window.updateDeliveryEstimator();
    renderScorecard();
    window.loadSampleJwt();
    window.explainCron();
    window.generateSpec('oas');
    window.selectRadarPillar('agentic', document.querySelector('#radar-tabs .seg-btn'));
  });
})();
