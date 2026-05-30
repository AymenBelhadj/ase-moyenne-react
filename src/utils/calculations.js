import { PROGRAM } from '../data/program';

export const VALIDATION_THRESHOLD = 8;

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

function isValidGrade(value) {
  return value !== null && value !== undefined && !Number.isNaN(Number(value));
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
    const completed = unique !== null;
    return {
      value: unique,
      completed,
      validated: completed && unique >= VALIDATION_THRESHOLD,
      validatedCredits: completed && unique >= VALIDATION_THRESHOLD ? module.credits : 0,
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
    return {
      value: null,
      completed: false,
      validated: false,
      validatedCredits: 0,
      formulaKey,
      missing,
    };
  }

  let value;
  if (formulaKey === 'tp') value = ds * 0.25 + tp * 0.25 + exam * 0.5;
  else if (formulaKey === 'project') value = ds * 0.25 + project * 0.25 + exam * 0.5;
  else if (formulaKey === 'tpProject') value = ds * 0.25 + ((tp + project) / 2) * 0.25 + exam * 0.5;
  else value = (ds + 2 * exam) / 3;

  const roundedValue = round2(value);
  const validated = roundedValue >= VALIDATION_THRESHOLD;

  return {
    value: roundedValue,
    completed: true,
    validated,
    validatedCredits: validated ? module.credits : 0,
    formulaKey,
    missing: [],
  };
}

export function weightedAverage(items) {
  let total = 0;
  let filledCredits = 0;
  let allCredits = 0;
  let filledCount = 0;
  let completedCount = 0;
  let count = 0;

  for (const item of items) {
    const credits = Number(item.credits) || 0;
    count += 1;
    allCredits += credits;

    if (isValidGrade(item.value)) {
      filledCount += 1;
      filledCredits += credits;
      total += Number(item.value) * credits;
    }

    if (item.isComplete === true || (item.isComplete === undefined && isValidGrade(item.value))) {
      completedCount += 1;
    }
  }

  return {
    value: filledCredits > 0 && allCredits > 0 ? round2(total / allCredits) : null,
    total: round2(total),
    filledCredits: round2(filledCredits) || 0,
    completedCredits: round2(filledCredits) || 0,
    allCredits: round2(allCredits) || 0,
    filledCount,
    completedCount,
    count,
    isComplete: count > 0 && completedCount === count,
  };
}

function applyCreditValidation(average, modules, compensatedModeLabel = 'tu-compensation') {
  const directCredits = modules.reduce((sum, module) => {
    return sum + (module.completed && module.value >= VALIDATION_THRESHOLD ? module.credits : 0);
  }, 0);

  const isCompensated = isValidGrade(average.value) && average.value >= VALIDATION_THRESHOLD;
  const validatedCredits = isCompensated ? average.allCredits : directCredits;

  return {
    ...average,
    validatedCredits: round2(validatedCredits) || 0,
    completedCredits: round2(validatedCredits) || 0,
    validationMode: isCompensated ? compensatedModeLabel : 'module-by-module',
    isCompensated,
    validationThreshold: VALIDATION_THRESHOLD,
  };
}

export function calculateTuAverage(tu, grades) {
  const modules = tu.modules.map((module) => {
    const result = calculateModuleAverage(module, grades[module.code]);
    return { ...module, ...result, credits: module.credits, isComplete: result.completed };
  });
  const average = weightedAverage(modules);
  return { ...applyCreditValidation(average, modules, 'tu-compensation'), modules };
}

export function calculateSemesterAverage(semester, grades) {
  const tus = semester.tus.map((tu) => {
    const result = calculateTuAverage(tu, grades);
    return { ...tu, result };
  });

  const tuItems = tus.map((tu) => ({
    value: tu.result.value,
    credits: tu.credits,
    isComplete: tu.result.isComplete,
  }));

  const average = weightedAverage(tuItems);
  const validatedCredits = tus.reduce((sum, tu) => sum + (tu.result.validatedCredits || 0), 0);

  return {
    ...average,
    completedCredits: round2(validatedCredits) || 0,
    validatedCredits: round2(validatedCredits) || 0,
    tus,
  };
}

export function calculateYearTuAverages(year, grades) {
  const tuMap = new Map();

  for (const semester of year.semesters) {
    for (const tu of semester.tus) {
      if (!tuMap.has(tu.id)) tuMap.set(tu.id, []);
      for (const module of tu.modules) {
        const result = calculateModuleAverage(module, grades[module.code]);
        tuMap.get(tu.id).push({ ...module, ...result, credits: module.credits, isComplete: result.completed });
      }
    }
  }

  return Array.from(tuMap.entries()).reduce((acc, [tuId, modules]) => {
    const average = weightedAverage(modules);
    acc[tuId] = { ...applyCreditValidation(average, modules, 'annual-tu-compensation'), modules };
    return acc;
  }, {});
}

export function calculateYearAverage(year, grades, options = { includeInternship: true }) {
  const tuAverages = calculateYearTuAverages(year, grades);
  const formula = year.yearFormula;
  let total = 0;
  let hasAnyValue = false;
  let allComplete = true;
  let validatedCredits = 0;
  const details = [];

  const addTuToYear = (tuId, weight) => {
    const tuAverage = tuAverages[tuId];
    const hasValue = isValidGrade(tuAverage?.value);

    if (hasValue) {
      total += tuAverage.value * weight;
      hasAnyValue = true;
    } else {
      allComplete = false;
    }

    if (!tuAverage?.isComplete) allComplete = false;
    validatedCredits += tuAverage?.validatedCredits || 0;
    details.push({
      tuId,
      weight,
      value: tuAverage?.value ?? null,
      isComplete: Boolean(tuAverage?.isComplete),
      validatedCredits: tuAverage?.validatedCredits || 0,
      allCredits: tuAverage?.allCredits || weight,
      validationMode: tuAverage?.validationMode || 'module-by-module',
    });
  };

  for (const [tuId, weight] of Object.entries(formula.tuWeights || {})) {
    addTuToYear(tuId, weight);
  }

  let officialDenominator = formula.denominator;

  if (formula.withInternship && options.includeInternship) {
    const weight = formula.withInternship.TU5;
    officialDenominator = formula.withInternship.denominator;
    addTuToYear('TU5', weight);
  }

  return {
    value: hasAnyValue && officialDenominator > 0 ? round2(total / officialDenominator) : null,
    officialValue: allComplete ? round2(total / officialDenominator) : null,
    total: round2(total),
    denominator: officialDenominator,
    officialDenominator,
    completedCredits: round2(validatedCredits) || 0,
    validatedCredits: round2(validatedCredits) || 0,
    allCredits: officialDenominator,
    isComplete: allComplete,
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
