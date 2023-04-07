<script lang="ts">
	import { goto } from '$app/navigation';
    import type { LayoutData } from './$types';
    import snackbars from '$lib/stores/snackbars';
	import { openSnackbar } from '$lib/util/openSnackbar';
    
    export let data: LayoutData;

    if (!data.session){
        openSnackbar($snackbars.error, "Please Login with your BattleNET account")
        goto("/login", {invalidateAll: true})
    }
</script>

<slot />