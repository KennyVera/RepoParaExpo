<script lang="ts">
    import { onMount } from 'svelte';
    let rol = $state('');

    onMount(() => {
        rol = localStorage.getItem('rol') || 'POSTULANTE';
    });

    const stats = $derived(rol === 'EMPRESA'
        ? [
            { label: 'Ofertas Activas', value: 12, color: 'from-blue-500 to-blue-600' },
            { label: 'Postulaciones', value: 48, color: 'from-cyan-500 to-cyan-600' }
        ]
        : [
            { label: 'Mis Postulaciones', value: 5, color: 'from-teal-500 to-teal-600' },
            { label: 'Ofertas Guardadas', value: 10, color: 'from-blue-500 to-blue-600' }
        ]
    );
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
    {#each stats as stat}
        <div class="bg-gradient-to-br {stat.color} p-6 rounded-2xl text-white shadow-lg">
            <p class="text-white text-opacity-80 text-sm mb-2">{stat.label}</p>
            <p class="text-4xl font-bold">{stat.value}</p>
        </div>
    {/each}
</div>

<div class="mt-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
    <h2 class="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
    <p class="text-gray-500">No hay notificaciones nuevas por el momento.</p>
</div>


<div class="sidebar"> </div>

<style>

    .shadow-sm {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .p-6 {
        padding: 1.5rem;
    }

    .mb-4 {
        margin-bottom: 1rem;
    }

    .mb-2 {
        margin-bottom: 0.5rem;
    }


    .mt-8 {
        margin-top: 2rem;
    }


    .text-white {
        color: black;
    }

    .text-gray-800 {
        color: #1f2937;
    }

    .text-4xl {
        font-size: 2.25rem;
        line-height: 2.5rem;
    }

    .text-xl {
        font-size: 1.25rem;
        line-height: 1.75rem;
    }

    .text-sm {
        font-size: 0.875rem;
        line-height: 1.25rem;
    }

    .font-bold {
        font-weight: 700;
    }

    .rounded-2xl {
        border-radius: 1rem;
    }

    .space-y-3 > * + * {
        margin-top: 0.75rem;
    }

    .space-y-4 > * + * {
        margin-top: 1rem;
    }

    .space-x-3 > * + * {
        margin-left: 0.75rem;
    }

    .space-x-4 > * + * {
        margin-left: 1rem;
    }

    .bg-white {
        background-color: #ffffff;
    }

    .border {
        border-width: 1px;
    }

    .border-gray-100 {
        border-color: #f3f4f6;
    }

    .grid {
        display: grid;
    }

    .grid-cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .gap-6 {
        gap: 1.5rem;
    }

    @media (min-width: 768px) {
        .md\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

    }

    @media (min-width: 1024px) {
        .lg\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
    }

    .bg-gradient-to-br {
        background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
    }


    .text-opacity-80 {
        --tw-text-opacity: 0.8;
    }

    /* Personalización adicional */
    button {
        cursor: pointer;
        border: none;
        outline: none;
        background: transparent;
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    .sidebar {
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 100%);
    }

    /* Animaciones personalizadas para la EXPO */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
    }
</style>