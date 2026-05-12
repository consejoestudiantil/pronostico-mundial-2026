// js/final.js
document.addEventListener('DOMContentLoaded', () => {
    const rsfValues = Object.values(AppState.rsf || {}).filter(val => val !== '');
    if (rsfValues.length < 2) {
        window.location.href = 'semis.html';
        return;
    }

    let S = {
        r4: AppState.r4 || {},
        rsf: AppState.rsf || {},
        r3rd: AppState.r3rd || '',
        rfinal: AppState.rfinal || ''
    };

    // --- DICCIONARIO DE BANDERAS ---
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

    function getLoser(matchId, winner) {
        const match = RSF.find(m => m.id === matchId);
        if (!match) return '?';
        const teamA = S.r4[match.a] || '?';
        const teamB = S.r4[match.b] || '?';
        
        if (winner === teamA) return teamB;
        if (winner === teamB) return teamA;
        return '?';
    }

    function renderFinals() {
        const c = document.getElementById('final-area');
        c.innerHTML = '';

        const w101 = S.rsf['p101'] || '?';
        const w102 = S.rsf['p102'] || '?';

        const l101 = getLoser('p101', w101);
        const l102 = getLoser('p102', w102);

        let cur3rd = S.r3rd;
        const teams3rd = [l101, l102].filter(t => t && t !== '?');
        
        if (cur3rd !== '' && !teams3rd.includes(cur3rd)) {
            cur3rd = ''; S.r3rd = ''; AppState.r3rd = '';
            localStorage.setItem('pronostico_r3rd', '');
        }

        const opts3rd = teams3rd.length === 2
            ? `<option value="">— Ganador (3° Puesto) —</option>${teams3rd.map(t => `<option value="${t}" ${cur3rd === t ? 'selected' : ''}>${t}</option>`).join('')}`
            : '<option>Faltan datos de Semis</option>';

        let curFinal = S.rfinal;
        const teamsFinal = [w101, w102].filter(t => t && t !== '?');
        
        if (curFinal !== '' && !teamsFinal.includes(curFinal)) {
            curFinal = ''; S.rfinal = ''; AppState.rfinal = ''; AppState.champ = '';
            localStorage.setItem('pronostico_rfinal', '');
            localStorage.setItem('pronostico_champ', '');
        }

        const optsFinal = teamsFinal.length === 2
            ? `<option value="">— ¡Elegir Campeón! —</option>${teamsFinal.map(t => `<option value="${t}" ${curFinal === t ? 'selected' : ''}>${t}</option>`).join('')}`
            : '<option>Faltan datos de Semis</option>';

        // Diseño simétrico con banderas
        c.innerHTML = `
            <div class="kmatch" style="border-left: 4px solid var(--mt);">
                <div class="kteams">
                    <div style="margin-bottom:6px; display:flex; align-items:center;">
                        <strong>${getBandera(l101)} ${l101}</strong>
                    </div>
                    <div style="margin-bottom:6px; display:flex; align-items:center;">
                        <span style="color:var(--mt); font-size:11px; margin-right:8px; font-weight:700;">VS</span> 
                        <strong>${getBandera(l102)} ${l102}</strong>
                    </div>
                    <div class="ksub" style="display:flex; align-items:center; margin-top:8px;">
                        <span class="kpnum">P103</span> <span>Tercer Puesto · 📍Miami</span>
                    </div>
                </div>
                <select class="ksel" id="sel-3rd" ${teams3rd.length < 2 ? 'disabled' : ''}>${opts3rd}</select>
            </div>
            
            <div class="kmatch" style="border-left: 4px solid var(--acc); margin-top: 1.5rem; background: linear-gradient(90deg, #78350f22, transparent); padding: 1.2rem;">
                <div class="kteams">
                    <div style="margin-bottom:6px; display:flex; align-items:center;">
                        <strong style="color:var(--acc); font-size:1.1rem;">${getBandera(w101)} ${w101}</strong>
                    </div>
                    <div style="margin-bottom:6px; display:flex; align-items:center;">
                        <span style="color:var(--mt); font-size:11px; margin-right:8px; font-weight:700;">VS</span> 
                        <strong style="color:var(--acc); font-size:1.1rem;">${getBandera(w102)} ${w102}</strong>
                    </div>
                    <div class="ksub" style="display:flex; align-items:center; margin-top:8px;">
                        <span class="kpnum" style="background:var(--acc); color:#000;">P104</span> <span style="color:var(--acc); font-weight:600;">LA GRAN FINAL · 📍Nueva York / Nueva Jersey</span>
                    </div>
                </div>
                <select class="ksel" id="sel-final" style="border-color:var(--acc); color:var(--acc);" ${teamsFinal.length < 2 ? 'disabled' : ''}>${optsFinal}</select>
            </div>
        `;

        document.getElementById('sel-3rd').addEventListener('change', (e) => {
            S.r3rd = e.target.value;
            AppState.r3rd = S.r3rd;
            localStorage.setItem('pronostico_r3rd', S.r3rd);
            validarAvance();
        });

        document.getElementById('sel-final').addEventListener('change', (e) => {
            S.rfinal = e.target.value;
            AppState.rfinal = S.rfinal;
            AppState.champ = S.rfinal; 
            localStorage.setItem('pronostico_rfinal', S.rfinal);
            localStorage.setItem('pronostico_champ', S.rfinal);
            validarAvance();
        });

        validarAvance();
    }

    function validarAvance() {
        if (S.r3rd !== '' && S.rfinal !== '') {
            document.getElementById('nav-resumen').classList.remove('locked');
        } else {
            document.getElementById('nav-resumen').classList.add('locked');
        }
    }

    renderFinals();

    document.getElementById('btn-siguiente').addEventListener('click', () => {
        if (S.r3rd === '' || S.rfinal === '') {
            mostrarNotificacion('⚠️ Debes seleccionar al ganador del 3° Puesto y al Campeón Mundial.');
            return;
        }
        window.location.href = 'resumen.html';
    });
});