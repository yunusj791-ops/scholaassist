import { SavedResearchItem } from '../types/academic';

const VAULT_STORAGE_KEY = 'scholarassist_vault_items_v1';

export function getSavedItems(): SavedResearchItem[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse vault items:', e);
    return [];
  }
}

export function saveItemToVault(item: Omit<SavedResearchItem, 'id' | 'timestamp'>): SavedResearchItem {
  const current = getSavedItems();
  const newItem: SavedResearchItem = {
    ...item,
    id: 'vault_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
  };
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to vault:', e);
  }
  return newItem;
}

export function removeItemFromVault(id: string): SavedResearchItem[] {
  const current = getSavedItems();
  const updated = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove from vault:', e);
  }
  return updated;
}

export function exportItemAsMarkdown(item: SavedResearchItem): void {
  let content = `# ${item.title}\n*Saved from ScholarAssist on ${new Date(item.timestamp).toLocaleDateString()}*\n\n`;

  if (item.type === 'synthesizer') {
    const d = item.data;
    content += `## Research Paper Synthesis\n\n`;
    content += `**Hypothesis/Question:** ${d.keyHypothesis}\n\n`;
    content += `**Theoretical Framework:** ${d.theoreticalFramework}\n\n`;
    content += `### Methodology\n- **Type:** ${d.methodology?.type}\n- **Sample/Corpus:** ${d.methodology?.sampleOrDataset}\n- **Procedures:** ${d.methodology?.procedures}\n\n`;
    content += `### Key Empirical Findings\n` + (d.keyFindings || []).map((f: string) => `- ${f}`).join('\n') + '\n\n';
    content += `### Critical Limitations\n` + (d.criticalLimitations || []).map((l: string) => `- ${l}`).join('\n') + '\n\n';
    content += `### Literature Gaps & Future Directions\n` + (d.researchGapsAndFutureWork || []).map((g: string) => `- ${g}`).join('\n') + '\n\n';
    content += `### Practical Implications\n${d.practicalImplications}\n\n`;
    content += `### Methodological Critique\n${d.suggestedCritique}\n`;
  } else if (item.type === 'citations') {
    const d = item.data;
    content += `## Academic Citations\n\n`;
    content += `### APA 7th Edition\n${d.citations?.apa7}\n\n`;
    content += `### MLA 9th Edition\n${d.citations?.mla9}\n\n`;
    content += `### Chicago (Author-Date)\n${d.citations?.chicago}\n\n`;
    content += `### IEEE\n${d.citations?.ieee}\n\n`;
    content += `### In-Text Citations\n- Parenthetical: ${d.inTextCitation?.parenthetical}\n- Narrative: ${d.inTextCitation?.narrative}\n- IEEE: ${d.inTextCitation?.ieeeNumeric}\n\n`;
    content += `### BibTeX\n\`\`\`bibtex\n${d.citations?.bibtex}\n\`\`\`\n`;
  } else if (item.type === 'thesis') {
    const d = item.data;
    content += `## Dissertation & Research Proposal\n\n`;
    content += `### Problem Statement\n${d.problemStatement}\n\n`;
    content += `### Research Questions\n` + (d.researchQuestions || []).map((q: string) => `1. ${q}`).join('\n') + '\n\n';
    content += `### Hypotheses\n` + (d.hypotheses || []).map((h: string) => `- ${h}`).join('\n') + '\n\n';
    content += `### Theoretical Framework\n${d.theoreticalFramework}\n\n`;
    content += `### Chapter Blueprint\n`;
    (d.chapterBreakdown || []).forEach((c: any) => {
      content += `#### ${c.chapter}\n` + (c.keySections || []).map((s: string) => `  - ${s}`).join('\n') + '\n';
    });
  } else if (item.type === 'polisher') {
    const d = item.data;
    content += `## Academic Tone Elevation\n\n`;
    content += `### Polished Academic Text\n${d.polishedText}\n\n`;
    content += `### Executive Summary\n${d.executiveSummaryOfChanges}\n\n`;
    content += `### Editorial Upgrades\n`;
    (d.editorialCritique || []).forEach((c: any) => {
      content += `- **Draft:** "${c.originalSegment}"\n  **Revised:** "${c.revisedSegment}"\n  *Rationale:* ${c.rationale}\n\n`;
    });
  } else if (item.type === 'formula') {
    const d = item.data;
    content += `## Mathematical & STEM Decipherer: ${d.formulaName}\n\n`;
    content += `$$${d.latexBlock}$$\n\n`;
    content += `### Concept\n${d.plainEnglishSummary}\n\n`;
    content += `### Variables\n` + (d.variablesBreakdown || []).map((v: any) => `- **${v.symbol}** (${v.name}): ${v.role}`).join('\n') + '\n\n';
    content += `### Practical Application\n${d.practicalApplication}\n`;
  } else if (item.type === 'projects') {
    const d = item.data;
    content += `## COMPLETE PROJECT MATERIAL: ${d.topicTitle}\n`;
    content += `Department: ${d.department} | Level: ${d.academicLevel}\n\n`;
    content += `### Abstract\n${d.abstract}\n\n`;
    content += `### Chapter 1: Introduction\n${d.chapter1?.background}\n\n### Problem Statement\n${d.chapter1?.statementOfProblem}\n\n`;
    content += `### Chapter 2: Literature Review\n${d.chapter2?.conceptualFramework}\n\n`;
    content += `### Chapter 3: Methodology\n${d.chapter3?.researchDesign}\n\n`;
    content += `### Chapter 4: Data & Findings\n${d.chapter4?.dataPresentation}\n\n`;
    content += `### Chapter 5: Summary & Recommendations\n${d.chapter5?.summaryOfFindings}\n\n`;
    content += `### References\n` + (d.references || []).map((r: string) => `- ${r}`).join('\n') + `\n\n`;
  } else {
    content += JSON.stringify(item.data, null, 2);
  }

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportItemAsBibtex(item: SavedResearchItem): void {
  let bib = '';
  if (item.type === 'citations' && item.data?.citations?.bibtex) {
    bib = item.data.citations.bibtex;
  } else {
    bib = `% No BibTeX record found for item: ${item.title}`;
  }
  const blob = new Blob([bib], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `citation_${Date.now()}.bib`;
  a.click();
  URL.revokeObjectURL(url);
}
