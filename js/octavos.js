// js/octavos.js
document.addEventListener('DOMContentLoaded', () => {
    const r16Values = Object.values(AppState.r16 || {}).filter(val => val !== '');
    if (r16Values.length < 16) {
        window.location.href = '16avos.html';
        return;
    }

    let S = {
        r16: AppState.r16 || {},
        r8: AppState.r8 || {}
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

    function renderR8() {
        const c = document.getElementById('r8-area');
        c.innerHTML = '';
        
        R8.forEach(m => {
            const h = S.r16[m.a] || '?';
            const a = S.r16[m.b] || '?';
            
            let cur2 = S.r8[m.id] || '';
            const teams = [h, a].filter(t => t && t !== '?');
            
            if (cur2 !== '' && !teams.includes(cur2)) {
                cur2 = '';
                S.r8[m.id] = '';
                AppState.r8 = S.r8;
                localStorage.setItem('pronostico_r8', JSON.stringify(S.r8));
            }

            const opts = teams.length === 2 
                ? `<option value="">— Ganador —</option>${teams.map(t => `<option value="${t}" ${cur2 === t ? 'selected' : ''}>${t}</option>`).join('')}`
                : '<option>Faltan datos de 16avos</option>';
            
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
                        <span class="kpnum">P${m.num}</span> <span>${m.desc} · 📍${m.venue}</span>
                    </div>
                </div>
                <select class="ksel" data-id="${m.id}" ${teams.length < 2 ? 'disabled' : ''}>${opts}</select>
            </div>`;
        });

        document.querySelectorAll('.ksel').forEach(select => {
            select.addEventListener('change', (e) => {
                const matchId = e.target.getAttribute('data-id');
                S.r8[matchId] = e.target.value;
                AppState.r8 = S.r8;
                localStorage.setItem('pronostico_r8', JSON.stringify(S.r8));
                validarAvance();
            });
        });
        validarAvance();
    }

    function validarAvance() {
        const seleccionados = Object.values(S.r8).filter(val => val !== '').length;
        if (seleccionados === 8) {
            document.getElementById('nav-cuartos').classList.remove('locked');
        } else {
            document.getElementById('nav-cuartos').classList.add('locked');
        }
    }

    renderR8();

    document.getElementById('btn-siguiente').addEventListener('click', () => {
        const seleccionados = Object.values(S.r8).filter(val => val !== '').length;
        if (8 - seleccionados > 0) {
            mostrarNotificacion(`⚠️ Te falta seleccionar el ganador en ${8 - seleccionados} partido(s).`);
            return;
        }
        window.location.href = 'cuartos.html';
    });
});