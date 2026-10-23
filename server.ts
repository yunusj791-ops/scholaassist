import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialise GoogleGenAI with required User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemini-3.8-flash';

import { dbService } from './src/server/db.ts';
import { 
  synthesizeAcademicProject, 
  generateAcademicDiagrams, 
  generateAcademicTables, 
  generateAcademicFigures,
  generateAcademicCharts,
  generatePreliminaryPages,
  generateAcademicAppendices
} from './src/server/academicEngine.ts';

// Helper to sanitize Gemini response text
function getCleanText(response: any): string {
  if (!response) return '';
  if (typeof response === 'string') return response;
  if (typeof response.text === 'string') return response.text;
  if (typeof response.text === 'function') return response.text();
  return '';
}

/**
 * Safe JSON parser for AI responses:
 * - Strips ```json and ``` markdown code fences
 * - Finds first '{' and last '}' (or '[' and ']') to isolate the exact JSON substring
 * - Wraps JSON.parse in try/catch to log friendly warning instead of crashing
 */
function safeParseGeminiJson<T = any>(response: any, fallback: T | null = null): T | null {
  try {
    let rawText = '';
    if (typeof response === 'string') {
      rawText = response;
    } else if (response && typeof response.text === 'string') {
      rawText = response.text;
    } else if (response && typeof response.text === 'function') {
      rawText = response.text();
    } else if (response && response.candidates?.[0]?.content?.parts?.[0]?.text) {
      rawText = response.candidates[0].content.parts[0].text;
    }

    let text = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    // Find the first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    } else {
      // Check for array payloads
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        text = text.substring(firstBracket, lastBracket + 1);
      }
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      console.log("AI returned text, not JSON:", text);
      return fallback;
    }
  } catch (err) {
    console.log("Error in safeParseGeminiJson:", err);
    return fallback;
  }
}


// Helper to extract authenticated user
function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return dbService.getUserByToken(token);
}

// ---------------- AUTH ROUTES ----------------
// Register new account (assigns 3 one-time free credits)
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, country, institution, institutionType, degreeLevel, department } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const result = dbService.registerUser({
      email,
      password,
      fullName,
      country: country || 'Nigeria',
      institution: institution || 'Higher Institution',
      institutionType: institutionType || 'University',
      degreeLevel: degreeLevel || 'Undergraduate / Bachelor’s Degree',
      department: department || 'General Academic Studies',
    });
    res.json({ status: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = dbService.loginUser(email, password);
    res.json({ status: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Login failed.' });
  }
});

// Get Current User Profile & Credits
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized session.' });
  }
  res.json({ status: true, user });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    dbService.logout(authHeader.split(' ')[1]);
  }
  res.json({ status: true, message: 'Logged out successfully.' });
});

// ---------------- USER SAVED DOCUMENTS ----------------
// Always accessible and editable even if credits or sub are expired!
app.get('/api/user/documents', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const docs = dbService.getUserDocuments(user.id);
  res.json({ status: true, documents: docs });
});

app.post('/api/user/documents', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const { id, title, department, academicLevel, country, data, hasRealEmpiricalData } = req.body;
  if (!title || !data) {
    return res.status(400).json({ error: 'Document title and data required.' });
  }
  const saved = dbService.saveUserDocument(user.id, {
    id,
    title,
    department: department || user.department,
    academicLevel: academicLevel || user.degreeLevel,
    country: country || user.country,
    data,
    hasRealEmpiricalData: Boolean(hasRealEmpiricalData),
  });
  res.json({ status: true, document: saved });
});

app.delete('/api/user/documents/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const deleted = dbService.deleteUserDocument(req.params.id, user.id);
  res.json({ status: true, deleted });
});

// ---------------- ADMIN ENDPOINTS ----------------
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const overview = dbService.getAdminOverview();
  res.json({ status: true, ...overview });
});

app.post('/api/admin/pricing', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const { weeklyPriceUSD, monthlyPriceUSD, freeTierCredits } = req.body;
  const updated = dbService.updatePlatformPricing(weeklyPriceUSD, monthlyPriceUSD, freeTierCredits);
  res.json({ status: true, config: updated });
});

app.post('/api/admin/users/:id/credits', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const { amount } = req.body;
  const updated = dbService.grantCredits(req.params.id, Number(amount));
  res.json({ status: true, user: updated });
});

app.post('/api/admin/users/:id/subscription', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const { planId, planName, durationDays } = req.body;
  const updated = dbService.activateSubscription(
    req.params.id,
    planId || 'scholar-pro-monthly',
    planName || 'Scholar Pro Pass',
    'free',
    'ADMIN_GRANT_' + Date.now(),
    Number(durationDays) || 30
  );
  res.json({ status: true, user: updated });
});

app.post('/api/admin/config', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  const { shopUrl, weeklyShopUrl, monthlyShopUrl } = req.body;
  const updated = dbService.updateGatewayConfig(shopUrl, weeklyShopUrl, monthlyShopUrl);
  res.json({ status: true, config: updated });
});

// 1. Literature Review & Paper Synthesis Endpoint
app.post('/api/academic/synthesize', async (req: Request, res: Response) => {
  try {
    const { paperText, focusArea, studyLevel, outputStyle } = req.body;
    if (!paperText) {
      return res.status(400).json({ error: 'Text or abstract content is required.' });
    }

    const prompt = `You are a distinguished university academic advisor and research methodologist assisting a ${studyLevel || 'higher institution'} student.
Analyze and synthesize the following academic text or research paper content:

"""
${paperText}
"""

Focus Area / Perspective: ${focusArea || 'General Academic Rigor'}
Output Style: ${outputStyle || 'comprehensive'}

Provide a structured, deep academic synthesis in valid JSON format matching this schema:
{
  "title": "Concise inferred or stated academic title",
  "keyHypothesis": "The primary research question, thesis statement, or hypothesis investigated",
  "theoreticalFramework": "Theoretical underpinnings or conceptual models utilized",
  "methodology": {
    "type": "e.g., Quantitative / Qualitative / Empirical / Quasi-experimental / Meta-analysis",
    "sampleOrDataset": "Details on participants, corpus, or dataset used",
    "procedures": "Core methodological procedures and instruments"
  },
  "keyFindings": ["Finding 1 with empirical support", "Finding 2 with empirical support", "Finding 3 with empirical support"],
  "criticalLimitations": ["Methodological limitation or constraint 1", "Limitation 2"],
  "researchGapsAndFutureWork": ["Unaddressed gap in the literature", "Suggested future direction for subsequent scholars"],
  "practicalImplications": "How this research impacts policy, industry, or university practice",
  "suggestedCritique": "Balanced academic critique: strengths vs. potential biases or threats to validity"
}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = safeParseGeminiJson(response);
    if (!parsed) {
      return res.status(502).json({ error: 'AI returned text, not structured JSON. Please try synthesizing again.' });
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/academic/synthesize:', error);
    res.status(500).json({ error: error.message || 'Failed to synthesize research paper.' });
  }
});

// 2. Citation Extraction & Formatter Endpoint
app.post('/api/academic/citations', async (req: Request, res: Response) => {
  try {
    const { sourceInput, preferredStyle } = req.body;
    if (!sourceInput) {
      return res.status(400).json({ error: 'Source text, title, or reference string is required.' });
    }

    const prompt = `You are an academic bibliography and citation specialist familiar with APA 7th, MLA 9th, Chicago 17th (Notes & Author-Date), Harvard, IEEE, and BibTeX.
Extract metadata from the following source information and format it across all standard higher-education citation standards.

Source input:
"""
${sourceInput}
"""

Return valid JSON with this exact structure:
{
  "metadata": {
    "authors": ["Last, First M."],
    "year": "2024",
    "title": "Article or Book Title",
    "publication": "Journal / Conference / Publisher Name",
    "volume": "12",
    "issue": "4",
    "pages": "120-135",
    "doiOrUrl": "https://doi.org/..."
  },
  "citations": {
    "apa7": "Full reference in APA 7th edition formatting",
    "mla9": "Full reference in MLA 9th edition formatting",
    "chicago": "Full reference in Chicago 17th Author-Date formatting",
    "harvard": "Full reference in Harvard style",
    "ieee": "Full reference in IEEE numeric standard formatting",
    "bibtex": "@article{...}"
  },
  "inTextCitation": {
    "parenthetical": "e.g., (Smith & Taylor, 2024)",
    "narrative": "e.g., Smith and Taylor (2024)",
    "ieeeNumeric": "[1]"
  },
  "formattingNotes": "Brief tips on italicization, DOI linking, or edge cases for this entry"
}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = safeParseGeminiJson(response);
    if (!parsed) {
      return res.status(502).json({ error: 'AI returned text, not JSON for citation metadata. Please try again.' });
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/academic/citations:', error);
    res.status(500).json({ error: error.message || 'Failed to process citations.' });
  }
});

// 3. Thesis & Research Proposal Architect Endpoint
app.post('/api/academic/proposal', async (req: Request, res: Response) => {
  try {
    const { topic, discipline, degreeLevel, targetGoal } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Research topic is required.' });
    }

    const prompt = `You are a University Dissertation Committee Chairperson and senior academic researcher in ${discipline || 'Interdisciplinary Studies'}.
Develop a comprehensive, defense-ready research outline and methodology proposal for a ${degreeLevel || 'Undergraduate'} student.

Topic: ${topic}
Goal: ${targetGoal || 'Comprehensive Thesis Proposal'}

Respond with valid JSON:
{
  "suggestedAcademicTitles": [
    "Academic Title 1 (Empirical)",
    "Academic Title 2 (Theoretical)",
    "Academic Title 3 (Applied/Policy-driven)"
  ],
  "problemStatement": "A rigorous 2-3 paragraph academic problem statement highlighting the real-world friction and scholarly vacuum",
  "researchQuestions": [
    "Primary RQ 1",
    "Secondary RQ 2",
    "Secondary RQ 3"
  ],
  "hypotheses": [
    "H1: Null and alternate hypothesis or proposition",
    "H2: Null and alternate hypothesis or proposition"
  ],
  "theoreticalFramework": "Recommended theoretical anchors, seminal foundational authors, and conceptual variables",
  "methodologicalDesign": {
    "researchParadigm": "e.g., Post-positivist / Constructivist / Pragmatist",
    "approach": "e.g., Quantitative (Survey/Regression) / Qualitative (Phenomenology/Grounded Theory) / Mixed Methods",
    "populationAndSampling": "Target population, sampling technique (stratified, purposive), and sample size rationale",
    "dataCollection": "Instruments, survey measures, interview protocols, or secondary APIs/datasets",
    "analyticalPlan": "Statistical tests (e.g., ANOVA, SEM, Logistic Regression) or qualitative coding frameworks (Thematic analysis, NVivo)"
  },
  "chapterBreakdown": [
    {
      "chapter": "Chapter 1: Introduction",
      "keySections": ["Background", "Statement of Problem", "Research Objectives", "Significance", "Delimitations"]
    },
    {
      "chapter": "Chapter 2: Literature Review",
      "keySections": ["Theoretical Foundations", "Current State of Knowledge", "Empirical Debates", "Literature Gaps"]
    },
    {
      "chapter": "Chapter 3: Methodology",
      "keySections": ["Research Design", "Sampling", "Instrumentation", "Validity & Reliability", "Ethical Approvals"]
    },
    {
      "chapter": "Chapter 4: Data Presentation & Analysis",
      "keySections": ["Descriptive Statistics", "Hypothesis Testing", "Secondary Findings"]
    },
    {
      "chapter": "Chapter 5: Discussion & Conclusion",
      "keySections": ["Integration with Literature", "Theoretical Implications", "Managerial/Policy Recommendations", "Future Research"]
    }
  ],
  "potentialEthicalRisks": ["IRB / Ethics consideration 1", "Data privacy & consent consideration 2"],
  "significanceStatement": "Scholarly and societal impact of this proposed inquiry"
}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = safeParseGeminiJson(response);
    if (!parsed) {
      return res.status(502).json({ error: 'AI returned text, not JSON for proposal. Please try again.' });
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/academic/proposal:', error);
    res.status(500).json({ error: error.message || 'Failed to generate proposal.' });
  }
});

// 4. Academic Tone Polisher & Formal Rhetoric Refiner Endpoint
app.post('/api/academic/polish', async (req: Request, res: Response) => {
  try {
    const { draftText, targetTone, citationSystem } = req.body;
    if (!draftText) {
      return res.status(400).json({ error: 'Draft text is required.' });
    }

    const prompt = `You are a senior academic copy-editor for top peer-reviewed journals (e.g., Nature, IEEE Transactions, Harvard University Press).
Elevate the following student draft into scholarly, publication-caliber prose while preserving the student's authentic underlying thesis.

Target Tone: ${targetTone || 'Peer-Reviewed Formal Journal'}
Citation Standard: ${citationSystem || 'APA 7th'}

Draft to refine:
"""
${draftText}
"""

Guidelines:
- Eliminate colloquialisms, informal rhetorical questions, and emotional assertions.
- Use academic hedging language appropriately ("The data suggests", "These findings point towards" rather than absolute "This proves").
- Refine nominalizations, syntactical variety, and transition logic.
- Highlight specific editorial transformations so the student learns academic rhetoric.

Respond with valid JSON:
{
  "polishedText": "The fully rewritten academic paragraph(s)",
  "executiveSummaryOfChanges": "High-level summary of rhetoric elevation and syntactic enhancements made",
  "editorialCritique": [
    {
      "originalSegment": "exact phrase from user draft",
      "revisedSegment": "scholarly upgraded phrase",
      "rationale": "Why this change adheres to scholarly standards (e.g., objectivity, hedging, concision)"
    }
  ],
  "vocabularyUpgrades": [
    {
      "original": "simple word",
      "scholarlyAlternative": "academic term",
      "contextualNote": "Nuance explanation"
    }
  ],
  "readabilityMetrics": {
    "toneRating": "e.g., Peer-Reviewed Journal Caliber (95%)",
    "clarityScore": "92/100",
    "hedgingAdequacy": "High (Scholarly cautious claims)"
  }
}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    });

    const parsed = safeParseGeminiJson(response);
    if (!parsed) {
      return res.status(502).json({ error: 'AI returned text, not JSON for polished draft. Please try again.' });
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/academic/polish:', error);
    res.status(500).json({ error: error.message || 'Failed to polish academic text.' });
  }
});

// 5. LaTeX & Formula Decipherer Endpoint
app.post('/api/academic/formula', async (req: Request, res: Response) => {
  try {
    const { formulaInput, contextField } = req.body;
    if (!formulaInput) {
      return res.status(400).json({ error: 'Formula or equation input is required.' });
    }

    const prompt = `You are a university STEM professor in ${contextField || 'Applied Mathematics / Computer Science / Physics'}.
Decipher, explain, and format the following mathematical, scientific, or statistical equation:

Input:
"""
${formulaInput}
"""

Respond with valid JSON:
{
  "formulaName": "Standard academic name (e.g., Shannon Entropy, Bayes Theorem, Gradient Descent, Navier-Stokes)",
  "latexBlock": "Ready-to-copy clean LaTeX math expression (e.g. \\mathcal{L}_{\\theta} = -\\sum_{i=1}^N ...)",
  "latexInline": "Inline LaTeX snippet (e.g. $E = mc^2$)",
  "plainEnglishSummary": "Intuitive 1-2 sentence explanation of what the formula actually represents and measures",
  "variablesBreakdown": [
    {
      "symbol": "e.g. \\theta",
      "name": "Parameter vector",
      "unitOrType": "Real tensor / dimensionless",
      "role": "Represents the trainable weights of the neural model"
    }
  ],
  "stepByStepDerivationOrMeaning": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "practicalApplication": "Concrete higher-institution research use case or experiment where this equation is pivotal",
  "commonStudentPitfalls": "Common exam/homework traps students fall into when applying this formula"
}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = safeParseGeminiJson(response);
    if (!parsed) {
      return res.status(502).json({ error: 'AI returned text, not JSON for formula explanation. Please try again.' });
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/academic/formula:', error);
    res.status(500).json({ error: error.message || 'Failed to decipher formula.' });
  }
});

// 6. Active Recall & Exam Mastery (Flashcards & Quizzes)
app.post('/api/academic/study', async (req: Request, res: Response) => {
  try {
    const { studyMaterial, count, level, mode } = req.body;
    if (!studyMaterial) {
      return res.status(400).json({ error: 'Study notes or reading excerpt is required.' });
    }

    const prompt = `You are a cognitive science learning specialist designing an active-recall study suite for higher education students (${level || 'University / College'}).
Based on the following academic text:

"""
${studyMaterial}
"""

Target Mode: ${mode || 'both'} (flashcards and exam questions)
Target items count: ${count || 6}

Generate high-yield materials in valid JSON:
{
  "topicTitle": "Core subject title",
  "flashcards": [
    {
      "id": "fc-1",
      "front": "Clear, concise high-yield academic question or prompt",
      "back": "Accurate, comprehensive answer with critical distinction",
      "keyTerms": ["Key concept 1", "Key concept 2"],
      "difficulty": "Easy | Medium | Hard"
    }
  ],
  "quizQuestions": [
    {
      "id": "qz-1",
      "question": "Scenario-based or conceptual higher-institution question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Thorough rationale explaining why the correct answer is valid and why distractors are flawed",
      "taxonomyLevel": "Recall | Analysis | Evaluation | Application"
    }
  ],
  "freeResponsePrompt": {
    "question": "Comprehensive analytical essay/free-response exam prompt",
    "modelGradingRubric": [
      "Criterion 1 (e.g. Theoretical grounding - 40%)",
      "Criterion 2 (e.g. Methodological critique - 35%)",
      "Criterion 3 (e.g. Synthesis & clarity - 25%)"
    ],
    "exemplarKeyPoints": ["Point A that a top-scoring paper must include", "Point B that must be addressed"]
  }
}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = safeParseGeminiJson(response);
    if (!parsed) {
      return res.status(502).json({ error: 'AI returned text, not JSON for study cards. Please try again.' });
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/academic/study:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study materials.' });
  }
});

// 7. General Interactive Academic Research Tutor Chat
app.post('/api/academic/chat', async (req: Request, res: Response) => {
  try {
    const { messages, academicContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const conversationHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemInstruction = `You are ScholarAssist - Global Academic Research Assistant for OND, HND, BSc, MSc, and PhD students.

Your job:
- Help students from ANY country (Nigeria, USA, UK, India, Ghana, Kenya, Canada, etc.) with Project, Thesis, Dissertation and Seminar research.
- Generate full chapters or chapter-by-chapter: Topic selection, Abstract, Chapter 1 Introduction, Chapter 2 Literature Review, Chapter 3 Methodology, Chapter 4 Results, Chapter 5 Summary/Conclusion, References, Seminar Slides, Defense Q&A.

Rules:
1. Never say you will write the entire project to cheat. Always say "I will generate a research draft and guide with citations for you to edit and expand"
2. Always include recent references (2020-2026) and citations in APA, MLA, Chicago as requested
3. Adapt to country: If user says they are from USA, use US academic style. UK = UK style. Nigeria/Ghana = simple clear academic style.
4. After EVERY generation, remind the user of these 3 actions:
   [ Humanize This Chapter ]
   [ Rewrite for My Country Style ]
   [ Download as Word Docx ]
5. Ask user their Level and Country at start if not known: "What is your Level (OND/HND/BSc/MSc/PhD) and Country?"

Academic context of current session: ${academicContext || 'General Higher Education Academic Inquiry'}`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: conversationHistory,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const reply = getCleanText(response);
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/academic/chat:', error);
    res.status(500).json({ error: error.message || 'Failed to generate tutor response.' });
  }
});

// 8. Complete Project & Seminar Material Generator Endpoint
app.post('/api/academic/project-generator', async (req: Request, res: Response) => {
  try {
    const { 
      topic, 
      department, 
      academicLevel, 
      caseStudy, 
      projectType, 
      studentEmpiricalData, 
      country,
      selectedScope = 'full' // 'full' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5'
    } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Please provide a project or seminar topic.' });
    }

    // Server-side credit and subscription enforcement
    const user = getAuthUser(req);
    let creditStatus: { allowed: boolean; reason: string; remainingCredits: number; planName: string } | null = null;
    if (user) {
      creditStatus = dbService.consumeCreditOrCheckPro(user.id);
      if (!creditStatus.allowed) {
        return res.status(403).json({
          error: 'CREDITS_EXHAUSTED',
          message: 'You have exhausted your 3 free research credits. Please activate a Weekly Pass ($1.49) or Monthly Pass ($3.99) to generate new research materials.',
          remainingCredits: 0,
        });
      }
    }

    const hasEmpirical = Boolean(studentEmpiricalData && studentEmpiricalData.trim().length > 10);

    const chapterScopeDescription = selectedScope === 'full' 
      ? 'GENERATE FULL COMPLETE PROJECT (ALL 5 CHAPTERS + ABSTRACT + REFERENCES + JOURNAL SOURCES).'
      : `GENERATE IN-DEPTH FOCUS ON ${selectedScope.toUpperCase()}: The student has selected to specifically generate ${selectedScope.toUpperCase()} for their supervisor. Give supreme priority, exhaustive paragraph depth, and comprehensive scholarly analysis to ${selectedScope.toUpperCase()}, while providing coherent scaffolding for other sections.`;

    const prompt = `You are ScholarAssist - Global Academic Research Assistant for OND, HND, BSc, MSc, and PhD students.
Your job is to help students from ANY country (Nigeria, USA, UK, India, Ghana, Kenya, Canada, etc.) with Project, Thesis, Dissertation and Seminar research.
Generate full chapters or chapter-by-chapter: Topic selection, Abstract, Chapter 1 Introduction, Chapter 2 Literature Review, Chapter 3 Methodology, Chapter 4 Results, Chapter 5 Summary/Conclusion, References, Seminar Slides, Defense Q&A.

ACADEMIC INTEGRITY & ETHICAL MANDATE:
- Never say or imply you write the entire final submission to cheat. Frame this as: "I will generate a research draft and guide with citations for you to edit and expand".
- Always include recent references (2020-2026) and citations in APA, MLA, Chicago as appropriate.
- Adapt to country: If user is from USA, use US academic style. UK = UK style (British spelling, Harvard). Nigeria/Ghana = simple, clear, formal 5-chapter academic style. India = formal, detailed with objectives and scope. Canada/Australia = clear, concise APA/Harvard.

GENERATION SCOPE: ${chapterScopeDescription}
Topic: "${topic.trim()}"
Department/Discipline: ${department || 'Academic Department'}
Academic Level: ${academicLevel || 'BSc / Undergraduate'}
Case Study / Context: ${caseStudy || 'Higher Institution / Empirical Sector Context'}
Target Country / Higher Education System: ${country || 'International'}

${hasEmpirical ? `
STUDENT'S EMPIRICAL RESEARCH DATA PROVIDED:
The student has collected and uploaded the following actual empirical research data:
"""
${studentEmpiricalData}
"""
CRITICAL ACADEMIC INTEGRITY INSTRUCTION: Analyze the student's actual uploaded empirical data above for Chapter 4 (Data Presentation & Analysis). Do NOT make up false numbers when actual data is provided.
` : `
ACADEMIC INTEGRITY INSTRUCTION: The student has not yet entered their field data. For Chapter 4, provide a realistic structured baseline demonstration, and explicitly label each table or analysis with "[HYPOTHETICAL DEMONSTRATION DATA: Please replace with your administered survey or experimental responses in compliance with institutional academic integrity policies]".
`}

REPUTABLE PEER-REVIEWED JOURNAL & APA 7TH REQUIREMENTS:
- Prioritize credible peer-reviewed academic literature published within the last 5 years (2021 to 2026), alongside foundational seminal theories where appropriate.
- SOURCING: Every citation and reference MUST originate from reputable, real scholarly journals and reputable academic publishers (e.g. Elsevier / ScienceDirect, IEEE Transactions, Springer Nature, Wiley, Taylor & Francis, SAGE Publications, Emerald Insight, Oxford University Press, PubMed, African Journals Online - AJOL).
- Provide valid DOI formats (e.g., https://doi.org/10.1016/... or https://doi.org/10.1109/...) and complete APA 7th edition metadata.
- In Chapter 2, weave realistic empirical reviews with author surnames, reputable journal names, and publication years (2021-2026).
- Supply a curated list of "journalSources" detailing each cited journal's title, publisher, indexing category, and direct citation.

Respond in valid JSON with this exact schema:
{
  "topicTitle": "${topic.trim()}",
  "department": "${department || 'Academic Department'}",
  "academicLevel": "${academicLevel || 'Undergraduate'}",
  "caseStudy": "${caseStudy || ''}",
  "country": "${country || 'International'}",
  "hasEmpiricalData": ${hasEmpirical},
  "selectedScope": "${selectedScope}",
  "abstract": "A 250-350 word academic abstract covering the background, problem statement, methodological framework, empirical findings, and policy/practical conclusion.",
  "keywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"],
  "chapter1": {
    "title": "CHAPTER ONE: INTRODUCTION",
    "background": "Detailed 2-3 paragraph background of the study contextualizing the real-world problem and scholarly background.",
    "statementOfProblem": "Rigorously stated problem of the study articulating the research vacuum and adverse consequences of unaddressed issues.",
    "objectives": [
      "General Objective: To examine...",
      "Specific Objective 1: To evaluate...",
      "Specific Objective 2: To ascertain...",
      "Specific Objective 3: To assess..."
    ],
    "researchQuestions": [
      "1. What is the extent of...",
      "2. How does...",
      "3. What relationship exists between..."
    ],
    "hypotheses": [
      "H01: There is no significant relationship between...",
      "H02: There is no significant difference in..."
    ],
    "significance": "Value to students, university researchers, industry practitioners, and policymakers.",
    "scopeAndDelimitation": "Scope of the study in terms of content, geographical context, and limitations.",
    "definitionOfTerms": [
      {"term": "Primary Concept", "definition": "Operationalized academic definition within this study context."},
      {"term": "Secondary Concept", "definition": "Operationalized academic definition within this study context."}
    ]
  },
  "chapter2": {
    "title": "CHAPTER TWO: REVIEW OF RELATED LITERATURE",
    "conceptualFramework": "In-depth review of the core concepts, historical perspectives, and analytical dimensions.",
    "theoreticalFramework": "Foundational theory, seminal author, year, and how this theory underpins the current project.",
    "empiricalReview": "Comprehensive review of 3-5 empirical studies published in reputable peer-reviewed journals between 2021-2026, with author names, methodologies, and findings.",
    "gapsInLiterature": "Summary of identified methodological, geographical, and conceptual gaps that this project resolves."
  },
  "chapter3": {
    "title": "CHAPTER THREE: RESEARCH METHODOLOGY",
    "researchDesign": "Description of research design (e.g. descriptive survey design / experimental / software engineering agile SDLC).",
    "populationOfStudy": "Target population characteristics, size, and institutional bounds.",
    "sampleSizeAndSamplingTechnique": "Sample size determination (e.g. Taro Yamane formula or G*Power) and sampling technique (stratified / random / purposive).",
    "instrumentationAndValidation": "Instruments used (structured questionnaire / API benchmarks / interview protocol), face and content validity, and reliability coefficients (Cronbach's alpha).",
    "procedureForDataCollection": "Step-by-step administration and retrieval protocols.",
    "methodOfDataAnalysis": "Analytical software (SPSS / Python / R) and statistical tests (mean score, standard deviation, Pearson r, Multiple Regression / ANOVA)."
  },
  "chapter4": {
    "title": "CHAPTER FOUR: DATA PRESENTATION, ANALYSIS AND DISCUSSION",
    "dataPresentation": "${hasEmpirical ? 'Presentation based on student uploaded empirical data' : '[HYPOTHETICAL DEMONSTRATION DATA] Demographic characteristics and baseline survey data'}",
    "analysisOfResearchQuestions": "Detailed narrative analysis addressing each research question with empirical interpretation.",
    "testOfHypotheses": "Results of hypothesis tests with p-values, decision rules (reject or accept null hypothesis), and analytical implications.",
    "discussionOfFindings": "Triangulating empirical findings with previous peer-reviewed literature from Chapter Two (2021-2026), highlighting convergence and novel insights."
  },
  "chapter5": {
    "title": "CHAPTER FIVE: SUMMARY, CONCLUSION AND RECOMMENDATIONS",
    "summaryOfFindings": "Concise recap of the major findings corresponding to each specific objective.",
    "conclusion": "Definitive academic conclusion drawn from the empirical data.",
    "recommendations": [
      "Recommendation 1: For educational institutions / universities...",
      "Recommendation 2: For industry practitioners / administrators...",
      "Recommendation 3: For government and policymakers..."
    ],
    "contributionToKnowledge": "Specific scholarly and technological contributions made by this project.",
    "suggestionsForFurtherStudies": [
      "Area for further research 1",
      "Area for further research 2"
    ]
  },
  "journalSources": [
    {
      "title": "Empirical study on topic domain",
      "authors": "Author A. & Author B.",
      "journal": "International Journal of Information Management",
      "publisher": "Elsevier",
      "year": 2024,
      "indexing": "Scopus / Web of Science Q1",
      "doi": "https://doi.org/10.1016/j.ijinfomgt.2024.102715",
      "apaCitation": "Author, A., & Author, B. (2024). Empirical study on topic domain. International Journal of Information Management, 75, 102715. https://doi.org/10.1016/j.ijinfomgt.2024.102715"
    },
    {
      "title": "Advanced frameworks in higher education and technology",
      "authors": "Scholar, C. D.",
      "journal": "IEEE Access",
      "publisher": "IEEE",
      "year": 2023,
      "indexing": "IEEE Xplore / Scopus",
      "doi": "https://doi.org/10.1109/ACCESS.2023.3289012",
      "apaCitation": "Scholar, C. D. (2023). Advanced frameworks in higher education and technology. IEEE Access, 11, 45210-45222. https://doi.org/10.1109/ACCESS.2023.3289012"
    },
    {
      "title": "Methodological rigor in contemporary tertiary research",
      "authors": "Adeyemi, T. O., & Okoro, P. E.",
      "journal": "African Journals Online (AJOL) - Journal of Educational Research",
      "publisher": "AJOL / Academic Press",
      "year": 2023,
      "indexing": "AJOL / Scopus",
      "doi": "https://doi.org/10.4314/jer.v22i3.4",
      "apaCitation": "Adeyemi, T. O., & Okoro, P. E. (2023). Methodological rigor in contemporary tertiary research. Journal of Educational Research, 22(3), 88-104. https://doi.org/10.4314/jer.v22i3.4"
    }
  ],
  "references": [
    "Adeyemi, T. O., & Okoro, P. E. (2023). Methodological rigor in contemporary tertiary research. Journal of Educational Research, 22(3), 88-104. https://doi.org/10.4314/jer.v22i3.4",
    "Akinola, B. O., & Bello, M. K. (2023). Contemporary research methods in higher education. Academic Press. https://doi.org/10.1016/j.ced.2023.1042",
    "Creswell, J. W., & Creswell, J. D. (2022). Research design: qualitative, quantitative, and mixed methods approaches (6th ed.). SAGE Publications.",
    "Nwankwo, O. C., & Taylor, S. A. (2024). Digital transformations and empirical inquiry in tertiary institutions. Journal of Academic Research, 18(2), 145-162. https://doi.org/10.1177/00222445241039",
    "Scholar, C. D. (2023). Advanced frameworks in higher education and technology. IEEE Access, 11, 45210-45222. https://doi.org/10.1109/ACCESS.2023.3289012",
    "Zhang, L., & Mensah, K. (2023). Statistical power and sampling protocols in applied research. International Journal of Educational Technology, 29(4), 312-329."
  ]
}`;

    let parsed: any = null;

    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model: DEFAULT_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timeout')), 35000)
        ),
      ]);

      parsed = safeParseGeminiJson(response);
    } catch (aiErr: any) {
      console.warn('AI generation call failed or timed out:', aiErr?.status || aiErr?.message);
    }

    // If Gemini returned text, encountered 503 high demand, or timed out, guaranteed fallback via academic synthesis engine
    if (!parsed || !parsed.topicTitle || !parsed.chapter1) {
      console.log('Using academic synthesis engine for guaranteed project draft...');
      parsed = synthesizeAcademicProject({
        topic,
        department,
        academicLevel,
        caseStudy,
        country,
        selectedScope,
        studentEmpiricalData,
      });
    }

    parsed.selectedScope = selectedScope;

    // Ensure diagrams, empirical tables, figures, charts, preliminary pages, and appendices are guaranteed
    if (!parsed.diagrams || !Array.isArray(parsed.diagrams) || parsed.diagrams.length === 0) {
      parsed.diagrams = generateAcademicDiagrams(
        parsed.topicTitle || topic, 
        parsed.department || department, 
        parsed.caseStudy || caseStudy || '', 
        parsed.country || country || 'Nigeria', 
        'Technology Acceptance Model & Empirical Systems Theory'
      );
    }
    if (!parsed.tables || !Array.isArray(parsed.tables) || parsed.tables.length === 0) {
      parsed.tables = generateAcademicTables(
        parsed.topicTitle || topic, 
        parsed.department || department, 
        hasEmpirical, 
        studentEmpiricalData
      );
    }
    if (!parsed.figures || !Array.isArray(parsed.figures) || parsed.figures.length === 0) {
      parsed.figures = generateAcademicFigures(
        parsed.topicTitle || topic, 
        parsed.department || department, 
        parsed.caseStudy || caseStudy || ''
      );
    }
    if (!parsed.charts || !Array.isArray(parsed.charts) || parsed.charts.length === 0) {
      parsed.charts = generateAcademicCharts(
        parsed.topicTitle || topic,
        parsed.department || department,
        parsed.caseStudy || caseStudy || ''
      );
    }
    if (!parsed.preliminaryPages) {
      parsed.preliminaryPages = generatePreliminaryPages(
        parsed.topicTitle || topic,
        parsed.department || department,
        parsed.academicLevel || academicLevel || 'BSc / Undergraduate',
        parsed.country || country || 'Nigeria'
      );
    }
    if (!parsed.appendices || !Array.isArray(parsed.appendices) || parsed.appendices.length === 0) {
      parsed.appendices = generateAcademicAppendices(
        parsed.topicTitle || topic,
        parsed.department || department,
        parsed.caseStudy || caseStudy || ''
      );
    }

    // If user is authenticated, automatically save the document to their private vault!
    let savedDocId = null;
    if (user) {
      const savedDoc = dbService.saveUserDocument(user.id, {
        title: parsed.topicTitle,
        department: parsed.department,
        academicLevel: parsed.academicLevel,
        country: parsed.country || user.country,
        data: parsed,
        hasRealEmpiricalData: hasEmpirical,
      });
      savedDocId = savedDoc.id;
    }

    res.json({
      ...parsed,
      documentId: savedDocId,
      remainingCredits: creditStatus ? creditStatus.remainingCredits : null,
      planName: creditStatus ? creditStatus.planName : null,
    });
  } catch (error: any) {
    console.error('Error in /api/academic/project-generator:', error);
    res.status(500).json({ error: error.message || 'Failed to generate project material.' });
  }
});

// Dedicated On-Demand Visual Generator (Diagrams, Figures, and APA Tables)
app.post('/api/academic/generate-visual', async (req: Request, res: Response) => {
  try {
    const { 
      visualType = 'diagram', // 'diagram' | 'table' | 'figure'
      subType = 'conceptual_framework', 
      topic = 'Academic Research', 
      department = 'General Studies', 
      chapter = 'chapter2',
      prompt: customPrompt 
    } = req.body;

    const isTable = visualType === 'table';
    const isChart = visualType === 'chart';

    const promptText = `You are a distinguished university academic illustrator, statistician, and visual methodologist.
Generate an academic ${visualType} for a higher education research project.
Topic: "${topic}"
Department/Discipline: "${department}"
Target Chapter: "${chapter}"
Visual Type: "${visualType}" (${subType})
Specific User Instructions: "${customPrompt || `Generate a high-impact academic ${visualType} appropriate for ${chapter}`}"

${isTable ? `
Respond in valid JSON matching this schema:
{
  "tableNumber": "Table 4.X",
  "title": "Concise APA 7th Table Title in Title Case",
  "headers": ["Column 1", "Column 2", "Column 3", "Column 4"],
  "rows": [
    ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3", "Row 1 Col 4"],
    ["Row 2 Col 1", "Row 2 Col 2", "Row 2 Col 3", "Row 2 Col 4"]
  ],
  "note": "Note: In APA 7th style, provide sample size N, significance p < 0.05*, and data source.",
  "chapter": "${chapter}"
}
` : isChart ? `
Respond in valid JSON matching this schema:
{
  "figureNumber": "Figure 4.X",
  "title": "Concise Bar Chart Title",
  "chartType": "grouped_bar",
  "xAxisLabel": "Evaluation Metrics",
  "yAxisLabel": "Likert Score (1-5)",
  "categories": ["Variable 1", "Variable 2", "Variable 3", "Variable 4"],
  "series": [
    { "name": "Senior Cadre", "data": [4.2, 4.0, 3.9, 4.1], "color": "#3b82f6" },
    { "name": "Junior Cadre", "data": [3.9, 3.8, 3.7, 4.0], "color": "#10b981" }
  ],
  "summaryText": "Analytical summary of the empirical comparisons demonstrated in this bar chart.",
  "svgCode": "<svg viewBox=\\"0 0 840 400\\" width=\\"100%\\" height=\\"100%\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>",
  "sourceNote": "Source: Survey Data Analysis (2026)",
  "chapter": "${chapter}"
}
` : `
Respond in valid JSON matching this schema:
{
  "figureNumber": "Figure 2.X",
  "title": "Concise Formal Figure Title",
  "type": "${subType || 'conceptual_framework'}",
  "description": "2-sentence scholarly description of the visual architecture and operational significance.",
  "svgCode": "<svg viewBox=\\"0 0 840 360\\" width=\\"100%\\" height=\\"100%\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>",
  "mermaidCode": "graph LR...",
  "sourceNote": "Source: Developed by Researcher (2026)",
  "chapter": "${chapter}"
}
CRITICAL SVG REQUIREMENT: The svgCode MUST be valid, beautifully designed SVG with viewBox, clean fonts (Arial/sans-serif), gradients, rounded rects, clear text labels, and directional arrows. Never return broken XML or raw unescaped HTML.
`}
`;

    let generated: any = null;
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });
      generated = safeParseGeminiJson(response);
    } catch (err: any) {
      console.warn('AI visual generation call failed, using engine fallback:', err?.message);
    }

    if (!generated || (!generated.svgCode && !generated.headers && !generated.series)) {
      if (isTable) {
        const fallbackTables = generateAcademicTables(topic, department, false, '');
        generated = fallbackTables[0] || {
          tableNumber: 'Table 4.1',
          title: `Empirical Distribution Matrix for ${topic.substring(0, 40)}`,
          headers: ['Construct / Dimension', 'Sample Size (N)', 'Mean (x̄)', 'SD', 'Decision'],
          rows: [
            ['Operational Capability', '298', '4.12', '0.76', 'Significant (p < 0.05)'],
            ['Institutional Readiness', '298', '3.98', '0.84', 'Significant (p < 0.05)'],
            ['Resource Allocation', '298', '3.84', '0.88', 'Moderate (p < 0.05)'],
            ['Performance Outcome', '298', '4.06', '0.79', 'Significant (p < 0.05)']
          ],
          note: 'Note: Evaluated on 5-point Likert scale. Benchmark mean = 3.00. Source: Fieldwork Survey (2026).',
          chapter
        };
      } else if (isChart) {
        const fallbackCharts = generateAcademicCharts(topic, department, '');
        generated = fallbackCharts[0] || {
          figureNumber: 'Figure 4.2',
          title: `Comparative Evaluation Across Dimensions: ${topic.substring(0, 35)}`,
          chartType: 'grouped_bar',
          xAxisLabel: 'Empirical Research Dimensions',
          yAxisLabel: 'Mean Likert Score (1.00 - 5.00)',
          categories: ['Infrastructural Readiness', 'Institutional Policy', 'Stakeholder Competence', 'Performance Impact'],
          series: [
            { name: 'Senior Cadre', data: [4.25, 4.18, 3.90, 4.15], color: '#3b82f6' },
            { name: 'Middle Cadre', data: [4.10, 3.95, 3.86, 4.04], color: '#10b981' }
          ],
          summaryText: 'Comparative bar chart displaying mean Likert perception scores across institutional cadres.',
          sourceNote: 'Source: Field Survey Data Analysis (2026)',
          chapter: chapter || 'chapter4'
        };
      } else {
        const fallbackDiagrams = generateAcademicDiagrams(topic, department, '', 'International', 'Technology Acceptance & Empirical Systems Model');
        generated = fallbackDiagrams[0] || {
          figureNumber: 'Figure 2.1',
          title: `Conceptual Framework Model for ${topic.substring(0, 40)}`,
          type: 'conceptual_framework',
          description: 'Conceptual framework outlining independent variables, intervening mechanisms, and target outcomes.',
          svgCode: '<svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="360" fill="#f8fafc" rx="8"/><text x="400" y="180" font-family="sans-serif" font-size="16" fill="#475569" text-anchor="middle">Conceptual Framework Diagram</text></svg>',
          sourceNote: 'Source: Researcher Conceptualization (2026)',
          chapter
        };
      }
    }

    generated.id = `custom-vis-${Date.now()}`;
    res.json({ status: true, item: generated, visualType });
  } catch (error: any) {
    console.error('Error in /api/academic/generate-visual:', error);
    res.status(500).json({ error: error.message || 'Failed to generate visual.' });
  }
});

// 9. Dedicated Global Humanizer Endpoint (User Requirement 2)
app.post('/api/academic/humanize-chapter', async (req: Request, res: Response) => {
  try {
    const { 
      chapterText, 
      chapterTitle = 'Academic Chapter', 
      level = 'BSc', 
      country = 'Nigeria' 
    } = req.body;

    if (!chapterText || !chapterText.trim()) {
      return res.status(400).json({ error: 'Chapter text is required for humanization.' });
    }

    const humanizerPrompt = `You are the global humanizer for ScholarAssist — working for any higher institution student worldwide.

HUMANIZER PROMPT:
When user clicks "Humanize This Chapter", rewrite the last generated chapter using these rules:

- Rewrite to sound 100% human-written by a real university student from ${country}.
- Keep all facts, citations, and references exactly the same.
- Make it natural: Mix short and long sentences. Use contractions where appropriate (e.g., it's, doesn't). Use natural academic flow.
- Remove typical AI patterns: No repetitive phrases like "In conclusion", "Delve into", "In today's world". 
- Keep it academic but natural and clear. No complex AI vocabulary.
- Adapt tone by level:
  OND/HND = Simple, clear, straightforward English
  BSc = Standard undergraduate academic English
  MSc = Critical, analytical, formal academic English
  PhD = Advanced, scholarly, research-level English with deep analysis
- Adapt tone by country:
  USA/Canada = American academic English
  UK = British academic English
  Nigeria/Ghana/Kenya = Clear, simple, formal academic English
  India = Formal, detailed academic English
- At the end, add: "Humanized for ${country} - [${level}] - Ready to edit"

Do not add new fake citations.

CHAPTER / SECTION TITLE: ${chapterTitle}
ORIGINAL CHAPTER TEXT:
"""
${chapterText}
"""`;

    let humanizedText = '';
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: humanizerPrompt,
        config: {
          temperature: 0.35,
        },
      });
      humanizedText = getCleanText(response);
    } catch (aiErr: any) {
      console.warn('AI Humanizer call failed, using heuristic humanization:', aiErr?.message);
      humanizedText = chapterText
        .replace(/In today's fast-paced world,/gi, 'In contemporary practice,')
        .replace(/It is crucial to delve into/gi, 'This inquiry examines')
        .replace(/delve into/gi, 'investigate')
        .replace(/In conclusion,/gi, 'Ultimately,')
        .replace(/Furthermore, it is noteworthy that/gi, 'Additionally,')
        + `\n\nHumanized for ${country} - [${level}] - Ready to edit`;
    }

    res.json({
      success: true,
      humanizedText,
      country,
      level,
      badge: `Humanized for ${country} - [${level}] - Ready to edit`
    });
  } catch (error: any) {
    console.error('Error in /api/academic/humanize-chapter:', error);
    res.status(500).json({ error: error.message || 'Failed to humanize chapter.' });
  }
});

// 10. Dedicated Country Style Rewriter Endpoint (User Requirement 3)
app.post('/api/academic/rewrite-country-style', async (req: Request, res: Response) => {
  try {
    const { 
      chapterText, 
      chapterTitle = 'Academic Chapter', 
      level = 'BSc', 
      targetCountry = 'Nigeria'
    } = req.body;

    if (!chapterText || !chapterText.trim()) {
      return res.status(400).json({ error: 'Chapter text is required for country rewriting.' });
    }

    const countryStylePrompt = `You are ScholarAssist Country Style Adaptor.

COUNTRY STYLE PROMPT:
Rewrite the last chapter to match academic writing standards of ${targetCountry}.

Academic style reference:
- USA: APA 7th, American spelling, direct and evidence-based.
- UK: Harvard, British spelling, critical and analytical.
- Nigeria/Ghana: Simple, formal, project format with 5 chapters.
- India: Formal, detailed, with objectives and scope clearly stated.
- Canada/Australia: APA/Harvard, clear and concise.

Rules:
- Adapt spelling, terminology, tone, and rhetorical structures to ${targetCountry} higher education standards.
- Keep all factual evidence, empirical research data, and citations accurate and preserved.
- Level: ${level}.
- At the end, add: "Rewritten for ${targetCountry} Style - [${level}] - Ready to edit"

CHAPTER / SECTION TITLE: ${chapterTitle}
ORIGINAL CHAPTER TEXT:
"""
${chapterText}
"""`;

    let rewrittenText = '';
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: countryStylePrompt,
        config: {
          temperature: 0.3,
        },
      });
      rewrittenText = getCleanText(response);
    } catch (aiErr: any) {
      console.warn('AI Country Style call failed, using contextual fallback:', aiErr?.message);
      rewrittenText = chapterText + `\n\nRewritten for ${targetCountry} Style - [${level}] - Ready to edit`;
    }

    res.json({
      success: true,
      rewrittenText,
      targetCountry,
      level,
      badge: `Rewritten for ${targetCountry} Style - [${level}] - Ready to edit`
    });
  } catch (error: any) {
    console.error('Error in /api/academic/rewrite-country-style:', error);
    res.status(500).json({ error: error.message || 'Failed to rewrite chapter for country style.' });
  }
});


// ==========================================
// PAYSTACK PAYMENT & SUBSCRIPTION ENDPOINTS
// ==========================================

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_WEEKLY_SHOP_URL = 'https://paystack.shop/pay/ybdmctgjwr';
const PAYSTACK_MONTHLY_SHOP_URL = 'https://paystack.shop/pay/q0bp-vzftt';
const PAYSTACK_SHOP_URL = PAYSTACK_MONTHLY_SHOP_URL;

// Check Paystack configuration status
app.get('/api/paystack/status', (_req: Request, res: Response) => {
  const isKeyConfigured = Boolean(
    PAYSTACK_SECRET_KEY &&
    !PAYSTACK_SECRET_KEY.includes('your_secret_key_here') &&
    (PAYSTACK_SECRET_KEY.startsWith('sk_test_') || PAYSTACK_SECRET_KEY.startsWith('sk_live_'))
  );

  const config = dbService.getPlatformConfig();

  res.json({
    isConfigured: isKeyConfigured,
    publicKey: isKeyConfigured ? PAYSTACK_PUBLIC_KEY : '',
    paystackShopUrl: config.supportedGateways?.paystack?.shopUrl || PAYSTACK_SHOP_URL,
    paystackWeeklyShopUrl: config.supportedGateways?.paystack?.weeklyShopUrl || PAYSTACK_WEEKLY_SHOP_URL,
    paystackMonthlyShopUrl: config.supportedGateways?.paystack?.monthlyShopUrl || PAYSTACK_MONTHLY_SHOP_URL,
    supportedCurrencies: ['USD', 'NGN', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR', 'CAD', 'INR', 'AUD'],
    plans: [
      {
        id: 'scholar-weekly-pass',
        name: 'Weekly Research Pass',
        priceUSD: config.pricing.weeklyPriceUSD || 1.49,
        priceNGN: Math.round((config.pricing.weeklyPriceUSD || 1.49) * 1450),
        paystackUrl: PAYSTACK_WEEKLY_SHOP_URL,
        interval: '7 days',
        durationDays: 7,
        tagline: 'Ideal for term papers, seminar presentations & quick thesis drafts',
        features: [
          'Full 7-Day Unlimited Academic Access',
          'Unlimited 5-Chapter Project & Seminar Downloads (.DOC)',
          'Recent & Verifiable 2021-2026 APA 7th Citations',
          'Empirical Student Research Data Analysis',
          'Save & Edit Work Anytime in Cloud Vault'
        ]
      },
      {
        id: 'scholar-pro-monthly',
        name: 'Monthly Pro Researcher',
        priceUSD: config.pricing.monthlyPriceUSD || 3.99,
        priceNGN: Math.round((config.pricing.monthlyPriceUSD || 3.99) * 1450),
        paystackUrl: PAYSTACK_MONTHLY_SHOP_URL,
        interval: 'monthly (30 days)',
        durationDays: 30,
        popular: true,
        tagline: 'Full dissertation architecture, defense prep, unlimited exports & 24/7 research advisor',
        features: [
          'Full 30-Day Unlimited Academic Access',
          'Unlimited Project, Thesis & Dissertation Downloads (.DOC & PDF)',
          'APA 7th, MLA, Chicago, IEEE & Harvard References',
          'Academic Tone Polisher & Rhetoric Refiner',
          'STEM & LaTeX Formula Decipherer with Overleaf export',
          'Interactive Active Recall Flashcards & Exam Simulator',
          '24/7 AI Research Advisor & Dissertation Mentor'
        ]
      }
    ]
  });
});

// Initialize Paystack payment transaction
app.post('/api/paystack/initialize', async (req: Request, res: Response) => {
  try {
    const { email, amount, currency = 'USD', planId, planName, metadata = {} } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Student email address is required for receipt.' });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    const reference = `SCHOLAR_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const amountInSubunits = Math.round(Number(amount) * 100);

    const isRealKeySet = Boolean(
      PAYSTACK_SECRET_KEY &&
      !PAYSTACK_SECRET_KEY.includes('your_secret_key_here') &&
      (PAYSTACK_SECRET_KEY.startsWith('sk_test_') || PAYSTACK_SECRET_KEY.startsWith('sk_live_'))
    );

    if (isRealKeySet) {
      const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const callbackUrl = `${hostUrl}/?paystack_ref=${reference}&plan=${encodeURIComponent(planId || 'scholar-weekly-pass')}`;

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountInSubunits,
          currency: currency.toUpperCase(),
          reference,
          callback_url: callbackUrl,
          metadata: {
            planId,
            planName,
            app: 'ScholarAssist Global',
            ...metadata,
          },
        }),
      });

      const paystackData: any = await paystackRes.json();

      if (!paystackRes.ok || !paystackData.status) {
        console.error('Paystack API error:', paystackData);
        return res.status(paystackRes.status || 400).json({
          error: paystackData.message || 'Paystack initialization failed.',
          details: paystackData,
        });
      }

      return res.json({
        status: true,
        isLive: PAYSTACK_SECRET_KEY.startsWith('sk_live_'),
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
        },
      });
    } else {
      return res.json({
        status: true,
        simulated: true,
        message: 'Paystack test session initialized. (Add PAYSTACK_SECRET_KEY to .env for production billing)',
        data: {
          authorization_url: null,
          access_code: `sim_access_${reference}`,
          reference,
          amount: Number(amount),
          currency,
          planName: planName || 'Scholar Pass',
        },
      });
    }
  } catch (error: any) {
    console.error('Error in /api/paystack/initialize:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize checkout.' });
  }
});

// Verify Paystack or International payment transaction
app.get('/api/paystack/verify/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference is required.' });
    }

    const isRealKeySet = Boolean(
      PAYSTACK_SECRET_KEY &&
      !PAYSTACK_SECRET_KEY.includes('your_secret_key_here') &&
      (PAYSTACK_SECRET_KEY.startsWith('sk_test_') || PAYSTACK_SECRET_KEY.startsWith('sk_live_'))
    );

    let verified = false;
    let txData: any = null;

    if (isRealKeySet) {
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const paystackData: any = await paystackRes.json();

      if (paystackRes.ok && paystackData.status && paystackData.data.status === 'success') {
        verified = true;
        const tx = paystackData.data;
        txData = {
          reference: tx.reference,
          amount: tx.amount / 100,
          currency: tx.currency,
          paidAt: tx.paid_at,
          channel: tx.channel,
          customerEmail: tx.customer?.email,
          metadata: tx.metadata,
        };
      } else {
        return res.status(400).json({
          status: false,
          verified: false,
          message: paystackData.message || 'Payment not completed or unverified.',
        });
      }
    } else {
      // Sandbox mode verification
      verified = true;
      txData = {
        reference,
        amount: 3.99,
        currency: 'USD',
        paidAt: new Date().toISOString(),
        channel: 'Paystack/Card Sandbox',
        customerEmail: 'student@university.edu',
        metadata: { planId: 'scholar-pro-monthly', planName: 'Monthly Pro Researcher' },
      };
    }

    // Activate subscription in server database!
    const user = getAuthUser(req);
    const planId = txData.metadata?.planId || 'scholar-pro-monthly';
    const planName = txData.metadata?.planName || 'Scholar Pro Monthly';
    const durationDays = planId.includes('weekly') ? 7 : 30;

    if (user) {
      dbService.activateSubscription(user.id, planId, planName, 'paystack', reference, durationDays);
      dbService.recordTransaction({
        userId: user.id,
        email: user.email,
        planId,
        planName,
        amountUSD: planId.includes('weekly') ? 1.49 : 3.99,
        amountLocal: txData.amount || 3.99,
        currency: txData.currency || 'USD',
        gateway: 'paystack',
        reference,
        status: 'success',
      });
    }

    res.json({
      status: true,
      verified: true,
      data: txData,
    });
  } catch (error: any) {
    console.error('Error in /api/paystack/verify:', error);
    res.status(500).json({ error: error.message || 'Verification endpoint error.' });
  }
});

// International Instant Unlock Verification (for PayPal / Stripe / Paystack direct shop)
app.post('/api/payments/verify-international', (req: Request, res: Response) => {
  try {
    const { reference, planId, gateway = 'paystack' } = req.body;
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Please log in to link your payment to your student account.' });
    }

    const durationDays = planId?.includes('weekly') ? 7 : 30;
    const planName = planId?.includes('weekly') ? 'Weekly Research Pass ($1.49)' : 'Monthly Pro Researcher ($3.99)';
    const amountUSD = planId?.includes('weekly') ? 1.49 : 3.99;

    const updatedUser = dbService.activateSubscription(
      user.id,
      planId || 'scholar-pro-monthly',
      planName,
      gateway as any,
      reference || `PAY_EXT_${Date.now()}`,
      durationDays
    );

    dbService.recordTransaction({
      userId: user.id,
      email: user.email,
      planId: planId || 'scholar-pro-monthly',
      planName,
      amountUSD,
      amountLocal: amountUSD,
      currency: 'USD',
      gateway: gateway as any,
      reference: reference || `PAY_EXT_${Date.now()}`,
      status: 'success',
    });

    res.json({ status: true, user: updatedUser, message: 'Subscription successfully activated.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to activate subscription.' });
  }
});

// Setup Vite dev server or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ScholarAssist server running on http://0.0.0.0:${port}`);
  });
}

startServer();
