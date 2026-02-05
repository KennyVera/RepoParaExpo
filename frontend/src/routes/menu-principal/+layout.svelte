<script lang="ts">
    import { onMount } from 'svelte';

    let { children } = $props();

    // Estados (Runas de Svelte 5)
    let isSidebarOpen = $state(true);
    let nombreUsuario = $state('');
    let rolUsuario = $state('');

    onMount(() => {
        nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
        rolUsuario = localStorage.getItem('rol') || 'POSTULANTE';

        if (!localStorage.getItem('idUsuario')) {
            window.location.href = '/login';
        }
    });

    const menuItems = $derived([
        { icon: 'person', title: 'Mi Perfil Profesional', color: 'from-blue-500 to-blue-600', roles: ['POSTULANTE'], path: '/menu-principal/perfil-profesional' },
        { icon: 'business', title: 'Perfil Empresarial', color: 'from-blue-500 to-blue-600', roles: ['EMPRESA'], path: '/menu-principal/empresa' },
        { icon: 'search', title: 'Búsqueda de Empleos', color: 'from-cyan-500 to-cyan-600', roles: ['POSTULANTE'], path: '/menu-principal/buscar' },
        { icon: 'work', title: 'Gestión de Ofertas', color: 'from-cyan-500 to-cyan-600', roles: ['EMPRESA'], path: '/menu-principal/ofertas' },
        { icon: 'person', title: 'Ver Postulaciones', color: 'from-cyan-500 to-cyan-600', roles: ['EMPRESA'], path: '/menu-principal/Postulaciones' },
        { icon: 'logout', title: 'Cerrar Sesión', color: 'from-red-500 to-red-600', roles: ['EMPRESA', 'POSTULANTE'], action: logout }
    ].filter(item => item.roles.includes(rolUsuario)));

    function toggleSidebar() { isSidebarOpen = !isSidebarOpen; }

    function logout() {
        localStorage.clear();
        window.location.href = '/login';
    }
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<div class="flex h-screen bg-gray-50">
    <div class="{isSidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-blue-600 to-blue-700 transition-all duration-300 shadow-xl relative">
        <div class="p-6">
            <div class="flex items-center justify-between mb-8">
                {#if isSidebarOpen}
                    <div class="text-white">
                        <h2 class="text-2xl font-bold text-white">Bolsa UTEQ</h2>
                        <p class="text-blue-200 text-sm mt-1">Panel {rolUsuario}</p>
                    </div>
                {/if}
                <button onclick={toggleSidebar} class="text-white hover:bg-blue-500 p-2 rounded-lg">
                    <span class="material-icons">{isSidebarOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            <nav class="space-y-3">
                {#each menuItems as item}
                    <a href={item.path || '#'}
                       onclick={item.action}
                       class="flex items-center space-x-3 p-3 rounded-xl text-white hover:bg-white hover:bg-opacity-10 transition-all">
                        <span class="material-icons">{item.icon}</span>
                        {#if isSidebarOpen}
                            <span class="font-medium">{item.title}</span>
                        {/if}
                    </a>
                {/each}
            </nav>
        </div>
    </div>

    <div class="flex-1 overflow-auto">
        <header class="bg-white shadow-sm border-b p-6 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">Hola, {nombreUsuario}</h1>
                <p class="text-gray-600">Bienvenido al portal de empleo de la UTEQ.</p>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-100 rounded-full">
                <span class="material-icons text-gray-600">person</span>
                <span class="text-sm font-medium text-gray-700">{nombreUsuario}</span>
            </div>
        </header>

        <main class="p-8">
            {@render children()}
        </main>
    </div>
</div>