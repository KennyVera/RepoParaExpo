const API_BASE_URL = 'http://localhost:8080/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include'
    });

    // 1. Manejo de errores (mantenemos tu lógica pero con un catch más seguro)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error en la petición al servidor');
    }

    // 2. NUEVO: Verificar si hay contenido antes de intentar parsear JSON
    // El status 204 significa "No Content"
    if (response.status === 204) {
        return null;
    }

    // Leer el texto primero para verificar si está vacío
    const text = await response.text();

    // Si el texto existe, lo parseamos; si no, devolvemos null o un objeto vacío
    return text ? JSON.parse(text) : null;
}

export const perfilService = {


    async guardarOferta(ofertaData: any) {
        // Usamos el endpoint que definimos en el OfertaController
        return apiFetch('/ofertas/guardar', {
            method: 'POST',
            body: JSON.stringify(ofertaData)
        });
    },

    async getModalidades() {
        return apiFetch('/academico/modalidades');
    },

    async getCategorias() {
        return apiFetch('/academico/categorias');
    },

    async getJornadas() {
        return apiFetch('/academico/jornadas');
    },

    async getEmpresaPorUsuario(idUsuario: string | number) {
        // Llama al endpoint: @GetMapping("/mi-empresa/{idUsuario}")
        return apiFetch(`/academico/mi-empresa/${idUsuario}`);
    },

    async getCiudades() {
        return apiFetch('/academico/ciudades');
    },

    async getOfertasPorEmpresa(idEmpresa: number | null) {
        if (!idEmpresa) return [];
        // Llama al @GetMapping("/empresa/{idEmpresa}") de tu OfertaController
        return apiFetch(`/ofertas/empresa/${idEmpresa}`);
    },

    async eliminarOferta(id: number) {
        // Llama al @DeleteMapping("/eliminar/{id}") de tu OfertaController
        return apiFetch(`/ofertas/eliminar/${id}`, {
            method: 'DELETE'
        });
    },

    async actualizarOferta(id: number, datos: any) {
        // Se concatena el ID al endpoint /ofertas/actualizar/{id}
        return apiFetch(`/ofertas/actualizar/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            // Convertimos el objeto de Svelte a un JSON que Spring Boot pueda entender
            body: JSON.stringify(datos)
        });
    }
};