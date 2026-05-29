export const PROGRAM = {
  title: 'Automotive Software Engineering',
  school: 'ENISo — Département Électronique Industrielle',
  sourceNote:
    'Les crédits et formules sont basés sur le plan d’étude ASE 2025/2026 fourni en PDF.',
  years: [
    {
      id: 'ase1',
      label: 'ASE 1ère année',
      shortLabel: '1ère',
      yearFormula: {
        label: 'Moyenne 1ère année',
        tuWeights: { TU1: 14.5, TU2: 16, TU3: 16.5, TU4: 13 },
        denominator: 60,
        description: '(TU1 × 14,5 + TU2 × 16 + TU3 × 16,5 + TU4 × 13) / 60',
      },
      semesters: [
        {
          id: 'ase1-s1',
          label: 'Semestre 1',
          shortLabel: 'S1',
          tus: [
            {
              id: 'TU1',
              label: 'TU1 — Culture générale, langues & mathématiques',
              credits: 6,
              modules: [
                { code: '111', title: 'General economy', credits: 2 },
                { code: '112', title: 'English I', credits: 2 },
                { code: '113', title: 'Mathematics of the engineer', credits: 2 },
              ],
            },
            {
              id: 'TU2',
              label: 'TU2 — Électronique & projet automobile',
              credits: 9,
              modules: [
                { code: '121', title: 'Analog Electronics', credits: 2.5 },
                { code: '122', title: 'Digital Electronics', credits: 2.5 },
                {
                  code: '123',
                  title: 'PRJ 1S1: Automotive request development',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
              ],
            },
            {
              id: 'TU3',
              label: 'TU3 — Informatique & IA',
              credits: 8.5,
              modules: [
                { code: '131', title: 'AI for Automotive', credits: 3 },
                { code: '132', title: 'Algorithm and data structure', credits: 2.5 },
                { code: '133', title: 'C programming', credits: 3 },
              ],
            },
            {
              id: 'TU4',
              label: 'TU4 — Signal & simulation',
              credits: 6.5,
              modules: [
                { code: '141', title: 'Signal processing', credits: 2.5 },
                {
                  code: '142',
                  title: 'PRJ 2S1: Automotive Advanced Simulation',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
              ],
            },
          ],
        },
        {
          id: 'ase1-s2',
          label: 'Semestre 2',
          shortLabel: 'S2',
          tus: [
            {
              id: 'TU1',
              label: 'TU1 — Carrière, langues & statistiques',
              credits: 8.5,
              modules: [
                { code: '211', title: 'Professional Career Development', credits: 2 },
                { code: '212', title: 'English II', credits: 2.5 },
                { code: '213', title: 'GERMAN I', credits: 2 },
                { code: '214', title: 'Probability and statistics', credits: 2 },
              ],
            },
            {
              id: 'TU2',
              label: 'TU2 — Microcontrôleurs',
              credits: 7,
              modules: [
                {
                  code: '221',
                  title: 'PRJ 1S2: Microcontroller base solution',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
                { code: '222', title: 'MCU and programming', credits: 3 },
              ],
            },
            {
              id: 'TU3',
              label: 'TU3 — Systèmes & architectures',
              credits: 8,
              modules: [
                { code: '231', title: 'Operating Systems', credits: 3 },
                { code: '232', title: 'General Purpose Processors architectures', credits: 2.5 },
                { code: '233', title: 'Automotive SW engineering', credits: 2.5 },
              ],
            },
            {
              id: 'TU4',
              label: 'TU4 — Systèmes automobiles',
              credits: 6.5,
              modules: [
                { code: '241', title: 'Automotive System Overview', credits: 2.5 },
                {
                  code: '242',
                  title: 'PRJ 2S2: System architecture: system level Modelling and process engineering',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ase2',
      label: 'ASE 2ème année',
      shortLabel: '2ème',
      yearFormula: {
        label: 'Moyenne 2ème année',
        tuWeights: { TU1: 14.5, TU2: 17, TU3: 16, TU4: 12.5 },
        denominator: 60,
        description: '(TU1 × 14,5 + TU2 × 17 + TU3 × 16 + TU4 × 12,5) / 60',
      },
      semesters: [
        {
          id: 'ase2-s1',
          label: 'Semestre 1',
          shortLabel: 'S3',
          tus: [
            {
              id: 'TU1',
              label: 'TU1 — Management, langues & analyse numérique',
              credits: 8,
              modules: [
                { code: '311', title: 'Team management project', credits: 2 },
                { code: '312', title: 'English III', credits: 2 },
                { code: '313', title: 'GERMAN II', credits: 2 },
                { code: '314', title: 'Numerical analysis', credits: 2 },
              ],
            },
            {
              id: 'TU2',
              label: 'TU2 — Temps réel & embarqué C',
              credits: 7,
              modules: [
                { code: '321', title: 'Real time systems', credits: 3 },
                {
                  code: '322',
                  title: 'PRJ 2S3: Advanced MCU embedded C application',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
              ],
            },
            {
              id: 'TU3',
              label: 'TU3 — POO, séminaires & change management',
              credits: 8.5,
              modules: [
                { code: '331', title: 'Object Oriented Programming', credits: 3 },
                {
                  code: '332',
                  title: 'Visits and Seminars',
                  credits: 1.5,
                  defaultSingleGrade: true,
                  badge: 'Évaluation libre',
                },
                {
                  code: '333',
                  title: 'PRJ 1S3: SW engineering change management',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
              ],
            },
            {
              id: 'TU4',
              label: 'TU4 — Réseaux, AUTOSAR & stage ouvrier',
              credits: 6.5,
              modules: [
                { code: '341', title: 'Network communication protocols', credits: 3 },
                { code: '342', title: 'AUTOSAR', credits: 2 },
                {
                  code: '343',
                  title: 'Workman internship',
                  credits: 1.5,
                  defaultSingleGrade: true,
                  badge: 'Stage',
                },
              ],
            },
          ],
        },
        {
          id: 'ase2-s2',
          label: 'Semestre 2',
          shortLabel: 'S4',
          tus: [
            {
              id: 'TU1',
              label: 'TU1 — Entrepreneuriat & optimisation',
              credits: 6.5,
              modules: [
                { code: '411', title: 'Introduction to entrepreneurship', credits: 2 },
                { code: '412', title: 'English IV', credits: 2 },
                { code: '413', title: 'Optimization techniques and methods', credits: 2.5 },
              ],
            },
            {
              id: 'TU2',
              label: 'TU2 — Projets profil, formal verification & AUTOSAR',
              credits: 10,
              modules: [
                {
                  code: '421',
                  title: 'PRJ 1S4: Profile based project',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
                { code: '422', title: 'SW Formal verification', credits: 2 },
                {
                  code: '423',
                  title: 'PRJ 2S4: AUTOSAR / ECU/CAN/MISRA-C',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
              ],
            },
            {
              id: 'TU3',
              label: 'TU3 — Safety, security & testing',
              credits: 7.5,
              modules: [
                { code: '431', title: 'Security and safety: Design', credits: 2 },
                { code: '432', title: 'Software testing', credits: 2.5 },
                { code: '433', title: 'Security and safety: Programming', credits: 3 },
              ],
            },
            {
              id: 'TU4',
              label: 'TU4 — Protocoles & modélisation automobile',
              credits: 6,
              modules: [
                { code: '441', title: 'Automotive communication protocols', credits: 3 },
                { code: '442', title: 'Automotive system modeling', credits: 3 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ase3',
      label: 'ASE 3ème année',
      shortLabel: '3ème',
      yearFormula: {
        label: 'Moyenne 3ème année',
        tuWeights: { TU1: 6, TU2: 7, TU3: 10, TU4: 7 },
        denominator: 30,
        withInternship: { TU5: 30, denominator: 60 },
        description:
          'Sans PFE: (TU1 × 6 + TU2 × 7 + TU3 × 10 + TU4 × 7) / 30. Avec PFE: ajouter TU5 × 30 puis diviser par 60.',
      },
      semesters: [
        {
          id: 'ase3-s1',
          label: 'Semestre 1',
          shortLabel: 'S5',
          tus: [
            {
              id: 'TU1',
              label: 'TU1 — Innovation, investissement & anglais',
              credits: 6,
              modules: [
                { code: '511', title: 'Investment laws', credits: 2.5 },
                { code: '512', title: 'Engineering technological innovation', credits: 1.5 },
                { code: '513', title: 'English V', credits: 2 },
              ],
            },
            {
              id: 'TU2',
              label: 'TU2 — Préparation PFE & stage ingénieur',
              credits: 7,
              modules: [
                {
                  code: '521',
                  title: 'PRJ 1S5: Depends on which Profiles: preparation for graduation Project (DRX)',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
                {
                  code: '522',
                  title: 'Visits and Seminars',
                  credits: 1.5,
                  defaultSingleGrade: true,
                  badge: 'Évaluation libre',
                },
                {
                  code: '523',
                  title: 'Engineer internship',
                  credits: 1.5,
                  defaultSingleGrade: true,
                  badge: 'Stage',
                },
              ],
            },
            {
              id: 'TU3',
              label: 'TU3 — Architectures parallèles & Linux embarqué',
              credits: 10,
              modules: [
                { code: '531', title: 'Parallel architectures', credits: 3 },
                { code: '532', title: 'Embedded Linux', credits: 3 },
                {
                  code: '533',
                  title: 'PRJ 2S5: Depends on which Profiles: preparation for graduation Project (DRX)',
                  credits: 4,
                  singleGrade: true,
                  badge: 'Projet semestriel',
                },
              ],
            },
            {
              id: 'TU4',
              label: 'TU4 — Diagnostic, contrôle & exigences process',
              credits: 7,
              modules: [
                { code: '541', title: 'Automotive Diagnostic Services and Testing', credits: 3 },
                { code: '542', title: 'Elective module: Automotive Control Systems', credits: 2 },
                { code: '543', title: 'Automotive Process Requirements', credits: 2 },
              ],
            },
          ],
        },
        {
          id: 'ase3-s2',
          label: 'Semestre 2',
          shortLabel: 'S6',
          finalInternship: true,
          tus: [
            {
              id: 'TU5',
              label: 'TU5 — Final internship / PFE',
              credits: 30,
              modules: [
                {
                  code: '611',
                  title: 'Final internship',
                  credits: 30,
                  singleGrade: true,
                  badge: 'PFE',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const FORMULA_LABELS = {
  noExtra: '(DS + 2 × Examen) / 3',
  tp: 'DS × 25% + TP × 25% + Examen × 50%',
  project: 'DS × 25% + Projet × 25% + Examen × 50%',
  tpProject: 'DS × 25% + moyenne(TP, Projet) × 25% + Examen × 50%',
  single: 'Note unique',
};

export function flattenModules(program = PROGRAM) {
  return program.years.flatMap((year) =>
    year.semesters.flatMap((semester) =>
      semester.tus.flatMap((tu) =>
        tu.modules.map((module) => ({
          ...module,
          id: module.code,
          yearId: year.id,
          semesterId: semester.id,
          tuId: tu.id,
          tuLabel: tu.label,
          semesterLabel: semester.label,
          yearLabel: year.label,
        }))
      )
    )
  );
}
