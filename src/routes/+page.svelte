<script lang="ts">
	import type { PageData } from './$types';
	import Card from '@smui/card';
	export let data: PageData;

	$: ({ professions } = data);
</script>

<svelte:head>
	<title>MyCrafter.io - Main Page</title>
</svelte:head>

<Card padded>
	<h1>What are you looking for today?</h1>
	<div class="profession-button-grid">
		{#each professions as profession}
			<div class="profession-button">
				<a href="/professions/{profession.name}">
					<img alt={profession.name} src={profession.icon} />
				</a>
			</div>
		{/each}
	</div>
</Card>



<style>
	.profession-button-grid {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
	}

	a {
		display: flex;
		text-decoration: none;
	}

	.profession-button {
		padding: 0.5em;
		border-radius: 24%;
		margin: 0.25em;
	}

	.profession-button:hover {
		background-color: hsla(0, 100%, 100%, 0.05);
		box-shadow:
			/* offset-x | offset-y | blur-radius | spread-radius | color */
			0px 1px 1px 0px hsla(0,0%,0%,0.14), 
			0px 2px 1px -1px hsla(0,0%,0%,0.12), 
			0px 1px 3px 0px hsla(0,0%,0%,0.2);
	}

	.profession-button img {
		display: inline-block;
		height: 5em;
		width: 5em;
		border-radius: 24%;
		border: 2px solid black;
	}
</style>
