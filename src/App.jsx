import { useEffect, useMemo, useRef, useState } from 'react';
import { FORMULA_LABELS, PROGRAM, flattenModules } from './data/program';
import {
  calculateModuleAverage,
  calculateSemesterAverage,
  calculateYearAverage,
  clampGrade,
  defaultGradeState,
  formatGrade,
  getFormulaKey,
  getProgress,
} from './utils/calculations';
import { clearAppState, downloadJson, loadAppState, readJsonFile, saveAppState } from './utils/storage';

const INTRO_DURATION_MS = 3400;

const initialPreferences = {
  activeYearId: PROGRAM.years[0].id,
  activeSemesterId: PROGRAM.years[0].semesters[0].id,
  query: '',
  includeInternship: true,
  theme: 'dark',
};

function buildInitialGrades() {
  const grades = {};
  for (const module of flattenModules(PROGRAM)) {
    grades[module.code] = defaultGradeState(module);
  }
  return grades;
}

function mergeGrades(savedGrades = {}) {
  const initial = buildInitialGrades();
  return Object.fromEntries(
    Object.entries(initial).map(([code, value]) => [code, { ...value, ...(savedGrades[code] || {}) }])
  );
}

function gradeTone(value) {
  if (value === null || value === undefined) return 'muted';
  if (value >= 16) return 'excellent';
  if (value >= 12) return 'good';
  if (value >= 10) return 'ok';
  return 'danger';
}

function App() {
  const loaded = useMemo(() => loadAppState(), []);
  const [grades, setGrades] = useState(() => mergeGrades(loaded?.grades));
  const [preferences, setPreferences] = useState(() => ({ ...initialPreferences, ...(loaded?.preferences || {}) }));
  const [saveInfo, setSaveInfo] = useState({ label: 'Prêt', method: 'cookies' });
  const [showFormulas, setShowFormulas] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const importInputRef = useRef(null);

  const activeYear = PROGRAM.years.find((year) => year.id === preferences.activeYearId) || PROGRAM.years[0];
  const activeSemester =
    activeYear.semesters.find((semester) => semester.id === preferences.activeSemesterId) || activeYear.semesters[0];

  useEffect(() => {
    const timer = window.setTimeout(() => setIsIntroVisible(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('intro-lock', isIntroVisible);
    return () => document.body.classList.remove('intro-lock');
  }, [isIntroVisible]);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences.theme]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const result = saveAppState({ grades, preferences });
      setSaveInfo({ label: 'Sauvegardé automatiquement', method: result.method });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [grades, preferences]);

  useEffect(() => {
    if (!activeYear.semesters.some((semester) => semester.id === preferences.activeSemesterId)) {
      setPreferences((current) => ({ ...current, activeSemesterId: activeYear.semesters[0].id }));
    }
  }, [activeYear, preferences.activeSemesterId]);

  const progress = useMemo(() => getProgress(PROGRAM, grades), [grades]);
  const semesterResult = useMemo(() => calculateSemesterAverage(activeSemester, grades), [activeSemester, grades]);
  const yearResult = useMemo(
    () => calculateYearAverage(activeYear, grades, { includeInternship: preferences.includeInternship }),
    [activeYear, grades, preferences.includeInternship]
  );

  const allYearsResults = useMemo(
    () => PROGRAM.years.map((year) => ({ year, result: calculateYearAverage(year, grades, { includeInternship: preferences.includeInternship }) })),
    [grades, preferences.includeInternship]
  );

  const activeModules = useMemo(() => {
    const query = preferences.query.trim().toLowerCase();
    const modules = activeSemester.tus.flatMap((tu) =>
      tu.modules.map((module) => ({ ...module, tuId: tu.id, tuLabel: tu.label }))
    );
    if (!query) return modules;
    return modules.filter(
      (module) => module.title.toLowerCase().includes(query) || module.code.toLowerCase().includes(query)
    );
  }, [activeSemester, preferences.query]);

  function updatePreference(key, value) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function updateGrade(code, patch) {
    setGrades((current) => ({
      ...current,
      [code]: { ...current[code], ...patch },
    }));
  }

  function updateGradeValue(code, key, value) {
    updateGrade(code, { [key]: clampGrade(value) });
  }

  function resetAll() {
    const confirmed = window.confirm('Voulez-vous vraiment supprimer toutes les notes sauvegardées ?');
    if (!confirmed) return;
    clearAppState();
    setGrades(buildInitialGrades());
    setSaveInfo({ label: 'Données supprimées', method: 'cookies + localStorage' });
  }

  function exportData() {
    downloadJson('ase-moyenne-sauvegarde.json', { grades, preferences, exportedAt: new Date().toISOString() });
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      setGrades(mergeGrades(data.grades));
      setPreferences({ ...initialPreferences, ...(data.preferences || {}) });
      setSaveInfo({ label: 'Import réussi', method: 'fichier JSON' });
    } catch (error) {
      alert('Fichier invalide. Import impossible.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <>
      {isIntroVisible && <IntroScreen onFinish={() => setIsIntroVisible(false)} />}
      <div className={`app-shell ${isIntroVisible ? 'app-shell-loading' : ''}`}>
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-icon">ASE</div>
          <div>
            <p className="eyebrow">Calculateur ENISo</p>
            <h1>Moyenne Automotive Software Engineering</h1>
          </div>
        </div>

        <nav className="year-tabs" aria-label="Choix de l'année">
          {PROGRAM.years.map((year) => (
            <button
              key={year.id}
              className={year.id === activeYear.id ? 'active' : ''}
              onClick={() =>
                setPreferences((current) => ({
                  ...current,
                  activeYearId: year.id,
                  activeSemesterId: year.semesters[0].id,
                }))
              }
            >
              <span>{year.shortLabel}</span>
              <small>{formatGrade(allYearsResults.find((item) => item.year.id === year.id)?.result.value)}</small>
            </button>
          ))}
        </nav>

        <div className="semester-tabs">
          {activeYear.semesters.map((semester) => (
            <button
              key={semester.id}
              className={semester.id === activeSemester.id ? 'active' : ''}
              onClick={() => updatePreference('activeSemesterId', semester.id)}
            >
              {semester.shortLabel}
            </button>
          ))}
        </div>

        <div className="side-panel">
          <div className="panel-row">
            <span>Progression</span>
            <strong>{progress.percent}%</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress.percent}%` }} />
          </div>
          <p>{progress.completed}/{progress.total} modules complétés</p>
        </div>

        <div className="side-panel compact">
          <p className="eyebrow">Sauvegarde</p>
          <strong>{saveInfo.label}</strong>
          <span>{saveInfo.method}</span>
        </div>
      </aside>

      <main className="content">
        <header className="hero">
          <div>
            <p className="eyebrow">{activeYear.label} · {activeSemester.label}</p>
            <h2>Tableau de bord des notes</h2>
            <p>
              Sélectionne TP ou projet matière par matière. Les projets semestriels coefficient 4 restent en note unique.
            </p>
          </div>
          <div className="hero-actions">
            <button className="ghost" onClick={() => setShowFormulas((value) => !value)}>
              {showFormulas ? 'Masquer formules' : 'Voir formules'}
            </button>
            <button className="ghost" onClick={() => updatePreference('theme', preferences.theme === 'dark' ? 'light' : 'dark')}>
              {preferences.theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </button>
          </div>
        </header>

        {showFormulas && <FormulaPanel year={activeYear} />}

        <section className="kpi-grid">
          <KpiCard
            label={activeYear.yearFormula.label}
            value={formatGrade(yearResult.value)}
            helper={yearResult.isComplete ? 'Moyenne officielle complète' : 'Moyenne prévisionnelle'}
            tone={gradeTone(yearResult.value)}
          />
          <KpiCard
            label={`Moyenne ${activeSemester.shortLabel}`}
            value={formatGrade(semesterResult.value)}
            helper={`${semesterResult.completedCount}/${semesterResult.count} TU complétées`}
            tone={gradeTone(semesterResult.value)}
          />
          <KpiCard
            label="Crédits validés dans ce semestre"
            value={`${semesterResult.completedCredits}/${semesterResult.allCredits}`}
            helper="Basé sur les modules remplis"
            tone="good"
          />
          <KpiCard
            label="État global"
            value={progress.percent >= 100 ? 'Complet' : `${progress.percent}%`}
            helper="Auto-save actif sur ce PC"
            tone={progress.percent >= 100 ? 'excellent' : 'muted'}
          />
        </section>

        {activeYear.id === 'ase3' && (
          <label className="switch-row highlight">
            <input
              type="checkbox"
              checked={preferences.includeInternship}
              onChange={(event) => updatePreference('includeInternship', event.target.checked)}
            />
            <span>Inclure le stage final / PFE dans la moyenne de 3ème année</span>
          </label>
        )}

        <section className="toolbar">
          <label className="search-box">
            <span>Rechercher</span>
            <input
              type="search"
              placeholder="Code ou nom de matière..."
              value={preferences.query}
              onChange={(event) => updatePreference('query', event.target.value)}
            />
          </label>
          <div className="toolbar-actions">
            <button className="ghost" onClick={exportData}>Exporter JSON</button>
            <button className="ghost" onClick={() => importInputRef.current?.click()}>Importer</button>
            <input ref={importInputRef} type="file" accept="application/json" hidden onChange={importData} />
            <button className="danger-button" onClick={resetAll}>Réinitialiser</button>
          </div>
        </section>

        <section className="tu-grid">
          {semesterResult.tus.map((tu) => (
            <TuCard
              key={`${activeSemester.id}-${tu.id}`}
              tu={tu}
              grades={grades}
              updateGrade={updateGrade}
              updateGradeValue={updateGradeValue}
              filteredModules={activeModules.filter((module) => module.tuId === tu.id).map((module) => module.code)}
            />
          ))}
        </section>
      </main>
      </div>
    </>
  );
}

function IntroScreen({ onFinish }) {
  return (
    <section className="intro-screen" aria-label="Introduction Automotive Software Engineering">
      <div className="intro-grid-bg" aria-hidden="true" />
      <div className="intro-orb intro-orb-one" aria-hidden="true" />
      <div className="intro-orb intro-orb-two" aria-hidden="true" />

      <header className="intro-topbar">
        <div className="intro-logo-card">
          <img src="/school-logo.svg" alt="Logo de l'école" />
          <span>National Engineers School of Sousse</span>
        </div>
        <div className="intro-logo-card intro-logo-card-right">
          <span>University of Sousse</span>
          <img src="/university-logo.svg" alt="Logo de l'université" />
        </div>
      </header>

      <main className="intro-content">
        <div className="intro-visual-card">
          <img src="/intro-visual.svg" alt="Visuel Automotive Software Engineering" />
          <span className="intro-scan-line" aria-hidden="true" />
          <span className="intro-floating-chip chip-one">React</span>
          <span className="intro-floating-chip chip-two">Moyenne TU</span>
          <span className="intro-floating-chip chip-three">Auto-save</span>
        </div>

        <div className="intro-copy">
          <p className="intro-kicker">Calculateur intelligent de moyenne</p>
          <h1>Automotive Software Engineering</h1>
          <p className="intro-year">Année universitaire 2025/2026</p>
          <p className="intro-description">
            Préparation de ton espace personnel : modules, coefficients, formules TP/projet et sauvegarde locale.
          </p>

          <div className="intro-tags" aria-label="Années disponibles">
            <span>ASE 1</span>
            <span>ASE 2</span>
            <span>ASE 3</span>
          </div>

          <div className="intro-loader" aria-hidden="true">
            <span />
          </div>
          <small>Chargement de ton tableau de bord...</small>
        </div>
      </main>

      <button className="intro-skip" type="button" onClick={onFinish}>
        Passer l’intro
      </button>
    </section>
  );
}

function FormulaPanel({ year }) {
  return (
    <section className="formula-panel">
      <div>
        <p className="eyebrow">Formules PDF</p>
        <h3>Calcul automatique appliqué</h3>
      </div>
      <div className="formula-list">
        <span>Avec TP: {FORMULA_LABELS.tp}</span>
        <span>Sans TP: {FORMULA_LABELS.noExtra}</span>
        <span>Avec projet: {FORMULA_LABELS.project}</span>
        <span>TP + projet: {FORMULA_LABELS.tpProject}</span>
        <span>TU: moyenne pondérée par crédits</span>
        <span>Année: {year.yearFormula.description}</span>
      </div>
    </section>
  );
}

function KpiCard({ label, value, helper, tone }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  );
}

function TuCard({ tu, grades, updateGrade, updateGradeValue, filteredModules }) {
  const result = tu.result;
  const modulesToDisplay = tu.modules.filter((module) => filteredModules.includes(module.code));

  return (
    <article className="tu-card">
      <header className="tu-header">
        <div>
          <p className="eyebrow">{tu.id} · {tu.credits} crédits</p>
          <h3>{tu.label}</h3>
        </div>
        <div className={`tu-score ${gradeTone(result.value)}`}>{formatGrade(result.value)}</div>
      </header>

      <div className="module-list">
        {modulesToDisplay.length === 0 ? (
          <p className="empty-state">Aucune matière ne correspond à la recherche.</p>
        ) : (
          modulesToDisplay.map((module) => (
            <ModuleCard
              key={module.code}
              module={module}
              entry={grades[module.code] || defaultGradeState(module)}
              onPatch={(patch) => updateGrade(module.code, patch)}
              onValue={(key, value) => updateGradeValue(module.code, key, value)}
            />
          ))
        )}
      </div>
    </article>
  );
}

function ModuleCard({ module, entry, onPatch, onValue }) {
  const result = calculateModuleAverage(module, entry);
  const formulaKey = getFormulaKey(entry, module);
  const isLockedSingle = Boolean(module.singleGrade);

  return (
    <section className="module-card">
      <div className="module-title-row">
        <div>
          <h4>{module.code} · {module.title}</h4>
          <p>
            Coefficient / crédit: <strong>{module.credits}</strong> · Formule: <strong>{FORMULA_LABELS[formulaKey]}</strong>
          </p>
        </div>
        <div className={`module-score ${gradeTone(result.value)}`}>{formatGrade(result.value)}</div>
      </div>

      <div className="badge-row">
        {module.badge && <span className="badge">{module.badge}</span>}
        {isLockedSingle && <span className="badge locked">Coeff 4 · note unique</span>}
        {!result.completed && <span className="badge warning">Manque: {result.missing.join(', ')}</span>}
      </div>

      {!isLockedSingle && (
        <div className="option-row">
          <label className="chip-toggle">
            <input
              type="checkbox"
              checked={Boolean(entry.single)}
              onChange={(event) => onPatch({ single: event.target.checked })}
            />
            <span>Note unique</span>
          </label>
          {!entry.single && (
            <>
              <label className="chip-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(entry.hasTp)}
                  onChange={(event) => onPatch({ hasTp: event.target.checked })}
                />
                <span>TP</span>
              </label>
              <label className="chip-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(entry.hasProject)}
                  onChange={(event) => onPatch({ hasProject: event.target.checked })}
                />
                <span>Projet</span>
              </label>
            </>
          )}
        </div>
      )}

      <div className="grade-grid">
        {isLockedSingle || entry.single ? (
          <GradeInput label="Note" value={entry.unique} onChange={(value) => onValue('unique', value)} />
        ) : (
          <>
            <GradeInput label="DS" value={entry.ds} onChange={(value) => onValue('ds', value)} />
            {entry.hasTp && <GradeInput label="TP" value={entry.tp} onChange={(value) => onValue('tp', value)} />}
            {entry.hasProject && <GradeInput label="Projet" value={entry.project} onChange={(value) => onValue('project', value)} />}
            <GradeInput label="Examen" value={entry.exam} onChange={(value) => onValue('exam', value)} />
          </>
        )}
      </div>
    </section>
  );
}

function GradeInput({ label, value, onChange }) {
  return (
    <label className="grade-input">
      <span>{label}</span>
      <input
        inputMode="decimal"
        type="number"
        min="0"
        max="20"
        step="0.25"
        placeholder="/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default App;
