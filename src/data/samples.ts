export const SAMPLE_PAPERS = [
  {
    label: "Medicine & AI: Multimodal Diagnostic Models",
    field: "Biomedical Informatics",
    text: `Abstract: Deep convolutional and vision transformer architectures have demonstrated remarkable accuracy in classifying pulmonary opacities on chest radiographs. However, real-world deployment across heterogeneous hospital networks frequently suffers from domain shift caused by varying radiographic hardware, patient positioning, and differing prevalence rates. In this multicenter cohort study (N = 14,280 pediatric and adult radiographs from 4 tertiary hospitals across North America and Europe), we evaluated a dual-branch Vision Transformer (ViT-H/16) combined with self-supervised contrastive pretraining. The primary endpoint was area under the receiver operating characteristic curve (AUROC) for distinguishing viral pneumonia from bacterial consolidation. The model achieved a pooled AUROC of 0.941 (95% CI: 0.932-0.950) in internal validation. In external cross-site testing without fine-tuning, performance dropped to 0.887 (95% CI: 0.871-0.903; p < 0.001), indicating marked vulnerability to institutional acquisition protocols. Feature attribution via integrated gradients revealed that the model disproportionately relied on extraneous peripheral markers (radiographic collimation borders and hospital ID tags) rather than parenchymal infiltrates in 11.4% of false-positive cases. We conclude that while foundation vision models display exceptional discriminative capacity in homogeneous benchmarks, rigorous multicenter distribution-shift auditing and saliency confounding checks remain mandatory prior to autonomous clinical triage.`
  },
  {
    label: "Environmental Science: Microplastic Toxicology",
    field: "Environmental Science & Toxicology",
    text: `Abstract: Microplastic (<5 mm) and nanoplastic particles have become pervasive anthropogenic contaminants in marine and estuarine ecosystems. While lethal concentrations in acute laboratory assays typically exceed current ambient environmental levels, chronic sublethal exposures and trophic biomagnification remain insufficiently quantified. Here, we investigate the physiological bioaccumulation and cellular oxidative stress responses of the Eastern oyster (Crassostrea virginica) subjected to environmentally relevant concentrations of polystyrene microbeads (10 µm) and weathered polyethylene fragments (20-50 µm) at 50 particles/L over a 45-day continuous-flow mesocosm regime. Histopathological examination demonstrated substantial particle entrapment within digestive diverticula and ciliated gill lamellae. Biomarker assays indicated a 2.4-fold upregulation of superoxide dismutase (SOD) activity (p = 0.002) and significant lipid peroxidation (malondialdehyde concentration elevated by 68%, p < 0.01) relative to control cohorts. Gametogenesis efficiency was curtailed by 28.5% in exposed females. These findings demonstrate that chronic low-dose microplastic pollution induces severe metabolic and reproductive senescence in filter-feeding foundational species, necessitating updated water quality criteria that account for non-acute biomarker thresholds.`
  },
  {
    label: "Economics: Algorithmic Nudges in FinTech",
    field: "Behavioral Economics & FinTech",
    text: `Abstract: Mobile financial applications increasingly employ algorithmic defaults and behavioral nudges—such as automated round-ups, gamified savings streaks, and push notifications—to steer user savings and discretionary spending. Using administrative transaction data from a nationwide retail digital bank (N = 82,410 active retail accounts over 18 months), we evaluate a randomized roll-out of algorithmic automated savings rules. We measure whether automatic round-up mechanisms increase net wealth accumulation or merely shift balances between liquid checking and interest-bearing deposits while leaving total credit card debt invariant. Our difference-in-differences estimates reveal that users assigned to automated savings accumulated an average of $412 more in savings over six months. However, 34% of these users also incurred increased overdraft penalties and elevated revolving credit card balances ($285 average increase, APR 21.4%), largely neutralizing positive asset accumulation. The welfare effects of automated financial nudges are therefore highly asymmetric, benefiting financially literate users with liquidity buffers while accelerating debt spirals among vulnerable subprime demographics.`
  }
];

export const SAMPLE_CITATIONS = [
  {
    label: "Vaswani et al. (2017) Attention Is All You Need",
    input: "Attention Is All You Need. Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin. 31st Conference on Neural Information Processing Systems (NeurIPS 2017), Long Beach, CA, USA. Advances in Neural Information Processing Systems 30, pages 5998-6008, 2017. arXiv:1706.03762."
  },
  {
    label: "Creswell & Creswell (2018) Research Design Book",
    input: "Research design: qualitative, quantitative, and mixed methods approaches. John W. Creswell and J. David Creswell. 5th edition. SAGE Publications, Los Angeles, 2018. ISBN: 9781506386706."
  },
  {
    label: "Kahneman (2011) Thinking, Fast and Slow",
    input: "Thinking, Fast and Slow. Daniel Kahneman. Farrar, Straus and Giroux, New York, 2011. 499 pages. ISBN: 9780374275631."
  }
];

export const SAMPLE_PROPOSALS = [
  {
    label: "Decentralized Renewable Microgrids in Agriculture",
    discipline: "Sustainable Energy Engineering & Agricultural Economics",
    topic: "Techno-economic viability and resilience of solar PV microgrids with battery storage for smallholder drip irrigation networks under climate volatility in semi-arid zones."
  },
  {
    label: "Generative AI in Academic Peer Review",
    discipline: "Information Systems & Research Ethics",
    topic: "Assessing the epistemic risks, reviewer hallucination, and detection limits of Large Language Model assisted manuscript peer evaluations in high-impact medical journals."
  },
  {
    label: "Neurocomputational Models of Working Memory",
    discipline: "Cognitive Neuroscience",
    topic: "Theta-gamma phase-amplitude coupling during multi-item working memory maintenance under sensory distraction in fMRI and intracranial EEG."
  }
];

export const SAMPLE_DRAFTS = [
  {
    label: "Informal student paragraph on smartphone distractions",
    text: `In this paper we looked at how students study for their midterm exams. A lot of kids in university don't do well on their tests because they are constantly looking at TikTok, Instagram, and group chats while they do homework. Our survey of 100 students proved that smartphones are totally terrible for GPA and cause massive brain rot. When professors ban phones, everyone does way better, so colleges should definitely outlaw phones in dorm study halls.`
  },
  {
    label: "Weak literature review intro on climate policy",
    text: `Climate change is a huge problem that everyone knows about. Scientists have written lots of stuff about how carbon emissions are super dangerous. In this project, I want to talk about how governments try to fix it with carbon taxes. Some people like taxes and some hate them. The papers I read show that taxes maybe work sometimes, but companies just cheat or move somewhere else.`
  }
];

export const SAMPLE_FORMULAS = [
  {
    label: "Gaussian Normal Distribution (Probability & Statistics)",
    field: "Statistics & Machine Learning",
    input: "f(x) = (1 / (sigma * sqrt(2 * pi))) * exp(- 0.5 * ((x - mu) / sigma)^2)"
  },
  {
    label: "Shannon Entropy (Information Theory)",
    field: "Computer Science & Information Theory",
    input: "H(X) = - sum_{i=1}^n P(x_i) * log_2(P(x_i))"
  },
  {
    label: "Navier-Stokes Momentum Equation (Fluid Dynamics)",
    field: "Mechanical & Aerospace Engineering",
    input: "rho * (du/dt + u * grad(u)) = - grad(p) + mu * laplacian(u) + f"
  },
  {
    label: "Bayes' Theorem with Marginalization",
    field: "Probability & Decision Theory",
    input: "P(A|B) = (P(B|A) * P(A)) / sum_j (P(B|A_j) * P(A_j))"
  }
];
