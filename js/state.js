// js/state.js
const AppState = {
    datos: JSON.parse(localStorage.getItem('pronostico_datos')) || {
        ci: '',
        nombre: '',
        email: '',
        whatsapp: ''
    },
    
    // NUEVO: Aquí se guardará la memoria del pago y la foto
    pago: JSON.parse(localStorage.getItem('pronostico_pago')) || null,

    scores: JSON.parse(localStorage.getItem('pronostico_scores')) || {},
    tiebreaks: JSON.parse(localStorage.getItem('pronostico_tiebreaks')) || {},
    thirdsManual: localStorage.getItem('pronostico_thirdsManual') || null,
    r16: JSON.parse(localStorage.getItem('pronostico_r16')) || {},
    r8: JSON.parse(localStorage.getItem('pronostico_r8')) || {},
    r4: JSON.parse(localStorage.getItem('pronostico_r4')) || {},
    rsf: JSON.parse(localStorage.getItem('pronostico_rsf')) || {},
    r3rd: localStorage.getItem('pronostico_r3rd') || '',
    rfinal: localStorage.getItem('pronostico_rfinal') || '',
    champ: localStorage.getItem('pronostico_champ') || '',
    
    guardarDatosUsuario: function(ci, nombre, email, whatsapp) {
        this.datos.ci = ci;
        this.datos.nombre = nombre;
        this.datos.email = email;
        this.datos.whatsapp = whatsapp;
        localStorage.setItem('pronostico_datos', JSON.stringify(this.datos));

        // NUEVO: Al darle a "Comenzar", guardamos también el pago para que viaje hasta el final
        if (this.pago) {
            try {
                localStorage.setItem('pronostico_pago', JSON.stringify(this.pago));
            } catch(e) {
                alert("⚠️ La imagen es muy pesada para la memoria del navegador. Por favor sube una imagen de menor tamaño.");
            }
        }
    },

    guardarMarcadores: function(scores, tiebreaks) {
        this.scores = scores;
        this.tiebreaks = tiebreaks;
        localStorage.setItem('pronostico_scores', JSON.stringify(this.scores));
        localStorage.setItem('pronostico_tiebreaks', JSON.stringify(this.tiebreaks));
    },

    guardarTercerosManual: function(equipo) {
        this.thirdsManual = equipo;
        localStorage.setItem('pronostico_thirdsManual', equipo);
    }
};