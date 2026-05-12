// js/terceros.js - VERSIÓN DEFINITIVA Y COMPLETA (ANTI-VACÍOS + EMPATES)
document.addEventListener('DOMContentLoaded', () => {

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
        if (codigo) return `<img src="https://flagcdn.com/20x15/${codigo}.png" class="team-flag" alt="${equipo}" style="width: 20px; border-radius: 2px;">`;
        return '⚽ ';
    }

    // Calcula las posiciones de un grupo
    function calcSt(g) {
        const gd = GD[g], stats = {};
        gd.t.forEach(t => stats[t] = { pts: 0, w: 0, d: 0, l: 0, gf: 0, gc: 0 });
        gd.m.forEach((m, i) => {
            const sc = AppState.scores[g] && AppState.scores[g][i];
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
        
        const tb = AppState.tiebreaks[g] || {};
        Object.keys(tb).sort().forEach(pos => {
            const w = tb[pos]; const p = parseInt(pos);
            const wi = t.findIndex(x => x.name === w);
            if (wi >= 0 && wi !== p) { const [it] = t.splice(wi, 1); t.splice(p, 0, it); }
        });
        return t;
    }

    function renderTerceros() {
        // 1. Extraer a los 12 terceros lugares
        let thirds = Object.keys(GD).map(g => {
            let st = calcSt(g);
            return { g: g, name: st[2].name, pts: st[2].pts, dif: st[2].dif, gf: st[2].gf };
        });

        // 2. Ordenar a los 12 equipos
        thirds.sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || a.name.localeCompare(b.name));

        const tieContainer = document.getElementById('tie-container');
        const listContainer = document.getElementById('thirds-list');

        // 3. LÓGICA BLINDADA DE DESEMPATE
        let statsFrontera = { pts: thirds[7].pts, dif: thirds[7].dif, gf: thirds[7].gf };
        let tiedTeams = thirds.filter(t => t.pts === statsFrontera.pts && t.dif === statsFrontera.dif && t.gf === statsFrontera.gf);

        // SEGURO ANTI-VACÍOS: Solo calcular empate si el mejor tercero tiene más de 0 puntos o goles
        let isTieCutoff = false;
        if (thirds[0].pts > 0 || thirds[0].gf > 0 || thirds[0].gc > 0) {
            isTieCutoff = thirds[8] && 
                          thirds[7].pts === thirds[8].pts && 
                          thirds[7].dif === thirds[8].dif && 
                          thirds[7].gf === thirds[8].gf;
        }

        // Aplicar selección manual si existe
        if (isTieCutoff && tiedTeams.length > 0 && AppState.thirdsManual) {
            let mi = thirds.findIndex(t => t.name === AppState.thirdsManual);
            if (mi > 7 && tiedTeams.find(t => t.name === AppState.thirdsManual)) {
                let it = thirds.splice(mi, 1)[0];
                thirds.splice(7, 0, it); 
            }
        }

        // 4. RENDERIZAR LA ALERTA DE EMPATE (Solo si se activó el seguro)
        if (isTieCutoff && tiedTeams.length > 0) {
            if (!AppState.thirdsManual || !tiedTeams.find(t => t.name === AppState.thirdsManual)) {
                AppState.thirdsManual = thirds[7].name; 
            }

            let optionsHTML = tiedTeams.map(t => 
                `<option value="${t.name}" ${AppState.thirdsManual === t.name ? 'selected' : ''}>${t.name} (Grupo ${t.g})</option>`
            ).join('');

            tieContainer.innerHTML = `
                <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid #fbbf24; padding: 15px; border-radius: 8px;">
                    <h3 style="color: #fbbf24; margin-top:0; font-family:'Bebas Neue', sans-serif; letter-spacing: 1px;">⚠️ EMPATE EN LA ZONA DE CLASIFICACIÓN</h3>
                    <p style="font-size: 14px; margin-bottom: 12px; color: var(--txt);">Varios equipos tienen exactamente los mismos Puntos y Goles peleando por entrar a 16avos. <strong>Por favor, selecciona quién clasifica:</strong></p>
                    <select id="tie-selector" style="width: 100%; max-width: 400px; padding: 10px; background: var(--bg3); border: 1px solid var(--acc); color: var(--txt); border-radius: 6px; font-family: 'Outfit', sans-serif; font-size: 15px; cursor: pointer;">
                        ${optionsHTML}
                    </select>
                </div>
            `;
            tieContainer.style.display = 'block';

            document.getElementById('tie-selector').addEventListener('change', (e) => {
                AppState.thirdsManual = e.target.value;
                localStorage.setItem('wc_app_state', JSON.stringify(AppState)); 
                renderTerceros(); 
            });

        } else {
            AppState.thirdsManual = null;
            if(tieContainer) tieContainer.style.display = 'none';
        }

        // 5. RENDERIZAR LA CUADRÍCULA DE LOS 12 TERCEROS
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">';
        
        thirds.forEach((t, i) => {
            let isClassified = i < 8;
            let bgStyle = isClassified ? 'background: rgba(26, 215, 128, 0.05); border-color: var(--acc);' : 'background: var(--bg3); border-color: var(--bdr); opacity: 0.5;';
            let numColor = isClassified ? 'color: var(--acc);' : 'color: var(--mt2);';

            html += `
                <div style="border: 1px solid; border-radius: 8px; padding: 12px 15px; display: flex; align-items: center; gap: 12px; transition: all 0.3s; ${bgStyle}">
                    <div style="font-weight: 800; font-size: 1.3rem; width: 25px; ${numColor}">${i + 1}°</div>
                    <div style="flex: 1; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 1.1rem; color: var(--txt);">
                        ${getBandera(t.name)} <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.name}</span>
                    </div>
                    <div style="text-align: right; font-size: 0.85rem; color: var(--mt2); line-height: 1.2;">
                        <div><strong style="${numColor}">${t.pts} pts</strong></div>
                        <div>${t.dif > 0 ? '+'+t.dif : t.dif} GD</div>
                        <div>${t.gf} GF</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        if (listContainer) listContainer.innerHTML = html;

        // 6. ACTUALIZAR EL TEXTO DEL ESCENARIO
        const top8 = thirds.slice(0, 8);
        const escKey = top8.map(t => t.g).sort().join(''); // Ej: ABCDEFGH
        const escText = document.getElementById('escenario-text');
        
        if (escText) {
            // Si la tabla está en 0s no mostramos el escenario
            if (thirds[0].pts === 0 && thirds[0].gf === 0 && thirds[0].gc === 0) {
                escText.innerText = "Escenario: --";
            } else {
                escText.innerText = "Escenario: " + escKey;
            }
        }
    }

    renderTerceros();

    // BOTONES DE NAVEGACIÓN
    const btnRegresar = document.getElementById('btn-regresar');
    if (btnRegresar) {
        btnRegresar.addEventListener('click', () => { window.location.href = 'grupos.html'; });
    }

    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
        btnNext.addEventListener('click', () => { window.location.href = '16avos.html'; });
    }
});