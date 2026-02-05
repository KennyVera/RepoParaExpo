<script lang="ts">
    // 1. Recibimos TODAS las props en una sola declaración
    let {
        isModalOpen = $bindable(),
        ofertaParaEditar,
        categoriasDisponibles = [],
        modalidadesDisponibles = [],
        ciudadesDisponibles = [],
        jornadasDisponibles = [],
        alGuardar,
        cerrarModal
    } = $props();

    // 2. Estado reactivo de la oferta (se llena con lo que capturaste al dar click)
    // Usamos $state.raw o una copia profunda para asegurar la reactividad en Svelte 5
    let oferta = $state({ ...ofertaParaEditar });

    // 3. Variables temporales para la sección de habilidades
    let tempIdHabilidad = $state(0);
    let tempNivel = $state("Básico");
    let tempObligatorio = $state(false);

    // 4. Lógica para agregar habilidades a la lista
    function agregarSkill() {
        if (tempIdHabilidad === 0) return;

        // Aquí podrías buscar el nombre real en una lista de habilidades si la tuvieras
        const nombres: Record<number, string> = { 1: "Java", 2: "SQL" };

        const nuevaHabilidad = {
            idHabilidad: tempIdHabilidad,
            nombreHabilidad: nombres[tempIdHabilidad] || 'Habilidad',
            nivelRequerido: tempNivel,
            esObligatorio: tempObligatorio
        };

        // Actualización reactiva del array de habilidades
        oferta.habilidades = [...(oferta.habilidades || []), nuevaHabilidad];

        // Limpiar campos temporales para la siguiente habilidad
        tempIdHabilidad = 0;
        tempObligatorio = false;
    }

    // 5. Quitar habilidad de la lista
    function removerSkill(index: number) {
        oferta.habilidades = oferta.habilidades.filter((_: any, i: number) => i !== index);
    }

    // 6. Enviar el objeto completo (con ID y todo) al backend
    function enviarFormulario() {
        alGuardar(oferta);
    }
</script>


{#if isModalOpen}
    <div class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Actualiza tu Oferta Laboral</h3>
                <button onclick={cerrarModal} class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body">
                <form onsubmit={(e) => { e.preventDefault(); enviarFormulario(); }}>
                    <div class="form-group full-width">
                        <label>Título de la Oferta</label>
                        <input type="text" bind:value={oferta.titulo} required placeholder="Ej: Desarrollador Java">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Categoría</label>
                            <select bind:value={oferta.categoria.idCategoria} required>
                                <option value={null} disabled>Seleccionar...</option>
                                {#each categoriasDisponibles as cat}
                                    <option value={cat.idCategoria}>{cat.nombreCategoria}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Modalidad</label>
                            <select bind:value={oferta.modalidad.idModalidad} required>
                                <option value={null} disabled>Seleccionar...</option>
                                {#each modalidadesDisponibles as mod}
                                    <option value={mod.idModalidad}>{mod.nombreModalidad}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Salario ($)</label>
                            <input type="number" bind:value={oferta.salarioPromedio} step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Ciudad</label>
                            <select bind:value={oferta.ciudad.idCiudad}>
                                <option value={null}>Seleccionar ciudad...</option>
                                {#each ciudadesDisponibles as ciu}
                                    <option value={ciu.idCiudad}>{ciu.nombreCiudad}</option>
                                {/each}
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Inicio</label>
                            <input type="date" bind:value={oferta.fechaInicio} required>
                        </div>
                        <div class="form-group">
                            <label>Cierre</label>
                            <input type="date" bind:value={oferta.fechaCierre} required>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label>Descripción</label>
                        <textarea rows="4" bind:value={oferta.descripcion} class="oferta-descripcion-modal" required></textarea>
                    </div>

                    <div class="skills-section">
                        <h4>Requisitos (Habilidades)</h4>
                        <div class="skills-input-row">
                            <select bind:value={tempIdHabilidad} class="small-select">
                                <option value={0}>Seleccionar...</option>
                                <option value={1}>Java</option>
                                <option value={2}>SQL</option>
                            </select>
                            <select bind:value={tempNivel} class="small-select">
                                <option value="Básico">Básico</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                            </select>
                            <label class="checkbox-label">
                                <input type="checkbox" bind:checked={tempObligatorio}> Obligatorio
                            </label>
                            <button type="button" class="btn-small-add" onclick={agregarSkill}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>

                        <div class="skills-tags-container">
                            {#each (oferta.habilidades || []) as s, i}
                                <span class="skill-chip">
                                    {s.nombreHabilidad} - {s.nivelRequerido}
                                    <i class="fas fa-times" role="button" tabindex="0" onclick={() => removerSkill(i)}></i>
                                </span>
                            {/each}
                        </div>
                    </div>
                </form>
            </div>

            <div class="modal-footer">
                <button onclick={cerrarModal} class="btn-text">Cancelar</button>
                <button onclick={enviarFormulario} class="btn-primary">Actualizar</button>
            </div>
        </div>
    </div>
{/if}

<style>

    .welcome-text h2 {
        color: #1f2937;
        font-size: 1.5rem;
        margin-bottom: 5px;
        font-weight: 700;
    }

    .welcome-text p {
        color: #6b7280;
        font-size: 0.95rem;
    }

    .stat-card h3 {
        font-size: 1.2rem;
        color: #1f2937;
        font-weight: 700;
        margin: 0;
    }

    .stat-card p {
        font-size: 0.8rem;
        color: #6b7280;
        margin: 0;
    }


    .offer-card h3 {
        font-size: 1.15rem;
        color: #111827;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }

    .offer-details span {
        display: flex;
        align-items: center;
        gap: 6px;
    }


    .btn-primary {
        background: #2563EB;
        color: white;
        border: none;
        padding: 0.7rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s;
    }

    .btn-primary:hover {
        background: #1d4ed8;
    }


    .btn-text {
        background: transparent;
        border: none;
        color: #6b7280;
        cursor: pointer;
        font-weight: 500;
        padding: 0.5rem 1rem;
    }

    .btn-text:hover {
        color: #1f2937;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(2px);
    }

    .modal-content {
        background: white;
        width: 650px;
        max-width: 95%;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        margin: 0;
        color: #111827;
        font-size: 1.2rem;
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #9ca3af;
        line-height: 1;
    }

    .close-modal:hover {
        color: #4b5563;
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        background-color: #f9fafb;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
    }

    .form-group {
        margin-bottom: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label {
        font-size: 0.9rem;
        font-weight: 500;
        color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        padding: 0.65rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.95rem;
        background-color: #fff;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        border-color: #2563EB;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .full-width {
        width: 100%;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .skills-section {
        background: #f8fafc;
        padding: 1.2rem;
        border-radius: 8px;
        border: 1px dashed #cbd5e1;
        margin-top: 0.5rem;
    }

    .skills-section h4 {
        margin: 0 0 10px 0;
        font-size: 0.9rem;
        color: #475569;
    }

    .skills-input-row {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 15px;
    }

    .small-select {
        flex: 1;
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        font-size: 0.9rem;
    }

    .checkbox-label {
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 5px;
        color: #4b5563;
        white-space: nowrap;
    }

    .btn-small-add {
        background: #2563EB;
        color: white;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }

    .btn-small-add:hover {
        background: #1e40af;
    }

    .skills-tags-container {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .skill-chip {
        background: #e0e7ff;
        color: #3730a3;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .skill-chip i {
        cursor: pointer;
        font-size: 0.8rem;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .skill-chip i:hover {
        opacity: 1;
        color: #dc2626;
    }
</style>

