const SUPABASE_URL = "https://kmkjuuytbgpozrigspgw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta2p1dXl0Ymdwb3pyaWdzcGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDQ2NTksImV4cCI6MjA4MDE4MDY1OX0.N0rlup6UV1rOlFlMPfIn-Y72S2O1hs2PGsIHSPTXl-I";
const PAID_LEAVES = 1;
const PT_TAX = 200;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];



// 👇 THIS is important
async function loadData() {
    const cached = cache.get('leaves');

    if (cached && (Date.now() - cached.t) / 60000 < 30) {
        allLeaves = cached.v;
        const sc = cache.get('configs');
        if (sc) monthConfigs = sc.v || {};

        document.getElementById('loadingMsg').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('cacheStatus').textContent =
            'cached · ' + Math.round((Date.now() - cached.t) / 60000) + 'm ago';

        renderAll();
        return;
    }

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/leaves?select=date,type&order=date.asc`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!res.ok) throw new Error("Status " + res.status);

        const data = await res.json();

        console.log("Fetched:", data);

        allLeaves = data;
        cache.set('leaves', allLeaves);

        const sc = cache.get('configs');
        if (sc) monthConfigs = sc.v || {};

        document.getElementById('loadingMsg').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('cacheStatus').textContent = 'live · just now';

        renderAll();

    } catch (e) {
        console.error(e);
    }
}



let allLeaves = [], monthConfigs = {}, activeMonth = null, leaveChart, salaryChart;

const cache = {
    set(k, v) { try { localStorage.setItem('lsd_' + k, JSON.stringify({ v, t: Date.now() })); } catch (e) { } },
    get(k) { try { return JSON.parse(localStorage.getItem('lsd_' + k) || 'null'); } catch (e) { return null; } }
};

function countSatSun(year, month) {
    let count = 0, days = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= days; d++) { const day = new Date(year, month, d).getDay(); if (day === 0 || day === 6) count++; }
    return count;
}

function calcForMonth(key, leaves, salary, extraHolidays) {
    const [y, m] = key.split('-').map(Number);
    const totalDays = new Date(y, m, 0).getDate();
    const weekendDays = countSatSun(y, m - 1);
    const workingDays = totalDays - weekendDays - extraHolidays;
    const fullLeaves = leaves.filter(l => l.type === 'full').length;
    const halfLeaves = leaves.filter(l => l.type === 'half').length;
    const totalLeaveDays = fullLeaves + halfLeaves * 0.5;
    const billableLeave = Math.max(0, totalLeaveDays - PAID_LEAVES);
    const perDay = salary > 0 ? salary / workingDays : 0;
    const deduction = parseFloat((billableLeave * perDay).toFixed(2));
    const netSalary = parseFloat((salary - deduction - PT_TAX).toFixed(2));
    return {
        totalDays, weekendDays, workingDays, extraHolidays, fullLeaves, halfLeaves,
        totalLeaveDays, paidLeave: PAID_LEAVES, billableLeave, perDay, deduction, ptTax: PT_TAX, salary, netSalary
    };
}

function groupByMonthKey(data) {
    const map = {};
    data.forEach(r => {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!map[key]) map[key] = [];
        map[key].push(r);
    });
    return map;
}

function renderMonthTabs(monthKeys) {
    const el = document.getElementById('monthTabs');
    el.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'tab' + (activeMonth === null ? ' active' : '');
    allBtn.textContent = 'All months';
    allBtn.onclick = () => { activeMonth = null; renderAll(); };
    el.appendChild(allBtn);
    monthKeys.forEach(k => {
        const [y, m] = k.split('-').map(Number);
        const btn = document.createElement('button');
        btn.className = 'tab' + (activeMonth === k ? ' active' : '');
        btn.textContent = `${MONTH_NAMES[m - 1]} ${y}`;
        btn.onclick = () => { activeMonth = k; renderAll(); };
        el.appendChild(btn);
    });
}

function renderMetrics(calc) {
    const el = document.getElementById('metricsRow');
    if (!calc) { el.innerHTML = `<div class="metric"><div class="lbl">Tip</div><div class="val" style="font-size:13px;color:var(--text2)">Select a month above to see salary breakdown</div></div>`; return; }
    el.innerHTML = `
    <div class="metric"><div class="lbl">Working days</div><div class="val">${calc.workingDays}</div><div class="sub">${calc.totalDays}d − ${calc.weekendDays} wknd − ${calc.extraHolidays} holiday</div></div>
    <div class="metric amber"><div class="lbl">Leaves taken</div><div class="val">${calc.totalLeaveDays}</div><div class="sub">${calc.fullLeaves} full + ${calc.halfLeaves} half day</div></div>
    <div class="metric"><div class="lbl">Billable leave</div><div class="val">${calc.billableLeave.toFixed(1)}</div><div class="sub">${calc.totalLeaveDays} taken − ${calc.paidLeave} paid</div></div>
    <div class="metric red"><div class="lbl">Deduction</div><div class="val">₹${Math.round(calc.deduction).toLocaleString('en-IN')}</div><div class="sub">+ ₹${calc.ptTax} PT tax</div></div>
    <div class="metric green"><div class="lbl">Net salary</div><div class="val">₹${Math.round(calc.netSalary).toLocaleString('en-IN')}</div><div class="sub">after all deductions</div></div>
  `;
}

function renderBreakdown(calc, key) {
    const wrap = document.getElementById('breakdownWrap');
    if (!calc) { wrap.innerHTML = ''; return; }
    const [y, m] = key.split('-').map(Number);
    wrap.innerHTML = `
    <div class="breakdown">
      <div class="breakdown-header">Salary breakdown — ${FULL_MONTH_NAMES[m - 1]} ${y}</div>
      <div class="brow"><span class="bl">Gross salary</span><span class="br">₹${calc.salary.toLocaleString('en-IN')}</span></div>
      <div class="brow"><span class="bl">Working days</span><span class="br">${calc.workingDays} days</span></div>
      <div class="brow"><span class="bl">Per day rate</span><span class="br">${calc.salary > 0 ? '₹' + calc.perDay.toFixed(2) : '—'}</span></div>
      <div class="brow"><span class="bl">Total leaves taken</span><span class="br">${calc.totalLeaveDays} days (${calc.fullLeaves} full + ${calc.halfLeaves} half)</span></div>
      <div class="brow"><span class="bl">Paid leave adjustment</span><span class="br">− ${calc.paidLeave} day</span></div>
      <div class="brow"><span class="bl">Billable leave days</span><span class="br">${calc.billableLeave.toFixed(1)} days</span></div>
      <div class="brow deduct"><span class="bl">Leave deduction</span><span class="br">− ₹${Math.round(calc.deduction).toLocaleString('en-IN')}</span></div>
      <div class="brow deduct"><span class="bl">Professional tax</span><span class="br">− ₹${calc.ptTax}</span></div>
      <div class="brow net"><span class="bl">Net salary received</span><span class="br">₹${Math.round(calc.netSalary).toLocaleString('en-IN')}</span></div>
    </div>
  `;
}

function renderCharts(grouped, monthKeys) {
    const labels = monthKeys.map(k => { const [y, m] = k.split('-').map(Number); return `${MONTH_NAMES[m - 1]} ${y}`; });
    const fulls = monthKeys.map(k => (grouped[k] || []).filter(l => l.type === 'full').length);
    const halfs = monthKeys.map(k => (grouped[k] || []).filter(l => l.type === 'half').length);
    const deductions = monthKeys.map(k => { const cfg = monthConfigs[k] || { salary: 0, holidays: 0 }; return Math.round(calcForMonth(k, grouped[k] || [], cfg.salary, cfg.holidays).deduction + PT_TAX); });
    const nets = monthKeys.map(k => { const cfg = monthConfigs[k] || { salary: 0, holidays: 0 }; return Math.round(calcForMonth(k, grouped[k] || [], cfg.salary, cfg.holidays).netSalary); });

    const gc = 'rgba(255,255,255,0.05)', tc = '#4a4f5e';

    if (leaveChart) leaveChart.destroy();
    leaveChart = new Chart(document.getElementById('leaveChart'), {
        type: 'bar', data: { labels, datasets: [{ label: 'Full', data: fulls, backgroundColor: '#4f8ef7', borderRadius: 4 }, { label: 'Half', data: halfs, backgroundColor: '#f5a623', borderRadius: 4 }] },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: tc, font: { size: 10, family: 'DM Mono' }, autoSkip: false, maxRotation: 45 }, grid: { color: gc }, border: { color: 'transparent' } },
                y: { beginAtZero: true, ticks: { color: tc, stepSize: 1, font: { family: 'DM Mono', size: 10 } }, grid: { color: gc }, border: { color: 'transparent' } }
            }
        }
    });

    if (salaryChart) salaryChart.destroy();
    salaryChart = new Chart(document.getElementById('salaryChart'), {
        type: 'bar', data: { labels, datasets: [{ label: 'Deduction', data: deductions, backgroundColor: '#f05a5a', borderRadius: 4 }, { label: 'Net', data: nets, backgroundColor: '#22c87a', borderRadius: 4 }] },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: tc, font: { size: 10, family: 'DM Mono' }, autoSkip: false, maxRotation: 45 }, grid: { color: gc }, border: { color: 'transparent' } },
                y: { beginAtZero: true, ticks: { color: tc, font: { family: 'DM Mono', size: 10 }, callback: v => '₹' + Math.round(v / 1000) + 'k' }, grid: { color: gc }, border: { color: 'transparent' } }
            }
        }
    });
}

function renderAll() {
    const grouped = groupByMonthKey(allLeaves);
    const monthKeys = Object.keys(grouped).sort();
    renderMonthTabs(monthKeys);
    const salaryEl = document.getElementById('salaryInput');
    const holidaysEl = document.getElementById('holidaysInput');

    if (activeMonth) {
        const saved = monthConfigs[activeMonth] || {};
        salaryEl.value = saved.salary || '';
        holidaysEl.value = saved.holidays || 0;
        const onChange = () => {
            monthConfigs[activeMonth] = { salary: parseFloat(salaryEl.value) || 0, holidays: parseInt(holidaysEl.value) || 0 };
            cache.set('configs', monthConfigs);
            const c = calcForMonth(activeMonth, grouped[activeMonth] || [], monthConfigs[activeMonth].salary, monthConfigs[activeMonth].holidays);
            renderMetrics(c); renderBreakdown(c, activeMonth); renderCharts(grouped, monthKeys);
        };
        salaryEl.oninput = onChange; holidaysEl.oninput = onChange;
        const cfg = monthConfigs[activeMonth] || { salary: 0, holidays: 0 };
        const c = calcForMonth(activeMonth, grouped[activeMonth] || [], cfg.salary, cfg.holidays);
        renderMetrics(c); renderBreakdown(c, activeMonth);
    } else {
        salaryEl.value = ''; holidaysEl.value = 0;
        salaryEl.oninput = holidaysEl.oninput = () => { };
        renderMetrics(null); renderBreakdown(null, null);
    }
    renderCharts(grouped, monthKeys);
}


loadData();