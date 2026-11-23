// Nikhil Rana Portfolio — My courses data (v6.0). Used by courses.js + study.js.
// ==========================================================================
// EDIT HERE. Subject format:
//   { id, code, name, credits, type: 'theory'|'lab'|'project'|'elective',
//     notes: 'path/to/notes.html' (omit = "Notes coming"),
//     practice: 'path/to/practice-set.pdf' (exam practice set / model paper, optional),
//     page: syllabus PDF page, units: ['Unit I title', …] }
// Semester status: 'done' | 'now' | 'next'. Semester `practiceTitle` = exam name shown on the practice block.
// Add notes for a new subject: put the HTML in notes/<course>/sem-<n>/ and set `notes`.
// Add a practice set: put the PDF in notes/<course>/sem-<n>/practice/<id>.pdf and set `practice`.
// Source: JRU "MCA 2025-2027 Syllabus" (notes/mca/syllabus.pdf).
// ==========================================================================
window.COURSES = [
  {
    id: 'mca',
    short: 'MCA',
    name: 'Master of Computer Applications',
    years: '2026 – 2028',
    tone: 'rust',
    college: 'Jharkhand Rai University',
    syllabus: 'notes/mca/syllabus.pdf',
    lead: 'Postgraduate course alongside my full-time developer job — core CS depth, applied the same week at work.',
    semesters: [
      {
        n: 1, year: '2026', status: 'now',
        practiceTitle: 'End Semester Examination · December 2026',
        subjects: [
          { id: 'adbms', code: '3CIT101', name: 'Advanced Database Management System', short: 'Advanced DBMS', credits: 3, type: 'theory', page: 13,
            notes: 'notes/mca/sem-1/adbms.html', practice: 'notes/mca/sem-1/practice/adbms.pdf',
            units: ['Introduction & conceptual modelling', 'Relational model, SQL & security', 'Database design & normalization', 'Transaction processing & concurrency', 'Distributed databases & client-server'] },
          { id: 'os', code: '3CIT102', name: 'Operating System', short: 'Operating System', credits: 3, type: 'theory', page: 19,
            notes: 'notes/mca/sem-1/os.html', practice: 'notes/mca/sem-1/practice/os.pdf',
            units: ['Introduction, processes & threads', 'Process scheduling & IPC', 'Deadlocks, memory & virtual memory', 'I/O, file & disk management'] },
          { id: 'coa', code: '3CIT103', name: 'Computer Organization & Architecture', short: 'COA', credits: 3, type: 'theory', page: 22,
            notes: 'notes/mca/sem-1/coa.html', practice: 'notes/mca/sem-1/practice/coa.pdf',
            units: ['Digital logic design', 'Instruction set architecture', 'Basic processing unit & pipelining', 'Memory organization', 'Input output & parallel processing'] },
          { id: 'ads', code: '3CIT104', name: 'Advanced Data Structure', short: 'Advanced DS', credits: 3, type: 'theory', page: 24,
            notes: 'notes/mca/sem-1/ads.html', practice: 'notes/mca/sem-1/practice/ads.pdf',
            units: ['Fundamental data structures', 'Stacks, queues & deques', 'Trees', 'Sorting & heaps', 'Graphs'] },
          { id: 'dm', code: '3CMT101', name: 'Discrete Mathematics', short: 'Discrete Maths', credits: 4, type: 'theory', page: 29,
            practice: 'notes/mca/sem-1/practice/dm.pdf',
            units: ['Sets, propositions & proof', 'Relations, functions & counting', 'Graph theory', 'Group theory & algebraic structures'] },
          { id: 'soft-skills', code: '3CHSMC101', name: 'Soft Skills and Interpersonal Communication', short: 'Soft Skills', credits: 2, type: 'theory', page: 32,
            notes: 'notes/mca/sem-1/soft-skills.html', practice: 'notes/mca/sem-1/practice/soft-skills.pdf',
            units: ['Self-analysis & self-development', 'Goal setting & career planning', 'Effective communication', 'Interpersonal skills'] },
          { id: 'cbhd-1', code: '3CMVAC101', name: 'Character Building & Holistic Development of Personality – I', short: 'CBHD – I', credits: 2, type: 'theory', page: 34,
            notes: 'notes/mca/sem-1/cbhd-1.html', practice: 'notes/mca/sem-1/practice/cbhd-1.pdf',
            units: ['Cognitive development & Pancha Kosha', 'Moral & spiritual development', 'Physical development, yoga & mudras', 'Intellectual–emotional development'] },
          { id: 'adbms-lab', code: '3CIT101P', name: 'Advanced DBMS Lab', credits: 2, type: 'lab', page: 15 },
          { id: 'ads-lab', code: '3CIT104P', name: 'Advanced Data Structure Lab', credits: 2, type: 'lab', page: 26 },
        ],
      },
      {
        n: 2, year: '2027', status: 'next',
        practiceTitle: 'End Semester Examination · 2027',   // practice PDFs → notes/mca/sem-2/practice/<id>.pdf
        subjects: [
          { id: 'java', code: '3CIT105', name: 'Java Programming', credits: 3, type: 'theory', page: 38 },
          { id: 'ccn', code: '3CIT106', name: 'Computer Communication Networks', short: 'Computer Networks', credits: 4, type: 'theory', page: 42 },
          { id: 'toc', code: '3CIT107', name: 'Theory of Computation', short: 'TOC', credits: 3, type: 'theory', page: 45 },
          { id: 'se', code: '3CIT108', name: 'Software Engineering', credits: 4, type: 'theory', page: 47 },
          { id: 'ot', code: '3CMT102', name: 'Optimization Techniques (Linear Programming)', short: 'Optimization (LP)', credits: 4, type: 'theory', page: 49 },
          { id: 'elective-1', code: 'Elective I', name: 'Departmental Elective I', short: 'Elective I', credits: 4, type: 'elective', page: 52, info: 'e.g. Computer Graphics' },
          { id: 'prof-skills', code: '3CHSMC102', name: 'Professional Skills', credits: 2, type: 'theory', page: 56 },
          { id: 'cbhd-2', code: '3CMVAC102', name: 'Character Building & Holistic Development of Personality – II', short: 'CBHD – II', credits: 2, type: 'theory', page: 58 },
          { id: 'java-lab', code: '3CIT105P', name: 'Java Programming Lab', credits: 2, type: 'lab', page: 40 },
        ],
      },
      {
        n: 3, year: '2027', status: 'next',
        practiceTitle: 'End Semester Examination · 2027',   // practice PDFs → notes/mca/sem-3/practice/<id>.pdf
        subjects: [
          { id: 'ai', code: '3CIT201', name: 'Artificial Intelligence', credits: 3, type: 'theory', page: 62 },
          { id: 'dmw', code: '3CIT202', name: 'Data Mining and Warehousing', short: 'Data Mining & DW', credits: 4, type: 'theory', page: 66 },
          { id: 'python', code: '3CIT203', name: 'Python Programming', credits: 3, type: 'theory', page: 68 },
          { id: 'elective-2', code: 'Elective II', name: 'Departmental Elective II', short: 'Elective II', credits: 4, type: 'elective', page: 72, info: 'Compiler Design · Internet & Website Management · Basics of ML' },
          { id: 'cbhd-3', code: '3CMVAC201', name: 'Character Building & Holistic Development of Personality – III', short: 'CBHD – III', credits: 2, type: 'theory', page: 82 },
          { id: 'ai-lab', code: '3CIT201P', name: 'Artificial Intelligence Lab', credits: 2, type: 'lab', page: 64 },
          { id: 'python-lab', code: '3CIT203P', name: 'Python Programming Lab', credits: 2, type: 'lab', page: 70 },
          { id: 'project-1', code: '3CPROJ201', name: 'Project – I', credits: 4, type: 'project', page: 81 },
        ],
      },
      {
        n: 4, year: '2028', status: 'next',
        practiceTitle: 'End Semester Examination · 2028',   // practice PDFs → notes/mca/sem-4/practice/<id>.pdf
        subjects: [
          { id: 'project-2', code: '3CPROJ202', name: 'Project – II', credits: 20, type: 'project', page: 86 },
          { id: 'cbhd-4', code: '3CMVAC202', name: 'Character Building & Holistic Development of Personality – IV', short: 'CBHD – IV', credits: 2, type: 'theory', page: 87 },
          { id: 'mpf', code: '3CMUMC101', name: 'Managing Personal Finance', short: 'Personal Finance', credits: 0, type: 'theory', info: 'University mandatory course' },
        ],
      },
    ],
  },
  {
    id: 'bca',
    short: 'BCA',
    name: 'Bachelor of Computer Applications',
    years: '2023 – 2026',
    tone: 'navy',
    college: '',
    lead: 'Where it started — programming foundations, web, databases and my first real projects.',
    semesters: [1, 2, 3, 4, 5, 6].map((n) => ({ n, year: String(2023 + Math.floor(n / 2)), status: 'done', subjects: [] })),
  },
];

// helpers shared by both pages
window.COURSE_STATUS = { done: 'Completed', now: 'In progress', next: 'Upcoming' };
window.COURSE_TYPE = { theory: 'Theory', lab: 'Lab', project: 'Project', elective: 'Elective' };
window.findSubject = (cId, sN, subId) => {
  const c = window.COURSES.find((x) => x.id === cId);
  const s = c?.semesters.find((x) => String(x.n) === String(sN));
  const sub = s?.subjects.find((x) => x.id === subId);
  return { c, s, sub };
};
