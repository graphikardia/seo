/**
 * All agent prompt definitions — each agent has multiple steps
 * that call Claude with structured JSON output requirements.
 */

import type { AgentStep } from "./claudeAgent";

export function getSeoSteps(url: string): AgentStep[] {
  return [
    {
      label: "Keyword gap & meta tag audit",
      outputKey: "keywordAudit",
      prompt: `You are an expert SEO analyst. Analyze the website at ${url} and perform a keyword gap and meta tag audit.
Return ONLY valid JSON (no markdown, no extra text):
{
  "primaryKeywords": ["kw1","kw2","kw3"],
  "missedOpportunities": ["missed kw1","missed kw2","missed kw3"],
  "titleTagStatus": "missing|present|needs_update",
  "metaDescriptionStatus": "missing|present|needs_update",
  "suggestedTitle": "...",
  "suggestedMeta": "...",
  "issues": ["issue1","issue2","issue3"]
}`,
    },
    {
      label: "Heading structure & internal link map",
      outputKey: "structureAudit",
      prompt: `You are an expert SEO analyst. Audit the heading structure (H1–H6) and internal linking strategy for ${url}.
Return ONLY valid JSON:
{
  "h1Count": 1,
  "h1Issues": ["issue if any"],
  "headingHierarchyScore": 72,
  "internalLinkOpportunities": ["add link to /page-a from /page-b","..."],
  "anchorTextIssues": ["generic 'click here' found","..."],
  "recommendations": ["rec1","rec2","rec3"]
}`,
    },
    {
      label: "Schema markup & rich result opportunities",
      outputKey: "schemaAudit",
      prompt: `You are an expert structured data specialist. Identify missing schema markup opportunities for ${url} that would improve rich results in Google Search.
Return ONLY valid JSON:
{
  "currentSchemaTypes": ["Article"],
  "missingSchemas": [
    {"type":"FAQPage","benefit":"Get FAQ rich results in SERP","effort":"Low"},
    {"type":"HowTo","benefit":"Step-by-step rich result","effort":"Medium"},
    {"type":"Organization","benefit":"Knowledge panel enhancement","effort":"Low"}
  ],
  "priorityAction": "Implement FAQPage schema on all blog posts",
  "estimatedTrafficLift": "+12-18%"
}`,
    },
    {
      label: "Competitor gap analysis",
      outputKey: "competitorGap",
      prompt: `You are an expert SEO strategist. Based on the domain ${url}, identify likely competitors and key ranking gaps.
Return ONLY valid JSON:
{
  "likelyCompetitors": ["competitor1.com","competitor2.com","competitor3.com"],
  "topicsCompetitorsRankFor": ["topic1","topic2","topic3"],
  "contentGaps": ["gap1","gap2","gap3"],
  "linkBuildingOpportunities": ["opportunity1","opportunity2"],
  "priorityPages": ["Create /topic1 pillar page","Expand /topic2 with more depth"]
}`,
    },
    {
      label: "Full SEO action plan",
      outputKey: "actionPlan",
      prompt: `You are an expert SEO consultant. Create a prioritized 90-day SEO action plan for ${url}.
Return ONLY valid JSON:
{
  "week1": ["Quick win action 1","Quick win action 2","Quick win action 3"],
  "month1": ["Month 1 goal 1","Month 1 goal 2"],
  "month2": ["Month 2 goal 1","Month 2 goal 2"],
  "month3": ["Month 3 goal 1","Month 3 goal 2"],
  "kpis": ["Organic traffic +20%","Avg position < 3 for top 10 keywords","DA increase by 5 points"],
  "estimatedROI": "3-5x within 6 months"
}`,
    },
  ];
}

export function getAeoSteps(url: string): AgentStep[] {
  return [
    {
      label: "Entity extraction & knowledge graph signals",
      outputKey: "entityAudit",
      prompt: `You are an AEO (Answer Engine Optimization) expert. Analyze ${url} for entity signals that help AI engines like Perplexity, ChatGPT, and Google SGE understand and cite this content.
Return ONLY valid JSON:
{
  "primaryEntity": "brand/person/organization name",
  "entityType": "Organization|Person|Product|Service",
  "entitySignalsFound": ["Wikipedia link","Wikidata entry","LinkedIn profile"],
  "entitySignalsMissing": ["missing signal 1","missing signal 2"],
  "brandMentionStrength": 45,
  "knowledgeGraphReady": false,
  "recommendations": ["rec1","rec2","rec3"]
}`,
    },
    {
      label: "FAQ cluster generation for AI discovery",
      outputKey: "faqClusters",
      prompt: `You are an AEO specialist. Generate optimized FAQ clusters for ${url} that will get cited by AI answer engines like Perplexity and ChatGPT Search.
Return ONLY valid JSON:
{
  "clusters": [
    {
      "topic": "What is [product/service]?",
      "faqs": [
        {"question": "...?", "answer": "Direct, factual answer under 50 words.", "schemaReady": true},
        {"question": "...?", "answer": "...", "schemaReady": true}
      ]
    },
    {
      "topic": "How to [key use case]",
      "faqs": [
        {"question": "...?", "answer": "...", "schemaReady": true}
      ]
    }
  ],
  "totalFaqs": 6,
  "implementationNote": "Add FAQPage JSON-LD schema to each page"
}`,
    },
    {
      label: "Featured snippet & direct answer targeting",
      outputKey: "snippetTargets",
      prompt: `You are an AEO expert. Identify featured snippet and AI answer box opportunities for ${url}.
Return ONLY valid JSON:
{
  "snippetOpportunities": [
    {"query": "how to ...", "snippetType": "paragraph|list|table", "currentRanking": "not ranking", "actionNeeded": "Add direct answer in first paragraph"},
    {"query": "what is ...", "snippetType": "paragraph", "currentRanking": "page 2", "actionNeeded": "Rewrite intro to answer directly"},
    {"query": "best ... for ...", "snippetType": "list", "currentRanking": "not ranking", "actionNeeded": "Create comparison listicle"}
  ],
  "priorityQuery": "Target this first for fastest win",
  "contentFormatting": ["Use numbered lists for how-to","Use definition boxes for what-is queries","Add TL;DR at top of articles"]
}`,
    },
    {
      label: "NLP & semantic optimization",
      outputKey: "nlpAudit",
      prompt: `You are an NLP content optimization specialist. Analyze semantic optimization needs for ${url} to improve understanding by AI systems.
Return ONLY valid JSON:
{
  "semanticGaps": ["term1 needs definition","concept2 lacks context","entity3 not linked"],
  "topicCoverageScore": 58,
  "missingTopicClusters": ["cluster1","cluster2"],
  "coOccurrenceTerms": ["related term 1","related term 2","related term 3"],
  "readabilityIssues": ["Sentences too complex","Passive voice overuse"],
  "nlpRecommendations": ["Add glossary section","Use topic sentences","Include statistics from authoritative sources"]
}`,
    },
  ];
}

export function getGeoSteps(url: string): AgentStep[] {
  return [
    {
      label: "LLM prompt simulation — how AI sees your site",
      outputKey: "llmSim",
      prompt: `You are simulating how a large language model would respond to questions about the company/service at ${url}. Analyze whether this website would be cited in AI-generated answers.
Return ONLY valid JSON:
{
  "wouldBeRecommended": false,
  "reasonsFor": ["has clear value proposition","some structured data present"],
  "reasonsAgainst": ["no authoritative citations","weak entity presence","content not structured for AI parsing"],
  "simulatedAiResponse": "When asked about this topic, an AI would likely say: '...' — and would cite competitors instead.",
  "geoReadinessScore": 38
}`,
    },
    {
      label: "Citation signal & authority building",
      outputKey: "citationAudit",
      prompt: `You are a GEO (Generative Engine Optimization) specialist. Analyze citation signals for ${url} that make AI engines trust and recommend this content.
Return ONLY valid JSON:
{
  "currentCitationSignals": ["has HTTPS","has contact page"],
  "missingCitationSignals": ["No Wikipedia/Wikidata presence","No authoritative press mentions","No .edu or .gov backlinks","Missing author bio with credentials"],
  "authorityScore": 32,
  "topCitationOpportunities": [
    {"action": "Get listed on Crunchbase/G2/Capterra", "impact": "High", "effort": "Low"},
    {"action": "Publish original research/data study", "impact": "Very High", "effort": "High"},
    {"action": "Create author profiles with credentials", "impact": "Medium", "effort": "Low"}
  ]
}`,
    },
    {
      label: "Structured data injection plan",
      outputKey: "structuredDataPlan",
      prompt: `You are a structured data expert focused on GEO. Create a comprehensive structured data (JSON-LD) implementation plan for ${url} to maximize AI engine comprehension.
Return ONLY valid JSON:
{
  "schemaTypesToImplement": [
    {"type": "Organization", "pages": ["homepage"], "priority": 1, "snippet": "{\"@type\":\"Organization\",\"name\":\"...\",\"url\":\"...\",\"sameAs\":[...]}"},
    {"type": "WebSite", "pages": ["homepage"], "priority": 1, "snippet": "{\"@type\":\"WebSite\",\"potentialAction\":{\"@type\":\"SearchAction\"}}"},
    {"type": "FAQPage", "pages": ["all blog posts"], "priority": 2, "snippet": "See FAQ generation step"},
    {"type": "BreadcrumbList", "pages": ["all pages"], "priority": 2, "snippet": "Auto-generate from URL structure"}
  ],
  "implementationOrder": ["Week 1: Organization + WebSite on homepage","Week 2: FAQPage on top 10 blog posts","Week 3: BreadcrumbList site-wide"],
  "estimatedGeoScoreImprovement": "+35 points"
}`,
    },
    {
      label: "AI readability & content restructuring",
      outputKey: "aiReadability",
      prompt: `You are a GEO content strategist. Analyze how to restructure content at ${url} so that AI systems can easily parse, understand, and cite it.
Return ONLY valid JSON:
{
  "aiReadabilityScore": 42,
  "contentIssues": [
    {"issue": "Information buried in long paragraphs", "fix": "Use definition boxes and callouts for key facts"},
    {"issue": "No clear factual claims with sources", "fix": "Add [Source: X] citations to all statistics"},
    {"issue": "No TL;DR or summary sections", "fix": "Add 3-bullet summary at top of each article"}
  ],
  "contentPatternsToAdd": ["Definition boxes", "Key fact callouts", "Step-by-step numbered sections", "Comparison tables", "Expert quotes with attribution"],
  "priorityPages": ["Rewrite homepage with entity-first structure","Add summaries to top 5 blog posts"],
  "estimatedCitationIncrease": "+65% in AI-generated answers"
}`,
    },
  ];
}

export function getContentWriterSteps(url: string, topic?: string): AgentStep[] {
  const t = topic || `main service or product`;
  return [
    {
      label: "Topic cluster & pillar page mapping",
      outputKey: "topicCluster",
      prompt: `You are a content strategist. Create a complete topic cluster map for ${url} focused on "${t}".
Return ONLY valid JSON:
{
  "pillarTopic": "...",
  "pillarPageTitle": "...",
  "clusterTopics": [
    {"title": "...", "targetKeyword": "...", "searchVolume": "high|medium|low", "difficulty": "easy|medium|hard", "contentType": "how-to|listicle|comparison"},
    {"title": "...", "targetKeyword": "...", "searchVolume": "high", "difficulty": "medium", "contentType": "how-to"},
    {"title": "...", "targetKeyword": "...", "searchVolume": "medium", "difficulty": "easy", "contentType": "listicle"}
  ],
  "contentCalendar": ["Week 1: Pillar page","Week 2: Cluster 1","Week 3: Cluster 2","Week 4: Cluster 3"],
  "internalLinkingPlan": "Hub-and-spoke model — pillar page links to all clusters"
}`,
    },
    {
      label: "Pillar content generation (SEO + AEO + GEO)",
      outputKey: "pillarContent",
      prompt: `You are a world-class content writer. Create a complete, publish-ready pillar article about "${t}" for ${url}.
Optimize for SEO (keywords, structure), AEO (direct answers, FAQs), and GEO (LLM citation-ready).
Return ONLY valid JSON:
{
  "title": "...",
  "slug": "/blog/...",
  "metaDescription": "...",
  "targetKeyword": "...",
  "lsiKeywords": ["kw1","kw2","kw3","kw4"],
  "wordCount": 2200,
  "readingTime": "9 min",
  "sections": [
    {"heading": "What is X? (Definition)", "keyPoints": ["point1","point2"], "aeoNote": "Answer directly in first sentence"},
    {"heading": "Why X Matters in 2025", "keyPoints": ["point1","point2"], "aeoNote": "Include statistics"},
    {"heading": "How to X: Step-by-Step", "keyPoints": ["step1","step2","step3"], "aeoNote": "Numbered list for featured snippet"},
    {"heading": "X Best Practices", "keyPoints": ["practice1","practice2"], "aeoNote": "Use listicle format"},
    {"heading": "Common X Mistakes to Avoid", "keyPoints": ["mistake1","mistake2"], "aeoNote": ""},
    {"heading": "FAQ: Everything About X", "keyPoints": ["faq1","faq2","faq3"], "aeoNote": "Add FAQPage schema"}
  ],
  "schemaTypes": ["Article","FAQPage","HowTo"],
  "internalLinks": ["Link to /related-page-1","Link to /related-page-2"],
  "callToAction": "..."
}`,
    },
    {
      label: "Social content series (5 posts per platform)",
      outputKey: "socialSeries",
      prompt: `You are a social media content strategist. Create a 5-post social series about "${t}" for ${url}.
Return ONLY valid JSON:
{
  "twitter": [
    {"post": "Tweet 1 under 280 chars with hashtags", "type": "hook"},
    {"post": "Tweet 2", "type": "value"},
    {"post": "Tweet 3", "type": "question"},
    {"post": "Tweet 4", "type": "stat"},
    {"post": "Tweet 5 with CTA", "type": "cta"}
  ],
  "linkedin": [
    {"post": "Professional LinkedIn post 150-200 words", "type": "insight"},
    {"post": "LinkedIn post 2", "type": "story"},
    {"post": "LinkedIn post 3 with CTA", "type": "cta"}
  ],
  "instagram": [
    {"caption": "Instagram caption with 15 hashtags", "visualIdea": "Carousel: 5 slides about X"},
    {"caption": "Instagram post 2 with hashtags", "visualIdea": "Single bold graphic"}
  ],
  "postingSchedule": "Twitter: daily 9am | LinkedIn: Mon/Wed/Fri 8am | Instagram: Tue/Thu 6pm"
}`,
    },
    {
      label: "Content refresh audit (existing pages)",
      outputKey: "refreshAudit",
      prompt: `You are a content audit specialist. Create a content refresh plan for ${url} to improve existing pages for SEO, AEO and GEO.
Return ONLY valid JSON:
{
  "refreshPriority": [
    {"page": "/homepage", "issue": "No clear entity definition", "fix": "Add 1-sentence definition in hero", "effort": "Low", "impact": "High"},
    {"page": "/about", "issue": "No structured data", "fix": "Add Organization schema", "effort": "Low", "impact": "High"},
    {"page": "/blog/*", "issue": "No FAQ sections", "fix": "Add 3 FAQs + FAQPage schema to top 10 posts", "effort": "Medium", "impact": "Very High"}
  ],
  "decayingContent": ["Post from 2022 still ranking but outdated — needs refresh"],
  "contentGaps": ["No comparison pages","No pricing page","No integration pages"],
  "estimatedTrafficRecovery": "+25% from refreshes alone"
}`,
    },
  ];
}

export function getSocialPublisherSteps(url: string): AgentStep[] {
  return [
    {
      label: "Brand voice & audience analysis",
      outputKey: "brandVoice",
      prompt: `You are a brand strategist. Analyze the website ${url} and define the brand voice, audience, and social media strategy.
Return ONLY valid JSON:
{
  "brandPersonality": ["professional","innovative","helpful"],
  "toneOfVoice": "Confident but approachable — like a trusted expert friend",
  "primaryAudience": "...",
  "audienceInterests": ["interest1","interest2","interest3"],
  "topicPillars": ["pillar1","pillar2","pillar3"],
  "contentMix": "40% educational, 30% behind-the-scenes, 20% promotional, 10% user-generated",
  "bestPostingTimes": {
    "twitter": "9am, 12pm, 5pm weekdays",
    "linkedin": "8am Tuesday/Wednesday/Thursday",
    "facebook": "1pm-3pm Wednesday/Thursday",
    "instagram": "11am-1pm Tuesday/Friday"
  }
}`,
    },
    {
      label: "Twitter/X content strategy & 7-day calendar",
      outputKey: "twitterCalendar",
      prompt: `You are a Twitter/X growth expert. Create a 7-day Twitter content calendar for ${url}.
Return ONLY valid JSON:
{
  "strategy": "2-3 tweets per day mixing value, engagement, and promotion",
  "calendar": [
    {"day": "Monday", "posts": [
      {"time": "9:00 AM", "content": "Tweet under 280 chars with 2-3 hashtags", "type": "educational"},
      {"time": "5:00 PM", "content": "Engagement question tweet", "type": "engagement"}
    ]},
    {"day": "Tuesday", "posts": [
      {"time": "9:00 AM", "content": "Value tweet with tip", "type": "value"},
      {"time": "12:00 PM", "content": "Thread hook tweet — 5 things about X 🧵", "type": "thread"}
    ]},
    {"day": "Wednesday", "posts": [
      {"time": "9:00 AM", "content": "Stat or data tweet with source", "type": "data"},
      {"time": "5:00 PM", "content": "Retweet opportunity or quote tweet", "type": "engagement"}
    ]}
  ],
  "hashtagStrategy": ["#primaryHashtag","#secondaryHashtag","#niche1","#niche2"],
  "growthTips": ["Pin best performing tweet","Reply to every comment in first hour","Cross-post top threads to LinkedIn"]
}`,
    },
    {
      label: "LinkedIn authority content series",
      outputKey: "linkedinSeries",
      prompt: `You are a LinkedIn content expert. Create a 4-week LinkedIn content series for ${url} to build thought leadership.
Return ONLY valid JSON:
{
  "seriesTheme": "...",
  "week1": {
    "theme": "The Problem",
    "post": "Full LinkedIn post 200-250 words establishing the problem your audience faces. Include hook, insight, CTA.",
    "type": "thought-leadership"
  },
  "week2": {
    "theme": "The Framework",
    "post": "Full LinkedIn post 200-250 words sharing your framework or approach.",
    "type": "educational"
  },
  "week3": {
    "theme": "Case Study / Proof",
    "post": "Full LinkedIn post 200-250 words with results story.",
    "type": "social-proof"
  },
  "week4": {
    "theme": "The Invitation",
    "post": "Full LinkedIn post 200-250 words with direct CTA.",
    "type": "conversion"
  },
  "engagementTips": ["Post at 8am Tuesday","Tag relevant people","Add poll in week 3 post"]
}`,
    },
    {
      label: "Instagram visual content plan",
      outputKey: "instagramPlan",
      prompt: `You are an Instagram growth expert. Create an Instagram content plan for ${url} focused on visual storytelling and engagement.
Return ONLY valid JSON:
{
  "feedStrategy": "Alternating: educational carousel → single quote graphic → product/service post",
  "reelIdeas": [
    {"concept": "60-sec 'Did you know?' about main service", "hook": "Stop scrolling if you...", "cta": "Save this for later"},
    {"concept": "Behind the scenes: how we work", "hook": "Ever wonder how we...", "cta": "Follow for more"},
    {"concept": "Quick tip series: 3 tips in 30 seconds", "hook": "3 tips that will change...", "cta": "Comment your tip"}
  ],
  "carouselTemplates": [
    {"title": "5 Myths About [Topic]", "slides": ["Cover","Myth 1","Myth 2","Myth 3","Myth 4","Myth 5","CTA"]},
    {"title": "How to [Achieve Goal] in 5 Steps", "slides": ["Cover","Step 1","Step 2","Step 3","Step 4","Step 5","CTA"]}
  ],
  "hashtagSets": {
    "broad": ["#marketing","#business","#growth"],
    "niche": ["#specifictag1","#specifictag2","#specifictag3"],
    "branded": ["#yourbrand","#yourbrandtip"]
  },
  "postingFrequency": "Feed: 4x/week | Reels: 3x/week | Stories: daily"
}`,
    },
  ];
}

export function getSiteAuditorSteps(url: string): AgentStep[] {
  return [
    {
      label: "Technical SEO & Core Web Vitals audit",
      outputKey: "technicalAudit",
      prompt: `You are a technical SEO auditor. Perform a comprehensive technical audit for ${url}.
Return ONLY valid JSON:
{
  "coreWebVitals": {
    "lcp": {"status": "needs_improvement", "value": "3.8s", "target": "<2.5s", "fix": "Optimize hero images, preload fonts"},
    "fid": {"status": "good", "value": "45ms", "target": "<100ms", "fix": "None needed"},
    "cls": {"status": "poor", "value": "0.18", "target": "<0.1", "fix": "Add size attributes to all images"}
  },
  "technicalIssues": [
    {"issue": "Missing canonical tags on 8 pages", "severity": "high", "fix": "Add rel=canonical to all pages", "impact": "Prevents duplicate content"},
    {"issue": "No HTTPS redirect on www version", "severity": "critical", "fix": "Set up 301 redirect www→non-www", "impact": "SEO authority consolidation"},
    {"issue": "Large JS bundle size (1.2MB)", "severity": "medium", "fix": "Code splitting and tree shaking", "impact": "LCP improvement"}
  ],
  "mobileScore": 72,
  "desktopScore": 88,
  "crawlabilityIssues": ["robots.txt blocking /blog","3 pages returning 404","Sitemap not submitted to GSC"]
}`,
    },
    {
      label: "Broken link & redirect chain detection",
      outputKey: "linkAudit",
      prompt: `You are a site health specialist. Audit link health and redirect chains for ${url}.
Return ONLY valid JSON:
{
  "estimatedBrokenLinks": 7,
  "brokenLinkExamples": [
    {"url": "/old-page-url", "statusCode": 404, "foundOn": "/blog/old-post", "fix": "Redirect to /new-page-url"},
    {"url": "/deleted-category", "statusCode": 404, "foundOn": "homepage nav", "fix": "Remove from navigation"}
  ],
  "redirectChains": [
    {"chain": "/page-a → /page-b → /page-c (3 hops)", "fix": "Direct redirect /page-a → /page-c"},
    {"chain": "/old → /new-old → /new (2 hops)", "fix": "Update /old to point directly to /new"}
  ],
  "externalLinkIssues": ["3 outbound links to dead domains","5 links missing rel=noopener"],
  "fixPriority": "Fix 404s first (3 critical pages losing link equity)"
}`,
    },
    {
      label: "Competitor rank tracker & gap report",
      outputKey: "competitorRanks",
      prompt: `You are a competitive intelligence analyst. Identify competitors for ${url} and analyze ranking gaps.
Return ONLY valid JSON:
{
  "topCompetitors": [
    {"domain": "competitor1.com", "estimatedTraffic": "45K/mo", "domainAuthority": 65, "topKeywords": ["kw1","kw2","kw3"]},
    {"domain": "competitor2.com", "estimatedTraffic": "28K/mo", "domainAuthority": 58, "topKeywords": ["kw4","kw5","kw6"]}
  ],
  "rankingGaps": [
    {"keyword": "target keyword 1", "yourPosition": "not ranking", "competitorPosition": 2, "opportunity": "high"},
    {"keyword": "target keyword 2", "yourPosition": 15, "competitorPosition": 3, "opportunity": "medium"}
  ],
  "contentGaps": ["Competitor A has /comparison page you lack","Competitor B ranks for FAQ queries you haven't targeted"],
  "backlinkGaps": ["Competitor A has 50+ .edu links","Tech press coverage you're missing"],
  "quickWins": ["Target 'low-competition' keywords competitors rank 6-10 for"]
}`,
    },
    {
      label: "On-page anomaly detection & monitoring plan",
      outputKey: "monitoringPlan",
      prompt: `You are a site monitoring expert. Create an anomaly detection and monitoring plan for ${url}.
Return ONLY valid JSON:
{
  "criticalAnomalies": [
    {"type": "Title tag duplication", "affectedPages": 4, "risk": "high", "autoFix": "Enforce unique titles via template"},
    {"type": "Missing H1 tags", "affectedPages": 2, "risk": "medium", "autoFix": "Add H1 to page template"}
  ],
  "monitoringAlerts": [
    {"metric": "Organic traffic drop >20%", "frequency": "daily", "action": "Check Google Search Console for manual actions"},
    {"metric": "New 404 pages", "frequency": "daily", "action": "Auto-create 301 redirect"},
    {"metric": "Core Web Vitals regression", "frequency": "weekly", "action": "Notify dev team"},
    {"metric": "Competitor new content in top 10", "frequency": "weekly", "action": "Schedule content update"}
  ],
  "uptimeConfig": {"checkFrequency": "5 minutes", "alertThreshold": "2 failed checks", "contacts": ["devops@company.com"]},
  "monthlyAuditChecklist": ["GSC errors review","Backlink profile check","Speed audit","Competitor content review","Schema validation"]
}`,
    },
  ];
}
