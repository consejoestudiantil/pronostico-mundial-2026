// js/16avos.js
document.addEventListener('DOMContentLoaded', () => {
    if (Object.keys(AppState.scores).length === 0) {
        window.location.href = 'grupos.html';
        return;
    }

    let S = {
        scores: AppState.scores,
        tiebreaks: AppState.tiebreaks,
        thirdsManual: AppState.thirdsManual,
        r16: AppState.r16 || {}
    };

    const banderas = {
        "México": "mx", "Sudáfrica": "za", "Corea del Sur": "kr", "República Checa": "cz", "Rep. Checa": "cz",
        "Cánada": "ca", "Canadá": "ca", "Bosnia y Herz.": "ba", "Catar": "qa", "Suiza": "ch",
        "Haití": "ht", "Escocia": "gb-sct", "Marruecos": "ma", "Brasil": "br",
        "Australia": "au", "EEUU": "us", "Paraguay": "py", "Turquía": "tr",
        "Alemania": "de", "Costa de Marfil": "ci", "Curasao": "cw", "Curazao": "cw", "Ecuador": "ec",
        "Japón": "jp", "Países Bajos": "nl", "Paises Bajos": "nl", "Suecia": "se", "Túnez": "tn",
        "Bélgica": "be", "Egipto": "eg", "Irán": "ir", "Nueva Zelanda": "nz",
        "Cabo Verde": "cv", "España": "es", "Arabia Saudí": "sa", "Uruguay": "uy",
        "Irak": "iq", "Francia": "fr", "Senegal": "sn", "Noruega": "no",
        "Jordania": "jo", "Argelia": "dz", "Austria": "at",
        "Colombia": "co", "Congo Dem.": "cd", "Portugal": "pt", "Uzbekistán": "uz",
        "Croacia": "hr", "Inglaterra": "gb-eng", "Panamá": "pa", "Ghana": "gh",
        "Argentina": "ar"
    };

    function getBandera(equipo) {
        if (!equipo || equipo === '?') return '';
        const codigo = banderas[equipo];
        if (codigo) {
            return `<img src="https://flagcdn.com/20x15/${codigo}.png" class="team-flag" alt="${equipo}">`;
        }
        return '⚽ ';
    }

    function mostrarNotificacion(mensaje, tipo = 'error') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = mensaje;
        toast.className = 'toast on ' + (tipo === 'success' ? 'success' : '');
        setTimeout(() => toast.classList.remove('on'), 3000);
    }

    function calcSt(g) {
        const gd = GD[g], stats = {};
        gd.t.forEach(t => stats[t] = { pts: 0, w: 0, d: 0, l: 0, gf: 0, gc: 0 });
        gd.m.forEach((m, i) => {
            const sc = S.scores[g] && S.scores[g][i];
            if (!sc || sc.h === '' || sc.a === '') return;
            const h = parseInt(sc.h), a = parseInt(sc.a);
            stats[m[0]].gf += h; stats[m[0]].gc += a;
            stats[m[1]].gf += a; stats[m[1]].gc += h;
            if (h > a) { stats[m[0]].pts += 3; stats[m[0]].w++; stats[m[1]].l++; }
            else if (h < a) { stats[m[1]].pts += 3; stats[m[1]].w++; stats[m[0]].l++; }
            else { stats[m[0]].pts++; stats[m[0]].d++; stats[m[1]].pts++; stats[m[1]].d++; }
        });
        let t = Object.entries(stats).map(([name, s]) => ({ name, ...s, dif: s.gf - s.gc }));
        t.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || a.name.localeCompare(b.name));
        const tb = S.tiebreaks[g] || {};
        const sortedPos = Object.keys(tb).sort((a, b) => parseInt(a) - parseInt(b));
        sortedPos.forEach(pos => {
            const w = tb[pos]; const p = parseInt(pos);
            const wi = t.findIndex(x => x.name === w);
            if (wi >= 0 && wi !== p) { const [it] = t.splice(wi, 1); t.splice(p, 0, it); }
        });
        return t;
    }

    function getPos(g, p) {
        const t = calcSt(g);
        return t[p] ? t[p].name : '?';
    }

    function calcThirds() {
        const all = Object.keys(GD).map(g => {
            const t = calcSt(g)[2];
            return t ? { g, name: t.name, pts: t.pts, gf: t.gf, gc: t.gc, dif: t.dif } : { g, name: '?', pts: 0, gf: 0, gc: 0, dif: 0 };
        });
        all.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || a.g.localeCompare(b.g));
        return all;
    }

    function getTop8() {
        const thirds = calcThirds();
        if (S.thirdsManual) {
            const mi = thirds.findIndex(t => t.name === S.thirdsManual);
            if (mi === 8) { const [it] = thirds.splice(mi, 1); thirds.splice(7, 0, it); }
        }
        const top8 = thirds.slice(0, 8);
        const key = top8.map(t => t.g).sort().join('');
        return { top8, key };
    }

    function getThird(slot) {
        const { top8, key } = getTop8();
        const asgn = TBL495[key];
        if (!asgn) return '?';
        const THIRD_HOSTS = ['A','B','D','E','G','I','K','L'];
        const idx = THIRD_HOSTS.indexOf(slot);
        if (idx < 0) return '?';
        const tg = asgn[idx][1];
        const t = top8.find(x => x.g === tg);
        return t ? t.name : '?';
    }

    function r16h(m) { return getPos(m.home.g, m.home.p); }
    function r16a(m) { return m.away === '3rd' ? getThird(m.slot) : getPos(m.away.g, m.away.p); }

    function renderR16() {
        const c = document.getElementById('r16-area');
        c.innerHTML = '';
        
        [...R16].sort((a, b) => a.num - b.num).forEach(m => {
            const h = r16h(m);
            const a = r16a(m);
            let cur2 = S.r16[m.id] || '';
            const teams = [h, a].filter(t => t && t !== '?');
            
            if (cur2 !== '' && !teams.includes(cur2)) {
                cur2 = ''; S.r16[m.id] = ''; AppState.r16 = S.r16;
                localStorage.setItem('pronostico_r16', JSON.stringify(S.r16));
            }
            
            const opts = `<option value="">— Ganador —</option>` + 
                         teams.map(t => `<option value="${t}" ${cur2 === t ? 'selected' : ''}>${t}</option>`).join('');
            
            c.innerHTML += `<div class="kmatch">
                <div class="kteams">
                    <div style="margin-bottom:6px; display:flex; align-items:center;">
                        <strong>${getBandera(h)} ${h}</strong>
                    </div>
                    <div style="margin-bottom:6px; display:flex; align-items:center;">
                        <span style="color:var(--mt); font-size:11px; margin-right:8px; font-weight:700;">VS</span> 
                        <strong>${getBandera(a)} ${a}</strong>
                    </div>
                    <div class="ksub" style="display:flex; align-items:center; margin-top:8px;">
                        <span class="kpnum">P${m.num}</span> <span>${m.label} · 📍${m.venue}</span>
                    </div>
                </div>
                <select class="ksel" data-id="${m.id}">${opts}</select>
            </div>`;
        });

        document.querySelectorAll('.ksel').forEach(select => {
            select.addEventListener('change', (e) => {
                const matchId = e.target.getAttribute('data-id');
                S.r16[matchId] = e.target.value;
                AppState.r16 = S.r16;
                localStorage.setItem('pronostico_r16', JSON.stringify(S.r16));
                validarAvance();
            });
        });
        validarAvance();
    }

    function validarAvance() {
        const seleccionados = Object.values(S.r16).filter(val => val !== '').length;
        if (seleccionados === 16) {
            document.getElementById('nav-octavos').classList.remove('locked');
        } else {
            document.getElementById('nav-octavos').classList.add('locked');
        }
    }

    renderR16();

    document.getElementById('btn-siguiente').addEventListener('click', () => {
        const seleccionados = Object.values(S.r16).filter(val => val !== '').length;
        if (16 - seleccionados > 0) {
            mostrarNotificacion(`⚠️ Te falta seleccionar el ganador en ${16 - seleccionados} partido(s).`);
            return;
        }
        window.location.href = 'octavos.html';
    });
});