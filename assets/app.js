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
      why = 'Decouples autonomous AI agents from core systems using Model Context Protocol (MCP), enforces PII redaction and token budgets at the gateway, and cuts LLM latency/cost via semantic caching and multi-provider fallback.';
      execPitch = 'Protects enterprise data from LLM leakage while reducing AI inference costs by 35–60% and eliminating vendor lock-in across OpenAI, Anthropic, and Gemini.';
      deliveryPlan = 'Estimated 2–3 sprints (1 Architect + 2 Integration Devs). Critical path: InfoSec PII redaction sign-off, MCP tool schema contracts, and LLM quota/fallback chaos testing.';
      antipatterns = [
        'Allowing AI agents to query ERP/CRM databases directly without an API/MCP governance layer.',
        'Hardcoding a single LLM provider without circuit-breaker fallback or token rate limits.',
        'Logging raw prompts containing customer PII/PCI fields to observability tools.'
      ];
      mapping = [
        ['API & AI Governance', 'Anypoint Flex Gateway + AI Chain / Model Proxy', 'AWS Bedrock Guardrails + API Gateway', 'Azure AI Foundry + APIM'],
        ['Agent Tooling', 'MuleSoft MCP Connector + Topic Center', 'AWS Lambda MCP Servers', 'OpenAPI / MCP Tool Adapters'],
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
      why = 'Streams high-volume datasets without exhausting JVM/container memory, avoids synchronous API rate-limit exhaustion, and persists watermarks + per-record error isolation so failed slices can replay cleanly.';
      execPitch = 'Processes millions of records predictably within overnight SLA windows with zero duplicate writes and automatic partial-failure recovery.';
      deliveryPlan = 'Estimated 2 sprints (1 Lead + 1 Dev + 1 QA). Critical path: production-sized 1M-row staging dataset for heap/GC soak tests and reconciliation report sign-off.';
      antipatterns = [
        'Using synchronous row-by-row REST calls inside a loop for >10,000 records.',
        'Loading entire multi-GB CSV/JSON files into heap memory instead of streaming.',
        'Skipping external IDs / idempotency keys, causing duplicate ERP/CRM records on retry.'
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
      why = 'Eliminates polling overhead and infinite echo loops by tagging service-account writes (or payload hashes + correlation IDs) in a shared idempotency store before propagating updates to the opposite system.';
      execPitch = 'Keeps CRM and ERP records synchronized in near real time while preventing catastrophic infinite-loop API storms and billing spikes.';
      deliveryPlan = 'Estimated 3–4 sprints (1 Architect + 2 Devs + CRM/SAP Admins). Critical path: field-level System-of-Record ownership matrix, dedicated integration service users, and loop-storm UAT drill.';
      antipatterns = [
        'Syncing two systems without filtering integration-user updates (causes infinite echo loops).',
        'Relying solely on timestamps without deterministic conflict resolution (System-of-Record rules).',
        'Ignoring event retention windows when a downstream ERP goes down for maintenance.'
      ];
      mapping = [
        ['Change Capture', 'Salesforce CDC / Platform Events (ReplayId)', 'Debezium CDC + Amazon MSK (Kafka)', 'SAP Event Mesh / OData Delta'],
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
      why = 'Absorbs traffic spikes via asynchronous buffering, returns fast 202 Accepted acknowledgments to callers, preserves strict partition ordering where required, and isolates downstream outages inside a replayable Dead-Letter Queue.';
      execPitch = 'Guarantees zero lost orders even when downstream ERP/payment vendors experience outages or 10× peak traffic surges.';
      deliveryPlan = 'Estimated 2–3 sprints (1 Architect + 2 Devs + DevOps). Critical path: queue/DLQ Terraform provisioning, consumer concurrency load testing, and ops replay runbook handover.';
      antipatterns = [
        'Holding open synchronous HTTP threads while waiting on slow (>3s) downstream systems.',
        'Using unbounded retries without exponential backoff or a Dead-Letter Queue (poison-pill loop).',
        'Assuming brokers deliver exactly-once without an idempotent consumer check.'
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
      why = 'Delivers sub-second responses by executing independent downstream calls in parallel, caching read-heavy reference data, and shielding legacy backends with timeouts, retries, and graceful fallback responses.';
      execPitch = 'Cuts customer-facing response latency by 40–60% while keeping every downstream system reusable across web, mobile, and partner channels.';
      deliveryPlan = 'Estimated 1–2 sprints (2 Integration Devs + 1 QA). Critical path: contract-first OpenAPI/RAML approval, OAuth2 client provisioning, and P95 load testing.';
      antipatterns = [
        'Chaining 4+ synchronous backend calls sequentially instead of fanning out in parallel.',
        'Exposing raw ERP/CRM table schemas directly to mobile or partner apps (tight coupling).',
        'Returning HTTP 200 OK on critical transactional failures (silent error swallowing).'
      ];
      mapping = [
        ['API Gateway', 'Anypoint API Manager / Flex Gateway', 'AWS API Gateway + WAF', 'Apigee / Kong Enterprise'],
        ['Orchestration', 'Mule 4 Scatter-Gather + ObjectStore Cache', 'AWS AppSync / Node/Java Aggregator', 'GraphQL Federation / Spring Boot'],
        ['Security', 'OAuth 2.0 JWT + mTLS + Client ID Enforcement', 'Cognito / Okta + IAM SigV4', 'Entra ID / OAuth 2.0 + mTLS']
      ];
    }

    if (priority === 'latency') {
      why += ' Latency focus: enforce strict downstream timeouts (<1500ms), HTTP keep-alive connection pooling, and read-through caching.';
    } else if (priority === 'audit') {
      why += ' Audit focus: propagate X-Correlation-Id end to end, persist immutable audit payloads, and enforce mTLS + RBAC.';
    } else if (priority === 'cost') {
      why += ' Cost focus: right-size fractional replicas/serverless concurrency, cache repetitive reads, and avoid unnecessary 24/7 idle clusters.';
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
      document.getElementById('adv-pitch').textContent = 'Gate production cutover on: 85%+ automated unit/MUnit coverage, 2× peak load test pass, DLQ replay drill, and signed-off ops alert runbook.';
    } else if (advisorAudience === 'exec') {
      document.getElementById('adv-why-label').textContent = '2. Executive / CTO Business Value';
      document.getElementById('adv-why').textContent = rec.execPitch;
      document.getElementById('adv-pitch-label').textContent = '4. Delivery & Governance Next Step';
      document.getElementById('adv-pitch').textContent = 'Approve a 2-week reference spike validating throughput, failover, and correlation telemetry before full program rollout.';
    } else {
      document.getElementById('adv-why-label').textContent = '2. Architectural Rationale';
      document.getElementById('adv-why').textContent = rec.why;
      document.getElementById('adv-pitch-label').textContent = '4. 1-Line Executive Pitch';
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
      '## Executive Value',
      rec.execPitch,
      '',
      '## Flow',
      rec.flow.map(function (n) { return n[1]; }).join(' -> '),
      '',
      '## Anti-Patterns Avoided',
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
      showToast('Copied Architecture Decision Record (Markdown)!');
    }).catch(function () {
      showToast('Copy failed — please copy manually.');
    });
  };

  /* ===== 2. Enterprise Reference Blueprints ===== */
  var BLUEPRINTS = {
    'sf-sap': {
      title: 'Bidirectional Salesforce ↔ SAP S/4HANA Sync',
      summary: 'Near-real-time customer & order synchronization with deterministic loop prevention, ReplayId recovery, and zero duplicate postings.',
      svg: '<svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Salesforce to SAP Bidirectional Architecture">' +
        '<rect width="920" height="230" rx="12" fill="#0c0c0f"/>' +
        '<rect x="24" y="62" width="150" height="96" rx="10" fill="#18181b" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="99" y="102" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">Salesforce CRM</text>' +
        '<text x="99" y="124" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">CDC / Platform Events</text>' +
        '<line x1="174" y1="95" x2="238" y2="95" stroke="#f59e0b" stroke-width="2"/><polygon points="238,90 248,95 238,100" fill="#f59e0b"/>' +
        '<line x1="248" y1="125" x2="184" y2="125" stroke="#10b981" stroke-width="2"/><polygon points="184,120 174,125 184,130" fill="#10b981"/>' +
        '<rect x="248" y="48" width="180" height="124" rx="10" fill="#18181b" stroke="#a1a1aa" stroke-width="1.5"/>' +
        '<text x="338" y="84" fill="#fafafa" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">Event Mesh / MQ</text>' +
        '<text x="338" y="108" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">FIFO + ReplayId Store</text>' +
        '<text x="338" y="132" fill="#34d399" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">DLQ Auto-Replay</text>' +
        '<line x1="428" y1="110" x2="492" y2="110" stroke="#f59e0b" stroke-width="2"/><polygon points="492,105 502,110 492,115" fill="#f59e0b"/>' +
        '<rect x="502" y="48" width="188" height="124" rx="10" fill="#18181b" stroke="#10b981" stroke-width="2"/>' +
        '<text x="596" y="84" fill="#34d399" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">Process &amp; Loop Guard</text>' +
        '<text x="596" y="108" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Filter Integration User</text>' +
        '<text x="596" y="132" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">SHA-256 Payload Hash</text>' +
        '<line x1="690" y1="110" x2="744" y2="110" stroke="#10b981" stroke-width="2"/><polygon points="744,105 754,110 744,115" fill="#10b981"/>' +
        '<rect x="754" y="62" width="142" height="96" rx="10" fill="#18181b" stroke="#f97316" stroke-width="2"/>' +
        '<text x="825" y="102" fill="#fb923c" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">SAP S/4HANA</text>' +
        '<text x="825" y="124" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">OData v4 / IDoc</text>' +
        '</svg>',
      cards: [
        ['Loop Prevention', 'Tag every integration write with a dedicated service user + correlation header and compare payload SHA-256 hashes before emitting updates back.'],
        ['Failure Resilience', 'Persist Salesforce ReplayId in ObjectStore/Redis; route SAP maintenance outages to an Anypoint MQ / SQS DLQ for ordered replay.'],
        ['KPI Outcome', 'Eliminated 100% of duplicate billing postings and cut sync lag from 15-minute batch polling down to < 2 seconds.']
      ]
    },
    'cloud-mig': {
      title: 'Zero-Downtime Legacy-to-Cloud-Native Migration',
      summary: 'Strangler-Fig API Gateway migration from legacy EC2/on-prem runtimes to Kubernetes/CloudHub 2.0 Private Spaces with instant canary rollback.',
      svg: '<svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zero Downtime Cloud Migration Blueprint">' +
        '<rect width="920" height="230" rx="12" fill="#0c0c0f"/>' +
        '<rect x="24" y="68" width="150" height="84" rx="10" fill="#18181b" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="99" y="104" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">API Consumers</text>' +
        '<text x="99" y="126" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Zero Client Change</text>' +
        '<line x1="174" y1="110" x2="238" y2="110" stroke="#f59e0b" stroke-width="2"/><polygon points="238,105 248,110 238,115" fill="#f59e0b"/>' +
        '<rect x="248" y="54" width="190" height="112" rx="10" fill="#18181b" stroke="#a1a1aa" stroke-width="1.5"/>' +
        '<text x="343" y="92" fill="#fafafa" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">Edge Gateway / DNS</text>' +
        '<text x="343" y="114" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Weighted Canary</text>' +
        '<text x="343" y="136" fill="#34d399" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">10% → 50% → 100%</text>' +
        '<line x1="438" y1="86" x2="530" y2="62" stroke="#10b981" stroke-width="2"/>' +
        '<line x1="438" y1="134" x2="530" y2="158" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,4"/>' +
        '<rect x="530" y="24" width="360" height="74" rx="10" fill="#0f231e" stroke="#10b981" stroke-width="2"/>' +
        '<text x="710" y="54" fill="#34d399" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">Target: CloudHub 2.0 / Kubernetes Private Space</text>' +
        '<text x="710" y="76" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">2+ Replicas · Transit Gateway · OTel Telemetry</text>' +
        '<rect x="530" y="128" width="360" height="74" rx="10" fill="#231a10" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="710" y="158" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">Legacy: CloudHub 1.0 / On-Prem Runtime</text>' +
        '<text x="710" y="180" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Warm Standby for Instant 30s Rollback</text>' +
        '</svg>',
      cards: [
        ['Network Parity First', 'Provision Private Space / VPC Peering, Transit Gateway, and egress static IPs before migrating the first API workload.'],
        ['Canary Cutover', 'Shift traffic 10% → 50% → 100% via DNS/Gateway weights while comparing P95 latency, 5xx rates, and payload parity.'],
        ['Zero-Downtime Guardrail', 'Keep legacy workers warm for 48 hours post-cutover so any downstream edge case rolls back in under 30 seconds.']
      ]
    },
    'ai-mcp': {
      title: 'Enterprise AI & Autonomous Agent Integration (MCP + Model Proxy)',
      summary: 'Connect Salesforce Agentforce and LLM copilots safely to enterprise APIs using Model Context Protocol (MCP), PII masking, and semantic caching.',
      svg: '<svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Enterprise AI MCP Governance Blueprint">' +
        '<rect width="920" height="230" rx="12" fill="#0c0c0f"/>' +
        '<rect x="24" y="62" width="150" height="96" rx="10" fill="#18181b" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="99" y="102" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">AI Agents</text>' +
        '<text x="99" y="124" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Agentforce / Copilots</text>' +
        '<line x1="174" y1="110" x2="234" y2="110" stroke="#f59e0b" stroke-width="2"/><polygon points="234,105 244,110 234,115" fill="#f59e0b"/>' +
        '<rect x="244" y="48" width="194" height="124" rx="10" fill="#18181b" stroke="#a1a1aa" stroke-width="1.5"/>' +
        '<text x="341" y="84" fill="#fafafa" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">AI Gateway &amp; Proxy</text>' +
        '<text x="341" y="108" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">PII Redaction + Quotas</text>' +
        '<text x="341" y="132" fill="#34d399" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Semantic Cache + Fallback</text>' +
        '<line x1="438" y1="110" x2="498" y2="110" stroke="#f59e0b" stroke-width="2"/><polygon points="498,105 508,110 498,115" fill="#f59e0b"/>' +
        '<rect x="508" y="48" width="184" height="124" rx="10" fill="#18181b" stroke="#10b981" stroke-width="2"/>' +
        '<text x="600" y="84" fill="#34d399" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">MCP Tool Layer</text>' +
        '<text x="600" y="108" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Scoped RBAC Actions</text>' +
        '<text x="600" y="132" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">Schema Validation</text>' +
        '<line x1="692" y1="110" x2="744" y2="110" stroke="#10b981" stroke-width="2"/><polygon points="744,105 754,110 744,115" fill="#10b981"/>' +
        '<rect x="754" y="62" width="142" height="96" rx="10" fill="#18181b" stroke="#f97316" stroke-width="2"/>' +
        '<text x="825" y="102" fill="#fb923c" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">System APIs</text>' +
        '<text x="825" y="124" fill="#a1a1aa" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace">ERP · CRM · Billing</text>' +
        '</svg>',
      cards: [
        ['Zero Direct DB Access', 'AI agents invoke strictly typed MCP tools backed by existing System APIs — inheriting OAuth2, audit logging, and rate limits.'],
        ['Cost & Latency Control', 'Semantic caching serves repeated policy/status prompts in <50ms while automatic fallback shifts traffic if a primary LLM throttles.'],
        ['Compliance & PII', 'Gateway strips SSN, card numbers, and secrets before prompts leave the enterprise boundary.']
      ]
    },
    'cross-2026': {
      title: '2026 Cross-Platform Agentic Mesh (Salesforce gRPC + MuleSoft/Workato MCP + SAP Clean Core)',
      summary: 'Unifies Salesforce Pub/Sub API (gRPC + Avro pull flow control), Verified User Access (VUA) / Agent Fabric MCP governance, and SAP S/4HANA Clean Core OData v4 without custom ERP code.',
      svg: '<svg viewBox="0 0 920 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="2026 Cross-Platform Agentic Mesh Blueprint">' +
        '<rect width="920" height="230" rx="12" fill="#0c0c0f"/>' +
        '<rect x="20" y="54" width="170" height="112" rx="10" fill="#18181b" stroke="#f59e0b" stroke-width="2"/>' +
        '<text x="105" y="88" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">Salesforce</text>' +
        '<text x="105" y="112" fill="#a1a1aa" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Pub/Sub API (gRPC)</text>' +
        '<text x="105" y="134" fill="#34d399" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Data Cloud Zero-Copy</text>' +
        '<line x1="190" y1="110" x2="242" y2="110" stroke="#f59e0b" stroke-width="2"/><polygon points="242,105 252,110 242,115" fill="#f59e0b"/>' +
        '<rect x="252" y="42" width="210" height="136" rx="10" fill="#18181b" stroke="#10b981" stroke-width="2"/>' +
        '<text x="357" y="76" fill="#34d399" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">Omni / Edge MCP Plane</text>' +
        '<text x="357" y="100" fill="#a1a1aa" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">MuleSoft Agent Fabric (A2A)</text>' +
        '<text x="357" y="122" fill="#a1a1aa" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Workato MCP + VUA (OAuth)</text>' +
        '<text x="357" y="146" fill="#fbbf24" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Human-in-Loop Approvals</text>' +
        '<line x1="462" y1="110" x2="514" y2="110" stroke="#10b981" stroke-width="2"/><polygon points="514,105 524,110 514,115" fill="#10b981"/>' +
        '<rect x="524" y="54" width="176" height="112" rx="10" fill="#18181b" stroke="#a1a1aa" stroke-width="1.5"/>' +
        '<text x="612" y="88" fill="#fafafa" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">SAP Integration Suite</text>' +
        '<text x="612" y="112" fill="#a1a1aa" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Advanced Event Mesh</text>' +
        '<text x="612" y="134" fill="#34d399" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">SAP Graph + API Mgmt</text>' +
        '<line x1="700" y1="110" x2="744" y2="110" stroke="#f97316" stroke-width="2"/><polygon points="744,105 754,110 744,115" fill="#f97316"/>' +
        '<rect x="754" y="54" width="146" height="112" rx="10" fill="#18181b" stroke="#f97316" stroke-width="2"/>' +
        '<text x="827" y="92" fill="#fb923c" font-size="13" font-weight="700" text-anchor="middle" font-family="Plus Jakarta Sans,sans-serif">SAP S/4HANA</text>' +
        '<text x="827" y="116" fill="#a1a1aa" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">Clean Core (BTP)</text>' +
        '<text x="827" y="138" fill="#34d399" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono,monospace">OData v4 Batch</text>' +
        '</svg>',
      cards: [
        ['Verified User Access (VUA)', 'AI agents call MCP tools using the end user\'s own OAuth 2.0 identity instead of a shared super-admin token, enforcing native CRM/ERP RBAC.'],
        ['gRPC Pull Flow Control', 'Salesforce Pub/Sub API replaces legacy CometD push streams with HTTP/2 + binary Avro pull batches so consumers never get overwhelmed.'],
        ['SAP Clean Core Compliance', 'All custom orchestration stays side-by-side in SAP BTP / MuleSoft / Workato via OData v4 & AEM, keeping S/4HANA upgrades 100% safe.']
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
    var apiCount = systems + Math.max(1, Math.ceil(systems / 2)) + 1; // SAPIs + PAPIs + XAPI
    var devDays = Math.round((apiCount * 5.5 * mult) + secDays);
    var qaDays = Math.round(devDays * 0.35);
    var totalDays = devDays + qaDays;
    var sprints = Math.max(1, Math.ceil(totalDays / (devs * 8.5)));
    var risk = (comp === 'erp' || sec === 'pci' || systems >= 5) ? 'HIGH — Run 1-Sprint Architecture Spike First' : (systems >= 3 ? 'MEDIUM — Lock Contracts Early' : 'LOW — Standard Agile Track');

    document.getElementById('del-kpis').innerHTML =
      '<div class="result-box"><h3>Estimated Timeline</h3><div class="kpi-val">' + sprints + ' Sprint' + (sprints > 1 ? 's' : '') + '</div><p>' + (sprints * 2) + ' weeks (' + totalDays + ' person-days incl. QA/NFR)</p></div>' +
      '<div class="result-box"><h3>Recommended APIs</h3><div class="kpi-val">' + apiCount + ' APIs</div><p>1 XAPI · ' + Math.max(1, Math.ceil(systems / 2)) + ' PAPI · ' + systems + ' SAPI</p></div>' +
      '<div class="result-box"><h3>Test &amp; NFR Buffer</h3><div class="kpi-val">' + qaDays + ' Days</div><p>Unit/MUnit (85%+), Perf Load &amp; Failover</p></div>' +
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
    { id: 'c1', title: 'Idempotency Keys on Writes', sub: 'Prevents duplicate orders/payments on retries', risk: 'Duplicate financial/ERP records during network retries' },
    { id: 'c2', title: 'Dead-Letter Queue + Replay', sub: 'Failed async messages never silently drop', risk: 'Permanent data loss when downstream systems go offline' },
    { id: 'c3', title: 'End-to-End Correlation ID', sub: 'Trace single request across XAPI → PAPI → SAPI', risk: 'Slow Sev-1 incident debugging across distributed teams' },
    { id: 'c4', title: 'Explicit Timeouts & Circuit Breaker', sub: 'No infinite hangs when a vendor stalls', risk: 'Thread-pool exhaustion cascading across all APIs' },
    { id: 'c5', title: 'Zero Secrets in Code or Logs', sub: 'Vault/Secrets Manager + PII log redaction', risk: 'Credential leak or compliance/audit failure' },
    { id: 'c6', title: 'High Availability (2+ Replicas)', sub: 'Zero-downtime rolling updates & AZ failover', risk: 'Single-node outage takes down production traffic' },
    { id: 'c7', title: 'Contract-First OpenAPI / RAML', sub: 'Schema validation & semantic versioning enforced', risk: 'Breaking downstream consumers on silent payload drift' },
    { id: 'c8', title: 'OpenTelemetry Traces & Alerts', sub: 'Proactive P95 latency & 5xx alerting', risk: 'Customers report outages before your ops team knows' }
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
      gradeEl.innerHTML = '<span class="status-chip status-ok">🏆 Enterprise Production-Ready</span>';
      riskEl.textContent = missing.length ? 'Remaining polish: ' + missing[0].title + '.' : 'All 8 enterprise resilience pillars verified — ready for high-SLA production!';
    } else if (pct >= 50) {
      gradeEl.innerHTML = '<span class="status-chip status-warn">⚠️ Needs Pre-Prod Hardening</span>';
      riskEl.textContent = 'Top gap to close first: ' + missing[0].risk + '.';
    } else {
      gradeEl.innerHTML = '<span class="status-chip status-err">🚨 High Outage Risk</span>';
      riskEl.textContent = 'Critical exposure: ' + missing[0].risk + '.';
    }
  };

  window.copyScorecardShare = function () {
    var score = document.getElementById('score-num').textContent;
    var txt = 'I just ran the 60-Second Enterprise Integration Readiness Audit and scored ' + score + '!\n\nTest your API & Event-Driven architecture resilience (free & offline): https://niranjanpotter.dpdns.org/#readiness-audit';
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
      out.textContent = 'Paste a JWT token to inspect Header, Payload, Expiry, and Security Flags (100% local in your browser).';
      status.innerHTML = '';
      return;
    }
    var parts = raw.split('.');
    if (parts.length < 2) {
      out.textContent = 'Invalid JWT format — expected 3 dot-separated segments (header.payload.signature).';
      status.innerHTML = '<span class="status-chip status-err">Invalid JWT</span>';
      return;
    }
    try {
      var header = JSON.parse(b64UrlDecode(parts[0]));
      var payload = JSON.parse(b64UrlDecode(parts[1]));
      var flags = [];
      var now = Math.floor(Date.now() / 1000);
      if (!header.alg || String(header.alg).toLowerCase() === 'none') flags.push('CRITICAL: alg is "none" (unsigned token).');
      if (payload.exp) {
        if (payload.exp < now) flags.push('EXPIRED at ' + new Date(payload.exp * 1000).toISOString());
        else flags.push('VALID until ' + new Date(payload.exp * 1000).toISOString());
        if (payload.iat && (payload.exp - payload.iat) > 86400) flags.push('WARNING: Token TTL > 24 hours (' + Math.round((payload.exp - payload.iat) / 3600) + 'h).');
      } else {
        flags.push('WARNING: Missing "exp" claim.');
      }
      if (!payload.iss) flags.push('NOTE: Missing "iss" (issuer) claim.');
      if (!payload.aud) flags.push('NOTE: Missing "aud" (audience) claim.');

      var isBad = flags.some(function (f) { return f.startsWith('CRITICAL') || f.startsWith('EXPIRED'); });
      var isWarn = flags.some(function (f) { return f.startsWith('WARNING'); });
      status.innerHTML = '<span class="status-chip ' + (isBad ? 'status-err' : (isWarn ? 'status-warn' : 'status-ok')) + '">' +
        (isBad ? 'Security / Expiry Alert' : (isWarn ? 'Valid with Warnings' : 'Valid Token Structure')) + '</span>';

      out.textContent =
        '=== SECURITY CHECKS ===\n' + flags.map(function (f) { return '• ' + f; }).join('\n') +
        '\n\n=== HEADER ===\n' + JSON.stringify(header, null, 2) +
        '\n\n=== PAYLOAD ===\n' + JSON.stringify(payload, null, 2);
    } catch (e) {
      out.textContent = 'Could not decode Base64URL JSON: ' + e.message;
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
      out.textContent = 'Enter a valid 5-field (Unix/AWS) or 6-field (Quartz / Mule 4 / Spring) cron expression.';
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
      'Format: ' + (isQuartz ? '6-field Quartz (Mule 4 / Spring / Java)' : '5-field Standard Unix / GitHub Actions / K8s') + '\n' +
      'Summary: ' + summary + '\n\n' +
      'Breakdown:\n' +
      (isQuartz ? '  Seconds      : ' + sec + '\n' : '') +
      '  Minutes      : ' + min + '\n' +
      '  Hours        : ' + hr + '\n' +
      '  Day of Month : ' + dom + '\n' +
      '  Month        : ' + mon + '\n' +
      '  Day of Week  : ' + dow + '\n\n' +
      'Mule 4 Scheduler XML:\n' +
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
      out.textContent = 'Invalid JSON input: ' + e.message;
    }
  };

  window.copySpecOutput = function () {
    var txt = document.getElementById('spec-output').textContent || '';
    navigator.clipboard.writeText(txt).then(function () {
      showToast('Copied generated API schema!');
    }).catch(function () {
      showToast('Copy failed.');
    });
  };

  /* ===== 6. 2026 Cross-Platform Enterprise Radar (MuleSoft · Workato · Salesforce · SAP) ===== */
  var RADAR_DATA = {
    agentic: {
      heading: 'Agentic AI, MCP Governance & Identity Security',
      insight: 'Rare Architect Insight: Never run AI/MCP tools under a shared "god-mode" service token. Use Workato Verified User Access (VUA) or MuleSoft Agent Fabric scoped OAuth so every AI tool call inherits the exact caller\'s RBAC permissions.',
      rows: [
        ['MuleSoft (docs.mulesoft.com)', 'Agent Fabric + Agent Brokers (agent-network.yaml) + A2A (Agent-to-Agent) + MCP Bridges (OAS 3.1/3.2 -> MCP tools)', 'Best when governing heterogeneous APIs + multi-agent networks across hybrid clouds'],
        ['Workato (docs.workato.com)', 'Workato ONE Agent Studio ("Genies") + Enterprise MCP + Verified User Access (VUA) + Slack/Teams Human-in-the-Loop', 'Best for fast business-workflow orchestration with end-user credential delegation'],
        ['Salesforce (developer.salesforce.com)', 'Agentforce Topics & Actions + External Services (OpenAPI -> declarative Agent Actions) + Data Cloud RAG grounding', 'Best for CRM-native autonomous service & sales agents grounded in unified profiles'],
        ['SAP (store.sap.com / BTP)', 'SAP BTP AI Core + Side-by-Side Clean Core extensions exposing governed OData v4 / SAP Graph actions', 'Best for ERP-centric enterprise workflows without modifying S/4HANA core ABAP']
      ]
    },
    streaming: {
      heading: 'Next-Gen Event Streaming & Backpressure Control',
      insight: 'Rare Architect Insight: Legacy push streaming (CometD) can crash slow consumers during traffic bursts. Salesforce Pub/Sub API (gRPC + HTTP/2 + Binary Avro) introduces client-controlled Pull Flow Control so consumers request exact batch sizes.',
      rows: [
        ['MuleSoft', 'Anypoint MQ (FIFO + DLQ) + Kafka Connector + ReplayId persistence in ObjectStore v2', 'Strong hybrid enterprise messaging with native DLQ replay flows'],
        ['Workato', 'Event Streams + Recipe Triggers + AWS SNS / Azure Event Hub / Kafka connectors', 'Rapid event-to-workflow orchestration with built-in job history & retries'],
        ['Salesforce', 'Pub/Sub API (gRPC + HTTP/2 + Apache Avro) with Pull Flow Control replacing legacy CometD', 'High-throughput bidirectional streaming directly into Data Cloud & external apps'],
        ['SAP Integration Suite', 'SAP Event Mesh & SAP Advanced Event Mesh (AEM) with multi-cloud topic filtering & queuing', 'Decouples S/4HANA lifecycle events cleanly across hybrid & multi-cloud landscapes']
      ]
    },
    gateways: {
      heading: 'Unified API, AI & Hybrid Edge Gateways',
      insight: 'Rare Architect Insight: Modern gateways now govern BOTH traditional REST/GraphQL traffic AND AI/MCP agent traffic inside private VPCs/on-prem perimeters without routing sensitive payloads through public SaaS planes.',
      rows: [
        ['MuleSoft', 'Omni Gateway (evolution of Flex Gateway) — unified policy plane for REST, GraphQL, MCP & AI agents', 'Ultra-lightweight Envoy-based gateway managing Mule & non-Mule APIs anywhere'],
        ['Workato', 'API Edge Gateway (EGW) — local on-prem / private-cloud data plane + cloud control plane + RBAC 2.0', 'Keeps regulated banking/healthcare API traffic strictly inside corporate perimeter'],
        ['Salesforce', 'External Services + Named Credentials + MuleSoft API Manager / Shield Event Monitoring', 'Declarative OAuth/mTLS callout management directly inside Salesforce'],
        ['SAP Integration Suite', 'SAP API Management + Developer Hub (rate limits, OAuth, threat protection, API composition)', 'Centralized governance for SAP OData v4 and third-party enterprise APIs']
      ]
    },
    core: {
      heading: 'Modern Runtime, Zero-Copy Data & Clean Core',
      insight: 'Rare Architect Insight: Copying ERP/CRM tables into 5 integration databases creates reconciliation nightmares. Combine Salesforce Data Cloud Zero-Copy + SAP S/4HANA Clean Core + SAP Graph to keep one source of truth.',
      rows: [
        ['MuleSoft', 'CloudHub 2.0 (Kubernetes Private Spaces) + Anypoint Code Builder (VS Code) + MuleSoft Vibes AI assistant', 'Pro-code API-led architecture with Terraform GitOps & OpenTelemetry Direct Telemetry'],
        ['Workato', 'Low-code Recipes + AIRO Connector Builder + Collaborator Groups (RBAC 2.0)', 'Fastest delivery speed for cross-SaaS business & IT automation teams'],
        ['Salesforce', 'Data Cloud Zero-Copy Federation (Snowflake / Databricks / BigQuery) + Apex/Flow pro-code hooks', 'Real-time 360 customer intelligence without duplicating terabytes of warehouse data'],
        ['SAP Integration Suite', 'Clean Core side-by-side extensibility on SAP BTP + SAP Graph unified business model + OData v4', 'Keeps S/4HANA upgrades zero-breakage by banning invasive custom ABAP modifications']
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
      '# 2026 Enterprise Integration Radar: ' + d.heading,
      '',
      '> ' + d.insight,
      '',
      '| Platform | 2026 Flagship Capability | Best Enterprise Fit |',
      '| :--- | :--- | :--- |',
      d.rows.map(function (r) { return '| ' + r.join(' | ') + ' |'; }).join('\n'),
      '',
      '_Source: Enterprise Integration Hub (https://niranjanpotter.dpdns.org)_'
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
