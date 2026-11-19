// Paste a Spline scene link here (from Spline: Export > Code > React) to show it in the hero.
// Leave empty to use the built-in React Three Fiber scene.
export const SPLINE_SCENE = ''

export const links = {
  email: 'tpoonia@mail.yu.edu',
  linkedin: 'https://www.linkedin.com/in/tpoonia/',
  github: 'https://github.com/tpoonia',
  resume: './Tushar_Poonia_Resume.pdf',
}

export const stats = [
  { n: 3, suffix: '+', label: 'years building ML systems for global banks' },
  { n: 40, suffix: '%', label: 'throughput gain across 10+ banking modules' },
  { n: 70, suffix: '%', label: 'less manual work with my research agent' },
  { n: 60, suffix: '+', label: 'REST APIs serving ML models in real time' },
]

export const jobs = [
  {
    role: 'Software Product Developer', when: 'Jun 2022 - Aug 2025',
    where: 'Tata Consultancy Services, client: CTBC Bank (Taiwan), Delhi, India',
    award: 'Employee of the Month (3×)', color: 'orange',
    points: [
      ['Built ', '60+ REST APIs', ' in Java and Spring Boot so 4 analytics teams could use ML models in real time across 8+ platforms, cutting integration time by ', '25%', '.'],
      ['Set up ', '5+ ML pipelines that take raw data all the way to live models', ', with automated testing, deployment (CI/CD) and model checks, raising analytics throughput across 10+ banking modules by ', '40%', '.'],
      ['Sped up ', '15+ data and feature pipelines', ' running on 100M+ row tables, cutting latency by ', '30%', ' and improving query throughput by 2×.'],
      ['Watched speed and load numbers in production and used them to decide which pipelines and queries to fix first.'],
      ['Built shared feature code and a feature store so models used the same data in training and in live use.'],
      ['Worked with teams in Taiwan and India in Agile sprints, joining code reviews, sprint planning and demos for the bank.'],
    ],
    tags: ['Java', 'Spring Boot', 'ML Pipelines', 'CI/CD', 'Feature Store', 'SQL'],
  },
  {
    role: 'Assistant Software Engineer', when: 'Dec 2021 - May 2022',
    where: 'Tata Consultancy Services, client: ING Bank (Netherlands), Delhi, India',
    award: 'Client Appreciation Award', color: 'cobalt',
    points: [
      ['Built ', '10+ Java microservices', " for ING Bank's ML data platform, cutting deployment time by ", '40%', '. Connected Oracle and PostgreSQL to handle 50M+ records a day at 99.9% accuracy.'],
      ['Designed ', '3+ Kafka pipelines', ' handling 1M+ events a day and cut latency by ', '35%', '.'],
      ["Wrote unit tests and worked in Agile sprints with ING's engineers, taking services from design through code review to release."],
      ['Linked the Kafka streams to the microservices so ML and analytics systems got transaction data almost instantly.'],
    ],
    tags: ['Java', 'Apache Kafka', 'Microservices', 'Oracle', 'PostgreSQL'],
  },
]

export const amlNodes = [
  { name: 'New AML alert', sub: 'customer, transactions, reason' },
  { name: 'Risk agent', sub: 'spots warning signs' },
  { name: 'Retrieval agent', sub: 'KYC and policy records (RAG)' },
  { name: 'Transaction agent', sub: 'checks account history' },
  { name: 'Investigation agent', sub: 'puts the evidence together' },
  { name: 'Explanation agent', sub: 'writes the risk report' },
]

export const sideProjects = [
  { kicker: 'AI agent', title: 'LangGraph Research Agent', text: 'An AI agent that searches documents (RAG) and uses tools to finish 8-step research tasks on its own.', big: '70%', bigLabel: 'less manual work', tags: ['LangGraph', 'LangChain', 'OpenAI API', 'RAG'], color: 'mint' },
  { kicker: 'Explainable ML', title: 'Explainable Credit Risk Model', text: 'XGBoost, random forest and logistic regression models on 50K+ loan records, with SHAP and LIME so auditors can see what drove each credit decision.', big: '92%', bigLabel: 'accuracy, 0.96 AUC-ROC', tags: ['XGBoost', 'SHAP', 'LIME', 'Python'], color: 'butter' },
]

export const skills = [
  { title: 'LLMs and AI Agents', color: 'orange', items: ['LangChain', 'LangGraph', 'OpenAI API', 'RAG', 'Multi-Agent Systems', 'Human-in-the-Loop', 'Prompt Engineering', 'Tool Calling', 'Fine-tuning', 'Hugging Face'] },
  { title: 'Machine Learning', color: 'cobalt', items: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'XGBoost', 'Random Forest', 'CNNs', 'NLP', 'Computer Vision', 'Reinforcement Learning', 'SHAP', 'LIME'] },
  { title: 'Quantum ML', color: 'mint', items: ['Qiskit', 'Quantum Classifiers', 'Error Mitigation', 'ZNE', 'Readout Correction'] },
  { title: 'Cloud and MLOps', color: 'butter', items: ['AWS (SageMaker, EC2, S3)', 'GCP', 'Docker', 'Kubernetes', 'MLflow', 'Weights and Biases', 'Feature Store', 'Jenkins', 'CI/CD', 'Git'] },
  { title: 'Backend and Data', color: 'sky', items: ['FastAPI', 'REST APIs', 'Microservices', 'Spring Boot', 'Apache Kafka', 'Data Pipelines', 'Pandas', 'NumPy', 'A/B Testing', 'Unit Testing'] },
  { title: 'Languages and Databases', color: 'orange', items: ['Python', 'Java', 'R', 'SQL', 'PostgreSQL', 'Oracle', 'MySQL'] },
]

export const education = [
  { when: 'Aug 2025 - May 2027 (Expected)', degree: 'M.S. Artificial Intelligence', school: 'Yeshiva University, Katz School of Science and Health, New York, NY', extra: 'Deep Learning, NLP, Computer Vision, Reinforcement Learning, Generative AI', gpa: '3.8' },
  { when: 'May 2022', degree: 'M.Sc. Computer Science, Honors in AI and ML', school: 'Savitribai Phule Pune University, Pune, India', gpa: '3.63' },
  { when: 'May 2020', degree: 'B.Sc. Computer Science, Honors Computer Applications', school: 'Savitribai Phule Pune University, Pune, India', gpa: '3.4' },
]
