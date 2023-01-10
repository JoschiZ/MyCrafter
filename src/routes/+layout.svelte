<script lang="ts">
	import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';
	import { mdiGithub } from '@mdi/js';
	import { Icon, Svg } from '@smui/common';
	import { page } from '$app/stores';

	$: data = $page.data

	let topAppBar: TopAppBar;
</script>

<TopAppBar bind:this={topAppBar} variant="standard">
	<Row>
		<Section>
			<IconButton href="/" class="material-icons">menu</IconButton>
			<Title>MyCrafter.io</Title>
		</Section>
		{#if data.session}
		<Section align="end" toolbar>
			<span style="margin-right: 5px; font-size: 1.2em; font-color: blue"><a href="/profile">{data.session.user?.name}</a></span>
			<IconButton href="/auth/signout" class="material-icons" aria-label="logout">logout</IconButton>
		</Section>
		{:else}
		<Section align="end" toolbar>
			<IconButton href="/auth/signin" class="material-icons" aria-label="Login">login</IconButton>
		</Section>
		{/if}

	</Row>
</TopAppBar>
<div class="content-wrapper dp01">
	<AutoAdjust {topAppBar}>
		<slot />
	</AutoAdjust>
</div>
<footer>
	<IconButton aria-label="GitHub" href="https://github.com/hperrin/svelte-material-ui">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path fill="currentColor" d={mdiGithub} />
		</Icon>
	</IconButton>
</footer>

<style>
	/* Hide everything above this component. */
	:global(#smui-app),
	:global(body),
	:global(html) {
		display: block !important;
		height: auto !important;
		width: auto !important;
		position: static !important;
	}

	.content-wrapper {
        padding-left: 8px;
        padding-right: 8px;
		min-height: calc( 100vh - 65px );
		display: flex;
		justify-content: center;
	}

	footer {
		border-top: 2px solid rgba(245, 245, 245, 0.138);
		height: 60px;
	}
</style>
