<svelte:head>
    <title>MyCrafter.io - Login - Please login with your Battle.net account.</title>
</svelte:head>

<Button on:click={LogIn}>Login with Battle.Net</Button>

<p>{$IsLoggedIn}</p>

<script lang="ts">
    import Button from "@smui/button"
	import { readable, writable } from "svelte/store";

    let IsLoggedIn = writable(false)

    function LogIn(){
        IsLoggedIn.set(!$IsLoggedIn)
    }

</script>