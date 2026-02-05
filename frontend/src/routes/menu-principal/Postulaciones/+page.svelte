<script lang="ts">
    import { perfilService } from '$lib/services/perfilService';
    import { onMount } from 'svelte';

    // Interfaces para el manejo de postulaciones
    interface Postulante {
        idUsuario: number;
        nombre: string;
        email: string;
    }

    interface PostulacionOferta {
        idPostulacion: number;
        titulo: string;
        descripcion: string;
        fechaPostulacion: string;
    }

    // Estados reactivos con Runas ($state)
    let postulantes = $state<Postulante[]>([]);
    let postulanteSeleccionado = $state<Postulante | null>(null);
    let ofertasPostuladas = $state<PostulacionOferta[]>([]);
    let cargandoOfertas = $state(false);

    // Variable para el ID del usuario empresa (el que sí existe en LocalStorage)
    let idUsuarioLogueado = $state<string | null>(null);

    onMount(async () => {
        try {
            // CORRECCIÓN CLAVE: Usamos 'idUsuario' porque 'idEmpresa' no existe en tu storage
            idUsuarioLogueado = localStorage.getItem('idUsuario');
            console.log("ID Usuario recuperado del Storage:", idUsuarioLogueado);

            if (idUsuarioLogueado) {
                // Cargamos la lista de personas que aplicaron a nuestras ofertas
                postulantes = await perfilService.getPostulantesPorEmpresa(idUsuarioLogueado);
                console.log("Postulantes cargados exitosamente:", postulantes);
            } else {
                console.error("No se encontró una sesión activa (idUsuario es null)");
            }
        } catch (error) {
            console.error("Error crítico al inicializar el componente:", error);
        }
    });

    async function seleccionarPostulante(postulante: Postulante) {
        postulanteSeleccionado = postulante;
        cargandoOfertas = true;
        try {
            if (idUsuarioLogueado) {
                // Enviamos el ID del candidato y el tuyo (idUsuarioLogueado que es 4)
                ofertasPostuladas = await perfilService.getOfertasPorPostulante(
                    postulante.idUsuario,
                    idUsuarioLogueado
                );
            }
        } catch (error) {
            console.error("Error al cargar cartas:", error);
        } finally {
            cargandoOfertas = false;
        }
    }

    async function gestionarPostulacion(idPostulacion: number, estado: 'CONTRATADO' | 'RECHAZADO') {
        if (!confirm(`¿Estás seguro de marcar esta postulación como ${estado}?`)) return;

        try {
            // Llamada al 'cerebro' en Spring Boot para persistir en PostgreSQL
            await perfilService.actualizarEstadoPostulacion(idPostulacion, estado);
            alert(`Candidato ${estado.toLowerCase()} exitosamente.`);

            // Reactividad: filtramos la lista para que la carta desaparezca de inmediato
            ofertasPostuladas = ofertasPostuladas.filter(o => o.idPostulacion !== idPostulacion);
        } catch (error) {
            console.error("Error al actualizar el estado en el servidor:", error);
            alert("Hubo un problema al procesar la acción.");
        }
    }
</script>

<div class="gestion-container">
    <aside class="sidebar-postulantes">
        <div class="sidebar-header">
            <span class="material-icons">people</span>
            <h4>Candidatos</h4>
        </div>
        <div class="lista-usuarios">
            {#each postulantes as p}
                <button
                        class="usuario-item {postulanteSeleccionado?.idUsuario === p.idUsuario ? 'active' : ''}"
                        onclick={() => seleccionarPostulante(p)}
                >
                    <div class="avatar">{p.nombre.charAt(0)}</div>
                    <div class="usuario-info">
                        <span class="nombre">{p.nombre}</span>
                        <span class="email">{p.email}</span>
                    </div>
                </button>
            {/each}
        </div>
    </aside>

    <main class="detalle-postulaciones">
        {#if postulanteSeleccionado}
            <div class="header-detalle">
                <h3>Postulaciones de: <span class="highlight">{postulanteSeleccionado.nombre}</span></h3>
            </div>

            {#if cargandoOfertas}
                <p class="msg">Cargando aplicaciones...</p>
            {:else if ofertasPostuladas.length === 0}
                <div class="empty-state">
                    <span class="material-icons">folder_open</span>
                    <p>No hay postulaciones pendientes para este candidato.</p>
                </div>
            {:else}
                <div class="grid-ofertas">
                    {#each ofertasPostuladas as oferta}
                        <div class="card-oferta">
                            <div class="card-body">
                                <h4>{oferta.titulo}</h4>
                                <p class="descripcion">{oferta.descripcion}</p>
                                <span class="fecha-post">Aplicó el: {oferta.fechaPostulacion}</span>
                            </div>
                            <div class="card-footer">
                                <button class="btn-rechazar" onclick={() => gestionarPostulacion(oferta.idPostulacion, 'RECHAZADO')}>
                                    <span class="material-icons">close</span> Rechazar
                                </button>
                                <button class="btn-contratar" onclick={() => gestionarPostulacion(oferta.idPostulacion, 'CONTRATADO')}>
                                    <span class="material-icons">check</span> Contratar
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {:else}
            <div class="welcome-state">
                <span class="material-icons">touch_app</span>
                <p>Selecciona un candidato de la lista para gestionar sus aplicaciones.</p>
            </div>
        {/if}
    </main>
</div>

<style>
    .gestion-container {
        display: flex;
        height: 80vh;
        gap: 20px;
        background: #f8faff;
        border-radius: 15px;
        overflow: hidden;
        padding: 10px;
    }

    /* Sidebar */
    .sidebar-postulantes {
        width: 300px;
        background: white;
        border-right: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
    }

    .sidebar-header {
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 2px solid #f1f5f9;
    }

    .lista-usuarios {
        flex: 1;
        overflow-y: auto;
    }

    .usuario-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px;
        border: none;
        background: none;
        cursor: pointer;
        transition: background 0.2s;
        text-align: left;
    }

    .usuario-item:hover { background: #f1f5f9; }
    .usuario-item.active { background: #eff6ff; border-left: 4px solid #3b82f6; }

    .avatar {
        width: 40px; height: 40px;
        background: #6366f1; color: white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: bold;
    }

    .usuario-info { display: flex; flex-direction: column; }
    .nombre { font-weight: 600; color: #1e293b; }
    .email { font-size: 0.75rem; color: #64748b; }

    /* Detalle */
    .detalle-postulaciones { flex: 1; padding: 20px; overflow-y: auto; }
    .highlight { color: #4f46e5; }

    .grid-ofertas {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .card-oferta {
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.2s;
    }

    .card-oferta:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

    .card-body { padding: 20px; flex: 1; }
    .card-body h4 { margin: 0 0 10px 0; color: #1e293b; }
    .descripcion { font-size: 0.9rem; color: #475569; line-height: 1.5; margin-bottom: 10px; }
    .fecha-post { font-size: 0.7rem; color: #94a3b8; }

    .card-footer {
        display: flex;
        border-top: 1px solid #f1f5f9;
    }

    .btn-rechazar, .btn-contratar {
        flex: 1;
        padding: 12px;
        border: none;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        gap: 6px; font-weight: 600; font-size: 0.85rem;
    }

    .btn-rechazar { background: #fef2f2; color: #ef4444; }
    .btn-rechazar:hover { background: #fee2e2; }
    .btn-contratar { background: #f0fdf4; color: #22c55e; }
    .btn-contratar:hover { background: #dcfce7; }

    .welcome-state, .empty-state {
        height: 100%;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: #94a3b8; gap: 10px;
    }
</style>