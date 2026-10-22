export type InstitutionLevel = 
  | 'OND'
  | 'HND'
  | 'BSc'
  | 'MSc'
  | 'PhD'
  | 'Undergraduate' 
  | 'Master’s Degree' 
  | 'Doctoral / PhD' 
  | 'Postdoctoral Researcher';

export type AcademicTab = 
  | 'projects'
  | 'synthesizer'
  | 'citations'
  | 'thesis'
  | 'polisher'
  | 'formula'
  | 'study'
  | 'tutor';

export interface JournalSource {
  title: string;
  authors: string;
  journal: string;
  publisher: string;
  year: number;
  indexing?: string;
  doi?: string;
  apaCitation: string;
}

export interface FullProjectResult {
  topicTitle: string;
  department: string;
  academicLevel: string;
  caseStudy?: string;
  abstract: string;
  keywords: string[];
  selectedScope?: 'full' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5';
  journalSources?: JournalSource[];
  chapter1: {
    title: string;
    background: string;
    statementOfProblem: string;
    objectives: string[];
    researchQuestions: string[];
    hypotheses: string[];
    significance: string;
    scopeAndDelimitation: string;
    definitionOfTerms: { term: string; definition: string }[];
  };
  chapter2: {
    title: string;
    conceptualFramework: string;
    theoreticalFramework: string;
    empiricalReview: string;
    gapsInLiterature: string;
  };
  chapter3: {
    title: string;
    researchDesign: string;
    populationOfStudy: string;
    sampleSizeAndSamplingTechnique: string;
    instrumentationAndValidation: string;
    procedureForDataCollection: string;
    methodOfDataAnalysis: string;
  };
  chapter4: {
    title: string;
    dataPresentation: string;
    analysisOfResearchQuestions: string;
    testOfHypotheses: string;
    discussionOfFindings: string;
  };
  chapter5: {
    title: string;
    summaryOfFindings: string;
    conclusion: string;
    recommendations: string[];
    contributionToKnowledge: string;
    suggestionsForFurtherStudies: string[];
  };
  references: string[];
}


export interface SynthesisResult {
  title: string;
  keyHypothesis: string;
  theoreticalFramework: string;
  methodology: {
    type: string;
    sampleOrDataset: string;
    procedures: string;
  };
  keyFindings: string[];
  criticalLimitations: string[];
  researchGapsAndFutureWork: string[];
  practicalImplications: string;
  suggestedCritique: string;
}

export interface CitationResult {
  metadata: {
    authors: string[];
    year: string;
    title: string;
    publication: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doiOrUrl?: string;
  };
  citations: {
    apa7: string;
    mla9: string;
    chicago: string;
    harvard: string;
    ieee: string;
    bibtex: string;
  };
  inTextCitation: {
    parenthetical: string;
    narrative: string;
    ieeeNumeric: string;
  };
  formattingNotes: string;
}

export interface ProposalResult {
  suggestedAcademicTitles: string[];
  problemStatement: string;
  researchQuestions: string[];
  hypotheses: string[];
  theoreticalFramework: string;
  methodologicalDesign: {
    researchParadigm: string;
    approach: string;
    populationAndSampling: string;
    dataCollection: string;
    analyticalPlan: string;
  };
  chapterBreakdown: {
    chapter: string;
    keySections: string[];
  }[];
  potentialEthicalRisks: string[];
  significanceStatement: string;
}

export interface PolishResult {
  polishedText: string;
  executiveSummaryOfChanges: string;
  editorialCritique: {
    originalSegment: string;
    revisedSegment: string;
    rationale: string;
  }[];
  vocabularyUpgrades: {
    original: string;
    scholarlyAlternative: string;
    contextualNote: string;
  }[];
  readabilityMetrics: {
    toneRating: string;
    clarityScore: string;
    hedgingAdequacy: string;
  };
}

export interface FormulaResult {
  formulaName: string;
  latexBlock: string;
  latexInline: string;
  plainEnglishSummary: string;
  variablesBreakdown: {
    symbol: string;
    name: string;
    unitOrType: string;
    role: string;
  }[];
  stepByStepDerivationOrMeaning: string[];
  practicalApplication: string;
  commonStudentPitfalls: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  keyTerms: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mastered?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  taxonomyLevel: string;
}

export interface StudyResult {
  topicTitle: string;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  freeResponsePrompt: {
    question: string;
    modelGradingRubric: string[];
    exemplarKeyPoints: string[];
  };
}

export interface SavedResearchItem {
  id: string;
  type: AcademicTab;
  title: string;
  timestamp: number;
  data: any;
}
