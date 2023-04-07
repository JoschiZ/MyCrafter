<script lang="ts">
	import { goto } from '$app/navigation';
    import type { LayoutData } from './$types';
    import snackbars from '$lib/stores/snackbars';
	import { openSnackbar } from '$lib/util/openSnackbar';
    
    export let data: LayoutData;
</script>

<slot />