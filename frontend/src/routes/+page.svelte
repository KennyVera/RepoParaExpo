<script lang="ts">
    import { onMount } from 'svelte';

    onMount(() => {
        // Redirige inmediatamente a la carpeta /login
        window.location.href = '/login';
    });
</script>

<p>Redirigiendo al login...</p>