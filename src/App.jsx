import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, Calculator, ChartNoAxesCombined, Check, CircleHelp, Github, Info, Landmark, LockKeyhole, Minus, Plus, ShieldCheck, Target, TrendingUp, TriangleAlert, Wallet, X } from 'lucide-react';

export const DEFAULT_STATE = { currentAge: 50, gender: 'male', bridgeStartAge: 52, pensionAge: 67, liquidSavings: 1800000, hishtalmut: 1200000, targetCapital: 500000, pensionBalance: 2500000, annualReturn: 4 };
const GITHUB_URL = 'https://github.com/pretyk/retirator';
const DISCLAIMER_SECTIONS = [
  ['סימולציה בלבד — לא ייעוץ פיננסי', 'האתר נועד ללמידה ולהמחשת תרחישים בלבד. מחבר האתר אינו יועץ פיננסי ואינו מספק במסגרת האתר ייעוץ השקעות, שיווק השקעות, ייעוץ פנסיוני, ייעוץ מס או ייעוץ משפטי. השימוש אינו יוצר יחסי יועץ–לקוח או חובת נאמנות מקצועית. אין בתוכן המלצה, הצעה או שידול לקנות, למכור או להחזיק מוצר פיננסי, למשוך כספים או לפרוש מעבודה.'],
  ['כל המספרים הם אומדנים, לא הבטחה', 'כל הסכומים, התשואות, ההכנסות, המקדמים ושיעורי המס המוצגים הם הערכות המבוססות על נתוני המשתמש ועל הנחות מפושטות. נתוני ברירת המחדל הם דוגמה בלבד, לא המלצה. אין התחייבות לדיוק, שלמות, עדכניות, התאמה אישית, רווח, קצבה, פטור ממס או יכולת לממן פרישה. ייתכנו טעויות בתוכנה ובחישובים, ותוצאות בפועל עלולות להיות שונות מהותית, לרבות הפסד הון.'],
  ['השוק, האינפלציה, הריבית והחוקים משתנים', 'מחירי השוק, תשואות, אינפלציה, שיעורי ריבית, דמי ניהול, תוחלת חיים, תנאי מוצרים וקרנות, חוקי מס ופנסיה, גילי פרישה, תקרות, פטורים ופרשנות רשויות עשויים להשתנות בכל עת. אין באתר נתוני שוק בזמן אמת או עדכון אוטומטי של הדין. תשואה קבועה אינה תחזית; רצף הפסדים, שינויי יוקר המחיה וסיכונים נוספים אינם משתקפים במלואם.'],
  ['מגבלות המודל הישראלי', 'המודל מניח גיל פרישה 67 לגבר ו־65 לאישה, אף שהזכאות בפועל עשויה להיות שונה לפי תאריך לידה ונסיבות אישיות. פטור בקרן השתלמות וקיבוע זכויות אינם אוטומטיים. שיעורי המס ומקדם ההמרה הם הנחות המחשה ולא חישוב זכאות או מס אישי. תרחיש מתחת לגיל 60 אינו אישור למשיכת קצבה. המודל אינו כולל הפקדות עתידיות, הכנסה מעבודה, קצבת אזרח ותיק או את כל העלויות והסיכונים.'],
  ['לפני כל החלטה — ייעוץ מקצועי אישי', 'אין להסתמך על האתר כבסיס יחיד או מכריע להחלטה. לפני השקעה, משיכה, שינוי חיסכון, תכנון מס או פרישה, יש לפנות לייעוץ פיננסי אישי מאיש מקצוע מוסמך ובעל רישיון מתאים לפי הדין, ובמידת הצורך ליועץ פנסיוני, יועץ השקעות, רואה חשבון, יועץ מס או עורך דין. יש לבדוק עצמאית נתונים, זכאות והוראות דין מול הגופים והרשויות הרלוונטיים.'],
  ['אחריות המשתמש והגבלת אחריות', 'השימוש באתר ובתוצאותיו הוא לפי בחירת המשתמש ועל אחריותו, בכפוף לדין החל. האתר ניתן כפי שהוא וכפי שהוא זמין, ללא מצג או אחריות מפורשים או משתמעים, ככל שהדין מתיר. במידה המרבית המותרת בדין, המחבר, המתחזקים והתורמים אינם אחראים לנזק או הפסד הנובעים מהשימוש, מחוסר יכולת להשתמש, מהסתמכות על התוכן או משגיאות והשמטות, לרבות הפסדי השקעה, אובדן רווח או חיסכון, חבות מס ונזק ישיר, עקיף, נלווה או תוצאתי.'],
  ['זכויות לפי דין והיקף ההסכמה', 'אין בהודעה זו כדי לשלול זכות קוגנטית או לפטור מאחריות שאי אפשר להגביל או לשלול על פי דין. הוראות ההגבלה חלות רק במידה המותרת בדין. ההסכמה מאשרת הבנה של מטרת ההדמיה ומגבלותיה; היא אינה מוותרת על זכויות שלא ניתן לוותר עליהן. אם אינך מסכים או מסכימה, אין להשתמש בסימולטור. נוסח זה אינו תחליף לבחינה משפטית של תנאי השימוש.'],
];
const PRIVACY_SECTIONS = [
  ['החישוב נשאר בדפדפן שלך', 'הנתונים שהוזנו, מצב הטיוטה ותוצאות הסימולציה מחושבים בזיכרון הדפדפן בלבד. אין שרת יישומי שמקבל את הגיל, החסכונות, יתרות הפנסיה או התוצאות. הנתונים אינם נשלחים למחבר האתר, אינם נכללים בכתובת העמוד ואינם משותפים עם צד שלישי על ידי היישום.'],
  ['בלי מעקב ובלי פרופיל משתמש', 'היישום אינו משתמש בכלי אנליטיקה, פיקסלים, הקלטות גלישה, פרסומות, זיהוי טביעת דפדפן או שירותי דיווח שגיאות מרוחקים. אין חשבון משתמש, ואין קובצי עוגיות, אחסון מקומי, אחסון סשן או מסד נתונים בדפדפן המשמשים לשמירת הנתונים. גופנים, סמלים וקובצי היישום אינם נטענים מספק חיצוני.'],
  ['מה קורה לאישור הודעת ההבהרה?', 'גם האישור נשמר רק בזיכרון העמוד, ללא מזהה, חותמת זמן או רישום בשרת. ניתן לעבור בין הסימולטור לעמודי המידע בלי לאבד את הטיוטה. טעינה מחדש או פתיחה חדשה מחזירות את נתוני הדוגמה ומבקשות אישור מחדש. אין בכך מנגנון לניהול או לתיעוד הסכמה משפטית.'],
  ['מה פירוש 100% אנונימי — ומה לא?', 'ההבטחה מתייחסת לנתוני הסימולציה ולאיסוף מידע על ידי קוד היישום, ולא לאנונימיות מוחלטת ברשת. כדי להציג את האתר, הדפדפן מבקש קבצים משרת האחסון. ספק האחסון, תשתית ההפצה או ספק הרשת עשויים לעבד כתובת IP, זמן בקשה, כתובת משאב ופרטי דפדפן לפי המדיניות שלהם. אין לנו אפשרות להבטיח שאין רישומי תשתית. תוספים בדפדפן, מכשיר משותף או צילומי מסך אינם בשליטת היישום.'],
  ['קישור לקוד ולתרומות', 'הקישור למאגר הקוד נפתח רק ביוזמתך ומעביר אותך ל־GitHub, שירות חיצוני בעל מדיניות פרטיות משלו. לא מועברים אליו נתוני הסימולציה על ידי הקישור. אין לפרסם פרטים פיננסיים אישיים, סודות או צילומי מסך עם מידע רגיש בדיווחי תקלות או בתרומות קוד.'],
  ['שקיפות שאפשר לבדוק', 'אפשר לעיין בקוד המקור הציבורי ובבדיקות האוטומטיות. בסביבת הייצור מוגדרת גם מדיניות דפדפן שחוסמת חיבורי נתונים יוצאים של היישום. זו שכבת הגנה נוספת, לא הבטחה כנגד כל סיכון אפשרי. בסביבת הפיתוח קיימים חיבורים מקומיים לצורך עדכון הקוד; הם אינם חלק ממעקב משתמשים.'],
];
const currentPage = () => ['#privacy', '#disclaimer'].includes(window.location.hash) ? window.location.hash.slice(1) : 'simulator';
const number = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
const money = (value) => value === null ? '—' : `₪${integer.format(value)}`;
const compact = (value) => Math.abs(value) >= 1000000 ? `${number.format(value / 1000000)} מ׳` : `${integer.format(value / 1000)} א׳`;
const CAPITAL_MAX = 100000000;

export function taxStatus(gender, age) {
  const officialAge = gender === 'female' ? 65 : 67;
  if (age < 60) return { level: 'danger', rate: 0.35, officialAge, title: 'סכנת מס! משיכה שלא כדין (מתחת לגיל 60)', text: 'קנס שבירה של 35% לפחות ומס שולי גבוה!' };
  if (age < officialAge) return { level: 'warning', rate: 0.2, officialAge, title: 'אזהרת מס (גיל 60 עד גיל פרישה)', text: 'הקצבה תחויב במס שולי כהכנסה רגילה ללא פטור קיבוע זכויות' };
  return { level: 'success', rate: 0.05, officialAge, title: 'פטור ממס (קיבוע זכויות)', text: 'משיכה אופטימלית בגיל פרישה חוקי' };
}

export function validateState(s) {
  const issues = [];
  const ranges = { currentAge: [25, 70], bridgeStartAge: [25, 70], pensionAge: [50, 75], annualReturn: [0, 10], liquidSavings: [0, CAPITAL_MAX], hishtalmut: [0, CAPITAL_MAX], targetCapital: [0, CAPITAL_MAX], pensionBalance: [0, CAPITAL_MAX] };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (!Number.isFinite(s[key]) || s[key] < min || s[key] > max) issues.push('אחד הנתונים מחוץ לטווח המותר.');
    else if (key.endsWith('Age') && !Number.isInteger(s[key])) issues.push('יש להזין גיל בשנים שלמות.');
  }
  if (!['male', 'female'].includes(s.gender)) issues.push('יש לבחור מין לחישוב גיל הפרישה.');
  if (s.bridgeStartAge < s.currentAge) issues.push('גיל הפסקת העבודה לא יכול להיות לפני הגיל הנוכחי.');
  if (s.pensionAge < s.bridgeStartAge) issues.push('גיל משיכת הפנסיה חייב להיות שווה לגיל הפסקת העבודה או מאוחר ממנו.');
  return [...new Set(issues)];
}

export function pmt(pv, fv, rate, months) {
  if (![pv, fv, rate, months].every(Number.isFinite) || pv < 0 || fv < 0 || rate < 0 || months <= 0) throw new RangeError('נתונים לא תקינים לחישוב קצבה');
  if (rate === 0) return (pv - fv) / months;
  const growthMinusOne = Math.expm1(months * Math.log1p(rate));
  return ((pv - fv) / growthMinusOne + pv) * rate;
}

export function calculate(s) {
  const issues = validateState(s);
  if (issues.length) return { valid: false, issues };
  const yearsWaiting = s.bridgeStartAge - s.currentAge;
  const rate = s.annualReturn / 100 / 12;
  const months = (s.pensionAge - s.bridgeStartAge) * 12;
  const startingCapital = s.liquidSavings + s.hishtalmut;
  const pv = startingCapital * (1 + s.annualReturn / 100) ** yearsWaiting;
  const gross = months === 0 ? null : pmt(pv, s.targetCapital, rate, months);
  const taxableRatio = startingCapital === 0 ? 0 : s.liquidSavings / startingCapital;
  const bridgeTax = taxableRatio * 0.15;
  const net = gross === null ? null : gross > 0 ? gross * (1 - bridgeTax) : gross;
  const tax = taxStatus(s.gender, s.pensionAge);
  const factor = s.pensionAge <= 67 ? 200 + (67 - s.pensionAge) * 4 : 200 - (s.pensionAge - 67) * 3;
  const pensionFinal = s.pensionBalance * (1 + s.annualReturn / 100) ** (s.pensionAge - s.currentAge);
  const pensionGross = pensionFinal / factor;
  const reachable = months === 0 ? pv >= s.targetCapital : gross >= 0;
  return { valid: true, issues: [], months, rate, pv, startingCapital, gross, net, bridgeTax, taxableRatio, tax, factor, pensionFinal, pensionGross, pensionNet: pensionGross * (1 - tax.rate), reachable };
}

export function trajectory(s, result) {
  if (!result.valid) return [];
  const totalMonths = (s.pensionAge - s.currentAge) * 12;
  const waitMonths = (s.bridgeStartAge - s.currentAge) * 12;
  return Array.from({ length: totalMonths + 1 }, (_, month) => {
    const elapsed = Math.max(0, month - waitMonths);
    let capital = result.startingCapital * (1 + s.annualReturn / 100) ** (month / 12);
    if (month > waitMonths) {
      // An impossible target is shown as actual no-withdrawal growth, not fictitious contributions.
      const withdrawal = Math.max(0, result.gross ?? 0);
      const growthMinusOne = Math.expm1(elapsed * Math.log1p(result.rate));
      capital = result.rate === 0 ? result.pv - withdrawal * elapsed : result.pv * (1 + growthMinusOne) - withdrawal * growthMinusOne / result.rate;
    }
    return { age: s.currentAge + month / 12, capital: Math.max(0, capital), pension: s.pensionBalance * (1 + s.annualReturn / 100) ** (month / 12) };
  });
}

export function feedbackFor(result, pensionAge) {
  if (!result.valid) return '';
  if (!result.reachable || (result.net !== null && result.net < 5000) || pensionAge < 60) return 'shake';
  return result.net !== null && result.net >= 12000 && pensionAge >= 60 ? 'confetti' : 'saved';
}

const MOBILE_QUERY = '(max-width: 720px)';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches));
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function Tooltip({ text }) {
  const id = useId();
  const tipRef = useRef(null);
  const [above, setAbove] = useState(false);
  const place = () => {
    const tip = tipRef.current;
    const anchor = tip?.offsetParent;
    if (!anchor || !window.matchMedia?.(MOBILE_QUERY).matches) return setAbove(false);
    const dock = document.querySelector('.calculate-dock')?.getBoundingClientRect();
    const dockTop = dock && dock.bottom >= window.innerHeight - 1 ? dock.top : window.innerHeight;
    const limit = Math.min(window.innerHeight, dockTop) - 8;
    const anchorTop = anchor.getBoundingClientRect().top;
    const below = limit - (anchorTop + 36);
    setAbove(tip.offsetHeight > below && anchorTop - 8 > below);
  };
  return <span className="tooltip-wrap" onFocus={place} onMouseEnter={place}><button type="button" className="info-button" aria-label="מידע נוסף" aria-describedby={id} onClick={(event) => event.currentTarget.focus()}><Info size={14} /></button><span ref={tipRef} role="tooltip" id={id} className={`tooltip${above ? ' tooltip-above' : ''}`}>{text}</span></span>;
}

function NumericField({ name, label, value, min = 0, max = CAPITAL_MAX, step = 10000, unit = '₪', info, onChange, onValidity, children }) {
  const id = useId();
  const [text, setText] = useState(null);
  const [error, setError] = useState('');
  const change = (next) => {
    setText(null);
    setError('');
    onValidity(name, false);
    onChange(name, Math.min(max, Math.max(min, Number(next.toFixed(2)))));
  };
  const edit = (raw) => {
    setText(raw);
    const validFormat = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(raw.trim());
    const next = Number(raw.replaceAll(',', '').trim());
    const valid = validFormat && Number.isFinite(next) && next >= min && next <= max && (unit !== 'שנים' || Number.isInteger(next));
    const message = valid ? '' : `יש להזין ${unit === 'שנים' ? 'מספר שלם' : 'מספר'} בין ${number.format(min)} ל־${number.format(max)}`;
    setError(message);
    onValidity(name, !valid);
    if (valid) onChange(name, next);
  };
  const fill = max === min ? 100 : Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
  return <div className="numeric-field">
    <div className="field-heading"><label htmlFor={id}>{label}</label><Tooltip text={info} /></div>
    <div className={`number-control ${error ? 'invalid' : ''}`}>
      <span className="unit">{unit}</span>
      <input id={id} name={name} type="text" inputMode={unit === '%' ? 'decimal' : 'numeric'} dir="ltr" value={text ?? number.format(value)} onChange={(event) => edit(event.target.value)} onBlur={() => { if (!error) setText(null); }} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      <button type="button" aria-label={`הגדל ${label}`} disabled={value >= max} onClick={() => change(value + step)}><Plus size={14} /></button>
      <button type="button" aria-label={`הקטן ${label}`} disabled={value <= min} onClick={() => change(value - step)}><Minus size={14} /></button>
    </div>
    <input className="range" type="range" aria-label={`${label} - מחוון`} min={min} max={max} step={step} value={value} onChange={(event) => change(Number(event.target.value))} style={{ background: `linear-gradient(to left, #818cf8 0%, #6366f1 ${fill}%, #2b3449 ${fill}%, #2b3449 100%)` }} />
    <div className="range-labels" aria-hidden="true"><span>{number.format(min)}</span><span>{number.format(max)}</span></div>
    {error && <p className="field-error" id={`${id}-error`} role="alert">{error}</p>}
    {children}
  </div>;
}

function Section({ icon: Icon, title, index, children }) {
  return <section className="input-section"><div className="section-heading"><span className="section-icon"><Icon size={17} /></span><h3>{title}</h3><span className="section-index">{index}</span></div>{children}</section>;
}

function TaxAlert({ gender, age }) {
  const tax = taxStatus(gender, age);
  return <div className={`tax-alert ${tax.level}`} data-testid="tax-alert" role="status" aria-live="polite">
    {tax.level === 'success' ? <ShieldCheck size={17} /> : <TriangleAlert size={17} />}
    <div><strong>{tax.title}</strong><p>{tax.text}</p><small>מודל מפושט בלבד; פטור אינו אוטומטי או מלא. הזכאות תלויה בנתונים אישיים.</small></div>
  </div>;
}

function Delta({ value, dirty, unavailable }) {
  if (!dirty) return null;
  if (unavailable) return <span className="delta warning">טיוטה ללא השוואה חודשית</span>;
  return <span className={`delta ${value >= 0 ? 'success' : 'danger'}`} data-testid="delta"><span dir="ltr">{value >= 0 ? '+' : '−'}{money(Math.abs(value))}</span> לחודש בטיוטה</span>;
}

function CapitalChart({ state, result }) {
  const points = useMemo(() => trajectory(state, result), [state, result]);
  const [selected, setSelected] = useState(null);
  const uid = useId().replaceAll(':', '');
  const narrow = useMediaQuery(MOBILE_QUERY);
  const width = narrow ? 380 : 760, height = 265, left = narrow ? 60 : 65, right = width - (narrow ? 14 : 30), top = 25, bottom = 215;
  const select = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = ((event.clientX - rect.left) / rect.width * width - left) / (right - left);
    setSelected(Math.round(Math.max(0, Math.min(1, fraction)) * (points.length - 1)));
  };
  const max = Math.max(1, state.targetCapital, ...points.flatMap((point) => [point.capital, point.pension])) * 1.12;
  const span = Math.max(1, state.pensionAge - state.currentAge);
  const x = (age) => left + (age - state.currentAge) / span * (right - left);
  const y = (value) => bottom - value / max * (bottom - top);
  const line = (key) => points.map((point, i) => `${i === 0 ? 'M' : 'L'}${x(point.age).toFixed(2)},${y(point[key]).toFixed(2)}`).join(' ');
  const capitalLine = line('capital');
  const ageMarks = [...new Set([state.currentAge, state.bridgeStartAge, state.pensionAge])].reduce((marks, age) => {
    const previous = marks.at(-1);
    const crowded = previous && x(age) - previous.x < (narrow ? 64 : 58);
    return [...marks, { age, x: x(age), row: crowded ? 1 - previous.row : 0 }];
  }, []);
  const last = points.at(-1);
  const chosen = points[Math.min(selected ?? points.length - 1, points.length - 1)];
  return <section className="panel chart-panel" aria-labelledby="chart-heading">
    <div className="card-heading"><div><span className="eyebrow">התמונה הגדולה</span><h3 id="chart-heading">הכסף שלך, לאורך הדרך</h3></div><ChartNoAxesCombined size={20} className="muted" /></div>
    <div className="chart-legend"><span><i className="dot indigo" />הון זמין לגישור</span><span><i className="dot emerald" />חיסכון פנסיוני</span><span className="muted">ערכים ריאליים · ₪</span></div>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="תחזית הון זמין וחיסכון פנסיוני מהגיל הנוכחי עד משיכת הפנסיה"     className="capital-chart" data-testid="capital-chart" onPointerDown={select} onPointerMove={select} onPointerLeave={(event) => { if (event.pointerType === 'mouse') setSelected(null); }}>
      <defs><linearGradient id={uid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity=".42" /><stop offset="100%" stopColor="#6366f1" stopOpacity=".015" /></linearGradient></defs>
      {[0, 1, 2, 3, 4].map((tick) => <g key={tick}><line x1={left} x2={right} y1={y(max * tick / 4)} y2={y(max * tick / 4)} stroke="#262f45" strokeDasharray="3 6" /><text x={left - 12} y={y(max * tick / 4) + 4} textAnchor="end" className="svg-label">{compact(max * tick / 4)}</text></g>)}
      <rect x={x(state.bridgeStartAge)} y={top} width={Math.max(0, x(state.pensionAge) - x(state.bridgeStartAge))} height={bottom - top} fill="#6366f1" opacity=".035" />
      <path d={`${capitalLine} L${x(last.age)},${bottom} L${left},${bottom} Z`} fill={`url(#${uid})`} />
      <path d={capitalLine} stroke="#818cf8" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <path d={line('pension')} stroke="#34d399" strokeWidth="2.5" strokeDasharray="7 6" fill="none" />
      {ageMarks.map(({ age, x: position, row }) => <g key={age}><line x1={position} x2={position} y1={top} y2={bottom} stroke="#59627a" strokeDasharray="4 6" /><text x={position} y={bottom + 24 + row * 18} textAnchor="middle" className="svg-label">גיל {age}</text></g>)}
      <circle cx={x(last.age)} cy={y(last.capital)} r="5" fill="#a5b4fc" stroke="#131826" strokeWidth="3" />
      {selected !== null && <><line x1={x(chosen.age)} x2={x(chosen.age)} y1={top} y2={bottom} stroke="#94a3b8" /><circle cx={x(chosen.age)} cy={y(chosen.capital)} r="5" fill="#a5b4fc" /></>}
    </svg>
    <div className="chart-readout" data-testid="chart-readout">גיל {number.format(chosen.age)} <span>הון זמין <b dir="ltr">{money(chosen.capital)}</b></span><span>פנסיה <b dir="ltr">{money(chosen.pension)}</b></span></div>
    <div className="chart-footer"><span><LockKeyhole size={13} /> החיסכון הפנסיוני אינו משמש למימון הגישור</span><span>{result.reachable ? `יעד הון: ${money(state.targetCapital)}` : 'יעד ההון אינו בר־השגה ללא הפקדות נוספות'}</span></div>
  </section>;
}

function ModalFrame({ titleId, descriptionId, className = '', onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('[data-initial-focus]')?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return <dialog ref={ref} className={`formula-modal ${className}`} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onClose?.(); }} onKeyDown={(event) => {
    if (event.key === 'Tab') {
      const stops = [...ref.current.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length);
      const index = stops.indexOf(document.activeElement);
      if (index === -1 || (event.shiftKey ? index === 0 : index === stops.length - 1)) {
        event.preventDefault();
        (event.shiftKey ? stops.at(-1) : stops[0])?.focus();
      }
    }
  }} onClick={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>{children}</dialog>;
}

function EntryDisclaimer({ onAccept }) {
  const [agreed, setAgreed] = useState(false);
  return <ModalFrame titleId="entry-title" descriptionId="entry-summary" className="entry-disclaimer">
    <span className="entry-icon"><TriangleAlert size={24} /></span>
    <span className="eyebrow">רגע לפני שמתחילים</span>
    <h2 id="entry-title" tabIndex={-1} data-initial-focus>סימולציה בלבד. לא ייעוץ פיננסי.</h2>
    <p id="entry-summary">כל המספרים הם אומדנים להמחשה, ולא הבטחה או המלצה. המחבר אינו יועץ פיננסי, והכלי אינו מחליף ייעוץ מקצועי אישי.</p>
    <p>השוק, האינפלציה, הריבית וחוקי המס והפנסיה עשויים להשתנות. לפני החלטה יש לפנות לאיש מקצוע מוסמך ובעל רישיון מתאים.</p>
    <a className="text-link" href="#disclaimer">למידע נוסף ולהודעת ההבהרה המלאה</a>
    <label className="agreement-label"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>קראתי והבנתי את הודעת ההבהרה ואת מגבלות הסימולציה, ואני מסכים/ה לתנאי השימוש ולהגבלת האחריות בכפוף לדין.</span></label>
    <button type="button" className="calculate-button" disabled={!agreed} onClick={() => { if (agreed) onAccept(); }}>אני מסכים/ה — כניסה לסימולטור<ArrowLeft size={17} /></button>
    <div className="entry-links"><a href="#disclaimer">לא מסכים/ה — להישאר בעמוד המידע</a><a href="#privacy">איך נשמרת הפרטיות?</a></div>
    <small>האישור נשמר בזיכרון העמוד בלבד. אין עוגיות או רישום הסכמה בשרת.</small>
  </ModalFrame>;
}

function InformationPage({ page }) {
  const heading = useRef(null);
  const privacy = page === 'privacy';
  useEffect(() => {
    heading.current.focus();
    window.scrollTo(0, 0);
  }, [page]);
  return <main id="information" tabIndex={-1} className="information-page main-container">
    <a className="text-link back-link" href="#">חזרה לסימולטור<ArrowLeft size={16} /></a>
    <article className="panel information-card">
      <span className="eyebrow">{privacy ? 'שקיפות ופרטיות' : 'שימוש אחראי במידע'}</span>
      <h1 ref={heading} tabIndex={-1}>{privacy ? 'המידע שלך נשאר אצלך' : 'הודעת הבהרה ותנאי שימוש'}</h1>
      <p className="information-lead">{privacy ? 'בלי חשבון, בלי מעקב ובלי שליחת נתוני הסימולציה.' : 'Retirator הוא כלי להדמיה וללמידה בלבד — לא בסיס לקבלת החלטה פיננסית אישית.'}</p>
      <p className="document-date">עדכון אחרון: 20 באוקטובר 2026</p>
      {(privacy ? PRIVACY_SECTIONS : DISCLAIMER_SECTIONS).map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      <nav className="information-links" aria-label="מידע נוסף">
        <a className="text-link" href={privacy ? '#disclaimer' : '#privacy'}>{privacy ? 'הודעת ההבהרה המלאה' : 'פרטיות ואי־מעקב'}</a>
        <a className="text-link" href="#">חזרה לסימולטור</a>
      </nav>
    </article>
  </main>;
}

function FormulaModal({ result, onClose }) {
  return <ModalFrame titleId="formula-title" onClose={onClose}>
    <div className="modal-top"><span className="section-icon"><Calculator size={22} /></span><button className="icon-button" onClick={onClose} aria-label="סגור הסבר"><X size={20} /></button></div>
    <span className="eyebrow">שקיפות, עד הספרה האחרונה</span><h2 id="formula-title">איך מחושבת ההכנסה בגישור?</h2>
    <p>נוסחת הקצבה מחשבת משיכה בסוף כל חודש, תוך המשך צבירת תשואה ושמירת יעד ההון בסוף תקופת הגישור.</p>
    <div className="formula" dir="ltr">PMT = (PV × (1+r)ᴺ − FV) × r / ((1+r)ᴺ − 1)</div>
    <dl className="formula-values"><div><dt>הון בתחילת הגישור · PV</dt><dd dir="ltr">{money(result.pv)}</dd></div><div><dt>הון לשימור · FV</dt><dd dir="ltr">{money(result.targetCapital)}</dd></div><div><dt>תשואה חודשית · r</dt><dd dir="ltr">{(result.rate * 100).toFixed(4)}%</dd></div><div><dt>מספר חודשים · N</dt><dd>{result.months}</dd></div><div><dt>משיכה חודשית ברוטו · PMT</dt><dd dir="ltr">{money(result.gross)}</dd></div></dl>
    <p>בתשואה אפס: <b dir="ltr">PMT = (PV − FV) / N</b>. כשאין תקופת גישור אין משיכה חודשית. תוצאה שלילית היא הפקדה חודשית נדרשת, ולא הכנסה.</p>
    <p>זהה בגודלו ל־<b dir="ltr">-PMT(r, N, PV, -FV, 0)</b> באקסל. לפני הגישור הפנסיה וההון צוברים תשואה שנתית; במהלך הגישור ההון צובר תשואה חודשית של התשואה השנתית חלקי 12, לפי המפרט.</p>
    <div className="notice"><Info size={16} /><span>מס אפקטיבי משוער בגישור: {number.format(result.bridgeTax * 100)}%. הנחת 15% על החלק הנזיל בלבד, ו־0% על קרן השתלמות נזילה ומזכה. המס בפועל חל על הרווח החייב, לא על מלוא המשיכה.</span></div>
  </ModalFrame>;
}

export default function App() {
  const [draftState, setDraftState] = useState({ ...DEFAULT_STATE });
  const [committedState, setCommittedState] = useState({ ...DEFAULT_STATE });
  const [fieldErrors, setFieldErrors] = useState({});
  const [page, setPage] = useState(currentPage);
  const [accepted, setAccepted] = useState(false);
  const [modal, setModal] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', id: 0 });
  const [announcement, setAnnouncement] = useState('');
  const resultsRef = useRef(null);
  const dockObserver = useRef(null);
  const dockRef = useCallback((node) => {
    dockObserver.current?.disconnect();
    dockObserver.current = null;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => document.documentElement.style.setProperty('--dock-clearance', `${Math.ceil(node.getBoundingClientRect().height) + 16}px`));
    observer.observe(node);
    dockObserver.current = observer;
  }, []);
  const committed = useMemo(() => calculate(committedState), [committedState]);
  const preview = useMemo(() => calculate(draftState), [draftState]);
  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const isDirty = Object.keys(DEFAULT_STATE).some((key) => draftState[key] !== committedState[key]) || hasFieldErrors;
  const invalid = !preview.valid || hasFieldErrors;
  const low = !committed.reachable || (committed.net !== null && committed.net < 5000) || committedState.pensionAge < 60;
  useEffect(() => {
    const onNavigation = () => { setPage(currentPage()); setModal(false); };
    window.addEventListener('hashchange', onNavigation);
    return () => window.removeEventListener('hashchange', onNavigation);
  }, []);
  useEffect(() => {
    document.title = page === 'privacy' ? 'פרטיות ואי־מעקב | Retirator' : page === 'disclaimer' ? 'הודעת הבהרה ותנאי שימוש | Retirator' : 'Retirator | מתכננים חופש כלכלי';
    if (page === 'simulator' && accepted) document.getElementById('main')?.focus();
  }, [page, accepted]);
  useEffect(() => {
    if (!feedback.type) return;
    const timeout = window.setTimeout(() => setFeedback((value) => ({ ...value, type: '' })), 2400);
    return () => window.clearTimeout(timeout);
  }, [feedback.id, feedback.type]);
  const change = (key, value) => setDraftState((previous) => {
    const next = { ...previous, [key]: value };
    if (key === 'currentAge') next.bridgeStartAge = Math.max(next.bridgeStartAge, value);
    return next;
  });
  const validity = (name, value) => setFieldErrors((previous) => previous[name] === value ? previous : { ...previous, [name]: value });
  const field = (name, label, info, extra = {}) => <NumericField key={name} name={name} label={label} info={info} value={draftState[name]} onChange={change} onValidity={validity} {...extra} />;
  const commit = () => {
    if (invalid || !accepted) return;
    setCommittedState({ ...draftState });
    setFeedback((previous) => ({ id: previous.id + 1, type: feedbackFor(preview, draftState.pensionAge) }));
    setAnnouncement(`הסימולציה עודכנה. ${preview.net === null ? 'אין תקופת גישור.' : `נטו משוער בגישור: ${money(preview.net)} לחודש.`}`);
    if (window.matchMedia?.(MOBILE_QUERY).matches) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }));
    }
  };
  return <div className="app-shell" dir="rtl">
    <style>{styles}</style>
    <a href={page === 'simulator' ? '#main' : '#information'} className="skip-link" onClick={(event) => { event.preventDefault(); document.getElementById(page === 'simulator' ? 'main' : 'information')?.focus(); }}>דלג לתוכן הראשי</a>
    <header className="site-header"><div className="header-inner"><a className="brand" href="#" aria-label="Retirator — עמוד ראשי"><span className="brand-mark"><ChartNoAxesCombined size={22} /></span><span dir="ltr">retir<span className="brand-accent">ator</span></span></a><div className="header-center"><span className="live-dot" />פחות אי־ודאות. יותר חופש.</div><span className="header-tag">סימולטור פרישה מוקדמת <span>גרסה 1.0</span></span></div></header>
    <main id="main" tabIndex={-1} className="main-container" hidden={page !== 'simulator'} inert={!accepted}>
      <div className="intro"><div><span className="eyebrow"><span className="tiny-line" />העתיד שלך, בתנאים שלך</span><h1>מתי אפשר לעבוד כי רוצים, <span>לא כי חייבים?</span></h1><p>גלו כמה ההון שלכם יכול לספק בכל חודש, איך מגשרים עד הפנסיה ומה נשאר ליום שאחרי.</p></div><div className="privacy-badge"><ShieldCheck size={21} /><div><span>100% אנונימי - הנתונים מחושבים בדפדפן שלך בלבד</span><a className="privacy-more" href="#privacy">למידע נוסף על הפרטיות<ArrowLeft size={12} /></a></div></div></div>
      <div className="workspace">
        <aside className="controls panel" aria-labelledby="controls-title">
          <div className="controls-header"><div><h2 id="controls-title">בונים את התרחיש שלך</h2><p>כל שינוי קטן פותח אפשרות חדשה</p></div><span className="icon-box"><Calculator size={20} /></span></div>
          <div className="fields-body">
            <Section icon={BriefcaseBusiness} title="נתונים אישיים וציר זמן" index="01">
              <div className="gender-row"><div className="field-heading"><span id="gender-label">מין לצורך גיל פרישה</span><Tooltip text="המודל מניח גיל פרישה 67 לגבר ו־65 לאישה. גיל הפרישה לנשים עולה בהדרגה לפי תאריך הלידה; יש לבדוק זכאות אישית." /></div><div className="gender-toggle" role="group" aria-labelledby="gender-label">{[['male', 'גבר'], ['female', 'אישה']].map(([value, label]) => <button key={value} aria-pressed={draftState.gender === value} className={draftState.gender === value ? 'active' : ''} onClick={() => change('gender', value)}>{label}</button>)}</div></div>
              <div className="two-fields">{field('currentAge', 'גיל נוכחי', 'הגיל היום בשנים שלמות. ההון הקיים צובר תשואה עד הפסקת העבודה; לא נכללות הפקדות חדשות.', { min: 25, max: 70, step: 1, unit: 'שנים' })}{field('bridgeStartAge', 'גיל הפסקת עבודה - תחילת גישור', 'הגיל שבו מתחילים לממן הוצאות מההון הזמין, ללא הכנסה מעבודה. גיל זה לא יכול להיות לפני הגיל הנוכחי.', { min: draftState.currentAge, max: 70, step: 1, unit: 'שנים' })}</div>
              {field('pensionAge', 'גיל משיכת פנסיה', 'גיל תחילת הקצבה. מתחת ל־60 מוצג תרחיש אזהרה בלבד, ולא זכאות לקצבה. גיל הזכאות לפטור תלוי בדין ובנתונים האישיים.', { min: 50, max: 75, step: 1, unit: 'שנים', children: <TaxAlert gender={draftState.gender} age={draftState.pensionAge} /> })}
            </Section>
            <Section icon={Wallet} title="הון ונכסים לגישור" index="02">
              {field('liquidSavings', 'חיסכון נזיל / תיק השקעות', 'תיק השקעות או חיסכון נזיל. במודל מנוכה מס אפקטיבי של 15% מהמשיכה היחסית מהתיק, כהנחה ל־25% מס על רכיב רווח של 60%.')}
              {field('hishtalmut', 'קרן השתלמות', 'המודל מניח קרן נזילה ומשיכה פטורה ממס בכפוף לתקרות ולתנאי הדין. הפקדות מעבר לתקרה או קרן שטרם נזילה עשויות להיות חייבות במס.')}
              {field('targetCapital', 'יעד הון להשאיר בגיל פנסיה', 'כרית ביטחון או ירושה שנותרת מההון הזמין בסוף הגישור, בערכי היום. היעד אינו כולל את החיסכון הפנסיוני.')}
              {field('annualReturn', 'תשואה שנתית ריאלית צפויה', 'תשואה משוערת לאחר אינפלציה ודמי ניהול, לפני מס משיכה. התשואה קבועה במודל; הפסדים וסיכון רצף תשואות אינם נכללים.', { min: 0, max: 10, step: 0.5, unit: '%' })}
            </Section>
            <Section icon={Landmark} title="חיסכון פנסיוני" index="03">{field('pensionBalance', 'צבירה נוכחית בקרן הפנסיה', 'היתרה הקיימת בקרן, ללא הפקדות עתידיות. מקדם ההמרה והמס הם אומדנים בלבד; אינם הצעה או התחייבות של קרן פנסיה.')}</Section>
          </div>
          <div className="calculate-dock" ref={dockRef}>{invalid && <p className="field-error" role="alert">{hasFieldErrors ? 'יש לתקן את השדות המסומנים לפני החישוב.' : preview.issues.join(' ')}</p>}{isDirty && !invalid && preview.net !== null && <p className="dock-preview" data-testid="dock-preview"><span>נטו חודשי בטיוטה</span><b dir="ltr">{money(preview.net)}</b>{committed.net !== null && <span className={`delta ${preview.net >= committed.net ? 'success' : 'danger'}`} dir="ltr">{preview.net >= committed.net ? '+' : '−'}{money(Math.abs(preview.net - committed.net))}</span>}</p>}<button className={`calculate-button ${isDirty && !invalid ? 'pulse-button' : ''}`} disabled={invalid} onClick={commit}><Calculator size={18} />חשב סימולציה<ArrowLeft size={18} /></button><span><LockKeyhole size={12} /> ללא הרשמה. ללא שמירת נתונים.</span></div>
        </aside>
        <div className="results" ref={resultsRef} aria-label="תוצאות הסימולציה">
          <div className={`results-status ${isDirty ? 'dirty' : ''}`} role="status">{isDirty ? <><span className="live-dot" />מצב טיוטה - לחץ על חישוב לעדכון</> : <><Check size={15} /> התרחיש שלך מעודכן <span>כל הסכומים בערכי היום</span></>}</div>
          <section key={feedback.id} className={`hero-card ${low ? 'deficit' : ''} ${feedback.type === 'shake' ? 'shake' : ''}`} data-testid="bridge-card">
            <div className="hero-top"><span className="phase-badge"><span className="live-dot" />תקופת הגישור</span><button className="fx-button" aria-label="הצג נוסחת חישוב" onClick={() => setModal(true)}><span dir="ltr">ƒx</span></button></div>
            <h2>החופש שלך, במספר חודשי.</h2><p className="hero-subtitle">נטו משוער לכיס <span>·</span> מגיל {committedState.bridgeStartAge} עד {committedState.pensionAge}</p>
            <div className="hero-amount"><span data-testid="bridge-net" dir="ltr">{money(committed.net)}</span><small>/ חודש</small></div>
            <Delta dirty={isDirty} unavailable={!preview.valid || hasFieldErrors || preview.net === null || committed.net === null} value={preview.valid ? preview.net - committed.net : 0} />
            <div className="hero-bottom"><div><span>הכנסה חודשית ברוטו בגישור</span><strong data-testid="bridge-gross" dir="ltr">{money(committed.gross)}</strong></div><div><span>משך תקופת הגישור</span><strong>{committed.months / 12} <small>שנים</small><em>{committed.months} חודשים</em></strong></div><div><span>מס אפקטיבי משוער</span><strong>{number.format(committed.bridgeTax * 100)}<small>%</small></strong></div></div>
            {committed.months === 0 && <p className="hero-warning">אין תקופת גישור: הפסקת העבודה ומשיכת הפנסיה באותו גיל. ההון אינו נמשך ונשאר בבעלותך.</p>}
            {!committed.reachable && <p className="hero-warning" role="alert">יעד ההון אינו בר־השגה. {committed.gross === null ? `חסר הון של ${money(Math.max(0, committedState.targetCapital - committed.pv))}.` : `נדרשת הפקדה חודשית של ${money(Math.abs(committed.gross))}, ולא משיכה.`}</p>}
            {committed.net !== null && committed.net >= 0 && committed.net < 5000 && <p className="hero-warning">ההכנסה בגישור נמוכה מ־5,000 ₪. מומלץ לבחון הוצאות ומקורות הכנסה נוספים.</p>}
            {committedState.pensionAge < 60 && <p className="hero-warning">תרחיש בסיכון מס גבוה: משיכה לפני גיל 60 אינה קצבת פרישה רגילה.</p>}
          </section>
          <div className="summary-grid"><section className="panel metric-card"><div className="metric-top"><span>הון זמין בתחילת הגישור</span><Wallet size={17} /></div><strong dir="ltr">{money(committed.pv)}</strong><small><TrendingUp size={13} /> לאחר {committedState.bridgeStartAge - committedState.currentAge} שנות צמיחה לפני הגישור</small></section><section className="panel metric-card"><div className="metric-top"><span>כרית הביטחון שלך</span><Target size={17} /></div><strong dir="ltr">{money(committedState.targetCapital)}</strong><small className={!committed.reachable ? 'rose-text' : ''}>{committed.reachable ? 'יעד הון לשימור בגיל משיכת הפנסיה' : 'יעד שאינו בר־השגה בתרחיש הנוכחי'}</small></section></div>
          <CapitalChart state={committedState} result={committed} />
          <section className="panel pension-card"><div className="card-heading"><div className="pension-title"><span className="pension-icon"><Landmark size={23} /></span><div><span className="eyebrow">השלב הבא</span><h3>תקופת הפנסיה - הערכה</h3></div></div><span className="estimate-badge">הערכה בלבד</span></div><div className="pension-main"><div><span className="muted">קצבה חודשית נטו משוערת</span><div className="pension-amount"><strong data-testid="pension-net" dir="ltr">{money(committed.pensionNet)}</strong><small>/ חודש</small></div><Delta dirty={isDirty} unavailable={!preview.valid || hasFieldErrors} value={preview.valid ? preview.pensionNet - committed.pensionNet : 0} /></div><div className="pension-detail"><span>ברוטו חודשי <b dir="ltr">{money(committed.pensionGross)}</b></span><span>מקדם המרה מוערך <b data-testid="annuity-factor">{committed.factor}</b></span><span>צבירה צפויה בגיל {committedState.pensionAge} <b dir="ltr">{money(committed.pensionFinal)}</b></span></div></div><div className="pension-note"><Info size={14} /><span>הנחת מס אפקטיבי: {committed.tax.rate * 100}%. {committedState.pensionAge < 60 ? 'הפחתת 35% היא המחשת קנס מינימום בלבד, לא קצבה זמינה או חישוב מס חוקי.' : 'הפטור כפוף לזכאות ולקיבוע זכויות; מס בפועל תלוי בהכנסות, תקרות ונקודות זיכוי.'}</span></div></section>
          <div className="notice assumptions"><CircleHelp size={19} /><div><strong>מודל לתכנון. לא כדור בדולח.</strong><p>התוצאות אינן ייעוץ השקעות, פנסיה או מס. המודל מניח תשואה קבועה, ללא הפקדות עתידיות או הכנסה מעבודה, וללא קצבת אזרח ותיק. הוא אינו כולל סיכון רצף תשואות, שינויי חקיקה או חישוב מס אישי. גיל הפרישה לנשים נקבע כאן כ־65 לצורך ההדמיה בלבד. לפני החלטה, יש להתייעץ עם בעל רישיון.</p><a className="text-link" href="#disclaimer">להודעת ההבהרה המלאה</a></div></div>
        </div>
      </div>
    </main>
    {page !== 'simulator' && <InformationPage page={page} />}
    <div className="footer-container"><footer className="site-footer"><span dir="ltr">Retirator</span><nav aria-label="קישורי אתר"><a href="#privacy">פרטיות</a><a href="#disclaimer">הבהרה ותנאי שימוש</a><a className="github-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="תרומה לקוד ב־GitHub — נפתח בלשונית חדשה"><Github size={15} />תרומה לקוד</a></nav><span><ShieldCheck size={14} /> המידע שלך נשאר אצלך</span></footer></div>
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    {page === 'simulator' && !accepted && <EntryDisclaimer onAccept={() => setAccepted(true)} />}
    {page === 'simulator' && accepted && modal && <FormulaModal result={{ ...committed, targetCapital: committedState.targetCapital }} onClose={() => setModal(false)} />}
    {feedback.type === 'confetti' && <div key={feedback.id} className="confetti" data-testid="confetti" aria-hidden="true">{Array.from({ length: 60 }, (_, i) => <i key={i} style={{ '--x': `${(i * 37) % 100}vw`, '--drift': `${(i % 2 ? 1 : -1) * (30 + i % 100)}px`, '--delay': `${i % 12 * 0.035}s`, '--rotation': `${i * 47}deg`, background: ['#818cf8', '#34d399', '#fbbf24', '#f9a8d4'][i % 4] }} />)}</div>}
  </div>;
}

const styles = `
.privacy-more{display:flex;align-items:center;gap:5px;margin-top:5px;text-decoration:underline;text-underline-offset:3px;color:#a7f3d0}
.text-link{color:#c7d2fe;text-decoration:underline;text-underline-offset:4px;font-size:12px;line-height:1.9}
.footer-container{max-width:1440px;margin:auto;padding:0 48px}.site-footer nav{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.site-footer nav a:hover{color:#eef2fc}.github-link{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid #39435a;border-radius:6px;color:#c7d2fe}
.formula-modal.entry-disclaimer{max-width:510px}.formula-modal.entry-disclaimer::backdrop{backdrop-filter:blur(9px);background:#050814b8}.entry-icon{display:flex;width:46px;height:46px;align-items:center;justify-content:center;color:#fcd34d;background:#f59e0b12;border:1px solid #73521f;border-radius:12px;margin-bottom:18px}.entry-disclaimer .eyebrow{color:#fcd34d}.entry-disclaimer h2{font-size:23px;line-height:1.5}.entry-disclaimer .agreement-label{display:flex;align-items:flex-start;gap:10px;font-size:12px;color:#d5deee;line-height:1.8;margin:23px 0 18px;cursor:pointer}.agreement-label input{accent-color:#6366f1;width:18px;height:18px;flex-shrink:0;margin-top:3px}.entry-links{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-top:18px;font-size:11px;color:#c7d2fe}.entry-links a{text-decoration:underline;text-underline-offset:3px}.entry-disclaimer>small{display:block;margin-top:17px;color:#a6b1c8;font-size:10px;line-height:1.8}.entry-disclaimer .calculate-button{font-size:13px}
.information-page{max-width:960px}.back-link{display:inline-flex;gap:8px;align-items:center;margin-bottom:20px}.information-card{padding:32px}.information-card h1{font-size:30px;line-height:1.5}.information-lead{font-size:15px;color:#c3ccdd;margin-top:12px;line-height:1.9}.document-date{font-size:11px;color:#95a1b9;margin:14px 0 28px}.information-card section+section{border-top:1px solid #262f45;margin-top:23px;padding-top:23px}.information-card section h2{font-size:18px;color:#dce3ff;margin-bottom:10px;line-height:1.6}.information-card section p{font-size:14px;line-height:2;color:#b5c1d7}.information-links{display:flex;flex-wrap:wrap;gap:22px;border-top:1px solid #262f45;margin-top:28px;padding-top:22px}
@media(max-width:720px){html{scroll-padding-bottom:var(--dock-clearance,140px)}.footer-container{padding:0 16px}.site-footer nav{gap:12px;justify-content:center}.information-card{padding:22px 18px}.information-card h1{font-size:25px}.information-card section p{font-size:13px}.entry-disclaimer{padding:22px}.entry-disclaimer h2{font-size:21px}.entry-disclaimer .entry-links{flex-direction:column;align-items:flex-start}}
:root{font-family:Arial,"Noto Sans Hebrew",sans-serif;color:#eef2fc;background:#0b0f19;font-synthesis:none;color-scheme:dark;font-weight:400}
*{box-sizing:border-box}body{margin:0}button,input{font:inherit}button,a,input{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button:disabled{cursor:not-allowed;opacity:.45}a{color:inherit;text-decoration:none}button{color:inherit}button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}button{transition:background .18s,border-color .18s,transform .18s}button:hover:not(:disabled){filter:brightness(1.15)}p,h1,h2,h3{margin:0}button svg,span svg{flex-shrink:0}button{border:0}.app-shell{min-height:100vh;background:radial-gradient(ellipse at 70% 0%,#151a322f,transparent 48%)}.site-header{height:82px;border-bottom:1px solid #222b3e;background:#0d111c}.header-inner{max-width:1440px;margin:auto;padding:0 48px;height:100%;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:11px;font-size:25px;font-weight:800;letter-spacing:-1.1px}.brand-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:linear-gradient(135deg,#818cf8,#4f46e5);box-shadow:0 3px 16px #6366f12b}.brand-accent{color:#a5b4fc}.header-center{display:flex;align-items:center;gap:9px;font-size:12px;color:#a6b1c8}.live-dot{width:6px;height:6px;border-radius:50%;display:inline-block;background:#34d399;box-shadow:0 0 9px #34d39966}.header-tag{font-size:12px;color:#a6b1c8}.header-tag>span{margin-inline-start:12px;font-size:10px;border:1px solid #30394c;border-radius:5px;padding:4px 6px}.main-container{max-width:1440px;padding:43px 48px 0;margin:auto}.intro{display:flex;align-items:center;justify-content:space-between;gap:32px;margin-bottom:32px}.eyebrow{color:#a5b4fc;font-size:11px;font-weight:600;display:inline-flex;gap:7px;align-items:center;letter-spacing:.3px}.tiny-line{width:17px;height:2px;background:#818cf8}h1{font-size:clamp(26px,2.5vw,36px);font-weight:750;letter-spacing:-1px;line-height:1.45;margin-top:10px}h1>span{color:#b7bdfd}.intro p{font-size:13px;line-height:1.8;color:#9aa7bf;margin-top:8px}.privacy-badge{border:1px solid #1b463e;background:#0c292230;border-radius:10px;color:#6ee7b7;display:flex;align-items:center;gap:10px;padding:13px 14px;font-size:11px;line-height:1.8;max-width:247px;flex-shrink:0}.profiles-bar{display:flex;gap:20px;align-items:center;padding:16px 18px;border:1px solid #262f45;border-radius:12px;background:#101522;margin-bottom:25px}.profiles-label{display:flex;gap:8px;align-items:center;flex-shrink:0;font-size:12px;color:#dbe1ee}.profiles-label svg{color:#a5b4fc}.profiles-label small{display:none}.profile-buttons{display:flex;gap:10px}.profile-button{display:flex;align-items:center;gap:9px;padding:11px 14px;border:1px solid #2e374b;border-radius:7px;background:#171d2c;color:#b9c4da;font-size:12px;white-space:nowrap}.profile-button.selected{border-color:#6366f1;background:#232342;color:#c7d2fe}.profile-button>svg:last-child{opacity:.65;margin-inline-start:6px}.profiles-hint{margin-inline-start:auto;font-size:11px;color:#95a1b9}.workspace{display:grid;grid-template-columns:365px minmax(0,1fr);gap:24px;align-items:start}.panel{border:1px solid #262f45;border-radius:13px;background:#131826}.controls{overflow:visible}.controls-header{padding:23px 23px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #262f45}.controls-header h2{font-size:17px;font-weight:700}.controls-header p{color:#9aa7bf;font-size:11px;margin-top:6px}.icon-box{width:36px;height:36px;display:grid;place-items:center;border:1px solid #313a52;border-radius:9px;color:#a5b4fc;background:#1b2335}.fields-body{padding:0 23px}.input-section{padding:23px 0 6px}.input-section+.input-section{border-top:1px solid #262f45;margin-top:12px}.section-heading{display:flex;align-items:center;gap:8px;margin-bottom:21px}.section-heading h3{font-size:13px;font-weight:650}.section-icon{color:#a5b4fc;display:inline-flex}.section-index{color:#95a1b9;font-size:10px;margin-inline-start:auto;font-variant-numeric:tabular-nums}.field-heading{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:500;color:#c3ccdd;margin-bottom:10px;min-height:18px}.tooltip-wrap{display:inline-flex;position:relative;vertical-align:middle}.info-button{display:flex;align-items:center;justify-content:center;background:none;color:#96a2ba;padding:2px}.tooltip{display:none;position:absolute;z-index:20;width:240px;max-width:70vw;inset-inline-end:-8px;bottom:calc(100% + 9px);padding:12px;border:1px solid #45516d;border-radius:8px;background:#202a3e;box-shadow:0 8px 30px #0006;color:#eef2ff;font-size:12px;line-height:1.8;font-weight:400}.tooltip-wrap:hover .tooltip,.tooltip-wrap:focus-within .tooltip{display:block}.gender-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:19px}.gender-row .field-heading{margin:0}.gender-toggle{display:flex;padding:3px;background:#0c111d;border:1px solid #29324a;border-radius:7px}.gender-toggle button{font-size:11px;border-radius:4px;padding:6px 18px;background:transparent;color:#a6b1c8}.gender-toggle button.active{background:#30315b;color:#e0e7ff}.two-fields{display:grid;grid-template-columns:1fr 1fr;gap:15px}.two-fields .field-heading{min-height:34px;align-items:flex-start;line-height:1.6}.numeric-field{margin-bottom:19px;min-width:0}.number-control{display:flex;align-items:center;gap:3px;border:1px solid #30394f;border-radius:7px;background:#0e1421;height:38px;overflow:hidden;padding-inline:10px 5px}.number-control input{width:100%;min-width:0;border:0;background:transparent;color:#e3e9f7;outline-offset:-2px;text-align:right;font-variant-numeric:tabular-nums;font-size:14px;padding:5px}.number-control button{display:grid;place-items:center;background:#1d2536;border:1px solid #343e55;border-radius:4px;min-width:22px;height:23px;color:#b8c3d8}.unit{font-size:11px;color:#9aa7bf}.two-fields .number-control{padding-inline:6px 4px}.two-fields .number-control input{font-size:13px}.two-fields .number-control .unit{font-size:9px}.range{display:block;direction:rtl;width:100%;height:4px;margin:17px 0 8px;appearance:none;border-radius:5px;cursor:pointer}.range::-webkit-slider-thumb{appearance:none;border:3px solid #c7d2fe;width:12px;height:12px;border-radius:50%;background:#6366f1;box-shadow:0 0 10px #6366f13b}.range::-moz-range-thumb{border:3px solid #c7d2fe;width:7px;height:7px;border-radius:50%;background:#6366f1}.range-labels{display:flex;justify-content:space-between;direction:rtl;font-size:9px;color:#95a1b9;font-variant-numeric:tabular-nums}.tax-alert{display:flex;align-items:flex-start;gap:8px;border:1px solid;border-radius:7px;padding:11px 10px;margin-top:13px;font-size:10px;line-height:1.8}.tax-alert>svg{flex-shrink:0;margin-top:2px}.tax-alert strong{font-size:10px}.tax-alert p{opacity:.95;margin-top:2px}.tax-alert small{display:block;font-size:9px;line-height:1.7;margin-top:5px;opacity:.9}.success{color:#6ee7b7;background:#10b9810c;border-color:#1e5447}.warning{color:#fcd34d;background:#f59e0b0e;border-color:#73521f}.danger{color:#fda4af;background:#f43f5e0c;border-color:#79364b}.tax-alert.danger{animation:shake .4s ease-in-out}.calculate-dock{padding:19px 23px 17px;border-top:1px solid #262f45;background:#101522;border-radius:0 0 13px 13px}.calculate-button{width:100%;display:flex;justify-content:center;align-items:center;gap:10px;padding:13px 15px;background:linear-gradient(110deg,#5855e7,#6d65ef);border:1px solid #8982fc;border-radius:8px;font-size:14px;font-weight:650;box-shadow:0 4px 20px #6366f120}.calculate-button>svg:last-child{margin-inline-start:auto}.calculate-button>svg:first-child{margin-inline-end:auto}.calculate-dock>span{display:flex;justify-content:center;align-items:center;gap:5px;font-size:9px;color:#a6b1c8;margin-top:12px}.results{display:flex;flex-direction:column;gap:17px;min-width:0}.results-status{display:flex;align-items:center;gap:6px;font-size:10px;color:#a6b1c8;min-height:22px}.results-status>svg{color:#34d399}.results-status>span:last-child:not(.live-dot){margin-inline-start:auto;color:#95a1b9}.results-status.dirty{background:#f59e0b0c;border:1px solid #73521f;border-radius:6px;color:#fcd34d;padding:8px 12px;animation:draft-pulse 2s infinite}.dirty .live-dot{background:#fbbf24;box-shadow:0 0 10px #f59e0b55}.hero-card{position:relative;overflow:hidden;border:1px solid #454682;border-radius:14px;padding:24px 28px 0;background:radial-gradient(ellipse at 5% 0%,#6366f123,transparent 60%),linear-gradient(125deg,#171c32,#1b2039 60%,#1a2034);box-shadow:0 8px 35px #0002}.hero-card:before{content:"";position:absolute;width:310px;height:310px;border:1px solid #818cf814;border-radius:50%;left:-100px;top:-75px;pointer-events:none;box-shadow:0 0 0 38px #818cf808,0 0 0 76px #818cf805}.hero-top{position:relative;display:flex;justify-content:space-between;align-items:center}.phase-badge{display:flex;align-items:center;gap:7px;border:1px solid #747ac43d;background:#818cf81a;border-radius:5px;padding:5px 8px;color:#c7d2fe;font-size:10px}.phase-badge .live-dot{background:#a5b4fc;box-shadow:none}.fx-button{border:1px solid #5b6090;border-radius:6px;width:31px;height:28px;background:#1c233b;color:#c7d2fe;font-family:Georgia,serif;font-style:italic}.hero-card h2{font-size:22px;font-weight:600;margin-top:19px;letter-spacing:-.3px}.hero-subtitle{color:#b0bbd4;font-size:12px;margin-top:10px}.hero-subtitle>span{margin:0 5px}.hero-amount{display:flex;gap:10px;align-items:baseline;margin-top:9px;margin-bottom:16px}.hero-amount>span{font-size:clamp(38px,4.3vw,62px);font-weight:750;letter-spacing:-2px;font-variant-numeric:tabular-nums;color:#a7f3d0;line-height:1.3}.hero-amount>small{font-size:12px;color:#a6b1c8}.hero-bottom{display:grid;grid-template-columns:1.25fr 1fr .9fr;gap:16px;padding:19px 0 22px;border-top:1px solid #40496982;margin-top:20px}.hero-bottom>div{display:flex;flex-direction:column;gap:9px}.hero-bottom>div+div{border-inline-start:1px solid #40496982;padding-inline-start:20px}.hero-bottom span{font-size:10px;color:#b0bbd4}.hero-bottom strong{font-size:21px;font-weight:600;font-variant-numeric:tabular-nums}.hero-bottom small{font-size:11px;margin-inline-start:4px;color:#d0d8e9}.hero-bottom em{font-style:normal;display:inline-block;font-size:9px;color:#a6b1c8;margin-inline-start:8px}.delta{display:inline-flex;align-items:center;gap:5px;font-size:10px;padding:5px 7px;border:1px solid;border-radius:5px;max-width:100%}.deficit{border-color:#a34a64}.deficit .hero-amount>span,.rose-text{color:#fda4af}.hero-warning{font-size:12px;line-height:1.8;color:#fda4af;border-top:1px solid #79364b;padding:12px 0}.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.metric-card{padding:18px 21px;min-width:0}.metric-top{display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#b0bbd4}.metric-top svg{color:#a5b4fc}.metric-card>strong{display:block;width:fit-content;margin-top:13px;font-size:27px;letter-spacing:-.7px;font-variant-numeric:tabular-nums;font-weight:600}.metric-card>small{display:flex;align-items:center;gap:5px;font-size:10px;color:#a6b1c8;margin-top:9px}.metric-card small svg{color:#34d399}.card-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.card-heading h3{font-size:17px;font-weight:600;margin-top:5px}.chart-panel{padding:22px 24px 0;overflow:hidden}.chart-panel .eyebrow{font-size:10px;color:#9aa7bf}.chart-legend{display:flex;align-items:center;gap:18px;font-size:10px;margin-top:23px;color:#b8c3d8;flex-wrap:wrap}.chart-legend>span{display:flex;gap:6px;align-items:center}.chart-legend>span:last-child{margin-inline-start:auto}.dot{width:7px;height:7px;border-radius:50%;display:inline-block}.indigo{background:#818cf8}.emerald{background:#34d399}.capital-chart{display:block;width:100%;overflow:visible;direction:ltr;margin-top:14px}.svg-label{fill:#a6b1c8;font-size:11px;font-family:Arial,sans-serif;direction:rtl;unicode-bidi:plaintext}.chart-readout{display:flex;flex-wrap:wrap;gap:14px;color:#a6b1c8;font-size:10px;min-height:30px}.chart-readout b{color:#d7dfef;margin-inline-start:5px;display:inline-block;font-weight:500}.chart-footer{display:flex;justify-content:space-between;gap:10px;padding:15px 0;border-top:1px solid #262f45;color:#a6b1c8;font-size:9px;line-height:1.7}.chart-footer>span:first-child{display:flex;align-items:center;gap:5px}.pension-card{padding:22px 24px 0}.pension-title{display:flex;gap:11px;align-items:center}.pension-icon{display:grid;place-items:center;width:43px;height:43px;background:#10b9810d;border:1px solid #235344;border-radius:10px;color:#6ee7b7}.pension-title .eyebrow{font-size:10px;color:#9aa7bf}.estimate-badge{font-size:9px;border:1px solid #3b455c;color:#bdc7dc;border-radius:5px;padding:5px 8px;white-space:nowrap}.pension-main{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center;margin:25px 0 19px}.pension-main>.muted,.pension-main>div>.muted{font-size:11px}.pension-amount{display:flex;align-items:baseline;gap:8px;margin:7px 0}.pension-amount strong{font-size:33px;font-weight:650;font-variant-numeric:tabular-nums;letter-spacing:-1px}.pension-amount small{font-size:11px;color:#a6b1c8}.pension-detail{display:flex;flex-direction:column;gap:12px;border-inline-start:1px solid #30394f;padding-inline-start:24px}.pension-detail>span{display:flex;justify-content:space-between;gap:10px;font-size:10px;color:#a6b1c8}.pension-detail b{font-weight:500;color:#e3e9f7;font-size:12px}.pension-note{display:flex;align-items:flex-start;gap:7px;font-size:10px;line-height:1.8;color:#a6b1c8;border-top:1px solid #262f45;padding:14px 0}.pension-note svg{flex-shrink:0;margin-top:2px}.notice{display:flex;gap:10px;color:#b1bdd4;font-size:12px;line-height:1.85;border:1px solid #30394f;padding:14px;border-radius:8px;background:#0e1421}.notice>svg{flex-shrink:0;margin-top:3px;color:#9ba9c5}.assumptions{font-size:10px;border:none;background:transparent;padding:2px 5px}.assumptions strong{color:#bac5da;font-weight:600;font-size:11px}.assumptions p{color:#95a1b9;margin-top:4px;line-height:1.9}.site-footer{border-top:1px solid #222b3e;margin-top:36px;padding:23px 0 26px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:10px;color:#95a1b9}.site-footer>span:first-child{font-weight:750;font-size:15px;color:#a6b1c8;letter-spacing:-.5px}.site-footer>span:last-child{display:flex;align-items:center;gap:5px}.muted{color:#a6b1c8}.field-error{color:#fda4af;font-size:11px;line-height:1.7;margin:7px 0}.invalid{border-color:#f43f5e}.formula-modal{padding:27px;max-width:590px;width:calc(100% - 32px);max-height:85vh;overflow:auto;border:1px solid #4a5275;border-radius:16px;background:#131826;color:#eef2fc;margin:auto;box-shadow:0 25px 100px #000a;direction:rtl}.formula-modal::backdrop{background:#050814c9;backdrop-filter:blur(5px)}.modal-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.icon-button{background:#20283b;color:#bac5da;border-radius:7px;padding:7px;display:grid;place-items:center}.formula-modal h2{font-size:23px;margin:9px 0 15px}.formula-modal p{font-size:12px;color:#b1bdd4;line-height:1.9;margin:12px 0}.formula{font-family:monospace;white-space:normal;overflow-wrap:anywhere;padding:19px 12px;background:#0b1020;border:1px solid #373e62;border-radius:9px;color:#c7d2fe;text-align:center;font-size:13px;line-height:2}.formula-values{display:flex;flex-direction:column;gap:13px;font-size:12px;padding:8px 0}.formula-values>div{display:flex;justify-content:space-between;gap:15px}.formula-values dt{color:#a6b1c8}.formula-values dd{margin:0;color:#e3e9f7}.skip-link{position:fixed;top:-80px;right:20px;padding:12px;background:#4f46e5;color:white;z-index:100;border-radius:5px}.skip-link:focus{top:10px}.confetti{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:50}.confetti i{position:absolute;top:-20px;left:var(--x);width:7px;height:11px;border-radius:2px;animation:confetti-fall 2.2s var(--delay) ease-out both}.pulse-button{animation:button-glow 2s infinite}.shake{animation:shake .4s ease-in-out}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}@keyframes draft-pulse{50%{border-color:#b48736}}@keyframes button-glow{50%{box-shadow:0 0 26px #6366f166}}@keyframes confetti-fall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translate(var(--drift),100vh) rotate(var(--rotation));opacity:0}}
@media(min-width:1450px){.workspace{grid-template-columns:390px minmax(0,1fr)}.hero-card{padding-top:28px}.hero-amount>span{font-size:66px}}
@media(max-width:1150px){.header-inner{padding:0 28px}.main-container{padding:32px 28px 0}.workspace{grid-template-columns:330px minmax(0,1fr);gap:18px}.profiles-hint{display:none}.profiles-bar{gap:14px}.profile-button{padding:10px;font-size:11px}.hero-card{padding-inline:22px}.hero-bottom{gap:10px}.hero-bottom>div+div{padding-inline-start:10px}.hero-bottom span{font-size:9px}.hero-bottom strong{font-size:18px}.pension-main{gap:14px}.pension-detail{padding-inline-start:14px}.pension-amount strong{font-size:28px}.metric-card{padding:17px}.metric-card>strong{font-size:24px}.chart-footer{flex-direction:column}.intro{gap:20px}.privacy-badge{max-width:215px}}
@media(max-width:900px){.workspace{grid-template-columns:300px minmax(0,1fr);gap:16px}.header-center{display:none}.main-container{padding-inline:20px}.header-inner{padding-inline:20px}.privacy-badge{max-width:190px;font-size:10px}.profiles-label{display:none}.profile-buttons{width:100%;justify-content:space-between}.fields-body{padding-inline:17px}.controls-header{padding-inline:17px}.calculate-dock{padding-inline:17px}.hero-bottom{grid-template-columns:1fr 1fr}.hero-bottom>div:last-child{display:none}.summary-grid{gap:10px}.metric-card{padding:14px}.metric-card>strong{font-size:21px}.metric-top{font-size:10px}.metric-top svg{display:none}.pension-main{grid-template-columns:1fr}.pension-detail{border-inline-start:0;padding-inline-start:0}.pension-card,.chart-panel{padding-inline:18px}.hero-amount>span{font-size:42px}.chart-legend{gap:10px}.chart-legend>span:last-child{display:none}.pension-amount strong{font-size:34px}}
@media(max-width:720px){.site-header{height:66px}.header-inner{padding-inline:18px}.brand{font-size:22px}.header-tag{font-size:10px}.header-tag>span{display:none}.main-container{padding:28px 16px 0}.intro{flex-direction:column;align-items:flex-start;gap:17px;margin-bottom:22px}h1{font-size:29px;max-width:450px}h1>span{display:block}.intro p{font-size:12px}.privacy-badge{max-width:none;padding:10px 12px;font-size:10px;width:100%;justify-content:center}.privacy-badge svg{width:17px}.profiles-bar{padding:12px;overflow:visible}.profile-buttons{flex-wrap:wrap;justify-content:flex-start;gap:8px}.profile-button{flex-grow:1;justify-content:center;font-size:10px;padding:10px 8px}.profile-button>svg:last-child{display:none}.workspace{grid-template-columns:1fr;gap:24px}.fields-body{padding-inline:20px}.controls-header{padding-inline:20px}.two-fields .field-heading{min-height:18px}.input-section{padding-top:20px}.numeric-field{margin-bottom:21px}.controls{overflow:visible}.calculate-dock{position:sticky;bottom:0;z-index:10;border-top:1px solid #3b4366;box-shadow:0 -8px 22px #0003}.hero-card{padding-inline:23px}.hero-amount>span{font-size:56px}.hero-bottom{grid-template-columns:1.3fr 1fr .8fr}.hero-bottom>div:last-child{display:flex}.hero-bottom strong{font-size:19px}.summary-grid{gap:12px}.metric-card{padding:17px}.metric-card>strong{font-size:25px}.metric-top{font-size:10px}.chart-panel,.pension-card{padding-inline:19px}.pension-main{grid-template-columns:1fr 1fr;gap:15px}.pension-detail{border-inline-start:1px solid #30394f;padding-inline-start:15px}.pension-amount strong{font-size:28px}.site-footer{flex-wrap:wrap;justify-content:center;text-align:center}.site-footer>span:nth-child(2){display:none}.site-footer>span:first-child{margin-inline-end:auto}.results-status{font-size:10px}.tooltip{inset-inline-end:-5px;width:210px}.tax-alert{font-size:11px}.tax-alert strong{font-size:11px}.tax-alert small{font-size:10px}}
@media(max-width:390px){.hero-amount>span{font-size:47px}.hero-bottom{gap:8px}.hero-bottom span{font-size:8px}.hero-bottom strong{font-size:17px}.hero-bottom em{display:block;margin:3px 0 0}.metric-card>strong{font-size:22px}.metric-card>small{font-size:9px}.pension-main{grid-template-columns:1fr}.pension-detail{border:0;padding:0}.chart-readout{font-size:9px;gap:8px}.two-fields .field-heading{min-height:34px}}
.dock-preview{display:none}
@media(max-width:720px){
.results{scroll-margin-top:12px}.brand{min-height:44px}.header-tag{font-size:11px}.intro p{font-size:14px;line-height:1.8}.privacy-badge{font-size:12px}.privacy-more{min-height:32px}.text-link{display:inline-flex;align-items:center;min-height:32px;font-size:13px}
.field-heading,.two-fields .field-heading{font-size:13px;min-height:24px;margin-bottom:8px}.two-fields{grid-template-columns:1fr;gap:0}
.info-button{width:44px;height:44px;margin:-12px -10px;padding:0}
.tooltip-wrap{position:static}.numeric-field,.gender-row{position:relative}.tooltip{top:36px;bottom:auto;inset-inline:0;width:auto;max-width:none;font-size:13px;pointer-events:none}.tooltip.tooltip-above{top:auto;bottom:calc(100% + 6px)}
.gender-toggle button{min-height:44px;min-width:64px;font-size:13px;padding:0 18px}
.number-control,.two-fields .number-control{height:54px;gap:6px;padding-inline:12px 4px}.number-control input,.two-fields .number-control input{font-size:16px;height:100%}.number-control .unit,.two-fields .number-control .unit{font-size:12px}.number-control button{min-width:44px;height:44px;border-radius:7px}
.range{height:44px;margin:4px 0 0;padding:20px 0;background-clip:content-box!important}.range::-webkit-slider-thumb{width:26px;height:26px}.range::-moz-range-thumb{width:18px;height:18px}.range-labels{font-size:11px}
.tax-alert,.tax-alert strong{font-size:12px}.tax-alert small{font-size:11px}
.calculate-dock{padding:12px 16px calc(12px + env(safe-area-inset-bottom))}.calculate-button{min-height:52px;font-size:15px}.calculate-dock>span{font-size:11px;margin-top:8px}
.dock-preview{display:flex;align-items:center;gap:8px;font-size:12px;color:#c3ccdd;margin-bottom:10px}.dock-preview b{margin-inline-start:auto;font-size:17px;color:#eef2fc;font-variant-numeric:tabular-nums}.dock-preview .delta{font-size:12px}
.results-status{font-size:12px}.fx-button{width:44px;height:44px}.icon-button{min-width:44px;min-height:44px}.delta{font-size:12px}
.hero-bottom{grid-template-columns:1fr 1fr;gap:12px}.hero-bottom span,.hero-bottom em{font-size:11px}.hero-bottom strong{font-size:19px}.hero-bottom>div:last-child{display:flex;grid-column:1/-1;flex-direction:row;justify-content:space-between;align-items:baseline;border-inline-start:0;padding-inline-start:0;border-top:1px solid #40496982;padding-top:12px}
.metric-top{font-size:12px}.metric-card>small{font-size:11px}.chart-panel .eyebrow{font-size:11px}.chart-legend,.chart-readout{font-size:12px}.chart-footer{font-size:11px}.capital-chart{touch-action:pan-y}.svg-label{font-size:13px}
.pension-detail>span,.pension-note{font-size:12px}.section-index,.phase-badge,.estimate-badge,.pension-title .eyebrow{font-size:11px}.notice p{font-size:12px}.site-footer{font-size:12px}.site-footer nav a{display:inline-flex;align-items:center;min-height:44px;padding-inline:8px}
}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.confetti{display:none}}
`;
