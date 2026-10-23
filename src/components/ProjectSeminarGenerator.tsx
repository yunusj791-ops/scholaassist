import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  CreditCard, 
  ExternalLink, 
  Search, 
  BookOpen, 
  Bookmark, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  FileCheck2,
  Lock,
  Unlock,
  AlertCircle,
  FolderDown,
  Printer,
  Edit3,
  Save,
  Globe,
  Sliders,
  Database,
  Library,
  Award,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  GraduationCap,
  X,
  Compass,
  ArrowRight,
  BarChart3,
  LayoutGrid,
  Maximize2,
  PlusCircle,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  FullProjectResult, 
  InstitutionLevel, 
  JournalSource, 
  AcademicTable, 
  AcademicDiagram, 
  AcademicFigure 
} from '../types/academic';
import { 
  generateProjectFullText, 
  downloadProjectAsWord, 
  downloadChapterAsWord,
  downloadProjectAsMarkdown,
  downloadCustomTextAsWord,
  downloadSvgAsFile
} from '../utils/projectDownloader';
import { saveItemToVault } from '../utils/vault';
import { CountryInfo, COUNTRIES } from '../data/countries';

interface Props {
  level: InstitutionLevel;
  setLevel?: (lvl: InstitutionLevel) => void;
  onSaved: () => void;
  isPro?: boolean;
  user?: any | null;
  token?: string | null;
  onRequireAuth?: () => void;
  onRequirePricing?: () => void;
  onRefreshUser?: () => void;
  country?: CountryInfo;
  onSelectCountry?: (country: CountryInfo) => void;
}

export const PAYSTACK_WEEKLY_SHOP_URL = 'https://paystack.shop/pay/ybdmctgjwr';
export const PAYSTACK_MONTHLY_SHOP_URL = 'https://paystack.shop/pay/q0bp-vzftt';
const PAYSTACK_SHOP_URL = PAYSTACK_MONTHLY_SHOP_URL;

export type ScopeOption = 'full' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5';

const CHAPTER_SCOPE_DEFINITIONS: { id: ScopeOption; label: string; shortLabel: string; desc: string; icon: string }[] = [
  {
    id: 'full',
    label: 'Complete Project (All 5 Chapters at Once)',
    shortLabel: 'Full 5 Chapters',
    desc: 'Generates Title Page, Abstract, Chapters 1-5, APA 7th References, and Peer-Reviewed Journal Audit in one full file.',
    icon: '🌟'
  },
  {
    id: 'chapter1',
    label: 'Chapter 1: Introduction & Problem Statement',
    shortLabel: 'Chapter 1 Only',
    desc: 'Background of the study, Statement of the Problem, Objectives, Research Questions, Hypotheses, Scope, and Operational Definitions.',
    icon: '📑'
  },
  {
    id: 'chapter2',
    label: 'Chapter 2: Literature Review & Theoretical Framework',
    shortLabel: 'Chapter 2 Only',
    desc: 'Conceptual Review, Theoretical Framework, Empirical Reviews from 2021-2026 indexed journals, and Gaps in Literature.',
    icon: '📚'
  },
  {
    id: 'chapter3',
    label: 'Chapter 3: Research Methodology & Instrument Design',
    shortLabel: 'Chapter 3 Only',
    desc: 'Research Design, Population, Sample Size (Taro Yamane / G*Power), Validation, Reliability Alpha, and Analytical Procedures.',
    icon: '🔬'
  },
  {
    id: 'chapter4',
    label: 'Chapter 4: Data Presentation, Analysis & Discussion',
    shortLabel: 'Chapter 4 Only',
    desc: 'Descriptive & Inferential Analysis of Research Questions, Hypothesis Testing (p-values), and Triangulated Empirical Discussion.',
    icon: '📊'
  },
  {
    id: 'chapter5',
    label: 'Chapter 5: Summary, Conclusion & Recommendations',
    shortLabel: 'Chapter 5 Only',
    desc: 'Summary of findings, Definitive conclusions, Practical & Policy Recommendations, Contributions to Knowledge, and Further Studies.',
    icon: '🎯'
  }
];

const POPULAR_TOPICS = [
  {
    topic: 'Design and Implementation of an Automated Student Attendance Management System Using Biometrics',
    dept: 'Computer Science & Software Engineering',
    case: 'Tertiary Institution Campus'
  },
  {
    topic: 'Impact of Monetary Policy and Interest Rates on Commercial Bank Lending Behavior and Economic Growth',
    dept: 'Banking, Finance & Economics',
    case: 'Selected Commercial Banks (2020-2025)'
  },
  {
    topic: 'Influence of Social Media Advertising on Consumer Purchase Decisions for Fashion and Lifestyle Brands',
    dept: 'Mass Communication & Marketing',
    case: 'Undergraduate Students in Urban Metropolis'
  },
  {
    topic: 'Assessment of Antimicrobial Resistance Profiles and Heavy Metal Concentrations in Hospital Wastewater',
    dept: 'Microbiology & Public Health',
    case: 'Tertiary Teaching Hospital'
  },
  {
    topic: 'Techno-Economic Feasibility Analysis of Hybrid Solar PV and Battery Energy Storage for Rural Electrification',
    dept: 'Electrical & Mechanical Engineering',
    case: 'Off-Grid Agrarian Community'
  },
  {
    topic: 'Evaluation of Cloud-Based Accounting Information Systems on Financial Reporting Quality in SMEs',
    dept: 'Accounting & Finance',
    case: 'Registered Small & Medium Enterprises'
  }
];

const DEPARTMENTS = [
  'Computer Science & IT',
  'Software Engineering & Cyber Security',
  'Economics & Development Studies',
  'Accounting & Finance',
  'Business Administration & Management',
  'Mass Communication & Media Studies',
  'Public Health & Community Medicine',
  'Microbiology & Biotechnology',
  'Biochemistry & Molecular Biology',
  'Electrical & Electronics Engineering',
  'Mechanical & Mechatronics Engineering',
  'Civil & Environmental Engineering',
  'Educational Management & Planning',
  'Political Science & International Relations',
  'Agriculture & Agribusiness Economics'
];

export const ProjectSeminarGenerator: React.FC<Props> = ({ 
  level, 
  setLevel,
  onSaved, 
  isPro = false,
  user,
  token,
  onRequireAuth,
  onRequirePricing,
  onRefreshUser,
  country,
  onSelectCountry
}) => {
  const [topic, setTopic] = useState('');
  const [department, setDepartment] = useState('Computer Science & IT');
  const [caseStudy, setCaseStudy] = useState('');
  const [projectType, setProjectType] = useState('Final Year Project (5 Chapters)');
  
  // Chapter selection scope
  const [selectedScope, setSelectedScope] = useState<ScopeOption>('full');
  
  const [loading, setLoading] = useState(false);
  const [loadingChapter, setLoadingChapter] = useState<ScopeOption | null>(null);
  const [project, setProject] = useState<FullProjectResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Empirical Data Tab (Academic Integrity Requirement 8)
  const [showDataInput, setShowDataInput] = useState(false);
  const [empiricalData, setEmpiricalData] = useState('');
  
  // View mode & navigation (including 'diagrams', 'tables', 'charts', 'appendices', and 'journals' tabs)
  const [activeTab, setActiveTab] = useState<'full' | 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5' | 'ref' | 'journals' | 'diagrams' | 'tables' | 'charts' | 'appendices'>('full');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Dedicated Visual & Diagram Generator state
  const [isVisualGeneratorOpen, setIsVisualGeneratorOpen] = useState(false);
  const [generatingVisual, setGeneratingVisual] = useState(false);
  const [visualType, setVisualType] = useState<'diagram' | 'table' | 'figure' | 'chart'>('diagram');
  const [visualSubType, setVisualSubType] = useState('conceptual_framework');
  const [visualChapter, setVisualChapter] = useState<'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5'>('chapter2');
  const [visualCustomPrompt, setVisualCustomPrompt] = useState('');
  const [activeZoomDiagram, setActiveZoomDiagram] = useState<{ title: string; figureNumber: string; svgCode?: string; sourceNote?: string; description?: string } | null>(null);

  // Live in-browser editing state (Requirement 9)
  const [isEditing, setIsEditing] = useState(false);
  const [editedAbstract, setEditedAbstract] = useState('');
  const [editedCh1Background, setEditedCh1Background] = useState('');
  const [editedCh1Problem, setEditedCh1Problem] = useState('');
  const [editedCh2Empirical, setEditedCh2Empirical] = useState('');
  const [editedCh3Design, setEditedCh3Design] = useState('');
  const [editedCh4Findings, setEditedCh4Findings] = useState('');
  const [editedCh5Recs, setEditedCh5Recs] = useState('');

  // Humanizer Modal & State (Requirement 2)
  const [isHumanizerOpen, setIsHumanizerOpen] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  const [humanizedResult, setHumanizedResult] = useState<{
    text: string;
    badge: string;
    chapterTitle: string;
    chapterKey: string;
  } | null>(null);

  // Country Style Modal & State (Requirement 3)
  const [isCountryStyleOpen, setIsCountryStyleOpen] = useState(false);
  const [rewritingCountry, setRewritingCountry] = useState(false);
  const [countryStyleTarget, setCountryStyleTarget] = useState<string>(country?.name || 'Nigeria');
  const [countryStyleResult, setCountryStyleResult] = useState<{
    text: string;
    badge: string;
    chapterTitle: string;
    chapterKey: string;
    targetCountry: string;
  } | null>(null);

  // Synchronize edit fields when a project is loaded or merged
  const syncEditFields = (p: FullProjectResult) => {
    setEditedAbstract(p.abstract || '');
    setEditedCh1Background(p.chapter1?.background || '');
    setEditedCh1Problem(p.chapter1?.statementOfProblem || '');
    setEditedCh2Empirical(p.chapter2?.empiricalReview || '');
    setEditedCh3Design(p.chapter3?.researchDesign || '');
    setEditedCh4Findings(p.chapter4?.discussionOfFindings || '');
    setEditedCh5Recs(p.chapter5?.recommendations ? p.chapter5.recommendations.join('\n- ') : '');
  };

  const getActiveChapterDetails = () => {
    if (!project) return { title: 'Academic Project', text: '', key: 'full' };
    if (activeTab === 'ch1') {
      const text = `${project.chapter1.title}\n\n1.1 Background of the Study\n${project.chapter1.background}\n\n1.2 Statement of the Problem\n${project.chapter1.statementOfProblem}\n\n1.3 Objectives of the Study\n${project.chapter1.objectives.map(o => `- ${o}`).join('\n')}\n\n1.4 Research Questions\n${project.chapter1.researchQuestions.map(q => `- ${q}`).join('\n')}\n\n1.5 Significance of the Study\n${project.chapter1.significance}\n\n1.6 Scope & Delimitations\n${project.chapter1.scopeAndDelimitation}`;
      return { title: project.chapter1.title, text, key: 'chapter1' };
    }
    if (activeTab === 'ch2') {
      const text = `${project.chapter2.title}\n\n2.1 Conceptual Review\n${project.chapter2.conceptualFramework}\n\n2.2 Theoretical Framework\n${project.chapter2.theoreticalFramework}\n\n2.3 Empirical Literature Review\n${project.chapter2.empiricalReview}\n\n2.4 Summary of Gaps in Literature\n${project.chapter2.gapsInLiterature}`;
      return { title: project.chapter2.title, text, key: 'chapter2' };
    }
    if (activeTab === 'ch3') {
      const text = `${project.chapter3.title}\n\n3.1 Research Design\n${project.chapter3.researchDesign}\n\n3.2 Population of Study\n${project.chapter3.populationOfStudy}\n\n3.3 Sample Size & Sampling Technique\n${project.chapter3.sampleSizeAndSamplingTechnique}\n\n3.4 Instrumentation & Validation\n${project.chapter3.instrumentationAndValidation}\n\n3.5 Procedure for Data Collection\n${project.chapter3.procedureForDataCollection}\n\n3.6 Method of Data Analysis\n${project.chapter3.methodOfDataAnalysis}`;
      return { title: project.chapter3.title, text, key: 'chapter3' };
    }
    if (activeTab === 'ch4') {
      const text = `${project.chapter4.title}\n\n4.1 Presentation and Analysis of Data\n${project.chapter4.dataPresentation}\n\n4.2 Analysis of Research Questions\n${project.chapter4.analysisOfResearchQuestions}\n\n4.3 Test of Hypotheses\n${project.chapter4.testOfHypotheses}\n\n4.4 Discussion of Findings\n${project.chapter4.discussionOfFindings}`;
      return { title: project.chapter4.title, text, key: 'chapter4' };
    }
    if (activeTab === 'ch5') {
      const text = `${project.chapter5.title}\n\n5.1 Summary of Findings\n${project.chapter5.summaryOfFindings}\n\n5.2 Conclusion\n${project.chapter5.conclusion}\n\n5.3 Recommendations\n${project.chapter5.recommendations.map(r => `- ${r}`).join('\n')}\n\n5.4 Contribution to Knowledge\n${project.chapter5.contributionToKnowledge}\n\n5.5 Suggestions for Further Studies\n${project.chapter5.suggestionsForFurtherStudies.map(s => `- ${s}`).join('\n')}`;
      return { title: project.chapter5.title, text, key: 'chapter5' };
    }
    return { title: project.topicTitle, text: generateProjectFullText(project), key: 'full' };
  };

  const handleGenerate = async (
    customTopic?: string, 
    customDept?: string, 
    customCase?: string,
    customScope?: ScopeOption
  ) => {
    const topicToUse = customTopic || topic;
    const deptToUse = customDept || department;
    const caseToUse = customCase !== undefined ? customCase : caseStudy;
    const scopeToUse = customScope || selectedScope;

    if (!topicToUse.trim()) {
      setError('Please type your project or seminar topic.');
      return;
    }

    // If user has an account with exhausted credits and not pro, show pricing
    if (user && user.credits <= 0 && !isPro && onRequirePricing) {
      onRequirePricing();
      return;
    }

    // Check if free credits exhausted and user not pro
    if (user && user.credits <= 0 && !isPro && onRequirePricing) {
      onRequirePricing();
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingChapter(scopeToUse);
    setSaved(false);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/academic/project-generator', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic: topicToUse,
          department: deptToUse,
          academicLevel: level,
          caseStudy: caseToUse,
          projectType,
          selectedScope: scopeToUse,
          studentEmpiricalData: empiricalData.trim() || undefined,
          country: country?.name || user?.country || 'Nigeria'
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === 'CREDITS_EXHAUSTED') {
          if (onRequirePricing) onRequirePricing();
          throw new Error('Your 3 free research credits have been used. Please activate a weekly ($1.49) or monthly ($3.99) subscription to continue generating.');
        }
        throw new Error(errData.error || errData.message || 'Failed to generate project material.');
      }

      const data: FullProjectResult = await res.json();

      // If user already had a project and is generating/refining a single chapter, merge it cleanly!
      if (project && scopeToUse !== 'full') {
        const merged: FullProjectResult = {
          ...project,
          [scopeToUse]: (data as any)[scopeToUse],
          tables: [
            ...(project.tables || []),
            ...(data.tables || [])
          ].filter((v, i, a) => a.findIndex(t => t.id === v.id || t.tableNumber === v.tableNumber) === i),
          diagrams: [
            ...(project.diagrams || []),
            ...(data.diagrams || [])
          ].filter((v, i, a) => a.findIndex(t => t.id === v.id || t.figureNumber === v.figureNumber) === i),
          figures: [
            ...(project.figures || []),
            ...(data.figures || [])
          ].filter((v, i, a) => a.findIndex(t => t.id === v.id || t.figureNumber === v.figureNumber) === i),
          references: Array.from(new Set([...project.references, ...(data.references || [])])),
          journalSources: [
            ...(project.journalSources || []),
            ...(data.journalSources || [])
          ].filter((v, i, a) => a.findIndex(t => t.title === v.title) === i)
        };
        setProject(merged);
        syncEditFields(merged);

        if (scopeToUse === 'chapter1') setActiveTab('ch1');
        else if (scopeToUse === 'chapter2') setActiveTab('ch2');
        else if (scopeToUse === 'chapter3') setActiveTab('ch3');
        else if (scopeToUse === 'chapter4') setActiveTab('ch4');
        else if (scopeToUse === 'chapter5') setActiveTab('ch5');
      } else {
        setProject(data);
        syncEditFields(data);
        if (scopeToUse === 'full') setActiveTab('full');
        else if (scopeToUse === 'chapter1') setActiveTab('ch1');
        else if (scopeToUse === 'chapter2') setActiveTab('ch2');
        else if (scopeToUse === 'chapter3') setActiveTab('ch3');
        else if (scopeToUse === 'chapter4') setActiveTab('ch4');
        else if (scopeToUse === 'chapter5') setActiveTab('ch5');
      }

      // Refresh credits count
      if (onRefreshUser) onRefreshUser();

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Scroll smoothly to result
      setTimeout(() => {
        document.getElementById('project-results-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error formulating project content.');
    } finally {
      setLoading(false);
      setLoadingChapter(null);
    }
  };

  const handleHumanizeActiveChapter = async () => {
    if (!project) return;
    const details = getActiveChapterDetails();
    setIsHumanizerOpen(true);
    setHumanizing(true);
    setError(null);

    try {
      const res = await fetch('/api/academic/humanize-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterText: details.text,
          chapterTitle: details.title,
          level,
          country: country?.name || 'Nigeria'
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to humanize chapter text.');
      }

      const data = await res.json();
      setHumanizedResult({
        text: data.humanizedText,
        badge: data.badge,
        chapterTitle: details.title,
        chapterKey: details.key
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error humanizing text.');
    } finally {
      setHumanizing(false);
    }
  };

  const handleRewriteCountryStyle = async (targetCountryName: string) => {
    if (!project) return;
    const details = getActiveChapterDetails();
    setCountryStyleTarget(targetCountryName);
    setIsCountryStyleOpen(true);
    setRewritingCountry(true);
    setError(null);

    try {
      const res = await fetch('/api/academic/rewrite-country-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterText: details.text,
          chapterTitle: details.title,
          level,
          targetCountry: targetCountryName
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to rewrite for target country style.');
      }

      const data = await res.json();
      setCountryStyleResult({
        text: data.rewrittenText,
        badge: data.badge,
        chapterTitle: details.title,
        chapterKey: details.key,
        targetCountry: targetCountryName
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error rewriting for country style.');
    } finally {
      setRewritingCountry(false);
    }
  };

  const handleDownloadActiveAsWord = () => {
    if (!project) return;
    if (activeTab === 'ch1') downloadChapterAsWord(project, 1);
    else if (activeTab === 'ch2') downloadChapterAsWord(project, 2);
    else if (activeTab === 'ch3') downloadChapterAsWord(project, 3);
    else if (activeTab === 'ch4') downloadChapterAsWord(project, 4);
    else if (activeTab === 'ch5') downloadChapterAsWord(project, 5);
    else downloadProjectAsWord(project);

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  const handleLoadSample = (sample: typeof POPULAR_TOPICS[0]) => {
    setTopic(sample.topic);
    setDepartment(sample.dept);
    setCaseStudy(sample.case);
    handleGenerate(sample.topic, sample.dept, sample.case, 'full');
  };

  const handleSaveEdits = () => {
    if (!project) return;
    const updated: FullProjectResult = {
      ...project,
      abstract: editedAbstract,
      chapter1: {
        ...project.chapter1,
        background: editedCh1Background,
        statementOfProblem: editedCh1Problem
      },
      chapter2: {
        ...project.chapter2,
        empiricalReview: editedCh2Empirical
      },
      chapter3: {
        ...project.chapter3,
        researchDesign: editedCh3Design
      },
      chapter4: {
        ...project.chapter4,
        discussionOfFindings: editedCh4Findings
      },
      chapter5: {
        ...project.chapter5,
        recommendations: editedCh5Recs.split('\n').map(s => s.replace(/^[-*•]\s*/, '').trim()).filter(Boolean)
      }
    };
    setProject(updated);
    setIsEditing(false);

    // Save to Vault as updated draft
    saveItemToVault({
      type: 'projects',
      title: `${project.topicTitle} (Customized)`,
      data: updated
    });
    onSaved();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyFull = () => {
    if (!project) return;
    const text = generateProjectFullText(project);
    navigator.clipboard.writeText(text);
    setCopiedKey('full');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopySection = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopySvg = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyTableMarkdown = (table: AcademicTable) => {
    let md = `### ${table.tableNumber}: ${table.title}\n\n`;
    md += table.headers.join(' | ') + '\n';
    md += table.headers.map(() => '---').join(' | ') + '\n';
    table.rows.forEach(r => {
      md += r.join(' | ') + '\n';
    });
    if (table.note) md += `\n*${table.note}*\n`;
    navigator.clipboard.writeText(md);
    setCopiedKey(`${table.id}-md`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyTableHtml = (table: AcademicTable) => {
    const html = `
<table border="0" cellpadding="6" cellspacing="0" style="width: 100%; border-top: 2px solid black; border-bottom: 2px solid black; border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: 11pt;">
  <caption style="text-align: left; font-weight: bold; margin-bottom: 4pt;">${table.tableNumber}: <span style="font-style: italic; font-weight: normal;">${table.title}</span></caption>
  <thead>
    <tr style="border-bottom: 1px solid black; text-align: left;">
      ${table.headers.map(h => `<th style="padding: 6pt; border-bottom: 1px solid black;">${h}</th>`).join('')}
    </tr>
  </thead>
  <tbody>
    ${table.rows.map(row => `
      <tr>
        ${row.map(cell => `<td style="padding: 4pt 6pt;">${cell}</td>`).join('')}
      </tr>
    `).join('')}
  </tbody>
</table>
${table.note ? `<p style="font-size: 9.5pt; font-style: italic; margin-top: 4pt;">${table.note}</p>` : ''}
    `.trim();
    navigator.clipboard.writeText(html);
    setCopiedKey(`${table.id}-html`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateVisual = async () => {
    if (!project) return;
    setGeneratingVisual(true);
    try {
      const res = await fetch('/api/academic/generate-visual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          visualType,
          subType: visualSubType,
          topic: project.topicTitle,
          department: project.department,
          chapter: visualChapter,
          prompt: visualCustomPrompt
        })
      });
      const data = await res.json();
      if (data.status && data.item) {
        if (visualType === 'table') {
          const updatedTables = [...(project.tables || []), data.item];
          setProject({ ...project, tables: updatedTables });
          setActiveTab('tables');
        } else if (visualType === 'chart') {
          const updatedCharts = [...(project.charts || []), data.item];
          setProject({ ...project, charts: updatedCharts });
          setActiveTab('charts');
        } else {
          const updatedDiagrams = [...(project.diagrams || []), data.item];
          setProject({ ...project, diagrams: updatedDiagrams });
          setActiveTab('diagrams');
        }
        setIsVisualGeneratorOpen(false);
        setVisualCustomPrompt('');
        confetti({ particleCount: 40, spread: 60 });
      }
    } catch (err: any) {
      console.error('Failed to generate visual:', err);
    } finally {
      setGeneratingVisual(false);
    }
  };

  const handleDownloadWord = () => {
    if (!project) return;
    downloadProjectAsWord(project);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleDownloadSpecificChapter = (chNum: 1 | 2 | 3 | 4 | 5) => {
    if (!project) return;
    downloadChapterAsWord(project, chNum);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const handleSaveToVault = () => {
    if (!project) return;
    saveItemToVault({
      type: 'projects',
      title: project.topicTitle,
      data: project,
    });
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Type Project Topic */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950/40 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>ScholarAssist Global • OND, HND, BSc, MSc & PhD Research Workspace</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-cinzel tracking-tight leading-tight">
            Academic Research Downloader & Chapter Generator
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif-academic">
            Type your project or seminar topic. Generate the <strong>complete 5-chapter project at once</strong>, or select <strong>specific chapters</strong> (e.g. Chapter 1, Chapter 2 Lit Review, Chapter 3 Methodology) to review with your supervisor. Provided with <strong>credible peer-reviewed journal sources (Elsevier, IEEE, Springer, AJOL)</strong> and APA 7th referencing.
          </p>
        </div>

        {/* Input Formulation Form */}
        <div className="mt-6 space-y-4 relative z-10">
          
          {/* RULE 5: Ask user their Level (OND/HND/BSc/MSc/PhD) and Country at start */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-100 font-cinzel">
                  What is your Level (OND/HND/BSc/MSc/PhD) and Country?
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                ScholarAssist adapts tone, chapter depth, and institutional style to your selection.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Academic Level Pill Selector */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Academic Level:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['OND', 'HND', 'BSc', 'MSc', 'PhD'] as InstitutionLevel[]).map((lvl) => {
                    const isSelected = level === lvl || 
                      (lvl === 'BSc' && level === 'Undergraduate') || 
                      (lvl === 'MSc' && level === 'Master’s Degree') || 
                      (lvl === 'PhD' && level === 'Doctoral / PhD');
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel && setLevel(lvl)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country Quick Badges */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Your Country: <strong className="text-indigo-300">{country?.name || 'Nigeria'}</strong>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
                    { code: 'US', name: 'USA', flag: '🇺🇸' },
                    { code: 'GB', name: 'UK', flag: '🇬🇧' },
                    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
                    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
                    { code: 'IN', name: 'India', flag: '🇮🇳' },
                    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
                  ].map((c) => {
                    const isSelected = country?.name === c.name || (c.name === 'USA' && country?.name === 'United States') || (c.name === 'UK' && country?.name === 'United Kingdom');
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          const found = COUNTRIES.find(cntry => cntry.name.toLowerCase().includes(c.name.toLowerCase()) || cntry.code === c.code);
                          if (found && onSelectCountry) onSelectCountry(found);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                        }`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Topic Input Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
              placeholder="Type your Project, Thesis, or Seminar Topic here (e.g., Design of Solar Inverter, Impact of Monetary Policy on Banks, Microplastics in Water)..."
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-900/90 border-2 border-indigo-500/40 hover:border-indigo-500/70 focus:border-indigo-400 rounded-xl text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 font-serif-academic shadow-inner transition"
            />
          </div>

          {/* Chapter Selection Scope Selector (Generate all at once OR single chapter) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>Select Generation Scope:</span>
                <span className="text-[11px] font-normal text-indigo-300/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Generate Full Project OR Single Chapters
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                Supervisor feedback? Choose an individual chapter for deeper elaboration.
              </span>
            </div>

            {/* Scope Grid Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {CHAPTER_SCOPE_DEFINITIONS.map((scope) => {
                const isSelected = selectedScope === scope.id;
                return (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setSelectedScope(scope.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-900/50 to-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/30 text-white shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-700/80 text-slate-300 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm">{scope.icon}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold leading-tight block">
                      {scope.shortLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {scope.id === 'full' ? 'All 5 Chapters' : scope.id.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scope Explanation hint */}
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans bg-slate-900/50 p-2 rounded-lg border border-slate-800">
              <strong className="text-indigo-300">Selected Scope:</strong> {CHAPTER_SCOPE_DEFINITIONS.find(s => s.id === selectedScope)?.desc}
            </p>
          </div>

          {/* Department, Case Study & Level Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Discipline / Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Case Study / Context (Optional)
              </label>
              <input
                type="text"
                value={caseStudy}
                onChange={(e) => setCaseStudy(e.target.value)}
                placeholder="e.g. Case Study of Selected Commercial Banks / Urban Metropolis"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Academic Document Format
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Final Year Project (5 Chapters)">Final Year Project (5 Chapters: ND/HND/BSc)</option>
                <option value="Postgraduate Seminar Paper">Postgraduate Seminar Paper (Thematic Review)</option>
                <option value="Research Proposal & Methodology">Thesis Proposal & Methodology (Ch 1-3)</option>
                <option value="Technical Capstone Report">Technical Capstone / Applied System Report</option>
              </select>
            </div>
          </div>

          {/* Academic Integrity Accordion: Enter Real Empirical Data (Requirement 8) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <button
              type="button"
              onClick={() => setShowDataInput(!showDataInput)}
              className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-300 hover:text-indigo-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span>Upload / Enter Your Actual Empirical Research Data (Academic Integrity)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono-code">
                {showDataInput ? 'Hide [-]' : 'Add Real Data [+]'}
              </span>
            </button>

            {showDataInput && (
              <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  To adhere to academic integrity standards and institutional AI policies, you can paste your actual survey responses, sample size, questionnaire frequencies, or laboratory observations. Chapter 4 will compute and present analysis based on your real empirical figures:
                </p>
                <textarea
                  rows={3}
                  value={empiricalData}
                  onChange={(e) => setEmpiricalData(e.target.value)}
                  placeholder="Paste your actual data here, e.g.: Sample Size: 180 respondents; RQ1 Mean: 3.45 (SD: 0.82); 72% agreed that interest rate hikes reduced borrowing; Chi-square p-value = 0.021..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono-code"
                />
              </div>
            )}
          </div>

          {/* Action Buttons: Generate & Paystack */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-indigo-600/30 ${
                loading
                  ? 'bg-indigo-700/50 text-indigo-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {loadingChapter === 'full' 
                      ? 'Formulating Complete 5-Chapter Academic File...' 
                      : `Formulating In-Depth ${loadingChapter?.toUpperCase()}...`}
                  </span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>
                    {selectedScope === 'full' 
                      ? 'Generate Full Project & Download File' 
                      : `Generate ${CHAPTER_SCOPE_DEFINITIONS.find(s => s.id === selectedScope)?.shortLabel}`}
                  </span>
                </>
              )}
            </button>

            {/* Paystack Payment Store Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <a
                href={PAYSTACK_WEEKLY_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Weekly Pass on Paystack ($1.49 / ₦2,200)"
              >
                <CreditCard className="h-4 w-4 text-indigo-400" />
                <span>Weekly Plan: paystack.shop/pay/ybdmctgjwr</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href={PAYSTACK_MONTHLY_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-3.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Monthly Pro on Paystack ($3.99 / ₦5,900)"
              >
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span>Monthly Plan: paystack.shop/pay/q0bp-vzftt</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Suggested Topics Pill Carousel */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Research Topics (Click to Pre-fill & Generate):
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TOPICS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(item)}
                className="text-xs bg-slate-800/70 hover:bg-indigo-900/30 hover:border-indigo-500/40 border border-slate-700 text-slate-300 hover:text-indigo-300 px-3 py-1.5 rounded-lg transition text-left cursor-pointer"
              >
                <span className="text-indigo-400 font-semibold mr-1.5">[{item.dept.split('&')[0].trim()}]</span>
                <span>{item.topic}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between p-4 bg-red-950/40 border border-red-800/50 text-red-200 rounded-xl text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          {onRequirePricing && (
            <button
              onClick={onRequirePricing}
              className="px-3 py-1 bg-red-800/60 hover:bg-red-800 text-white rounded-lg font-semibold shrink-0 cursor-pointer"
            >
              View Plans ($1.49)
            </button>
          )}
        </div>
      )}

      {/* Generated Project Content Section */}
      {project && (
        <div id="project-results-view" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Top Project Action Bar */}
          <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Academic Research Ready for Download & Copying</span>
                </span>

                {/* Sourcing Badge */}
                <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Library className="h-3 w-3 text-indigo-400" />
                  <span>Peer-Reviewed Journal Sourced (Elsevier, IEEE, Springer, AJOL)</span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-100 font-cinzel mt-0.5">
                {project.topicTitle}
              </h2>
              <p className="text-xs text-slate-400">
                Department of {project.department} • Level: {project.academicLevel}
                {project.caseStudy && ` • (${project.caseStudy})`}
              </p>
            </div>

            {/* Download & Copy Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Download Word Document Button (Full Project) */}
              <button
                onClick={handleDownloadWord}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition cursor-pointer"
                title="Download formatted file for Microsoft Word (.doc)"
              >
                <FolderDown className="h-4 w-4" />
                <span>Download Full Word (.DOC)</span>
              </button>

              {/* Download Markdown */}
              <button
                onClick={() => downloadProjectAsMarkdown(project)}
                className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                title="Download as Markdown (.md)"
              >
                <Download className="h-3.5 w-3.5 text-slate-400" />
                <span>.MD File</span>
              </button>

              {/* 1-Click Copy Full Text */}
              <button
                onClick={handleCopyFull}
                className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Copy entire project text to clipboard"
              >
                {copiedKey === 'full' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'full' ? 'Copied Full Project!' : 'Copy Full Text'}</span>
              </button>

              {/* Live Editor Toggle (Requirement 9) */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer border ${
                  isEditing 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Edit sections before downloading"
              >
                <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                <span>{isEditing ? 'Editing Mode' : 'Edit Sections'}</span>
              </button>

              {/* Save to Vault */}
              <button
                onClick={handleSaveToVault}
                className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                title="Save to Research Vault"
              >
                <Bookmark className="h-3.5 w-3.5 text-emerald-400" />
                <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RULE 4 MANDATORY ACTION BAR: [ Humanize This Chapter ] [ Rewrite for My Country Style ] [ Download as Word Docx ] */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-indigo-500/30 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-100 block">
                  Chapter Customization Actions ({activeTab.toUpperCase()} View Active)
                </span>
                <span className="text-[11px] text-slate-400">
                  Refine with student humanization, country academic standards, or export as Word docx.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Button 1: [ Humanize This Chapter ] */}
              <button
                onClick={handleHumanizeActiveChapter}
                disabled={humanizing}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer"
                title="Rewrite to sound 100% human-written by a real university student from your country (removes AI cliches)"
              >
                {humanizing ? (
                  <div className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                )}
                <span>Humanize This Chapter</span>
              </button>

              {/* Button 2: [ Rewrite for My Country Style ] */}
              <button
                onClick={() => setIsCountryStyleOpen(true)}
                disabled={rewritingCountry}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                title="Rewrite to match academic writing standards of your country (USA, UK, Nigeria, Ghana, India, Canada)"
              >
                {rewritingCountry ? (
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-indigo-200" />
                )}
                <span>Rewrite for My Country Style</span>
              </button>

              {/* Button 3: [ Download as Word Docx ] */}
              <button
                onClick={handleDownloadActiveAsWord}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                title="Download active view as Microsoft Word (.doc/.docx)"
              >
                <FolderDown className="h-3.5 w-3.5" />
                <span>Download as Word Docx</span>
              </button>
            </div>
          </div>

          {/* Paystack Official Store Notification */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-b border-emerald-500/20 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200">
                  Official Paystack Payment Links
                </span>
                <p className="text-[11px] text-slate-400">
                  Weekly Plan ($1.49): <span className="text-indigo-300 font-mono-code">paystack.shop/pay/ybdmctgjwr</span> • Monthly Plan ($3.99): <span className="text-emerald-300 font-mono-code">paystack.shop/pay/q0bp-vzftt</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={PAYSTACK_WEEKLY_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Weekly Plan ($1.49)"
              >
                <span>Weekly ($1.49)</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href={PAYSTACK_MONTHLY_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Monthly Plan ($3.99)"
              >
                <span>Monthly ($3.99)</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Chapter Navigation Tabs & Quick Download Bar */}
          <div className="px-5 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'full', label: 'Full 5-Chapter Project' },
                { id: 'ch1', label: 'Chapter 1: Intro' },
                { id: 'ch2', label: 'Chapter 2: Lit Review' },
                { id: 'ch3', label: 'Chapter 3: Methodology' },
                { id: 'ch4', label: 'Chapter 4: Data & Findings' },
                { id: 'ch5', label: 'Chapter 5: Summary & Recs' },
                { id: 'diagrams', label: '🎨 Diagrams & Models' },
                { id: 'tables', label: '📊 Empirical Tables' },
                { id: 'charts', label: '📈 Bar Charts & Statistics' },
                { id: 'appendices', label: '📝 Survey & Appendices' },
                { id: 'journals', label: '📚 Journal Audit (2023-2026)' },
                { id: 'ref', label: 'APA 7th References' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-850 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsVisualGeneratorOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition cursor-pointer shrink-0"
                title="Generate an academic diagram, flowchart, or APA table on-demand"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>+ Generate Diagram / Table</span>
              </button>
              {isEditing && (
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shrink-0"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save All Edits</span>
                </button>
              )}
            </div>
          </div>

          {/* Project Body */}
          <div className="p-6 max-h-[850px] overflow-y-auto space-y-8 font-serif-academic text-slate-200 leading-relaxed text-sm">
            {/* View 1: Full Document View */}
            {activeTab === 'full' && (
              <div className="space-y-8 max-w-4xl mx-auto">
                {/* Title Page Box */}
                <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-xl text-center space-y-3">
                  <h1 className="text-xl font-bold font-cinzel text-slate-100 uppercase tracking-wide">
                    {project.topicTitle}
                  </h1>
                  {project.caseStudy && (
                    <p className="text-xs text-indigo-400 font-semibold uppercase">
                      ({project.caseStudy})
                    </p>
                  )}
                  <div className="pt-4 text-xs text-slate-400 space-y-1 font-sans">
                    <p>A RESEARCH REPORT SUBMITTED TO THE DEPARTMENT OF {project.department.toUpperCase()}</p>
                    <p>IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF {project.academicLevel.toUpperCase()}</p>
                    <p className="font-semibold text-slate-300 mt-2">{new Date().getFullYear()}</p>
                  </div>
                </div>

                {/* Abstract */}
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold font-cinzel text-indigo-300 uppercase">
                      Abstract
                    </h2>
                    <button
                      onClick={() => handleCopySection(project.abstract, 'abstract')}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'abstract' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'abstract' ? 'Copied' : 'Copy Abstract'}</span>
                    </button>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={5}
                      value={editedAbstract}
                      onChange={(e) => setEditedAbstract(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200"
                    />
                  ) : (
                    <p className="text-slate-300 text-justify leading-relaxed">
                      {project.abstract}
                    </p>
                  )}

                  <div className="pt-2 text-xs">
                    <strong className="text-slate-400 font-sans">Keywords: </strong>
                    <span className="text-indigo-300">{project.keywords.join(', ')}</span>
                  </div>
                </div>

                {/* Chapter 1 Full */}
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                      {project.chapter1.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadSpecificChapter(1)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <FolderDown className="h-3 w-3 text-indigo-400" />
                        <span>Download Ch 1 (.DOC)</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">1.1 Background of the Study</h4>
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={editedCh1Background}
                          onChange={(e) => setEditedCh1Background(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                        />
                      ) : (
                        <p className="text-slate-300 text-justify leading-relaxed">{project.chapter1.background}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">1.2 Statement of the Problem</h4>
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={editedCh1Problem}
                          onChange={(e) => setEditedCh1Problem(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                        />
                      ) : (
                        <p className="text-slate-300 text-justify leading-relaxed">{project.chapter1.statementOfProblem}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">1.3 Objectives of the Study</h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        {project.chapter1.objectives.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">1.4 Research Questions</h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        {project.chapter1.researchQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    {project.chapter1.hypotheses && project.chapter1.hypotheses.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-200 mb-1">1.5 Research Hypotheses</h4>
                        <ul className="list-disc pl-5 space-y-1 text-slate-300">
                          {project.chapter1.hypotheses.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">1.6 Significance of the Study</h4>
                      <p className="text-slate-300 text-justify">{project.chapter1.significance}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">1.7 Scope and Delimitations of the Study</h4>
                      <p className="text-slate-300 text-justify">{project.chapter1.scopeAndDelimitation}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">1.8 Operational Definition of Terms</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {project.chapter1.definitionOfTerms.map((t, i) => (
                          <div key={i} className="p-2 rounded bg-slate-900/60 border border-slate-800">
                            <strong className="text-indigo-300 font-sans block">{t.term}</strong>
                            <span className="text-slate-400">{t.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter 2 Full */}
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                      {project.chapter2.title}
                    </h2>
                    <button
                      onClick={() => handleDownloadSpecificChapter(2)}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <FolderDown className="h-3 w-3 text-indigo-400" />
                      <span>Download Ch 2 (.DOC)</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">2.1 Conceptual Framework</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter2.conceptualFramework}</p>
                    </div>

                    {project.diagrams?.filter(d => d.chapter === 'chapter2').map((diag, dIdx) => (
                      <div key={dIdx} className="my-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-indigo-300 font-sans">{diag.figureNumber}: {diag.title}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setActiveZoomDiagram(diag)}
                              className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="h-3 w-3 text-indigo-400" /> Zoom
                            </button>
                            <button
                              onClick={() => downloadSvgAsFile(diag.svgCode, diag.figureNumber, diag.title)}
                              className="text-[11px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/40 flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-3 w-3" /> SVG
                            </button>
                          </div>
                        </div>
                        <div 
                          className="w-full flex items-center justify-center [&>svg]:max-h-[300px] [&>svg]:w-full [&>svg]:h-auto cursor-pointer"
                          onClick={() => setActiveZoomDiagram(diag)}
                          dangerouslySetInnerHTML={{ __html: diag.svgCode }}
                        />
                        {diag.sourceNote && <p className="text-[10px] text-slate-400 italic text-center mt-2 font-serif-academic">{diag.sourceNote}</p>}
                      </div>
                    ))}

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">2.2 Theoretical Framework</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter2.theoreticalFramework}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">2.3 Empirical Literature Review (Peer-Reviewed 2021-2026 Journals)</h4>
                      {isEditing ? (
                        <textarea
                          rows={5}
                          value={editedCh2Empirical}
                          onChange={(e) => setEditedCh2Empirical(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                        />
                      ) : (
                        <p className="text-slate-300 text-justify leading-relaxed">{project.chapter2.empiricalReview}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">2.4 Summary of Gaps in the Literature</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter2.gapsInLiterature}</p>
                    </div>
                  </div>
                </div>

                {/* Chapter 3 Full */}
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                      {project.chapter3.title}
                    </h2>
                    <button
                      onClick={() => handleDownloadSpecificChapter(3)}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <FolderDown className="h-3 w-3 text-indigo-400" />
                      <span>Download Ch 3 (.DOC)</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">3.1 Research Design</h4>
                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={editedCh3Design}
                          onChange={(e) => setEditedCh3Design(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                        />
                      ) : (
                        <p className="text-slate-300 text-justify leading-relaxed">{project.chapter3.researchDesign}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <h4 className="font-bold text-slate-200 mb-1">3.2 Population of the Study</h4>
                        <p className="text-slate-300">{project.chapter3.populationOfStudy}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 mb-1">3.3 Sample Size & Sampling Technique</h4>
                        <p className="text-slate-300">{project.chapter3.sampleSizeAndSamplingTechnique}</p>
                      </div>
                    </div>

                    {/* Chapter 3 Empirical Table & Methodology Diagram */}
                    {project.tables?.filter(t => t.chapter === 'chapter3').map((tbl, tIdx) => (
                      <div key={tIdx} className="my-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="text-xs font-bold text-indigo-300 font-serif-academic block">{tbl.tableNumber}</span>
                            <span className="text-xs italic text-slate-200 font-serif-academic">{tbl.title}</span>
                          </div>
                          <button
                            onClick={() => handleCopyTableHtml(tbl)}
                            className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3 text-emerald-400" /> Copy Table
                          </button>
                        </div>
                        <div className="overflow-x-auto my-2">
                          <table className="w-full text-xs font-serif-academic border-t-2 border-b-2 border-slate-400 border-collapse text-left">
                            <thead>
                              <tr className="border-b border-slate-500 bg-slate-950/40">
                                {tbl.headers.map((h, i) => <th key={i} className="py-2 px-3 font-bold text-slate-200">{h}</th>)}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {tbl.rows.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-850/40">
                                  {r.map((c, j) => <td key={j} className="py-1.5 px-3 text-slate-300">{c}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {tbl.note && <p className="text-[10px] font-serif-academic italic text-slate-400">{tbl.note}</p>}
                      </div>
                    ))}

                    {project.diagrams?.filter(d => d.chapter === 'chapter3').map((diag, dIdx) => (
                      <div key={dIdx} className="my-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-indigo-300 font-sans">{diag.figureNumber}: {diag.title}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setActiveZoomDiagram(diag)}
                              className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="h-3 w-3 text-indigo-400" /> Zoom
                            </button>
                            <button
                              onClick={() => downloadSvgAsFile(diag.svgCode, diag.figureNumber, diag.title)}
                              className="text-[11px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/40 flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-3 w-3" /> SVG
                            </button>
                          </div>
                        </div>
                        <div 
                          className="w-full flex items-center justify-center [&>svg]:max-h-[300px] [&>svg]:w-full [&>svg]:h-auto cursor-pointer"
                          onClick={() => setActiveZoomDiagram(diag)}
                          dangerouslySetInnerHTML={{ __html: diag.svgCode }}
                        />
                        {diag.sourceNote && <p className="text-[10px] text-slate-400 italic text-center mt-2 font-serif-academic">{diag.sourceNote}</p>}
                      </div>
                    ))}

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">3.4 Research Instrumentation & Validation</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter3.instrumentationAndValidation}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">3.5 Procedure for Data Collection</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter3.procedureForDataCollection}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">3.6 Method of Data Analysis</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter3.methodOfDataAnalysis}</p>
                    </div>
                  </div>
                </div>

                {/* Chapter 4 Full */}
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                      {project.chapter4.title}
                    </h2>
                    <button
                      onClick={() => handleDownloadSpecificChapter(4)}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <FolderDown className="h-3 w-3 text-indigo-400" />
                      <span>Download Ch 4 (.DOC)</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">4.1 Data Presentation & Analysis</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter4.dataPresentation}</p>
                    </div>

                    {/* Chapter 4 Empirical Tables, Bar Charts & Path Diagrams */}
                    {project.tables?.filter(t => t.chapter === 'chapter4').map((tbl, tIdx) => (
                      <div key={tIdx} className="my-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="text-xs font-bold text-indigo-300 font-serif-academic block">{tbl.tableNumber}</span>
                            <span className="text-xs italic text-slate-200 font-serif-academic">{tbl.title}</span>
                          </div>
                          <button
                            onClick={() => handleCopyTableHtml(tbl)}
                            className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="h-3 w-3 text-emerald-400" /> Copy Table
                          </button>
                        </div>
                        <div className="overflow-x-auto my-2">
                          <table className="w-full text-xs font-serif-academic border-t-2 border-b-2 border-slate-400 border-collapse text-left">
                            <thead>
                              <tr className="border-b border-slate-500 bg-slate-950/40">
                                {tbl.headers.map((h, i) => <th key={i} className="py-2 px-3 font-bold text-slate-200">{h}</th>)}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {tbl.rows.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-850/40">
                                  {r.map((c, j) => <td key={j} className="py-1.5 px-3 text-slate-300">{c}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {tbl.note && <p className="text-[10px] font-serif-academic italic text-slate-400">{tbl.note}</p>}
                      </div>
                    ))}

                    {project.charts?.filter(c => c.chapter === 'chapter4').map((chart, cIdx) => (
                      <div key={cIdx} className="my-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-300 font-sans">{chart.figureNumber}: {chart.title}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setActiveZoomDiagram({
                                title: chart.title,
                                figureNumber: chart.figureNumber,
                                svgCode: chart.svgCode,
                                sourceNote: chart.sourceNote,
                                description: chart.summaryText
                              })}
                              className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="h-3 w-3 text-emerald-400" /> Zoom
                            </button>
                            <button
                              onClick={() => downloadSvgAsFile(chart.svgCode!, chart.figureNumber, chart.title)}
                              className="text-[11px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/40 flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-3 w-3" /> SVG
                            </button>
                          </div>
                        </div>
                        {chart.svgCode && (
                          <div 
                            className="w-full flex items-center justify-center [&>svg]:max-h-[340px] [&>svg]:w-full [&>svg]:h-auto cursor-pointer"
                            onClick={() => setActiveZoomDiagram({
                              title: chart.title,
                              figureNumber: chart.figureNumber,
                              svgCode: chart.svgCode,
                              sourceNote: chart.sourceNote,
                              description: chart.summaryText
                            })}
                            dangerouslySetInnerHTML={{ __html: chart.svgCode }}
                          />
                        )}
                        {chart.summaryText && <p className="text-[11px] text-slate-300 mt-2 font-serif-academic leading-relaxed">{chart.summaryText}</p>}
                        {chart.sourceNote && <p className="text-[10px] text-slate-400 italic text-center mt-1.5 font-serif-academic">{chart.sourceNote}</p>}
                      </div>
                    ))}

                    {project.diagrams?.filter(d => d.chapter === 'chapter4').map((diag, dIdx) => (
                      <div key={dIdx} className="my-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-indigo-300 font-sans">{diag.figureNumber}: {diag.title}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setActiveZoomDiagram(diag)}
                              className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="h-3 w-3 text-indigo-400" /> Zoom
                            </button>
                            <button
                              onClick={() => downloadSvgAsFile(diag.svgCode, diag.figureNumber, diag.title)}
                              className="text-[11px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/40 flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-3 w-3" /> SVG
                            </button>
                          </div>
                        </div>
                        <div 
                          className="w-full flex items-center justify-center [&>svg]:max-h-[300px] [&>svg]:w-full [&>svg]:h-auto cursor-pointer"
                          onClick={() => setActiveZoomDiagram(diag)}
                          dangerouslySetInnerHTML={{ __html: diag.svgCode }}
                        />
                        {diag.sourceNote && <p className="text-[10px] text-slate-400 italic text-center mt-2 font-serif-academic">{diag.sourceNote}</p>}
                      </div>
                    ))}

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">4.2 Analysis of Research Questions</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter4.analysisOfResearchQuestions}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">4.3 Test of Hypotheses</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter4.testOfHypotheses}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">4.4 Discussion of Findings</h4>
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={editedCh4Findings}
                          onChange={(e) => setEditedCh4Findings(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                        />
                      ) : (
                        <p className="text-slate-300 text-justify leading-relaxed">{project.chapter4.discussionOfFindings}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chapter 5 Full */}
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                      {project.chapter5.title}
                    </h2>
                    <button
                      onClick={() => handleDownloadSpecificChapter(5)}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <FolderDown className="h-3 w-3 text-indigo-400" />
                      <span>Download Ch 5 (.DOC)</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">5.1 Summary of Findings</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter5.summaryOfFindings}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">5.2 Conclusion</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter5.conclusion}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">5.3 Policy and Practical Recommendations</h4>
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={editedCh5Recs}
                          onChange={(e) => setEditedCh5Recs(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                        />
                      ) : (
                        <ul className="list-disc pl-5 space-y-1 text-slate-300">
                          {project.chapter5.recommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">5.4 Contribution to Knowledge</h4>
                      <p className="text-slate-300 text-justify leading-relaxed">{project.chapter5.contributionToKnowledge}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">5.5 Suggestions for Further Studies</h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        {project.chapter5.suggestionsForFurtherStudies.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* References Box */}
                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold font-cinzel text-indigo-300 uppercase">
                      References (APA 7th Edition)
                    </h2>
                    <button
                      onClick={() => handleCopySection(project.references.join('\n\n'), 'references')}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'references' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedKey === 'references' ? 'Copied' : 'Copy All References'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {project.references.map((ref, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 pl-4 -indent-4 text-slate-300">
                        <span className="font-mono-code text-indigo-400 font-bold mr-2">[{idx + 1}]</span>
                        <span>{ref}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* View: Chapter 1 Solo */}
            {activeTab === 'ch1' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                    {project.chapter1.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleHumanizeActiveChapter}
                      disabled={humanizing}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Humanize Chapter 1</span>
                    </button>
                    <button
                      onClick={() => setIsCountryStyleOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe className="h-3 w-3 text-indigo-400" />
                      <span>Rewrite Country Style</span>
                    </button>
                    <button
                      onClick={() => handleDownloadSpecificChapter(1)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold shadow"
                    >
                      <FolderDown className="h-3 w-3" />
                      <span>Download Ch 1 Word (.DOC)</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">1.1 Background of the Study</h4>
                    <p className="text-slate-300 text-justify">{project.chapter1.background}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">1.2 Statement of the Problem</h4>
                    <p className="text-slate-300 text-justify">{project.chapter1.statementOfProblem}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">1.3 Objectives of the Study</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      {project.chapter1.objectives.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">1.4 Research Questions</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      {project.chapter1.researchQuestions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                  {project.chapter1.hypotheses && project.chapter1.hypotheses.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-200 mb-1">1.5 Research Hypotheses</h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        {project.chapter1.hypotheses.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">1.6 Significance of the Study</h4>
                    <p className="text-slate-300 text-justify">{project.chapter1.significance}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">1.7 Scope & Delimitations</h4>
                    <p className="text-slate-300 text-justify">{project.chapter1.scopeAndDelimitation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* View: Chapter 2 Solo */}
            {activeTab === 'ch2' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                    {project.chapter2.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleHumanizeActiveChapter}
                      disabled={humanizing}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Humanize Chapter 2</span>
                    </button>
                    <button
                      onClick={() => setIsCountryStyleOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe className="h-3 w-3 text-indigo-400" />
                      <span>Rewrite Country Style</span>
                    </button>
                    <button
                      onClick={() => handleDownloadSpecificChapter(2)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold shadow"
                    >
                      <FolderDown className="h-3 w-3" />
                      <span>Download Ch 2 Word (.DOC)</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">2.1 Conceptual Review</h4>
                    <p className="text-slate-300 text-justify">{project.chapter2.conceptualFramework}</p>
                  </div>

                  {project.diagrams?.filter(d => d.chapter === 'chapter2').map((diag, dIdx) => (
                    <div key={dIdx} className="my-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-300 font-sans">{diag.figureNumber}: {diag.title}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveZoomDiagram(diag)}
                            className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Maximize2 className="h-3 w-3 text-indigo-400" /> Zoom
                          </button>
                          <button
                            onClick={() => downloadSvgAsFile(diag.svgCode, diag.figureNumber, diag.title)}
                            className="text-[11px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/40 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3 w-3" /> SVG
                          </button>
                        </div>
                      </div>
                      <div 
                        className="w-full flex items-center justify-center [&>svg]:max-h-[300px] [&>svg]:w-full [&>svg]:h-auto cursor-pointer"
                        onClick={() => setActiveZoomDiagram(diag)}
                        dangerouslySetInnerHTML={{ __html: diag.svgCode }}
                      />
                      {diag.sourceNote && <p className="text-[10px] text-slate-400 italic text-center mt-2 font-serif-academic">{diag.sourceNote}</p>}
                    </div>
                  ))}

                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">2.2 Theoretical Framework</h4>
                    <p className="text-slate-300 text-justify">{project.chapter2.theoreticalFramework}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">2.3 Empirical Literature Review (Peer-Reviewed Journals 2021-2026)</h4>
                    <p className="text-slate-300 text-justify">{project.chapter2.empiricalReview}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">2.4 Summary of Gaps in Literature</h4>
                    <p className="text-slate-300 text-justify">{project.chapter2.gapsInLiterature}</p>
                  </div>
                </div>
              </div>
            )}

            {/* View: Chapter 3 Solo */}
            {activeTab === 'ch3' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                    {project.chapter3.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleHumanizeActiveChapter}
                      disabled={humanizing}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Humanize Chapter 3</span>
                    </button>
                    <button
                      onClick={() => setIsCountryStyleOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe className="h-3 w-3 text-indigo-400" />
                      <span>Rewrite Country Style</span>
                    </button>
                    <button
                      onClick={() => handleDownloadSpecificChapter(3)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold shadow"
                    >
                      <FolderDown className="h-3 w-3" />
                      <span>Download Ch 3 Word (.DOC)</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">3.1 Research Design</h4>
                    <p className="text-slate-300 text-justify">{project.chapter3.researchDesign}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">3.2 Population & Sample</h4>
                    <p className="text-slate-300">{project.chapter3.populationOfStudy}</p>
                    <p className="text-slate-300 mt-2">{project.chapter3.sampleSizeAndSamplingTechnique}</p>
                  </div>

                  {project.tables?.filter(t => t.chapter === 'chapter3').map((tbl, tIdx) => (
                    <div key={tIdx} className="my-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs font-bold text-indigo-300 font-serif-academic block">{tbl.tableNumber}</span>
                          <span className="text-xs italic text-slate-200 font-serif-academic">{tbl.title}</span>
                        </div>
                        <button
                          onClick={() => handleCopyTableHtml(tbl)}
                          className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="h-3 w-3 text-emerald-400" /> Copy Table
                        </button>
                      </div>
                      <div className="overflow-x-auto my-2">
                        <table className="w-full text-xs font-serif-academic border-t-2 border-b-2 border-slate-400 border-collapse text-left">
                          <thead>
                            <tr className="border-b border-slate-500 bg-slate-950/40">
                              {tbl.headers.map((h, i) => <th key={i} className="py-2 px-3 font-bold text-slate-200">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {tbl.rows.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-850/40">
                                {r.map((c, j) => <td key={j} className="py-1.5 px-3 text-slate-300">{c}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {tbl.note && <p className="text-[10px] font-serif-academic italic text-slate-400">{tbl.note}</p>}
                    </div>
                  ))}

                  {project.diagrams?.filter(d => d.chapter === 'chapter3').map((diag, dIdx) => (
                    <div key={dIdx} className="my-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-300 font-sans">{diag.figureNumber}: {diag.title}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveZoomDiagram(diag)}
                            className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Maximize2 className="h-3 w-3 text-indigo-400" /> Zoom
                          </button>
                          <button
                            onClick={() => downloadSvgAsFile(diag.svgCode, diag.figureNumber, diag.title)}
                            className="text-[11px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/40 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3 w-3" /> SVG
                          </button>
                        </div>
                      </div>
                      <div 
                        className="w-full flex items-center justify-center [&>svg]:max-h-[300px] [&>svg]:w-full [&>svg]:h-auto cursor-pointer"
                        onClick={() => setActiveZoomDiagram(diag)}
                        dangerouslySetInnerHTML={{ __html: diag.svgCode }}
                      />
                      {diag.sourceNote && <p className="text-[10px] text-slate-400 italic text-center mt-2 font-serif-academic">{diag.sourceNote}</p>}
                    </div>
                  ))}

                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">3.3 Instrumentation & Validation</h4>
                    <p className="text-slate-300 text-justify">{project.chapter3.instrumentationAndValidation}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">3.4 Procedure for Data Collection</h4>
                    <p className="text-slate-300 text-justify">{project.chapter3.procedureForDataCollection}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">3.5 Method of Data Analysis</h4>
                    <p className="text-slate-300 text-justify">{project.chapter3.methodOfDataAnalysis}</p>
                  </div>
                </div>
              </div>
            )}

            {/* View: Chapter 4 Solo */}
            {activeTab === 'ch4' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                    {project.chapter4.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleHumanizeActiveChapter}
                      disabled={humanizing}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Humanize Chapter 4</span>
                    </button>
                    <button
                      onClick={() => setIsCountryStyleOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe className="h-3 w-3 text-indigo-400" />
                      <span>Rewrite Country Style</span>
                    </button>
                    <button
                      onClick={() => handleDownloadSpecificChapter(4)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold shadow"
                    >
                      <FolderDown className="h-3 w-3" />
                      <span>Download Ch 4 Word (.DOC)</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">4.1 Data Presentation & Analysis</h4>
                    <p className="text-slate-300 text-justify">{project.chapter4.dataPresentation}</p>
                  </div>

                  {/* Chapter 4 Visual Tables & Charts */}
                  {project.tables?.filter(t => t.chapter === 'chapter4').map((tbl, tIdx) => (
                    <div key={tIdx} className="my-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs font-bold text-indigo-300 font-serif-academic block">{tbl.tableNumber}</span>
                          <span className="text-xs italic text-slate-200 font-serif-academic">{tbl.title}</span>
                        </div>
                        <button
                          onClick={() => handleCopyTableHtml(tbl)}
                          className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="h-3 w-3 text-emerald-400" /> Copy Table
                        </button>
                      </div>
                      <div className="overflow-x-auto my-2">
                        <table className="w-full text-xs font-serif-academic border-t-2 border-b-2 border-slate-400 border-collapse text-left">
                          <thead>
                            <tr className="border-b border-slate-500 bg-slate-950/40">
                              {tbl.headers.map((h, i) => <th key={i} className="py-2 px-3 font-bold text-slate-200">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {tbl.rows.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-850/40">
                                {r.map((c, j) => <td key={j} className="py-1.5 px-3 text-slate-300">{c}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {tbl.note && <p className="text-[10px] font-serif-academic italic text-slate-400">{tbl.note}</p>}
                    </div>
                  ))}

                  {project.charts?.filter(c => c.chapter === 'chapter4').map((chart, cIdx) => (
                    <div key={cIdx} className="my-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-300 font-sans">{chart.figureNumber}: {chart.title}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveZoomDiagram({
                              title: chart.title,
                              figureNumber: chart.figureNumber,
                              svgCode: chart.svgCode,
                              sourceNote: chart.sourceNote,
                              description: chart.summaryText
                            })}
                            className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Maximize2 className="h-3 w-3 text-emerald-400" /> Zoom
                          </button>
                          <button
                            onClick={() => downloadSvgAsFile(chart.svgCode!, chart.figureNumber, chart.title)}
                            className="text-[11px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/40 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3 w-3" /> SVG
                          </button>
                        </div>
                      </div>
                      {chart.svgCode && (
                        <div 
                          className="w-full flex items-center justify-center [&>svg]:max-h-[340px] [&>svg]:w-full [&>svg]:h-auto cursor-pointer"
                          onClick={() => setActiveZoomDiagram({
                            title: chart.title,
                            figureNumber: chart.figureNumber,
                            svgCode: chart.svgCode,
                            sourceNote: chart.sourceNote,
                            description: chart.summaryText
                          })}
                          dangerouslySetInnerHTML={{ __html: chart.svgCode }}
                        />
                      )}
                      {chart.summaryText && <p className="text-[11px] text-slate-300 mt-2 font-serif-academic leading-relaxed">{chart.summaryText}</p>}
                      {chart.sourceNote && <p className="text-[10px] text-slate-400 italic text-center mt-1.5 font-serif-academic">{chart.sourceNote}</p>}
                    </div>
                  ))}

                  {project.diagrams?.filter(d => d.chapter === 'chapter4').map((diag, dIdx) => (
                    <div key={dIdx} className="my-3 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-300 font-sans">{diag.figureNumber}: {diag.title}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveZoomDiagram(diag)}
                            className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Maximize2 className="h-3 w-3 text-indigo-400" /> Zoom
                          </button>
                          <button
                            onClick={() => downloadSvgAsFile(diag.svgCode, diag.figureNumber, diag.title)}
                            className="text-[11px] px-2 py-0.5 bg-emerald-900/30 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/40 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3 w-3" /> SVG
                          </button>
                        </div>
                      </div>
                      <div 
                        className="w-full flex items-center justify-center [&>svg]:max-h-[300px] [&>svg]:w-full [&>svg]:h-auto cursor-pointer"
                        onClick={() => setActiveZoomDiagram(diag)}
                        dangerouslySetInnerHTML={{ __html: diag.svgCode }}
                      />
                      {diag.sourceNote && <p className="text-[10px] text-slate-400 italic text-center mt-2 font-serif-academic">{diag.sourceNote}</p>}
                    </div>
                  ))}

                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">4.2 Analysis of Research Questions</h4>
                    <p className="text-slate-300 text-justify">{project.chapter4.analysisOfResearchQuestions}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">4.3 Test of Hypotheses</h4>
                    <p className="text-slate-300 text-justify">{project.chapter4.testOfHypotheses}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">4.4 Discussion of Findings</h4>
                    <p className="text-slate-300 text-justify">{project.chapter4.discussionOfFindings}</p>
                  </div>
                </div>
              </div>
            )}

            {/* View: Chapter 5 Solo */}
            {activeTab === 'ch5' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                    {project.chapter5.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleHumanizeActiveChapter}
                      disabled={humanizing}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Humanize Chapter 5</span>
                    </button>
                    <button
                      onClick={() => setIsCountryStyleOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe className="h-3 w-3 text-indigo-400" />
                      <span>Rewrite Country Style</span>
                    </button>
                    <button
                      onClick={() => handleDownloadSpecificChapter(5)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold shadow"
                    >
                      <FolderDown className="h-3 w-3" />
                      <span>Download Ch 5 Word (.DOC)</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">5.1 Summary of Findings</h4>
                    <p className="text-slate-300 text-justify">{project.chapter5.summaryOfFindings}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">5.2 Conclusion</h4>
                    <p className="text-slate-300 text-justify">{project.chapter5.conclusion}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">5.3 Recommendations</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
                      {project.chapter5.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">5.4 Contribution to Knowledge</h4>
                    <p className="text-slate-300 text-justify">{project.chapter5.contributionToKnowledge}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">5.5 Suggestions for Further Studies</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300">
                      {project.chapter5.suggestionsForFurtherStudies.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* View: Peer-Reviewed Journal Sources & Verifiable Audit (User requirement: from a good source and journal) */}
            {activeTab === 'journals' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase flex items-center gap-2">
                      <Library className="h-5 w-5 text-indigo-400" />
                      <span>Peer-Reviewed Journal Sources & Scholarly Audit</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verified publications from leading scientific publishers (Elsevier, IEEE, Springer Nature, Wiley, SAGE, AJOL)
                    </p>
                  </div>

                  <span className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto font-semibold">
                    Indexed: Scopus • Web of Science • AJOL
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {project.journalSources && project.journalSources.length > 0 ? (
                    project.journalSources.map((js, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                              {js.publisher} • {js.indexing || 'Scopus / WoS'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-100 font-sans mt-1">
                              {js.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-sans">
                              {js.authors} ({js.year}) — <strong className="text-indigo-300">{js.journal}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {js.doi && (
                              <a
                                href={js.doi}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer font-sans"
                                title="Open DOI persistent link"
                              >
                                <span>DOI Link</span>
                                <ExternalLink className="h-3 w-3 text-indigo-400" />
                              </a>
                            )}
                            <a
                              href={`https://scholar.google.com/scholar?q=${encodeURIComponent(js.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer font-sans"
                              title="Verify on Google Scholar"
                            >
                              <span>Google Scholar</span>
                              <ExternalLink className="h-3 w-3 text-emerald-400" />
                            </a>
                          </div>
                        </div>

                        {/* APA 7th entry preview */}
                        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-serif-academic flex items-start justify-between gap-2">
                          <span className="leading-relaxed">{js.apaCitation}</span>
                          <button
                            onClick={() => handleCopySection(js.apaCitation, `js-${idx}`)}
                            className="text-slate-400 hover:text-emerald-400 p-1 shrink-0 cursor-pointer"
                            title="Copy formatted citation"
                          >
                            {copiedKey === `js-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3 text-xs text-slate-300">
                      <p>
                        This research incorporates reputable peer-reviewed academic journal citations formatted according to APA 7th Edition standards. You can view all formatted bibliography entries under the <strong>APA 7th References</strong> tab or download the complete Word report containing the verified sources audit.
                      </p>
                      <button
                        onClick={() => setActiveTab('ref')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>View APA 7th References</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View: References */}
            {activeTab === 'ref' && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase">
                      References (APA 7th Edition)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Prioritized credible academic literature published within 2021-2026.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopySection(project.references.join('\n\n'), 'ref-solo')}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold"
                  >
                    {copiedKey === 'ref-solo' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'ref-solo' ? 'Copied All!' : 'Copy All References'}</span>
                  </button>
                </div>

                <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
                  {project.references.map((ref, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs text-slate-300">
                      <div className="pl-3 -indent-3 leading-relaxed">
                        <span className="font-mono-code text-indigo-400 font-bold mr-2">[{idx + 1}]</span>
                        <span>{ref}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`https://scholar.google.com/scholar?q=${encodeURIComponent(ref)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-800 border border-slate-700"
                          title="Verify source on Google Scholar"
                        >
                          <span>Verify</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                        <button
                          onClick={() => handleCopySection(ref, `ref-item-${idx}`)}
                          className="text-slate-400 hover:text-emerald-400 p-1 cursor-pointer"
                          title="Copy citation"
                        >
                          {copiedKey === `ref-item-${idx}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Diagrams & Models */}
            {activeTab === 'diagrams' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase flex items-center gap-2">
                      <LayoutGrid className="h-5 w-5 text-indigo-400" />
                      <span>Diagrams, Flowcharts & Conceptual Models</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vector SVG diagrams adhering to supervisor requirements for theoretical, methodological, and architectural modeling.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setVisualType('diagram');
                      setIsVisualGeneratorOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Generate Custom Diagram</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {project.diagrams && project.diagrams.length > 0 ? (
                    project.diagrams.map((diag, idx) => (
                      <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30">
                                {diag.figureNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {diag.chapter?.toUpperCase() || 'DISSERTATION MODEL'}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-100 font-sans mt-1.5">
                              {diag.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              {diag.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setActiveZoomDiagram(diag)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              title="Zoom and inspect full-size diagram"
                            >
                              <Maximize2 className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Zoom</span>
                            </button>
                            <button
                              onClick={() => downloadSvgAsFile(diag.svgCode, diag.figureNumber, diag.title)}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              title="Download SVG vector file"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>SVG</span>
                            </button>
                            <button
                              onClick={() => handleCopySvg(diag.id, diag.svgCode)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              title="Copy raw SVG markup"
                            >
                              {copiedKey === diag.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{copiedKey === diag.id ? 'Copied' : 'Copy'}</span>
                            </button>
                            {diag.mermaidCode && (
                              <button
                                onClick={() => handleCopySection(diag.mermaidCode!, `${diag.id}-mermaid`)}
                                className="px-2.5 py-1 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-700/50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                title="Copy Mermaid text notation"
                              >
                                {copiedKey === `${diag.id}-mermaid` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                <span>Mermaid</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* SVG Display Canvas */}
                        <div 
                          className="bg-slate-900/90 rounded-lg p-3 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[460px] cursor-pointer hover:border-indigo-500/40 transition"
                          onClick={() => setActiveZoomDiagram(diag)}
                          title="Click to view full screen"
                        >
                          <div 
                            className="w-full h-full flex items-center justify-center [&>svg]:max-h-[420px] [&>svg]:w-full [&>svg]:h-auto"
                            dangerouslySetInnerHTML={{ __html: diag.svgCode }}
                          />
                        </div>

                        {diag.sourceNote && (
                          <p className="text-[11px] text-slate-400 text-center italic font-serif-academic">
                            {diag.sourceNote}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                      <LayoutGrid className="h-8 w-8 text-slate-500 mx-auto" />
                      <p>No diagrams generated yet for this project.</p>
                      <button
                        onClick={() => {
                          setVisualType('diagram');
                          setIsVisualGeneratorOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Generate Figure 2.1 Conceptual Framework</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View: Empirical Tables (APA 7th) */}
            {activeTab === 'tables' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-400" />
                      <span>Empirical Statistical Tables (APA 7th Edition)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Rigorous frequency, descriptive statistics, Taro Yamane allocation, Pearson correlations, and regression models.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setVisualType('table');
                      setIsVisualGeneratorOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Custom APA Table</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {project.tables && project.tables.length > 0 ? (
                    project.tables.map((tbl, idx) => (
                      <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div>
                            <span className="text-[11px] font-bold font-serif-academic text-indigo-300 block">
                              {tbl.tableNumber}
                            </span>
                            <span className="text-xs font-serif-academic italic text-slate-200">
                              {tbl.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCopyTableHtml(tbl)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              title="Copy as APA 7th HTML table (ready to paste into Word)"
                            >
                              {copiedKey === `${tbl.id}-html` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{copiedKey === `${tbl.id}-html` ? 'Copied HTML' : 'Copy APA Table'}</span>
                            </button>
                            <button
                              onClick={() => handleCopyTableMarkdown(tbl)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              title="Copy Markdown representation"
                            >
                              {copiedKey === `${tbl.id}-md` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>Markdown</span>
                            </button>
                          </div>
                        </div>

                        {/* APA 7th Table Component */}
                        <div className="overflow-x-auto my-2">
                          <table className="w-full text-xs font-serif-academic border-t-2 border-b-2 border-slate-400 border-collapse text-left">
                            <thead>
                              <tr className="border-b border-slate-500 bg-slate-900/60">
                                {tbl.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="py-2.5 px-3 font-bold text-slate-200">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {tbl.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-900/40">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="py-2 px-3 text-slate-300">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {tbl.note && (
                          <p className="text-[11px] font-serif-academic italic text-slate-400 pt-1">
                            {tbl.note}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                      <BarChart3 className="h-8 w-8 text-slate-500 mx-auto" />
                      <p>No empirical tables generated yet for this project.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View: Bar Charts & Statistical Analytics */}
            {activeTab === 'charts' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-indigo-400" />
                      <span>Empirical Bar Charts & Visual Statistical Analytics</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Interactive high-precision bar charts comparing respondent cadres, Likert mean acceptance, and cut-off benchmarks.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setVisualType('chart');
                      setIsVisualGeneratorOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Generate Custom Bar Chart</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {project.charts && project.charts.length > 0 ? (
                    project.charts.map((chart, idx) => (
                      <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30">
                                {chart.figureNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {chart.chartType.replace('_', ' ').toUpperCase()} • CHAPTER 4
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-100 font-sans mt-1.5">
                              {chart.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {chart.svgCode && (
                              <>
                                <button
                                  onClick={() => setActiveZoomDiagram({
                                    title: chart.title,
                                    figureNumber: chart.figureNumber,
                                    svgCode: chart.svgCode,
                                    sourceNote: chart.sourceNote,
                                    description: chart.summaryText
                                  })}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Zoom bar chart"
                                >
                                  <Maximize2 className="h-3.5 w-3.5 text-indigo-400" />
                                  <span>Zoom</span>
                                </button>
                                <button
                                  onClick={() => downloadSvgAsFile(chart.svgCode!, chart.figureNumber, chart.title)}
                                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Download SVG bar chart"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>SVG</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Chart Render Canvas */}
                        {chart.svgCode && (
                          <div 
                            className="bg-slate-900/90 rounded-lg p-3 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[460px] cursor-pointer hover:border-emerald-500/40 transition"
                            onClick={() => setActiveZoomDiagram({
                              title: chart.title,
                              figureNumber: chart.figureNumber,
                              svgCode: chart.svgCode,
                              sourceNote: chart.sourceNote,
                              description: chart.summaryText
                            })}
                            title="Click to view full screen"
                          >
                            <div 
                              className="w-full h-full flex items-center justify-center [&>svg]:max-h-[420px] [&>svg]:w-full [&>svg]:h-auto"
                              dangerouslySetInnerHTML={{ __html: chart.svgCode }}
                            />
                          </div>
                        )}

                        {chart.summaryText && (
                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-serif-academic leading-relaxed">
                            <strong className="text-emerald-300 font-sans block mb-1">Empirical Discussion & Triangulation:</strong>
                            {chart.summaryText}
                          </div>
                        )}

                        {chart.sourceNote && (
                          <p className="text-[11px] text-slate-400 text-center italic font-serif-academic">
                            {chart.sourceNote}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                      <BarChart3 className="h-8 w-8 text-slate-500 mx-auto" />
                      <p>No bar charts generated yet for this project.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View: Appendices & Questionnaire */}
            {activeTab === 'appendices' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold font-cinzel text-indigo-300 uppercase flex items-center gap-2">
                      <FileCheck2 className="h-5 w-5 text-indigo-400" />
                      <span>Research Appendices & Survey Instruments</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Formal survey questionnaires (STAQ), Taro Yamane statistical worksheets, and Cronbach's Alpha matrices.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {project.appendices && project.appendices.length > 0 ? (
                    project.appendices.map((app, idx) => (
                      <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <h3 className="text-sm font-bold text-slate-100 font-sans">
                            {app.title}
                          </h3>
                          <button
                            onClick={() => handleCopySection(app.content, `app-${app.id}`)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === `app-${app.id}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedKey === `app-${app.id}` ? 'Copied' : 'Copy Text'}</span>
                          </button>
                        </div>

                        <div className="p-4 bg-slate-900/90 rounded-lg border border-slate-800/80 font-mono-code text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                          {app.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                      <FileCheck2 className="h-8 w-8 text-slate-500 mx-auto" />
                      <p>Appendices are generated automatically during full project synthesis.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HUMANIZER MODAL (User Requirement 2) */}
      {/* ========================================================================= */}
      {isHumanizerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-cinzel">
                    ScholarAssist Global Humanizer
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    Adapting tone for <strong className="text-amber-200">{country?.name || 'Nigeria'}</strong> ({level}) • 100% natural student writing
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHumanizerOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {humanizing ? (
                <div className="py-16 text-center space-y-3">
                  <div className="h-10 w-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-200">
                    Humanizing {humanizedResult?.chapterTitle || 'Chapter'}...
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Removing repetitive AI patterns ("In conclusion", "Delve into", "In today's world"), injecting natural sentence variation, and preserving all empirical facts and citations.
                  </p>
                </div>
              ) : humanizedResult ? (
                <div className="space-y-4">
                  {/* Badge */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>{humanizedResult.badge}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      All facts, empirical data & references preserved
                    </span>
                  </div>

                  {/* Humanized Text Box */}
                  <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl font-serif-academic text-slate-200 leading-relaxed text-sm whitespace-pre-line max-h-96 overflow-y-auto">
                    {humanizedResult.text}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            {humanizedResult && !humanizing && (
              <div className="px-5 py-3.5 bg-slate-850 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono-code">
                  Ready to submit to supervisor or edit
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(humanizedResult.text);
                      setCopiedKey('humanized-modal');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'humanized-modal' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'humanized-modal' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadCustomTextAsWord(
                        `${humanizedResult.chapterTitle}_Humanized`,
                        humanizedResult.text,
                        project?.topicTitle || 'Academic_Research',
                        level,
                        country?.name || 'International'
                      );
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FolderDown className="h-3.5 w-3.5" />
                    <span>Download as Word Docx</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COUNTRY STYLE REWRITER MODAL (User Requirement 3) */}
      {/* ========================================================================= */}
      {isCountryStyleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border-b border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-cinzel">
                    Rewrite for Country Academic Standards
                  </h3>
                  <p className="text-xs text-indigo-300/80">
                    Adapts vocabulary, spelling, citation convention & chapter structures
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCountryStyleOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Country Selector Options */}
            <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap gap-2 text-xs">
              {[
                { country: 'Nigeria', label: '🇳🇬 Nigeria / Ghana (5-Chapter Formal Format)' },
                { country: 'USA', label: '🇺🇸 USA (APA 7th, American Spelling, Direct)' },
                { country: 'UK', label: '🇬🇧 UK (Harvard, British Spelling, Analytical)' },
                { country: 'India', label: '🇮🇳 India (Formal, Detailed, Objectives Stated)' },
                { country: 'Canada', label: '🇨🇦 Canada / Australia (APA/Harvard, Concise)' }
              ].map((c) => (
                <button
                  key={c.country}
                  onClick={() => handleRewriteCountryStyle(c.country)}
                  disabled={rewritingCountry}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer border ${
                    countryStyleTarget === c.country
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {rewritingCountry ? (
                <div className="py-16 text-center space-y-3">
                  <div className="h-10 w-10 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-200">
                    Rewriting for {countryStyleTarget} Academic Standards...
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Updating spelling conventions, formatting style, structural tone, and citation norms.
                  </p>
                </div>
              ) : countryStyleResult ? (
                <div className="space-y-4">
                  {/* Badge */}
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>{countryStyleResult.badge}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Standard: {countryStyleResult.targetCountry}
                    </span>
                  </div>

                  {/* Text Box */}
                  <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl font-serif-academic text-slate-200 leading-relaxed text-sm whitespace-pre-line max-h-96 overflow-y-auto">
                    {countryStyleResult.text}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <Globe className="h-8 w-8 text-indigo-400 mx-auto" />
                  <p>Select your target country above to adapt this chapter to its exact university standards.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {countryStyleResult && !rewritingCountry && (
              <div className="px-5 py-3.5 bg-slate-850 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono-code">
                  Formatted for {countryStyleResult.targetCountry}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(countryStyleResult.text);
                      setCopiedKey('country-modal');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'country-modal' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'country-modal' ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadCustomTextAsWord(
                        `${countryStyleResult.chapterTitle}_${countryStyleResult.targetCountry}_Style`,
                        countryStyleResult.text,
                        project?.topicTitle || 'Academic_Research',
                        level,
                        countryStyleResult.targetCountry
                      );
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FolderDown className="h-3.5 w-3.5" />
                    <span>Download as Word Docx</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* VISUAL & DIAGRAM GENERATOR MODAL */}
      {/* ========================================================================= */}
      {isVisualGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border-b border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-cinzel">
                    Academic Visual & Diagram Generator
                  </h3>
                  <p className="text-xs text-indigo-300/80">
                    Generate vector SVG diagrams, APA 7th empirical tables, or statistical bar charts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVisualGeneratorOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Type Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Visual Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'diagram', label: '🎨 SVG Diagram / Model' },
                    { id: 'chart', label: '📈 Statistical Bar Chart' },
                    { id: 'table', label: '📊 APA 7th Empirical Table' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setVisualType(t.id as any);
                        if (t.id === 'chart') {
                          setVisualSubType('grouped_bar');
                          setVisualChapter('chapter4');
                        } else if (t.id === 'table') {
                          setVisualSubType('descriptive_table');
                          setVisualChapter('chapter4');
                        } else {
                          setVisualSubType('conceptual_framework');
                          setVisualChapter('chapter2');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer ${
                        visualType === t.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950/60 hover:bg-slate-850 text-slate-300 border-slate-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-type Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Visual Model Archetype
                </label>
                <select
                  value={visualSubType}
                  onChange={(e) => setVisualSubType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {visualType === 'diagram' && (
                    <>
                      <option value="conceptual_framework">Figure 2.1: Conceptual Framework (IV → Intervening → DV)</option>
                      <option value="methodology_flowchart">Figure 3.1: Sequential Empirical Methodology Pipeline</option>
                      <option value="system_architecture">Figure 4.1: Multi-Tier System Architecture & Data Ingestion Flow</option>
                      <option value="path_model">Figure 4.1: Empirical Structural Path Model (Regression Weights)</option>
                    </>
                  )}
                  {visualType === 'chart' && (
                    <>
                      <option value="grouped_bar">Figure 4.2: Grouped Bar Chart (Perception Ratings Across Cadres)</option>
                      <option value="benchmark_bar">Figure 4.3: Variable Mean Bar Chart vs. Criterion Cut-Off Benchmark (3.00)</option>
                    </>
                  )}
                  {visualType === 'table' && (
                    <>
                      <option value="sampling_matrix">Table 3.1: Target Population & Proportionate Taro Yamane Matrix</option>
                      <option value="demographic_table">Table 4.1: Demographic Characteristics Distribution (N=298)</option>
                      <option value="descriptive_table">Table 4.2: Descriptive Mean (x̄) & Standard Deviation Acceptance Table</option>
                      <option value="correlation_matrix">Table 4.3: Pearson Correlation & Hypothesis Testing Summary</option>
                      <option value="regression_table">Table 4.4: Multiple Linear Regression Parameters (R², F-test)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Chapter Assignment */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Target Dissertation Chapter
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'chapter1', label: 'Ch 1' },
                    { id: 'chapter2', label: 'Ch 2' },
                    { id: 'chapter3', label: 'Ch 3' },
                    { id: 'chapter4', label: 'Ch 4' },
                    { id: 'chapter5', label: 'Ch 5' }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setVisualChapter(ch.id as any)}
                      className={`p-2 rounded-lg border text-center font-bold transition cursor-pointer text-xs ${
                        visualChapter === ch.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-950/60 hover:bg-slate-850 text-slate-300 border-slate-800'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Specific Instructions / Variables (Optional)
                </label>
                <textarea
                  rows={3}
                  value={visualCustomPrompt}
                  onChange={(e) => setVisualCustomPrompt(e.target.value)}
                  placeholder="e.g. Include specific metrics for Infrastructure, Staff Competence, and Institutional Productivity on a 5-point Likert scale..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setIsVisualGeneratorOpen(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateVisual}
                disabled={generatingVisual}
                className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {generatingVisual ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Visual...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Generate Visual Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DIAGRAM & CHART ZOOM MODAL */}
      {/* ========================================================================= */}
      {activeZoomDiagram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30">
                  {activeZoomDiagram.figureNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-100 font-sans truncate max-w-lg">
                  {activeZoomDiagram.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {activeZoomDiagram.svgCode && (
                  <button
                    onClick={() => downloadSvgAsFile(activeZoomDiagram.svgCode!, activeZoomDiagram.figureNumber, activeZoomDiagram.title)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download SVG</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveZoomDiagram(null)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col items-center justify-center space-y-4">
              {activeZoomDiagram.svgCode && (
                <div 
                  className="w-full bg-white rounded-xl p-4 shadow-inner flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[600px]"
                  dangerouslySetInnerHTML={{ __html: activeZoomDiagram.svgCode }}
                />
              )}
              {activeZoomDiagram.description && (
                <p className="text-xs text-slate-300 text-center max-w-2xl leading-relaxed">
                  {activeZoomDiagram.description}
                </p>
              )}
              {activeZoomDiagram.sourceNote && (
                <p className="text-[11px] text-slate-400 italic font-serif-academic text-center">
                  {activeZoomDiagram.sourceNote}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
