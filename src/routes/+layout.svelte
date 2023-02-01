<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { mdiGithub } from '@mdi/js';
	import Autocomplete from '@smui-extra/autocomplete';
	import Card from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import { Icon, Label, Svg } from '@smui/common';
	import IconButton from '@smui/icon-button';
	import { Text } from '@smui/list';
	import Snackbar, { Actions } from '@smui/snackbar';
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import snackbars from '$lib/stores/snackbars';
	import { onMount } from 'svelte';

	$: data = $page.data;

	let topAppBar: TopAppBar;

	async function getData(name: string) {
		const response = await fetch(`/api/items?name=${name}`, {
			method: 'GET'
		});
		return response.json();
	}

	let items: { name: string; id: number }[] = [];
	let setOfNames = new Set();

	let value: string | undefined = undefined;

	let counter = 0;

	async function searchItems(input: string) {
		if (input === '') {
			return [];
		}

		for (const item of items) {
			if (item.name === input) {
				return [item];
			}
		}

		// Pretend to have some sort of canceling mechanism.
		const myCounter = ++counter;

		const newItems = await getData(input);

		for (const newItem of newItems) {
			if (setOfNames.has(newItem.name)) {
				continue;
			}
			setOfNames.add(newItem.name);
			items.push(newItem);
		}

		// This means the function was called again, so we should cancel.
		if (myCounter !== counter) {
			// `return false` (or, more accurately, resolving the Promise object to
			// `false`) is how you tell Autocomplete to cancel this search. It won't
			// replace the results of any subsequent search that has already finished.
			return false;
		}

		// Return a list of matches.
		return Array.from(items).filter((item) => item.name.includes(input));
	}

	function onSearchKeyDown(e: CustomEvent<any>) {
		//@ts-expect-error Bad typing in SMUI
		if (e.keyCode === 13) {
			goto(`/items/${itemText}`);
		}
	}

	let itemText = '';

	let snackbarSuccess: Snackbar | undefined;
	let snackbarError: Snackbar | undefined;
	let snackbarWarning: Snackbar | undefined;

	onMount(async () => {
		snackbars.set({
			success: snackbarSuccess,
			warning: snackbarWarning,
			error: snackbarError
		});
	});
</script>

<TopAppBar style="position:unset" variant="standard">
	<Row>
		<Section align="start">
			<IconButton href="/" class="material-icons">menu</IconButton>
			<Title>MyCrafter.io</Title>
		</Section>
		<Section style="justify-content: center;">
			<Card style="padding-left: 10px; padding-right: 10px;" class="search-bar">
				<div>
					<Autocomplete
						search={searchItems}
						bind:value
						showMenuWithNoInput={false}
						bind:text={itemText}
						class="search-autocomplete"
						getOptionLabel={(option) => (option ? `${option.name}` : '')}
						on:keydown={onSearchKeyDown}
					>
						<Text
							slot="loading"
							style="display: flex; width: 100%; justify-content: center; align-items: center;"
							class="search-text"
						>
							<CircularProgress style="height: 24px; width: 24px;" indeterminate />
						</Text>
					</Autocomplete>
				</div>
			</Card>
		</Section>
		{#if data.session}
			<Section align="end" toolbar>
				<Title style="margin-right: 5px; font-size: 1.2em; font-color: blue"
					><a href="/profile">{data.session.user?.name}</a></Title
				>
				<IconButton href="/auth/signout" class="material-icons" aria-label="logout"
					>logout</IconButton
				>
			</Section>
		{:else}
			<Section align="end" toolbar>
				<IconButton href="/login" class="material-icons" aria-label="Login">login</IconButton>
			</Section>
		{/if}
	</Row>
</TopAppBar>
<div class="content-wrapper dp01">
	<slot />
</div>
<footer>
	<IconButton aria-label="GitHub" href="https://github.com/JoschiGrey/MyCrafter">
		<Icon component={Svg} viewBox="0 0 24 24">
			<path fill="currentColor" d={mdiGithub} />
		</Icon>
	</IconButton>
</footer>
<Snackbar bind:this={snackbarSuccess} class="demo-success">
	<Label />
	<Actions>
		<IconButton class="material-icons" title="Dismiss">close</IconButton>
	</Actions>
</Snackbar>

<Snackbar bind:this={snackbarWarning} class="demo-warning">
	<Label />
	<Actions>
		<IconButton class="material-icons" title="Dismiss">close</IconButton>
	</Actions>
</Snackbar>

<Snackbar bind:this={snackbarError} class="demo-error">
	<Label />
	<Actions>
		<IconButton class="material-icons" title="Dismiss">close</IconButton>
	</Actions>
</Snackbar>

<style lang="scss">
	* :global(.search-autocomplete input) {
		width: 400px;
	}

	* :global(.search-autocomplete label) {
		height: 45px;
	}

	*
		:global(
			.search-autocomplete
				.smui-text-field--standard:not(.mdc-text-field--disabled)
				.mdc-line-ripple::before
		) {
		border-bottom-color: transparent;
	}

	*
		:global(
			.search-autocomplete
				.smui-text-field--standard:not(.mdc-text-field--disabled)
				.mdc-line-ripple::after
		) {
		border-bottom-color: transparent;
	}

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
		min-height: calc(100vh - 65px - 80px - 20px - 10px);
		padding-top: 20px;
		padding-bottom: 20px;
	}

	footer {
		border-top: 2px solid rgba(245, 245, 245, 0.138);
		height: 60px;
	}

	a {
		text-decoration: none;
		color: #148eff;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
