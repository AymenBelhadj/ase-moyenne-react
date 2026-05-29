import { PROGRAM } from '../data/program';

export function clampGrade(value) {
  if (value === '' || value === null || Number.isNaN(Number(value))) return '';
  const number = Number(value);
  if (number < 0) return 0;
  if (number > 20) return 20;
  return number;
}

export function round2(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.round(value * 100) / 100;
}

export function formatGrade(value, fallback = '—') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;
  return round2(value).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isFilled(value) {
  return value !== '' && value !== null && value !== undefined && !Number.isNaN(Number(value));
}

function numberOrNull(value) {
  return isFilled(value) ? Number(value) : null;
}

export function defaultGradeState(module) {
  const single = Boolean(module.singleGrade || module.defaultSingleGrade);
  return {
    single,
    hasTp: false,
    hasProject: false,
    ds: '',
    tp: '',
    project: '',
    exam: '',
    unique: '',
  };
}

export function getFormulaKey(entry, module) {
  if (module.singleGrade || entry?.single) return 'single';
  if (entry?.hasTp && entry?.hasProject) return 'tpProject';
  if (entry?.hasTp) return 'tp';
  if (entry?.hasProject) return 'project';
  return 'noExtra';
}

export function calculateModuleAverage(module, entry) {
  const current = { ...defaultGradeState(module), ...entry };
  const formulaKey = getFormulaKey(current, module);

  if (formulaKey === 'single') {
    const unique = numberOrNull(current.unique);
    return {
      value: unique,
      completed: unique !== null,
      formulaKey,
      missing: unique === null ? ['note unique'] : [],
    };
  }

  const ds = numberOrNull(current.ds);
  const exam = numberOrNull(current.exam);
  const tp = numberOrNull(current.tp);
  const project = numberOrNull(current.project);
  const missing = [];

  if (ds === null) missing.push('DS');
  if (exam === null) missing.push('examen');
  if (current.hasTp && tp === null) missing.push('TP');
  if (current.hasProject && project === null) missing.push('projet');

  if (missing.length > 0) {
    return { value: null, completed: false, formulaKey, missing };
  }

  let value;
  if (formulaKey === 'tp') value = ds * 0.25 + tp * 0.25 + exam * 0.5;
  else if (formulaKey === 'project') value = ds * 0.25 + project * 0.25 + exam * 0.5;
  else if (formulaKey === 'tpProject') value = ds * 0.25 + ((tp + project) / 2) * 0.25 + exam * 0.5;
  else value = (ds + 2 * exam) / 3;

  return { value: round2(value), completed: true, formulaKey, missing: [] };
}

export function weightedAverage(items) {
  let total = 0;
  let completedCredits = 0;
  let allCredits = 0;
  let completedCount = 0;
  let count = 0;

  for (const item of items) {
    count += 1;
    allCredits += item.credits;
    if (item.value !== null && item.value !== undefined && !Number.isNaN(item.value)) {
      completedCount += 1;
      completedCredits += item.credits;
      total += item.value * item.credits;
    }
  }

  return {
    value: completedCredits > 0 ? round2(total / completedCredits) : null,
    completedCredits,
    allCredits,
    completedCount,
    count,
    isComplete: count > 0 && completedCount === count,
  };
}

export function calculateTuAverage(tu, grades) {
  const modules = tu.modules.map((module) => {
    const result = calculateModuleAverage(module, grades[module.code]);
    return { ...module, ...result, credits: module.credits };
  });
  return { ...weightedAverage(modules), modules };
}

export function calculateSemesterAverage(semester, grades) {
  const tus = semester.tus.map((tu) => {
    const result = calculateTuAverage(tu, grades);
    return { ...tu, result };
  });

  const tuItems = tus.map((tu) => ({
    value: tu.result.value,
    credits: tu.credits,
  }));

  return { ...weightedAverage(tuItems), tus };
}

export function calculateYearTuAverages(year, grades) {
  const tuMap = new Map();

  for (const semester of year.semesters) {
    for (const tu of semester.tus) {
      if (!tuMap.has(tu.id)) tuMap.set(tu.id, []);
      for (const module of tu.modules) {
        const result = calculateModuleAverage(module, grades[module.code]);
        tuMap.get(tu.id).push({ ...module, ...result, credits: module.credits });
      }
    }
  }

  return Array.from(tuMap.entries()).reduce((acc, [tuId, modules]) => {
    acc[tuId] = weightedAverage(modules);
    return acc;
  }, {});
}

export function calculateYearAverage(year, grades, options = { includeInternship: true }) {
  const tuAverages = calculateYearTuAverages(year, grades);
  const formula = year.yearFormula;
  let total = 0;
  let denominator = 0;
  let allComplete = true;
  const details = [];

  for (const [tuId, weight] of Object.entries(formula.tuWeights || {})) {
    const tuAverage = tuAverages[tuId];
    if (tuAverage?.value !== null && tuAverage?.value !== undefined) {
      total += tuAverage.value * weight;
      denominator += weight;
    } else {
      allComplete = false;
    }
    if (!tuAverage?.isComplete) allComplete = false;
    details.push({ tuId, weight, value: tuAverage?.value ?? null, isComplete: Boolean(tuAverage?.isComplete) });
  }

  let officialDenominator = formula.denominator;

  if (formula.withInternship && options.includeInternship) {
    const tu5 = tuAverages.TU5;
    const weight = formula.withInternship.TU5;
    officialDenominator = formula.withInternship.denominator;
    if (tu5?.value !== null && tu5?.value !== undefined) {
      total += tu5.value * weight;
      denominator += weight;
    } else {
      allComplete = false;
    }
    if (!tu5?.isComplete) allComplete = false;
    details.push({ tuId: 'TU5', weight, value: tu5?.value ?? null, isComplete: Boolean(tu5?.isComplete) });
  }

  return {
    value: denominator > 0 ? round2(total / denominator) : null,
    officialValue: allComplete && denominator === officialDenominator ? round2(total / officialDenominator) : null,
    denominator,
    officialDenominator,
    isComplete: allComplete && denominator === officialDenominator,
    details,
    tuAverages,
  };
}

export function getModuleCount(program = PROGRAM) {
  return program.years.reduce(
    (sum, year) =>
      sum +
      year.semesters.reduce(
        (semSum, semester) =>
          semSum + semester.tus.reduce((tuSum, tu) => tuSum + tu.modules.length, 0),
        0
      ),
    0
  );
}

export function getProgress(program, grades) {
  const modules = [];
  for (const year of program.years) {
    for (const semester of year.semesters) {
      for (const tu of semester.tus) {
        for (const module of tu.modules) modules.push(module);
      }
    }
  }
  const completed = modules.filter((module) => calculateModuleAverage(module, grades[module.code]).completed).length;
  return { completed, total: modules.length, percent: modules.length ? Math.round((completed / modules.length) * 100) : 0 };
}
