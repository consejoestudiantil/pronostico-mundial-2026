// js/resumen.js - VERSIÓN DEFINITIVA (PAGO EN INICIO)
document.addEventListener('DOMContentLoaded', () => {
    if (!AppState.champ || AppState.champ === '') {
        window.location.href = 'final.html';
        return;
    }

    let S = {
        datos: AppState.datos, 
        pago: AppState.pago, // Extraemos el pago de la memoria
        scores: AppState.scores, tiebreaks: AppState.tiebreaks,
        thirdsManual: AppState.thirdsManual, r16: AppState.r16, r8: AppState.r8,
        r4: AppState.r4, rsf: AppState.rsf, r3rd: AppState.r3rd, rfinal: AppState.rfinal, champ: AppState.champ
    };

    const banderas = {
        "méxico": "mx", "sudáfrica": "za", "corea del sur": "kr", "república checa": "cz", "rep. checa": "cz",
        "cánada": "ca", "canadá": "ca", "bosnia y herz.": "ba", "catar": "qa", "suiza": "ch",
        "haití": "ht", "escocia": "gb-sct", "marruecos": "ma", "brasil": "br",
        "australia": "au", "eeuu": "us", "paraguay": "py", "turquía": "tr",
        "alemania": "de", "costa de marfil": "ci", "curasao": "cw", "curazao": "cw", "ecuador": "ec",
        "japón": "jp", "países bajos": "nl", "paises bajos": "nl", "suecia": "se", "túnez": "tn",
        "bélgica": "be", "egipto": "eg", "irán": "ir", "nueva zelanda": "nz",
        "cabo verde": "cv", "españa": "es", "arabia saudí": "sa", "uruguay": "uy",
        "irak": "iq", "francia": "fr", "senegal": "sn", "noruega": "no",
        "jordania": "jo", "argelia": "dz", "austria": "at",
        "colombia": "co", "congo dem.": "cd", "portugal": "pt", "uzbekistán": "uz",
        "croacia": "hr", "inglaterra": "gb-eng", "panamá": "pa", "ghana": "gh",
        "argentina": "ar"
    };

    function getBandera(equipo) {
        if (!equipo || equipo === '?') return '';
        const name = equipo.trim().toLowerCase();
        const codigo = banderas[name];
        if (codigo) return `<img src="https://flagcdn.com/20x15/${codigo}.png" class="team-flag" alt="${equipo}">`;
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
        Object.keys(tb).sort().forEach(pos => {
            const w = tb[pos]; const p = parseInt(pos);
            const wi = t.findIndex(x => x.name === w);
            if (wi >= 0 && wi !== p) { const [it] = t.splice(wi, 1); t.splice(p, 0, it); }
        });
        return t;
    }

    function getTop8() {
        const thirds = Object.keys(GD).map(g => {
            const t = calcSt(g)[2];
            return t ? { g, name: t.name, pts: t.pts, gf: t.gf, gc: t.gc, dif: t.dif } : { g, name: '?', pts: 0, gf: 0, gc: 0, dif: 0 };
        });
        thirds.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || a.g.localeCompare(b.g));
        if (S.thirdsManual) {
            const mi = thirds.findIndex(t => t.name === S.thirdsManual);
            if (mi === 8) { const [it] = thirds.splice(mi, 1); thirds.splice(7, 0, it); }
        }
        return thirds.slice(0, 8);
    }

    function getLoser(matchId, winner, roundData, originalArray) {
        const match = originalArray.find(m => m.id === matchId);
        if (!match) return '?';
        const teamA = roundData[match.a] || '?';
        const teamB = roundData[match.b] || '?';
        return winner === teamA ? teamB : teamA;
    }

    function renderResumen() {
        document.getElementById('res-user').innerHTML = `
            <div class="user-avatar">👤</div>
            <div class="user-info">
                <div class="user-name">${S.datos.nombre}</div>
                <div class="user-details">
                    <span><strong>Cédula:</strong> ${S.datos.ci}</span>
                    <span><strong>📱</strong> ${S.datos.whatsapp}</span>
                    <span><strong>✉️</strong> ${S.datos.email || 'N/A'}</span>
                </div>
            </div>`;

        const w101 = S.rsf['p101']; const w102 = S.rsf['p102'];
        const runnerUp = S.champ === w101 ? w102 : w101;
        const l101 = getLoser('p101', w101, S.r4, RSF);
        const l102 = getLoser('p102', w102, S.r4, RSF);
        const fourthPlace = S.r3rd === l101 ? l102 : l101;

        document.getElementById('res-podium').innerHTML = `
            <div class="p-box gold"><div class="p-medal">🏆</div><div class="p-title">Campeón</div><div class="p-team">${getBandera(S.champ)} <span>${S.champ}</span></div></div>
            <div class="p-box silver"><div class="p-medal">🥈</div><div class="p-title">Subcampeón</div><div class="p-team">${getBandera(runnerUp)} <span>${runnerUp}</span></div></div>
            <div class="p-box bronze"><div class="p-medal">🥉</div><div class="p-title">3er Puesto</div><div class="p-team">${getBandera(S.r3rd)} <span>${S.r3rd}</span></div></div>
            <div class="p-box"><div class="p-medal">🎖️</div><div class="p-title">4to Puesto</div><div class="p-team">${getBandera(fourthPlace)} <span>${fourthPlace}</span></div></div>`;

        const top8 = getTop8();
        document.getElementById('res-thirds').innerHTML = `<div class="thirds-grid">` + top8.map((t, i) => `
            <div class="third-item"><span class="t-num">${i+1}°</span><span class="t-team">${getBandera(t.name)} ${t.name}</span><span class="t-pts">${t.pts} pts</span></div>
        `).join('') + `</div>`;

        let gHTML = '';
        Object.keys(GD).forEach(gk => {
            const st = calcSt(gk);
            gHTML += `<div class="grp-box"><div class="grp-name">GRUPO ${gk}</div>
                <div class="grp-pos"><div class="g-badge b1">1</div> ${getBandera(st[0].name)} <strong>${st[0].name}</strong></div>
                <div class="grp-pos"><div class="g-badge b2">2</div> ${getBandera(st[1].name)} <strong>${st[1].name}</strong></div>
                <div class="grp-pos"><div class="g-badge b3">3</div> ${getBandera(st[2].name)} <strong>${st[2].name}</strong></div>
            </div>`;
        });
        document.getElementById('res-groups').innerHTML = gHTML;
    }

    renderResumen();

    const btnRegresar = document.getElementById('btn-regresar');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'final.html';
        });
    }

    // --- PROCESO DE ENVÍO FINAL AL EXCEL ---
    document.getElementById('btn-enviar').addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Verificamos que el pago exista en memoria
        if (!S.pago || !S.pago.fileBase64) {
            mostrarNotificacion('⚠️ Faltan datos de pago. Por favor, regresa al inicio para adjuntar tu comprobante.');
            return;
        }

        let row = [S.datos.nombre, S.datos.ci]; 

        // 1. Grupos
        Object.keys(GD).forEach(g => {
            GD[g].m.forEach((m, i) => {
                let sc = S.scores[g] && S.scores[g][i];
                row.push(sc ? `'${sc.h}–${sc.a}` : '');
            });
        });

        // 2. Posiciones Grupos (SOLO 1ro y 2do)
        Object.keys(GD).forEach(g => {
            let st = calcSt(g);
            row.push(st[0].name, st[1].name); 
        });

        // 3. Mejores Terceros
        const top8 = getTop8();
        top8.forEach(t => row.push(t.name));

        // 4. Lógica de 16avos
        const key = top8.map(t => t.g).sort().join('');
        const mappingTerceros = TBL495[key]; 
        const slotsOrdenados = ['A', 'B', 'D', 'E', 'G', 'I', 'K', 'L'];

        let enfrentamientos16 = [];
        R16.forEach(m => {
            let tA = "?", tB = "?";
            if (m.home && m.home.g) {
                let st = calcSt(m.home.g);
                if(st[m.home.p]) tA = st[m.home.p].name;
            }
            if (m.away && m.away.g) {
                let st = calcSt(m.away.g);
                if(st[m.away.p]) tB = st[m.away.p].name;
            } else if (m.away === '3rd') {
                if (mappingTerceros) {
                    const slotIndex = slotsOrdenados.indexOf(m.slot);
                    if (slotIndex !== -1 && mappingTerceros[slotIndex]) {
                        const grupoTercero = mappingTerceros[slotIndex].replace('3', '');
                        let st = calcSt(grupoTercero);
                        if(st[2]) tB = st[2].name;
                    }
                }
            }
            enfrentamientos16.push(`${tA}–${tB}`);
        });

        // Agrupación 16avos: Enfrentamientos -> Clasificados
        enfrentamientos16.forEach(enf => row.push(enf));
        R16.forEach(m => row.push(S.r16[m.id] || ''));

        // Agrupación Octavos
        R8.forEach(m => {
            let tA = S.r16[m.a] || '?'; let tB = S.r16[m.b] || '?';
            row.push(`${tA}–${tB}`);
        });
        R8.forEach(m => row.push(S.r8[m.id] || ''));

        // Agrupación Cuartos
        R4.forEach(m => {
            let tA = S.r8[m.a] || '?'; let tB = S.r8[m.b] || '?';
            row.push(`${tA}–${tB}`);
        });
        R4.forEach(m => row.push(S.r4[m.id] || ''));

        // Agrupación Semis
        RSF.forEach(m => {
            let tA = S.r4[m.a] || '?'; let tB = S.r4[m.b] || '?';
            row.push(`${tA}–${tB}`);
        });
        RSF.forEach(m => row.push(S.rsf[m.id] || ''));

        // Finales y Podio
        const w101 = S.rsf['p101']; const w102 = S.rsf['p102'];
        const runnerUp = S.champ === w101 ? w102 : w101;
        const l101 = getLoser('p101', w101, S.r4, RSF);
        const l102 = getLoser('p102', w102, S.r4, RSF);
        const fourthPlace = S.r3rd === l101 ? l102 : l101;

        row.push(`${l101}–${l102}`, `${w101}–${w102}`); // 2 Enfrentamientos
        row.push(S.champ, runnerUp, S.r3rd, fourthPlace); // 4 del Podio

        // ¡AQUÍ ENVIAMOS S.PAGO QUE TRAJIMOS DE LA PRIMERA PÁGINA!
        const payload = {
            usuario: S.datos,
            pago: S.pago, 
            rowResultados: row
        };

        const btnEnviar = document.getElementById('btn-enviar');
        const loader = document.getElementById('btn-loader');
        const txt = document.getElementById('btn-text');
        
        btnEnviar.disabled = true; 
        txt.style.display = 'none'; 
        loader.style.display = 'inline-block'; // Spinner de carga

        const URL_WEB = "https://script.google.com/macros/s/AKfycbyc8I0d47E3riR1Pqj_2opy7WCBiKZjIjawNFCGgXsJ3cOPSokv2sDT-bkLLI7aeiCT7g/exec";

        try {
            await fetch(URL_WEB, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
            mostrarNotificacion('✅ ¡Tu pronóstico y pago se han enviado con éxito!', 'success');
            
            // Ocultamos los botones normales y mostramos el de reiniciar
            document.querySelector('.nav-buttons').style.display = 'none';
            document.getElementById('btn-reiniciar').style.display = 'block';
        } catch (e) {
            mostrarNotificacion('❌ Hubo un error de conexión. Intenta nuevamente.');
            btnEnviar.disabled = false; 
            loader.style.display = 'none'; 
            txt.style.display = 'inline';
        }
    });

    document.getElementById('btn-reiniciar').addEventListener('click', () => { 
        localStorage.clear(); 
        window.location.href = '../index.html'; 
    });
});