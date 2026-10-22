import { FullProjectResult } from '../types/academic';

export function generateProjectFullText(project: FullProjectResult): string {
  let doc = '';
  doc += `${project.topicTitle.toUpperCase()}\n`;
  if (project.caseStudy) {
    doc += `(${project.caseStudy.toUpperCase()})\n`;
  }
  doc += `\nDEPARTMENT OF ${project.department.toUpperCase()}\n`;
  doc += `DEGREE LEVEL: ${project.academicLevel.toUpperCase()}\n\n`;
  doc += `=========================================================\n`;
  doc += `                        ABSTRACT                         \n`;
  doc += `=========================================================\n\n`;
  doc += `${project.abstract}\n\n`;
  doc += `Keywords: ${project.keywords.join(', ')}\n\n`;

  // Chapter 1
  doc += `=========================================================\n`;
  doc += `                 ${project.chapter1.title}               \n`;
  doc += `=========================================================\n\n`;
  doc += `1.1 Background of the Study\n${project.chapter1.background}\n\n`;
  doc += `1.2 Statement of the Problem\n${project.chapter1.statementOfProblem}\n\n`;
  doc += `1.3 Objectives of the Study\n` + project.chapter1.objectives.map(o => `   - ${o}`).join('\n') + `\n\n`;
  doc += `1.4 Research Questions\n` + project.chapter1.researchQuestions.map(q => `   - ${q}`).join('\n') + `\n\n`;
  if (project.chapter1.hypotheses && project.chapter1.hypotheses.length > 0) {
    doc += `1.5 Hypotheses of the Study\n` + project.chapter1.hypotheses.map(h => `   - ${h}`).join('\n') + `\n\n`;
  }
  doc += `1.6 Significance of the Study\n${project.chapter1.significance}\n\n`;
  doc += `1.7 Scope and Delimitations of the Study\n${project.chapter1.scopeAndDelimitation}\n\n`;
  doc += `1.8 Operational Definition of Terms\n` + project.chapter1.definitionOfTerms.map(d => `   - ${d.term}: ${d.definition}`).join('\n') + `\n\n`;

  // Chapter 2
  doc += `=========================================================\n`;
  doc += `                 ${project.chapter2.title}               \n`;
  doc += `=========================================================\n\n`;
  doc += `2.1 Conceptual Review\n${project.chapter2.conceptualFramework}\n\n`;
  doc += `2.2 Theoretical Framework\n${project.chapter2.theoreticalFramework}\n\n`;
  doc += `2.3 Empirical Literature Review\n${project.chapter2.empiricalReview}\n\n`;
  doc += `2.4 Summary of Gaps in the Literature\n${project.chapter2.gapsInLiterature}\n\n`;

  // Chapter 3
  doc += `=========================================================\n`;
  doc += `                 ${project.chapter3.title}               \n`;
  doc += `=========================================================\n\n`;
  doc += `3.1 Research Design\n${project.chapter3.researchDesign}\n\n`;
  doc += `3.2 Population of the Study\n${project.chapter3.populationOfStudy}\n\n`;
  doc += `3.3 Sample Size and Sampling Technique\n${project.chapter3.sampleSizeAndSamplingTechnique}\n\n`;
  doc += `3.4 Research Instrumentation and Validation\n${project.chapter3.instrumentationAndValidation}\n\n`;
  doc += `3.5 Procedure for Data Collection\n${project.chapter3.procedureForDataCollection}\n\n`;
  doc += `3.6 Method of Data Analysis\n${project.chapter3.methodOfDataAnalysis}\n\n`;

  // Chapter 4
  doc += `=========================================================\n`;
  doc += `                 ${project.chapter4.title}               \n`;
  doc += `=========================================================\n\n`;
  doc += `4.1 Presentation and Analysis of Data\n${project.chapter4.dataPresentation}\n\n`;
  doc += `4.2 Analysis of Research Questions\n${project.chapter4.analysisOfResearchQuestions}\n\n`;
  doc += `4.3 Test of Hypotheses\n${project.chapter4.testOfHypotheses}\n\n`;
  doc += `4.4 Discussion of Findings\n${project.chapter4.discussionOfFindings}\n\n`;

  // Chapter 5
  doc += `=========================================================\n`;
  doc += `                 ${project.chapter5.title}               \n`;
  doc += `=========================================================\n\n`;
  doc += `5.1 Summary of Findings\n${project.chapter5.summaryOfFindings}\n\n`;
  doc += `5.2 Conclusion\n${project.chapter5.conclusion}\n\n`;
  doc += `5.3 Recommendations\n` + project.chapter5.recommendations.map(r => `   - ${r}`).join('\n') + `\n\n`;
  doc += `5.4 Contribution to Knowledge\n${project.chapter5.contributionToKnowledge}\n\n`;
  doc += `5.5 Suggestions for Further Studies\n` + project.chapter5.suggestionsForFurtherStudies.map(s => `   - ${s}`).join('\n') + `\n\n`;

  // References
  doc += `=========================================================\n`;
  doc += `                       REFERENCES                        \n`;
  doc += `=========================================================\n\n`;
  doc += project.references.map((ref, idx) => `[${idx + 1}] ${ref}`).join('\n\n') + '\n';

  return doc;
}

export function downloadProjectAsWord(project: FullProjectResult): void {
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${project.topicTitle}</title>
<style>
  @page {
    size: 8.5in 11.0in;
    margin: 1.0in 1.0in 1.0in 1.5in;
  }
  body {
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #000000;
  }
  h1.title-page {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 100pt;
    margin-bottom: 24pt;
    line-height: 1.3;
  }
  h2.chapter-title {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 24pt;
    margin-bottom: 18pt;
    page-break-before: always;
  }
  h3.section-title {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 14pt;
    margin-bottom: 6pt;
  }
  p {
    text-align: justify;
    text-indent: 0.5in;
    margin-bottom: 12pt;
  }
  .center {
    text-align: center;
  }
  .no-indent {
    text-indent: 0;
  }
  ul, ol {
    margin-left: 0.5in;
    margin-bottom: 12pt;
  }
  li {
    margin-bottom: 6pt;
  }
</style>
</head>
<body>
  <div class="center">
    <h1 class="title-page">${project.topicTitle}</h1>
    ${project.caseStudy ? `<p class="center no-indent" style="font-weight: bold; text-transform: uppercase;">(${project.caseStudy})</p>` : ''}
    <br><br><br>
    <p class="center no-indent" style="font-size: 11pt;">A RESEARCH PROJECT SUBMITTED TO THE DEPARTMENT OF ${project.department.toUpperCase()}</p>
    <p class="center no-indent" style="font-size: 11pt;">IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF ${project.academicLevel.toUpperCase()}</p>
    <br><br><br>
    <p class="center no-indent" style="font-size: 11pt; font-weight: bold;">${new Date().getFullYear()}</p>
  </div>

  <h2 class="chapter-title">ABSTRACT</h2>
  <p>${project.abstract}</p>
  <p class="no-indent"><strong>Keywords:</strong> ${project.keywords.join(', ')}</p>

  <h2 class="chapter-title">${project.chapter1.title}</h2>
  <h3 class="section-title">1.1 Background of the Study</h3>
  <p>${project.chapter1.background}</p>

  <h3 class="section-title">1.2 Statement of the Problem</h3>
  <p>${project.chapter1.statementOfProblem}</p>

  <h3 class="section-title">1.3 Objectives of the Study</h3>
  <ul>
    ${project.chapter1.objectives.map(o => `<li>${o}</li>`).join('')}
  </ul>

  <h3 class="section-title">1.4 Research Questions</h3>
  <ul>
    ${project.chapter1.researchQuestions.map(q => `<li>${q}</li>`).join('')}
  </ul>

  ${project.chapter1.hypotheses && project.chapter1.hypotheses.length > 0 ? `
  <h3 class="section-title">1.5 Hypotheses of the Study</h3>
  <ul>
    ${project.chapter1.hypotheses.map(h => `<li>${h}</li>`).join('')}
  </ul>` : ''}

  <h3 class="section-title">1.6 Significance of the Study</h3>
  <p>${project.chapter1.significance}</p>

  <h3 class="section-title">1.7 Scope and Delimitation of the Study</h3>
  <p>${project.chapter1.scopeAndDelimitation}</p>

  <h3 class="section-title">1.8 Operational Definition of Terms</h3>
  <ul>
    ${project.chapter1.definitionOfTerms.map(d => `<li><strong>${d.term}:</strong> ${d.definition}</li>`).join('')}
  </ul>

  <h2 class="chapter-title">${project.chapter2.title}</h2>
  <h3 class="section-title">2.1 Conceptual Review</h3>
  <p>${project.chapter2.conceptualFramework}</p>

  <h3 class="section-title">2.2 Theoretical Framework</h3>
  <p>${project.chapter2.theoreticalFramework}</p>

  <h3 class="section-title">2.3 Empirical Literature Review</h3>
  <p>${project.chapter2.empiricalReview}</p>

  <h3 class="section-title">2.4 Summary of Gaps in the Literature</h3>
  <p>${project.chapter2.gapsInLiterature}</p>

  <h2 class="chapter-title">${project.chapter3.title}</h2>
  <h3 class="section-title">3.1 Research Design</h3>
  <p>${project.chapter3.researchDesign}</p>

  <h3 class="section-title">3.2 Population of the Study</h3>
  <p>${project.chapter3.populationOfStudy}</p>

  <h3 class="section-title">3.3 Sample Size and Sampling Technique</h3>
  <p>${project.chapter3.sampleSizeAndSamplingTechnique}</p>

  <h3 class="section-title">3.4 Instrumentation and Validation</h3>
  <p>${project.chapter3.instrumentationAndValidation}</p>

  <h3 class="section-title">3.5 Procedure for Data Collection</h3>
  <p>${project.chapter3.procedureForDataCollection}</p>

  <h3 class="section-title">3.6 Method of Data Analysis</h3>
  <p>${project.chapter3.methodOfDataAnalysis}</p>

  <h2 class="chapter-title">${project.chapter4.title}</h2>
  <h3 class="section-title">4.1 Data Presentation and Analysis</h3>
  <p>${project.chapter4.dataPresentation}</p>

  <h3 class="section-title">4.2 Analysis of Research Questions</h3>
  <p>${project.chapter4.analysisOfResearchQuestions}</p>

  <h3 class="section-title">4.3 Test of Hypotheses</h3>
  <p>${project.chapter4.testOfHypotheses}</p>

  <h3 class="section-title">4.4 Discussion of Findings</h3>
  <p>${project.chapter4.discussionOfFindings}</p>

  <h2 class="chapter-title">${project.chapter5.title}</h2>
  <h3 class="section-title">5.1 Summary of Findings</h3>
  <p>${project.chapter5.summaryOfFindings}</p>

  <h3 class="section-title">5.2 Conclusion</h3>
  <p>${project.chapter5.conclusion}</p>

  <h3 class="section-title">5.3 Recommendations</h3>
  <ul>
    ${project.chapter5.recommendations.map(r => `<li>${r}</li>`).join('')}
  </ul>

  <h3 class="section-title">5.4 Contribution to Knowledge</h3>
  <p>${project.chapter5.contributionToKnowledge}</p>

  <h3 class="section-title">5.5 Suggestions for Further Studies</h3>
  <ul>
    ${project.chapter5.suggestionsForFurtherStudies.map(s => `<li>${s}</li>`).join('')}
  </ul>

  <h2 class="chapter-title">REFERENCES</h2>
  <ol>
    ${project.references.map(ref => `<li style="margin-bottom: 10pt;">${ref}</li>`).join('')}
  </ol>

  ${project.journalSources && project.journalSources.length > 0 ? `
  <h2 class="chapter-title">PEER-REVIEWED JOURNAL & SCHOLARLY SOURCES AUDIT</h2>
  <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 12pt;">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th>#</th>
        <th>Journal Name & Publisher</th>
        <th>Article Title & Authors</th>
        <th>Year</th>
        <th>Indexing Category</th>
        <th>DOI / Persistent Link</th>
      </tr>
    </thead>
    <tbody>
      ${project.journalSources.map((js, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${js.journal}</strong><br><em>${js.publisher}</em></td>
          <td>${js.title}<br><small>${js.authors}</small></td>
          <td>${js.year}</td>
          <td>${js.indexing || 'Scopus / Web of Science'}</td>
          <td><a href="${js.doi || '#'}">${js.doi || 'N/A'}</a></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = project.topicTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
  a.download = `${safeName}_Project_Report.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadChapterAsWord(project: FullProjectResult, chapterNum: 1 | 2 | 3 | 4 | 5): void {
  const chapterTitles = {
    1: 'Chapter_1_Introduction',
    2: 'Chapter_2_Literature_Review',
    3: 'Chapter_3_Methodology',
    4: 'Chapter_4_Data_Analysis',
    5: 'Chapter_5_Conclusion_Recommendations'
  };

  let chapterHtml = '';
  if (chapterNum === 1) {
    chapterHtml = `
      <h2 class="chapter-title">${project.chapter1.title}</h2>
      <h3 class="section-title">1.1 Background of the Study</h3>
      <p>${project.chapter1.background}</p>
      <h3 class="section-title">1.2 Statement of the Problem</h3>
      <p>${project.chapter1.statementOfProblem}</p>
      <h3 class="section-title">1.3 Objectives of the Study</h3>
      <ul>${project.chapter1.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
      <h3 class="section-title">1.4 Research Questions</h3>
      <ul>${project.chapter1.researchQuestions.map(q => `<li>${q}</li>`).join('')}</ul>
      ${project.chapter1.hypotheses && project.chapter1.hypotheses.length > 0 ? `
        <h3 class="section-title">1.5 Hypotheses of the Study</h3>
        <ul>${project.chapter1.hypotheses.map(h => `<li>${h}</li>`).join('')}</ul>
      ` : ''}
      <h3 class="section-title">1.6 Significance of the Study</h3>
      <p>${project.chapter1.significance}</p>
      <h3 class="section-title">1.7 Scope and Delimitations of the Study</h3>
      <p>${project.chapter1.scopeAndDelimitation}</p>
      <h3 class="section-title">1.8 Operational Definition of Terms</h3>
      <ul>${project.chapter1.definitionOfTerms.map(d => `<li><strong>${d.term}:</strong> ${d.definition}</li>`).join('')}</ul>
    `;
  } else if (chapterNum === 2) {
    chapterHtml = `
      <h2 class="chapter-title">${project.chapter2.title}</h2>
      <h3 class="section-title">2.1 Conceptual Review</h3>
      <p>${project.chapter2.conceptualFramework}</p>
      <h3 class="section-title">2.2 Theoretical Framework</h3>
      <p>${project.chapter2.theoreticalFramework}</p>
      <h3 class="section-title">2.3 Empirical Literature Review (Peer-Reviewed 2021-2026 Journals)</h3>
      <p>${project.chapter2.empiricalReview}</p>
      <h3 class="section-title">2.4 Summary of Gaps in the Literature</h3>
      <p>${project.chapter2.gapsInLiterature}</p>
    `;
  } else if (chapterNum === 3) {
    chapterHtml = `
      <h2 class="chapter-title">${project.chapter3.title}</h2>
      <h3 class="section-title">3.1 Research Design</h3>
      <p>${project.chapter3.researchDesign}</p>
      <h3 class="section-title">3.2 Population of the Study</h3>
      <p>${project.chapter3.populationOfStudy}</p>
      <h3 class="section-title">3.3 Sample Size and Sampling Technique</h3>
      <p>${project.chapter3.sampleSizeAndSamplingTechnique}</p>
      <h3 class="section-title">3.4 Research Instrumentation and Validation</h3>
      <p>${project.chapter3.instrumentationAndValidation}</p>
      <h3 class="section-title">3.5 Procedure for Data Collection</h3>
      <p>${project.chapter3.procedureForDataCollection}</p>
      <h3 class="section-title">3.6 Method of Data Analysis</h3>
      <p>${project.chapter3.methodOfDataAnalysis}</p>
    `;
  } else if (chapterNum === 4) {
    chapterHtml = `
      <h2 class="chapter-title">${project.chapter4.title}</h2>
      <h3 class="section-title">4.1 Presentation and Analysis of Data</h3>
      <p>${project.chapter4.dataPresentation}</p>
      <h3 class="section-title">4.2 Analysis of Research Questions</h3>
      <p>${project.chapter4.analysisOfResearchQuestions}</p>
      <h3 class="section-title">4.3 Test of Hypotheses</h3>
      <p>${project.chapter4.testOfHypotheses}</p>
      <h3 class="section-title">4.4 Discussion of Findings</h3>
      <p>${project.chapter4.discussionOfFindings}</p>
    `;
  } else if (chapterNum === 5) {
    chapterHtml = `
      <h2 class="chapter-title">${project.chapter5.title}</h2>
      <h3 class="section-title">5.1 Summary of Findings</h3>
      <p>${project.chapter5.summaryOfFindings}</p>
      <h3 class="section-title">5.2 Conclusion</h3>
      <p>${project.chapter5.conclusion}</p>
      <h3 class="section-title">5.3 Recommendations</h3>
      <ul>${project.chapter5.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
      <h3 class="section-title">5.4 Contribution to Knowledge</h3>
      <p>${project.chapter5.contributionToKnowledge}</p>
      <h3 class="section-title">5.5 Suggestions for Further Studies</h3>
      <ul>${project.chapter5.suggestionsForFurtherStudies.map(s => `<li>${s}</li>`).join('')}</ul>
    `;
  }

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${project.topicTitle} - Chapter ${chapterNum}</title>
<style>
  @page { size: 8.5in 11.0in; margin: 1.0in 1.0in 1.0in 1.5in; }
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000000; }
  h2.chapter-title { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 24pt; margin-bottom: 18pt; }
  h3.section-title { font-size: 12pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; }
  p { text-align: justify; text-indent: 0.5in; margin-bottom: 12pt; }
  .center { text-align: center; }
  .no-indent { text-indent: 0; }
  ul, ol { margin-left: 0.5in; margin-bottom: 12pt; }
  li { margin-bottom: 6pt; }
</style>
</head>
<body>
  <div class="center" style="margin-bottom: 30pt; padding-bottom: 15pt; border-bottom: 1px solid #ccc;">
    <h3 style="font-size: 13pt; margin-bottom: 4pt;">${project.topicTitle.toUpperCase()}</h3>
    <p class="center no-indent" style="font-size: 11pt; color: #444;">Department of ${project.department} | ${project.academicLevel}</p>
  </div>

  ${chapterHtml}

  <h2 class="chapter-title" style="margin-top: 30pt;">CHAPTER REFERENCES (APA 7th)</h2>
  <ol>
    ${project.references.map(ref => `<li style="margin-bottom: 8pt;">${ref}</li>`).join('')}
  </ol>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = project.topicTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
  a.download = `${safeName}_${chapterTitles[chapterNum]}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCustomTextAsWord(
  title: string, 
  content: string, 
  topicTitle: string, 
  level: string = 'BSc', 
  country: string = 'International'
): void {
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${title} - ${topicTitle}</title>
<style>
  @page { size: 8.5in 11.0in; margin: 1.0in 1.0in 1.0in 1.5in; }
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000000; }
  h2.chapter-title { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 24pt; margin-bottom: 18pt; }
  p { text-align: justify; text-indent: 0.5in; margin-bottom: 12pt; }
  .center { text-align: center; }
  .no-indent { text-indent: 0; }
</style>
</head>
<body>
  <div class="center" style="margin-bottom: 24pt; padding-bottom: 12pt; border-bottom: 1px solid #ccc;">
    <h3 style="font-size: 13pt; margin-bottom: 4pt;">${topicTitle.toUpperCase()}</h3>
    <p class="center no-indent" style="font-size: 11pt; color: #444;">${title.toUpperCase()} • Level: ${level} • Standard: ${country}</p>
  </div>

  <h2 class="chapter-title">${title.toUpperCase()}</h2>
  ${content
    .split('\n\n')
    .filter(Boolean)
    .map(p => {
      if (p.trim().startsWith('#') || p.trim().startsWith('CHAPTER') || p.trim().startsWith('1.') || p.trim().startsWith('2.') || p.trim().startsWith('3.') || p.trim().startsWith('4.') || p.trim().startsWith('5.')) {
        return `<h3 style="font-size: 12pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt;">${p.replace(/^[#\s]+/, '')}</h3>`;
      }
      return `<p>${p}</p>`;
    })
    .join('')}
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = `${topicTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20)}_${title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 15)}`;
  a.download = `${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadProjectAsMarkdown(project: FullProjectResult): void {
  const fullText = generateProjectFullText(project);
  const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = project.topicTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
  a.download = `${safeName}_Project.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}



