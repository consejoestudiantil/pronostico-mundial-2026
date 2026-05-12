// js/grupos.js
document.addEventListener('DOMContentLoaded', () => {
    if (!AppState.datos.ci || !AppState.datos.nombre) {
        window.location.href = '../index.html';
        return;
    }

    let S = {
        scores: AppState.scores || {},
        tiebreaks: AppState.tiebreaks || {}
    };

    // --- DICCIONARIO DE BANDERAS DEFINITIVO ---
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

    function renderGroups() {
        const c = document.getElementById('groups-area');
        c.innerHTML = '';
        Object.entries(GD).forEach(([gk, gv]) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.id = 'gc-' + gk;
            let mh = '';
            gv.m.forEach((m, i) => {
                const sc = S.scores[gk] && S.scores[gk][i];
                mh += `<div class="mrow">
                    <div class="mteam r">${m[0]} ${getBandera(m[0])}</div>
                    <div class="mscores">
                        <input type="text" inputmode="numeric" maxlength="2" class="si" value="${sc ? sc.h : ''}" placeholder="-" data-g="${gk}" data-i="${i}" data-side="h">
                        <span class="msep">-</span>
                        <input type="text" inputmode="numeric" maxlength="2" class="si" value="${sc ? sc.a : ''}" placeholder="-" data-g="${gk}" data-i="${i}" data-side="a">
                    </div>
                    <div class="mteam l">${getBandera(m[1])} ${m[1]}</div>
                </div>`;
            });
            div.innerHTML = `<div class="card-hd"><div class="card-title">GRUPO ${gk}</div><div class="card-sub">${gv.t.join(' · ')}</div></div>
            <div class="card-body">${mh}<div id="st-${gk}" style="margin-top:.35rem"></div></div>`;
            c.appendChild(div);
            renderSt(gk);
        });

        document.querySelectorAll('.si').forEach(input => {
            input.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length > 2) val = val.substring(0, 2);
                e.target.value = val;

                const g = e.target.getAttribute('data-g');
                const i = e.target.getAttribute('data-i');
                const side = e.target.getAttribute('data-side');
                setSc(g, i, side, val);
            });
        });
    }

    function setSc(g, i, side, v) {
        if (!S.scores[g]) S.scores[g] = {};
        if (!S.scores[g][i]) S.scores[g][i] = { h: '', a: '' };
        S.scores[g][i][side] = v;
        
        // Borramos los desempates si se modifica un número
        if (S.tiebreaks[g]) delete S.tiebreaks[g];

        renderSt(g);
        updateGP();
        AppState.guardarMarcadores(S.scores, S.tiebreaks);
    }

    window.setTie = function(g, pos, w) {
        if (!S.tiebreaks[g]) S.tiebreaks[g] = {};
        
        // Evitar que el mismo equipo esté seleccionado en dos posiciones
        Object.keys(S.tiebreaks[g]).forEach(k => {
            if (S.tiebreaks[g][k] === w) delete S.tiebreaks[g][k];
        });
        
        S.tiebreaks[g][pos] = w;
        renderSt(g);
        AppState.guardarMarcadores(S.scores, S.tiebreaks);
    };

    function calcStRaw(g) {
        const gd = GD[g], stats = {};
        gd.t.forEach(t => stats[t] = { pts: 0, w: 0, d: 0, l: 0, gf: 0, gc: 0 });
        gd.m.forEach((m, i) => {
            const sc = S.scores[g] && S.scores[g][i];
            if (!sc || sc.h === '' || sc.a === '') return;
            const h = parseInt(sc.h), a = parseInt(sc.a);
            if (isNaN(h) || isNaN(a)) return;
            stats[m[0]].gf += h; stats[m[0]].gc += a;
            stats[m[1]].gf += a; stats[m[1]].gc += h;
            if (h > a) { stats[m[0]].pts += 3; stats[m[0]].w++; stats[m[1]].l++; }
            else if (h < a) { stats[m[1]].pts += 3; stats[m[1]].w++; stats[m[0]].l++; }
            else { stats[m[0]].pts++; stats[m[0]].d++; stats[m[1]].pts++; stats[m[1]].d++; }
        });
        let t = Object.entries(stats).map(([name, s]) => ({ name, ...s, dif: s.gf - s.gc }));
        t.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || a.name.localeCompare(b.name));
        return t;
    }

    function calcSt(g) {
        let t = calcStRaw(g);
        const tb = S.tiebreaks[g] || {};
        const sortedPos = Object.keys(tb).sort((a, b) => parseInt(a) - parseInt(b));
        sortedPos.forEach(pos => {
            const w = tb[pos];
            const p = parseInt(pos);
            const wi = t.findIndex(x => x.name === w);
            if (wi >= 0 && wi !== p) {
                const [it] = t.splice(wi, 1);
                t.splice(p, 0, it);
            }
        });
        return t;
    }

    function renderSt(g) {
        const c = document.getElementById('st-' + g);
        if (!c) return;
        
        const rawT = calcStRaw(g); 
        const st = calcSt(g);      
        
        let h = `<table class="stbl"><thead><tr><th>Equipo</th><th>Pts</th><th>W</th><th>E</th><th>L</th><th>GF</th><th>GC</th><th>DIF</th></tr></thead><tbody>`;
        st.forEach((t, i) => {
            const cls = i === 0 ? 'q1' : i === 1 ? 'q2' : i === 2 ? 'q3' : '';
            h += `<tr class="${cls}"><td>${i + 1}° ${getBandera(t.name)} ${t.name}</td><td><strong>${t.pts}</strong></td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf}</td><td>${t.gc}</td><td style="color:${t.dif >= 0 ? 'var(--grn)' : 'var(--red)'}">${t.dif >= 0 ? '+' : ''}${t.dif}</td></tr>`;
        });
        h += `</tbody></table>`;
        
        // --- AQUÍ REGRESAN TUS 3 RECUADROS CON LA NUEVA LÓGICA DE 4/3/2 ---
        let assignedTeams = [];

        for (let pos = 0; pos < 3; pos++) {
            let tiedTeams = [];
            // Buscar cuántos equipos tienen las mismas estadísticas que el equipo en 'pos'
            for (let j = 0; j < 4; j++) {
                if (rawT[j].pts === rawT[pos].pts && rawT[j].dif === rawT[pos].dif && rawT[j].gf === rawT[pos].gf) {
                    tiedTeams.push(rawT[j].name);
                }
            }

            // Si hay un empate en esta posición...
            if (tiedTeams.length > 1) {
                // Filtramos los equipos que ya ganaron un recuadro de arriba
                let available = tiedTeams.filter(t => !assignedTeams.includes(t));
                let curSelected = S.tiebreaks[g] && S.tiebreaks[g][pos];

                // Si queda más de un equipo para elegir en este recuadro, lo mostramos
                if (available.length > 1) {
                    h += `<div class="tie-box">
                        <div class="tie-title">⚠️ Empate Múltiple — ¿Qué equipo ocupa el ${pos + 1}° puesto?</div>
                        <div class="tie-opts">`;
                    
                    available.forEach(tName => {
                        let isSel = (curSelected === tName);
                        h += `<button class="tie-btn ${isSel ? 'sel' : ''}" onclick="window.setTie('${g}',${pos},'${tName}')">${getBandera(tName)} ${tName}</button>`;
                    });
                    
                    h += `</div></div>`;
                }

                // Guardar en la memoria quién fue el elegido para que no aparezca en el siguiente recuadro
                if (curSelected && available.includes(curSelected)) {
                    assignedTeams.push(curSelected);
                } else if (available.length === 1) {
                    // Si por descarte ya solo queda 1, se asigna automáticamente
                    assignedTeams.push(available[0]);
                }
            }
        }
        
        c.innerHTML = h;
    }

    // --- FUNCIONES PARA VERIFICAR QUE TODO ESTÉ LLENO ---
    function hasPendingTies(g) {
        const rawT = calcStRaw(g);
        let assignedTeams = [];
        for (let pos = 0; pos < 3; pos++) {
            let tiedTeams = [];
            for (let j = 0; j < 4; j++) {
                if (rawT[j].pts === rawT[pos].pts && rawT[j].dif === rawT[pos].dif && rawT[j].gf === rawT[pos].gf) {
                    tiedTeams.push(rawT[j].name);
                }
            }
            if (tiedTeams.length > 1) {
                let available = tiedTeams.filter(t => !assignedTeams.includes(t));
                let curSelected = S.tiebreaks[g] && S.tiebreaks[g][pos];
                
                if (available.length > 1) {
                    if (!curSelected || !available.includes(curSelected)) {
                        return true; // Hay un empate sin resolver
                    }
                }
                if (curSelected && available.includes(curSelected)) {
                    assignedTeams.push(curSelected);
                }
            }
        }
        return false;
    }

    function updateGP() {
        const done = Object.keys(GD).filter(g => {
            const matchesDone = GD[g].m.every((m, i) => S.scores[g] && S.scores[g][i] && S.scores[g][i].h !== '' && S.scores[g][i].a !== '');
            return matchesDone && !hasPendingTies(g);
        }).length;
        
        document.getElementById('gp-cnt').textContent = done + '/12';
        document.getElementById('gp-bar').style.width = (done / 12 * 100) + '%';
        
        if (done === 12) {
            document.getElementById('nav-terceros').classList.remove('locked');
        } else {
            document.getElementById('nav-terceros').classList.add('locked');
        }
    }

    renderGroups();
    updateGP();

    document.getElementById('btn-siguiente').addEventListener('click', () => {
        const miss = Object.keys(GD).filter(g => !GD[g].m.every((m, i) => S.scores[g] && S.scores[g][i] && S.scores[g][i].h !== '' && S.scores[g][i].a !== ''));
        if (miss.length) {
            mostrarNotificacion('⚠️ Faltan marcadores en los grupos: ' + miss.join(', '));
            return;
        }

        let empatesSinResolver = Object.keys(GD).filter(g => hasPendingTies(g));

        if (empatesSinResolver.length > 0) {
            mostrarNotificacion('⚠️ Resuelve los empates en los grupos: ' + empatesSinResolver.join(', '));
            return;
        }
        
        AppState.guardarMarcadores(S.scores, S.tiebreaks);
        window.location.href = 'terceros.html';
    });
});