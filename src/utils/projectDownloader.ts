import { 
  FullProjectResult, 
  AcademicTable, 
  AcademicDiagram, 
  AcademicFigure,
  AcademicChart,
  PreliminaryPages,
  AcademicAppendix
} from '../types/academic';

export function renderWordTable(table: AcademicTable): string {
  return `
  <div style="margin: 18pt 0; text-align: left;">
    <p class="no-indent" style="font-weight: bold; margin-bottom: 2pt; font-size: 11pt;">${table.tableNumber}</p>
    <p class="no-indent" style="font-style: italic; margin-bottom: 6pt; font-size: 11pt;">${table.title}</p>
    <table border="0" cellpadding="6" cellspacing="0" style="width: 100%; border-top: 1.5pt solid #000000; border-bottom: 1.5pt solid #000000; border-collapse: collapse; font-size: 10.5pt;">
      <thead>
        <tr style="border-bottom: 1pt solid #000000; text-align: left; background-color: #f8fafc;">
          ${table.headers.map(h => `<th style="padding: 6pt; font-weight: bold; border-bottom: 1pt solid #000000;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${table.rows.map(row => `
          <tr>
            ${row.map(cell => `<td style="padding: 5pt 6pt; border-bottom: 0.5pt solid #e2e8f0;">${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${table.note ? `<p class="no-indent" style="font-size: 9.5pt; font-style: italic; color: #333333; margin-top: 5pt;">${table.note}</p>` : ''}
  </div>
  `;
}

export function renderWordDiagram(diagram: AcademicDiagram): string {
  return `
  <div style="margin: 22pt 0; text-align: center;">
    <div style="max-width: 680pt; margin: 0 auto; border: 1pt solid #cbd5e1; padding: 10pt; background-color: #ffffff; text-align: center;">
      ${diagram.svgCode}
    </div>
    <p class="no-indent center" style="font-weight: bold; font-size: 11pt; margin-top: 8pt; margin-bottom: 2pt;">${diagram.figureNumber}: ${diagram.title}</p>
    <p class="no-indent center" style="font-size: 9.5pt; font-style: italic; color: #475569; margin-top: 0;">${diagram.sourceNote || 'Source: Researcher (2026)'}</p>
  </div>
  `;
}

export function renderWordChart(chart: AcademicChart): string {
  return `
  <div style="margin: 22pt 0; text-align: center;">
    ${chart.svgCode ? `
    <div style="max-width: 680pt; margin: 0 auto; border: 1pt solid #cbd5e1; padding: 10pt; background-color: #ffffff; text-align: center;">
      ${chart.svgCode}
    </div>` : ''}
    <p class="no-indent center" style="font-weight: bold; font-size: 11pt; margin-top: 8pt; margin-bottom: 2pt;">${chart.figureNumber}: ${chart.title}</p>
    ${chart.summaryText ? `<p class="no-indent" style="font-size: 10pt; text-align: justify; margin: 6pt 0; line-height: 1.4;">${chart.summaryText}</p>` : ''}
    <p class="no-indent center" style="font-size: 9.5pt; font-style: italic; color: #475569; margin-top: 0;">${chart.sourceNote || 'Source: Field Survey Data Analysis (2026)'}</p>
  </div>
  `;
}

export function renderWordAppendix(app: AcademicAppendix): string {
  return `
  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 class="chapter-title">${app.title.toUpperCase()}</h2>
    <div style="font-family: 'Courier New', Courier, monospace; font-size: 9.5pt; background-color: #f8fafc; border: 1pt solid #cbd5e1; padding: 12pt; white-space: pre-wrap; line-height: 1.4;">
${app.content}
    </div>
  </div>
  `;
}

export function renderWordPreliminary(prelim: PreliminaryPages): string {
  return `
  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 class="chapter-title">CERTIFICATION & APPROVAL SHEET</h2>
    <p style="white-space: pre-wrap; line-height: 1.8;">${prelim.certification}</p>
  </div>

  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 class="chapter-title">DEDICATION</h2>
    <p>${prelim.dedication}</p>
  </div>

  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 class="chapter-title">ACKNOWLEDGEMENTS</h2>
    <p>${prelim.acknowledgements}</p>
  </div>

  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 class="chapter-title">TABLE OF CONTENTS</h2>
    <table border="0" cellpadding="4" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 10.5pt;">
      <thead>
        <tr style="border-bottom: 1pt solid #000000; font-weight: bold;">
          <th style="text-align: left; width: 15%;">Section</th>
          <th style="text-align: left; width: 75%;">Title / Chapter Heading</th>
          <th style="text-align: right; width: 10%;">Page</th>
        </tr>
      </thead>
      <tbody>
        ${prelim.tableOfContents.map(toc => `
          <tr style="border-bottom: 0.5pt dotted #94a3b8;">
            <td style="font-weight: ${toc.sectionNumber.startsWith('CHAPTER') ? 'bold' : 'normal'};">${toc.sectionNumber}</td>
            <td style="font-weight: ${toc.sectionNumber.startsWith('CHAPTER') ? 'bold' : 'normal'};">${toc.title}</td>
            <td style="text-align: right; font-weight: ${toc.sectionNumber.startsWith('CHAPTER') ? 'bold' : 'normal'};">${toc.pageNumber}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 class="chapter-title">LIST OF TABLES</h2>
    <table border="0" cellpadding="4" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 10.5pt;">
      <thead>
        <tr style="border-bottom: 1pt solid #000000; font-weight: bold;">
          <th style="text-align: left; width: 20%;">Table No.</th>
          <th style="text-align: left; width: 70%;">Table Description</th>
          <th style="text-align: right; width: 10%;">Page</th>
        </tr>
      </thead>
      <tbody>
        ${prelim.listOfTables.map(lot => `
          <tr style="border-bottom: 0.5pt dotted #94a3b8;">
            <td style="font-weight: bold;">${lot.tableNumber}</td>
            <td>${lot.title}</td>
            <td style="text-align: right;">${lot.pageNumber}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div style="page-break-before: always; margin-top: 24pt;">
    <h2 class="chapter-title">LIST OF FIGURES & CHARTS</h2>
    <table border="0" cellpadding="4" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 10.5pt;">
      <thead>
        <tr style="border-bottom: 1pt solid #000000; font-weight: bold;">
          <th style="text-align: left; width: 20%;">Figure No.</th>
          <th style="text-align: left; width: 70%;">Figure / Chart Title</th>
          <th style="text-align: right; width: 10%;">Page</th>
        </tr>
      </thead>
      <tbody>
        ${prelim.listOfFigures.map(lof => `
          <tr style="border-bottom: 0.5pt dotted #94a3b8;">
            <td style="font-weight: bold;">${lof.figureNumber}</td>
            <td>${lof.title}</td>
            <td style="text-align: right;">${lof.pageNumber}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  `;
}

export function downloadSvgAsFile(svgCode: string, figureNumber: string, title: string): void {
  const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = `${figureNumber}_${title}`.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
  a.download = `${safeName}.svg`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  }, 2000);
}

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

  const ch2Diagrams = project.diagrams?.filter(d => d.chapter === 'chapter2') || [];
  if (ch2Diagrams.length > 0) {
    doc += `---------------------------------------------------------\n`;
    doc += `               CHAPTER 2 DIAGRAMS & MODELS               \n`;
    doc += `---------------------------------------------------------\n`;
    ch2Diagrams.forEach(d => {
      doc += `[${d.figureNumber}: ${d.title}]\n${d.description}\n${d.sourceNote || ''}\n\n`;
    });
  }

  // Chapter 3
  doc += `=========================================================\n`;
  doc += `                 ${project.chapter3.title}               \n`;
  doc += `=========================================================\n\n`;
  doc += `3.1 Research Design\n${project.chapter3.researchDesign}\n\n`;
  doc += `3.2 Population of the Study\n${project.chapter3.populationOfStudy}\n\n`;
  doc += `3.3 Sample Size and Sampling Technique\n${project.chapter3.sampleSizeAndSamplingTechnique}\n\n`;

  const ch3Tables = project.tables?.filter(t => t.chapter === 'chapter3') || [];
  if (ch3Tables.length > 0) {
    ch3Tables.forEach(t => {
      doc += `\n[${t.tableNumber}: ${t.title}]\n`;
      doc += t.headers.join(' | ') + '\n';
      doc += t.headers.map(() => '---').join(' | ') + '\n';
      t.rows.forEach(r => {
        doc += r.join(' | ') + '\n';
      });
      if (t.note) doc += `${t.note}\n`;
      doc += '\n';
    });
  }

  const ch3Diagrams = project.diagrams?.filter(d => d.chapter === 'chapter3') || [];
  if (ch3Diagrams.length > 0) {
    ch3Diagrams.forEach(d => {
      doc += `[${d.figureNumber}: ${d.title}]\n${d.description}\n\n`;
    });
  }

  doc += `3.4 Research Instrumentation and Validation\n${project.chapter3.instrumentationAndValidation}\n\n`;
  doc += `3.5 Procedure for Data Collection\n${project.chapter3.procedureForDataCollection}\n\n`;
  doc += `3.6 Method of Data Analysis\n${project.chapter3.methodOfDataAnalysis}\n\n`;

  // Chapter 4
  doc += `=========================================================\n`;
  doc += `                 ${project.chapter4.title}               \n`;
  doc += `=========================================================\n\n`;
  doc += `4.1 Presentation and Analysis of Data\n${project.chapter4.dataPresentation}\n\n`;

  const ch4Tables = project.tables?.filter(t => t.chapter === 'chapter4') || [];
  if (ch4Tables.length > 0) {
    ch4Tables.forEach(t => {
      doc += `\n[${t.tableNumber}: ${t.title}]\n`;
      doc += t.headers.join(' | ') + '\n';
      doc += t.headers.map(() => '---').join(' | ') + '\n';
      t.rows.forEach(r => {
        doc += r.join(' | ') + '\n';
      });
      if (t.note) doc += `${t.note}\n`;
      doc += '\n';
    });
  }

  const ch4Diagrams = project.diagrams?.filter(d => d.chapter === 'chapter4') || [];
  if (ch4Diagrams.length > 0) {
    ch4Diagrams.forEach(d => {
      doc += `[${d.figureNumber}: ${d.title}]\n${d.description}\n\n`;
    });
  }

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
  const ch2Diagrams = project.diagrams?.filter(d => d.chapter === 'chapter2') || [];
  const ch3Diagrams = project.diagrams?.filter(d => d.chapter === 'chapter3') || [];
  const ch4Diagrams = project.diagrams?.filter(d => d.chapter === 'chapter4') || [];

  const ch3Tables = project.tables?.filter(t => t.chapter === 'chapter3') || [];
  const ch4Tables = project.tables?.filter(t => t.chapter === 'chapter4') || [];
  const ch4Charts = project.charts?.filter(c => c.chapter === 'chapter4') || project.charts || [];

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

  ${project.preliminaryPages ? renderWordPreliminary(project.preliminaryPages) : ''}

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

  ${ch2Diagrams.map(d => renderWordDiagram(d)).join('')}

  <h3 class="section-title">2.2 Theoretical Framework</h3>
  <p>${project.chapter2.theoreticalFramework}</p>

  <h3 class="section-title">2.3 Empirical Literature Review (Recent 2023-2026 Sources)</h3>
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

  ${ch3Tables.map(t => renderWordTable(t)).join('')}
  ${ch3Diagrams.map(d => renderWordDiagram(d)).join('')}

  <h3 class="section-title">3.4 Instrumentation and Validation</h3>
  <p>${project.chapter3.instrumentationAndValidation}</p>

  <h3 class="section-title">3.5 Procedure for Data Collection</h3>
  <p>${project.chapter3.procedureForDataCollection}</p>

  <h3 class="section-title">3.6 Method of Data Analysis</h3>
  <p>${project.chapter3.methodOfDataAnalysis}</p>

  <h2 class="chapter-title">${project.chapter4.title}</h2>
  <h3 class="section-title">4.1 Data Presentation and Analysis</h3>
  <p>${project.chapter4.dataPresentation}</p>

  ${ch4Tables.map(t => renderWordTable(t)).join('')}
  ${ch4Diagrams.map(d => renderWordDiagram(d)).join('')}
  ${ch4Charts.map(c => renderWordChart(c)).join('')}

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

  ${project.appendices && project.appendices.length > 0 ? `
  <h1 class="chapter-title" style="page-break-before: always; margin-top: 40pt; font-size: 16pt;">RESEARCH APPENDICES</h1>
  ${project.appendices.map(app => renderWordAppendix(app)).join('')}
  ` : ''}
</body>
</html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = project.topicTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
  a.download = `${safeName}_Project_Report.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  }, 2000);
}

export function downloadChapterAsWord(project: FullProjectResult, chapterNum: 1 | 2 | 3 | 4 | 5): void {
  const chapterTitles = {
    1: 'Chapter_1_Introduction',
    2: 'Chapter_2_Literature_Review',
    3: 'Chapter_3_Methodology',
    4: 'Chapter_4_Data_Analysis',
    5: 'Chapter_5_Conclusion_Recommendations'
  };

  const chKey = `chapter${chapterNum}` as const;
  const chDiagrams = project.diagrams?.filter(d => d.chapter === chKey) || [];
  const chTables = project.tables?.filter(t => t.chapter === chKey) || [];
  const chCharts = project.charts?.filter(c => c.chapter === chKey) || [];

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
      ${chDiagrams.map(d => renderWordDiagram(d)).join('')}
      <h3 class="section-title">2.2 Theoretical Framework</h3>
      <p>${project.chapter2.theoreticalFramework}</p>
      <h3 class="section-title">2.3 Empirical Literature Review (Recent 2023-2026 Peer-Reviewed Journals)</h3>
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
      ${chTables.map(t => renderWordTable(t)).join('')}
      ${chDiagrams.map(d => renderWordDiagram(d)).join('')}
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
      ${chTables.map(t => renderWordTable(t)).join('')}
      ${chDiagrams.map(d => renderWordDiagram(d)).join('')}
      ${chCharts.map(c => renderWordChart(c)).join('')}
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

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = project.topicTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
  a.download = `${safeName}_${chapterTitles[chapterNum]}.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  }, 2000);
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

  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = `${topicTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20)}_${title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 15)}`;
  a.download = `${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  }, 2000);
}

export function downloadProjectAsMarkdown(project: FullProjectResult): void {
  const fullText = generateProjectFullText(project);
  const blob = new Blob(['\ufeff' + fullText], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = project.topicTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
  a.download = `${safeName}_Project.md`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      // ignore
    }
  }, 2000);
}
