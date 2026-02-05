<script lang="ts">
    import { perfilService } from '$lib/services/perfilService';
    import { onMount } from 'svelte';
    import FrmActualizar from './frmActualizar.svelte';

    // --- INTERFACES PARA TIPADO ---
    interface Empresa { idEmpresa: number; nombreEmpresa: string; }
    interface Categoria { idCategoria: number; nombreCategoria: string; }
    interface Modalidad { idModalidad: number; nombreModalidad: string; }
    interface Jornada { idJornada: number; nombreJornada: string; }
    interface Ciudad { idCiudad: number; nombreCiudad: string; }

    interface Oferta {
        id_oferta?: number;
        titulo: string;
        descripcion: string;
        estado_oferta: string;
        nombre_empresa: string;
        fecha_inicio: string;
        // Campos para mapeo interno
        id_categoria?: number;
        id_modalidad?: number;
        id_jornada?: number;
        id_ciudad?: number;
        salario_promedio?: number;
        fecha_cierre?: string;
    }

    interface OfertaFormulario {
        id_oferta?: number;
        titulo: string;
        descripcion: string;
        salarioPromedio: number | null;
        fechaInicio: string;
        fechaCierre: string;
        estadoOferta: string;
        categoria: { idCategoria: number | null };
        modalidad: { idModalidad: number | null };
        ciudad: { idCiudad: number | null };
        jornada: { idJornada: number | null };
        empresa: { idEmpresa: number | null };
    }

    // --- ESTADOS REACTIVOS ($state) ---
    let ofertas = $state<Oferta[]>([]);
    let modalidadesDisponibles = $state<Modalidad[]>([]);
    let categoriasDisponibles = $state<Categoria[]>([]);
    let jornadasDisponibles = $state<Jornada[]>([]);
    let ciudadesDisponibles = $state<Ciudad[]>([]);

    let idEmpresaLogueada = $state<number | null>(null);
    let nombreEmpresaLogueada = $state('');
    let mostrarModalActualizar = $state(false);
    let ofertaSeleccionada = $state<OfertaFormulario | null>(null);

    let nuevaOferta = $state({
        titulo: '',
        descripcion: '',
        salarioPromedio: null,
        fechaInicio: '',
        fechaCierre: '',
        estadoOferta: 'Activa',
        empresa: { idEmpresa: null as number | null },
        modalidad: { idModalidad: null as number | null },
        categoria: { idCategoria: null as number | null },
        jornada: { idJornada: null as number | null },
        ciudad: { idCiudad: null as number | null }
    });

    // --- CARGA DE DATOS AL INICIAR ---
    onMount(async () => {
        try {
            const [mod, cat, jor, ciu] = await Promise.all([
                perfilService.getModalidades(),
                perfilService.getCategorias(),
                perfilService.getJornadas(),
                perfilService.getCiudades()
            ]);

            modalidadesDisponibles = mod;
            categoriasDisponibles = cat;
            jornadasDisponibles = jor;
            ciudadesDisponibles = ciu;

            const idUsuario = localStorage.getItem('idUsuario');
            if (idUsuario) {
                const miEmpresa = await perfilService.getEmpresaPorUsuario(idUsuario);
                idEmpresaLogueada = miEmpresa.idEmpresa;
                nombreEmpresaLogueada = miEmpresa.usuario?.nombre || 'Nombre no disponible';
                nuevaOferta.empresa.idEmpresa = idEmpresaLogueada;

                const ofertasPrevias = await perfilService.getOfertasPorEmpresa(idEmpresaLogueada);
                ofertas = ofertasPrevias.map((o: any) => ({
                    id_oferta: o.idOferta,
                    titulo: o.titulo,
                    descripcion: o.descripcion,
                    estado_oferta: o.estadoOferta,
                    nombre_empresa: nombreEmpresaLogueada,
                    fecha_inicio: o.fechaInicio,
                    id_categoria: o.categoria?.idCategoria,
                    id_modalidad: o.modalidad?.idModalidad,
                    id_jornada: o.jornada?.idJornada,
                    id_ciudad: o.ciudad?.idCiudad,
                    salario_promedio: o.salarioPromedio,
                    fecha_cierre: o.fechaCierre
                }));
            }
        } catch (error: any) {
            console.error("Error al inicializar datos:", error.message);
        }
    });

    // --- LÓGICA DE NEGOCIO ---
    function getEstadoClass(estado: string) {
        const clases: Record<string, string> = {
            'Activa': 'badge-activa',
            'Pausada': 'badge-pausada',
            'Cerrada': 'badge-cerrada',
            'En Revisión': 'badge-revision'
        };
        return clases[estado] || '';
    }

    async function manejarPublicar(event: Event) {
        event.preventDefault();
        try {
            const resultado = await perfilService.guardarOferta(nuevaOferta);
            const nuevaOfertaRender: Oferta = {
                id_oferta: resultado.idOferta,
                titulo: resultado.titulo,
                descripcion: resultado.descripcion,
                estado_oferta: resultado.estadoOferta,
                nombre_empresa: nombreEmpresaLogueada,
                fecha_inicio: resultado.fechaInicio
            };
            ofertas = [nuevaOfertaRender, ...ofertas];
            resetFormulario();
            alert('¡Oferta publicada exitosamente!');
        } catch (error: any) {
            alert('Error al guardar: ' + error.message);
        }
    }

    async function manejarEliminar(id: number | undefined, index: number) {
        if (!id) return;
        if (confirm('¿Estás seguro de eliminar esta oferta permanentemente?')) {
            try {
                await perfilService.eliminarOferta(id);
                ofertas = ofertas.filter((_, i) => i !== index);
                alert('Oferta eliminada correctamente.');
            } catch (error: any) {
                alert('No se pudo eliminar: ' + error.message);
            }
        }
    }

    function abrirModalActualizar(oferta: Oferta) {
        ofertaSeleccionada = {
            id_oferta: oferta.id_oferta,
            titulo: oferta.titulo,
            descripcion: oferta.descripcion,
            salarioPromedio: oferta.salario_promedio || 0,
            fechaInicio: oferta.fecha_inicio ? oferta.fecha_inicio.split('T')[0] : '',
            fechaCierre: oferta.fecha_cierre ? oferta.fecha_cierre.split('T')[0] : '',
            estadoOferta: oferta.estado_oferta || 'Activa',
            categoria: { idCategoria: oferta.id_categoria || null },
            modalidad: { idModalidad: oferta.id_modalidad || null },
            ciudad: { idCiudad: oferta.id_ciudad || null },
            jornada: { idJornada: oferta.id_jornada || null },
            empresa: { idEmpresa: idEmpresaLogueada }
        };
        mostrarModalActualizar = true;
    }

    async function ejecutarActualizacion(ofertaEditada: OfertaFormulario) {
        try {
            if (ofertaEditada.id_oferta) {
                await perfilService.actualizarOferta(ofertaEditada.id_oferta, ofertaEditada);
                // Actualizar la lista localmente para reflejar cambios sin recargar
                ofertas = ofertas.map(o => o.id_oferta === ofertaEditada.id_oferta ? {
                    ...o,
                    titulo: ofertaEditada.titulo,
                    descripcion: ofertaEditada.descripcion,
                    estado_oferta: ofertaEditada.estadoOferta,
                    fecha_inicio: ofertaEditada.fechaInicio
                } : o);
                alert('Oferta actualizada con éxito');
                mostrarModalActualizar = false;
            }
        } catch (error: any) {
            alert('Error al actualizar: ' + error.message);
        }
    }

    function resetFormulario() {
        nuevaOferta = {
            titulo: '', descripcion: '', salarioPromedio: null,
            fechaInicio: '', fechaCierre: '', estadoOferta: 'Activa',
            empresa: { idEmpresa: idEmpresaLogueada },
            modalidad: { idModalidad: null }, categoria: { idCategoria: null },
            jornada: { idJornada: null }, ciudad: { idCiudad: null }
        };
    }
</script>

{#if mostrarModalActualizar}
    <FrmActualizar
            bind:isModalOpen={mostrarModalActualizar}
            ofertaParaEditar={ofertaSeleccionada}
            {categoriasDisponibles}
            {modalidadesDisponibles}
            {ciudadesDisponibles}
            {jornadasDisponibles}
            alGuardar={ejecutarActualizacion}
            cerrarModal={() => mostrarModalActualizar = false}
    />
{/if}

<div class="section-card">
    <div class="section-header">
        <h3><span class="section-icon">💼</span> Gestión de Ofertas Laborales</h3>
    </div>

    <form class="form-section" onsubmit={manejarPublicar}>
        <h4 class="subsection-title">
            <span class="material-icons">add_circle</span>
            Crear Nueva Oferta
        </h4>

        <div class="form-grid">
            <div class="form-group full-width">
                <label for="titulo">Título de la Oferta *</label>
                <input
                        id="titulo"
                        type="text"
                        bind:value={nuevaOferta.titulo}
                        class="form-control"
                        placeholder="Ej: Desarrollador Java Senior"
                        required
                >
            </div>

            <div class="form-group">
                <label for="empresa">Empresa Publicadora</label>
                <div class="form-control bg-gray-100 font-semibold text-blue-700">
                    <span class="material-icons" style="font-size: 16px; vertical-align: middle;">business</span>
                    {nombreEmpresaLogueada || 'Cargando empresa...'}
                </div>
                <input type="hidden" bind:value={nuevaOferta.empresa.idEmpresa}>
            </div>

            <div class="form-group">
                <label for="cat">Categoría *</label>
                <select id="cat" bind:value={nuevaOferta.categoria.idCategoria} class="form-control" required>
                    <option value="" disabled>Seleccionar categoría...</option>
                    {#each categoriasDisponibles as cat}
                        <option value={cat.idCategoria}>{cat.nombreCategoria}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label for="mod">Modalidad *</label>
                <select id="mod" bind:value={nuevaOferta.modalidad.idModalidad} class="form-control" required>
                    <option value="" disabled>Seleccionar modalidad...</option>
                    {#each modalidadesDisponibles as mod}
                        <option value={mod.idModalidad}>{mod.nombreModalidad}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label for="jor">Jornada *</label>
                <select id="jor" bind:value={nuevaOferta.jornada.idJornada} class="form-control" required>
                    <option value="" disabled>Seleccionar jornada...</option>
                    {#each jornadasDisponibles as jor}
                        <option value={jor.idJornada}>{jor.nombreJornada}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label for="ciudad">Ciudad</label>
                <select id="ciudad" bind:value={nuevaOferta.ciudad.idCiudad} class="form-control">
                    <option value="">Seleccionar ciudad...</option>
                    {#each ciudadesDisponibles as ciudad}
                        <option value={ciudad.idCiudad}>{ciudad.nombreCiudad}</option>
                    {/each}
                </select>
            </div>

            <div class="form-group">
                <label for="salario">Salario Promedio</label>
                <input
                        id="salario"
                        type="number"
                        bind:value={nuevaOferta.salarioPromedio}
                        class="form-control"
                        placeholder="0.00"
                        step="0.01"
                >
            </div>

            <div class="form-group">
                <label for="f_inicio">Fecha Inicio *</label>
                <input id="f_inicio" type="date" bind:value={nuevaOferta.fechaInicio} class="form-control" required>
            </div>

            <div class="form-group">
                <label for="f_cierre">Fecha Cierre *</label>
                <input id="f_cierre" type="date" bind:value={nuevaOferta.fechaCierre} class="form-control" required>
            </div>

            <div class="form-group full-width">
                <label for="desc">Descripción de la Oferta *</label>
                <textarea
                        id="desc"
                        bind:value={nuevaOferta.descripcion}
                        class="form-control"
                        rows="4"
                        placeholder="Detalla los requisitos y beneficios..."
                        required
                ></textarea>
            </div>
        </div>

        <div class="actions-row">
            <button type="submit" class="btn-add-list">
                <span class="material-icons">publish</span>
                Publicar Oferta Laboral
            </button>
        </div>
    </form>

    <hr class="section-divider">

    <div class="docs-title">
        <span class="material-icons">work</span>
        Ofertas Publicadas
    </div>

    {#if ofertas.length === 0}
        <div class="empty-state">
            <span class="material-icons">work_off</span>
            <p>No hay ofertas publicadas aún en la base de datos.</p>
        </div>
    {:else}
        {#each ofertas as oferta, i}
            <div class="oferta-card">
                <div class="oferta-header">
                    <div class="oferta-titulo-section">
                        <h4 class="oferta-titulo">{oferta.titulo}</h4>
                        <span class="badge {getEstadoClass(oferta.estado_oferta)}">
                            {oferta.estado_oferta}
                        </span>
                    </div>
                    <p class="oferta-empresa">{oferta.nombre_empresa}</p>
                </div>

                <div class="oferta-body">
                    <p class="descripcion-corta">{oferta.descripcion}</p>
                    <div class="oferta-footer">
    <span class="fecha">
        <span class="material-icons" style="font-size: 14px;">event</span>
        Inicio: {oferta.fecha_inicio}
    </span>

                        <div class="oferta-acciones">
                            <button
                                    type="button"
                                    class="btn-edit"
                                    onclick={() => abrirModalActualizar(oferta)}
                            >
                                <span class="material-icons">edit</span>
                                Actualizar
                            </button>
                            <button
                                    type="button"
                                    class="btn-delete"
                                    onclick={() => manejarEliminar(oferta.id_oferta, i)}
                            >
                                <span class="material-icons">delete</span>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>

    .oferta-footer {
        display: flex;
        justify-content: space-between; /* Separa la fecha de los botones */
        align-items: center;
        margin-top: 1rem;
        padding-top: 0.5rem;
        border-top: 1px solid #eee;
    }

    .oferta-acciones {
        display: flex;
        gap: 8px; /* Espacio pequeño entre botones */
    }

    /* Estilo común para botones de acción */
    .btn-edit, .btn-delete {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
    }

    /* Botón Actualizar (Azul) */
    .btn-edit {
        background-color: #eff6ff;
        color: #2563eb;
    }

    .btn-edit:hover {
        background-color: #2563eb;
        color: white;
    }

    /* Botón Eliminar (Rojo suave) */
    .btn-delete {
        background-color: #fef2f2;
        color: #dc2626;
    }

    .btn-delete:hover {
        background-color: #dc2626;
        color: white;
    }

    .material-icons {
        font-size: 18px; /* Tamaño consistente para los iconos */
    }
    /* ===== SECCIÓN OFERTAS LABORALES ===== */
    .section-card {
        background: white;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        margin-bottom: 25px;
    }

    .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #f0f0f0;
    }

    .section-header h3 {
        color: #1e293b;
        font-size: 22px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
    }

    .section-icon {
        width: 35px;
        height: 35px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
    }

    /* Subsección de Formulario */
    .form-section {
        background: #f8faff;
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 30px;
    }

    .subsection-title {
        color: #1e293b;
        font-size: 18px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 25px 0;
    }

    .subsection-title .material-icons {
        color: #667eea;
        font-size: 22px;
    }

    /* Grid de Formularios */
    .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group.full-width {
        grid-column: 1 / -1;
    }

    .form-group label {
        color: #475569;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .form-control {
        padding: 12px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        font-size: 14px;
        color: #334155;
        background: white;
        transition: all 0.3s ease;
        font-family: inherit;
    }

    .form-control:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    textarea.form-control {
        resize: vertical;
        min-height: 120px;
        line-height: 1.6;
    }

    /* Fila de Acciones */
    .actions-row {
        margin-top: 25px;
        display: flex;
        gap: 15px;
    }

    .btn-add-list {
        flex: 1;
        background: #4f46e5;
        color: white;
        border: none;
        padding: 14px 24px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .btn-add-list:hover {
        background: #4338ca;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    /* Divisor */
    .section-divider {
        border: 0;
        border-top: 2px solid #f1f5f9;
        margin: 30px 0;
    }

    /* Título de Ofertas */
    .docs-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 25px;
    }

    .docs-title .material-icons {
        font-size: 22px;
        color: #667eea;
    }

    /* Estado Vacío */
    .empty-state {
        text-align: center;
        padding: 50px 20px;
        color: #94a3b8;
        background: #f8faff;
        border-radius: 12px;
    }

    .empty-state .material-icons {
        font-size: 64px;
        margin-bottom: 15px;
        opacity: 0.5;
    }

    .empty-state p {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
    }

    /* ===== TARJETA DE OFERTA ===== */
    .oferta-card {
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        margin-bottom: 20px;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .oferta-card:hover {
        border-color: #667eea;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        transform: translateY(-2px);
    }

    /* Header de la Oferta */
    .oferta-header {
        background: linear-gradient(135deg, #667eea, #764ba2);
        padding: 20px 25px;
        color: white;
    }

    .oferta-titulo-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 8px;
        flex-wrap: wrap;
    }

    .oferta-titulo {
        color: white;
        font-size: 20px;
        font-weight: 800;
        margin: 0;
        flex: 1;
    }

    .oferta-empresa {
        font-size: 14px;
        opacity: 0.95;
        font-weight: 500;
    }

    /* Badges de Estado */
    .badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }



    /* Body de la Oferta */
    .oferta-body {
        padding: 25px;
    }



    .btn-edit {
        background: #0ea5e9; /* Un azul vibrante */
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        font-weight: 500;
        transition: background 0.2s;
    }

    .btn-edit:hover {
        background: #0284c7;
    }

    .btn-edit .material-icons {
        font-size: 18px;
    }

    .oferta-descripcion strong {
        color: #475569;
        font-size: 14px;
        display: block;
        margin-bottom: 10px;
    }

    .oferta-descripcion p {
        color: #64748b;
        font-size: 14px;
        line-height: 1.8;
        margin: 0;
        white-space: pre-line;
    }

    /* Footer de la Oferta */
    .oferta-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }



    .fecha-creacion .material-icons {
        font-size: 18px;
    }

    /* Botón Eliminar */
    .btn-delete {
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        background: #ef4444;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s ease;
    }

    .btn-delete:hover {
        background: #dc2626;
        transform: scale(1.05);
    }

    .btn-delete .material-icons {
        font-size: 20px;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
        }

        .oferta-titulo-section {
            flex-direction: column;
            align-items: flex-start;
        }

        .oferta-footer {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
        }

        .btn-delete {
            width: 100%;
            justify-content: center;
        }
    }
</style>