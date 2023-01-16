<script lang="ts">
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import Card from '@smui/card';
	import { applyAction, enhance } from '$app/forms';
	import snackbars from '$lib/stores/snackbars';
	import { openSnackbar } from '$lib/util/openSnackbar';

	let importDump = '';

	const localSnackbars = $snackbars;
</script>

<div class="layout">
	<section style="justify-self: end;">
		<Card padded>
			<div style="padding: 1rem;">
				<h2 class="mdc-typography--headline6" style="margin: 0;">Upload your crafter data!</h2>
			</div>
			<form
				use:enhance={() => {
					return async ({ result }) => {
						console.log(result)
						if (result.type === 'failure') {

							if(result.data?.message){
								openSnackbar($snackbars.error, result.data.message)
							}
							else{
								openSnackbar($snackbars.error, "Unknown Error")
							}

							await applyAction(result);
						}
					};
				}}
				method="POST"
			>
				<input hidden name="profession-json" bind:value={importDump} />
				<Textfield textarea bind:value={importDump}>
					<input name="data" type="data" hidden bind:value={importDump} />
					<HelperText slot="helper">Insert your MyCrafter addon output</HelperText>
				</Textfield>
				<button>Send!</button>
			</form>
		</Card>
	</section>
	<section style="justify-self: start;">
		<Card padded>
			<div style="padding: 1rem;">
				<h2 class="mdc-typography--headline6" style="margin: 0;">Upload your crafter data!</h2>
			</div>
			<form>
				<Textfield textarea bind:value={importDump}>
					<HelperText slot="helper">Insert your MyCrafter addon output</HelperText>
				</Textfield>
			</form>
		</Card>
	</section>
	<section class="bottom">
		<Card padded>
			<div style="padding: 1rem;">
				<h2 class="mdc-typography--headline6" style="margin: 0;">Upload your crafter data!</h2>
			</div>
			<form>
				<Textfield textarea bind:value={importDump}>
					<HelperText slot="helper">Insert your MyCrafter addon output</HelperText>
				</Textfield>
			</form>
		</Card>
	</section>
</div>

<style>
	* :global(.mdc-text-field__resizer) {
		height: 300px;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	h2 {
		text-decoration: underline;
	}

	.layout {
		margin-top: 30px;
		display: grid;
		grid-template-columns: 50% 50%;
		grid-template-rows: 50% 50%;
		grid-template-areas:
			'upload settings'
			'stats stats';
		column-gap: 20px;
		row-gap: 20px;
		justify-items: center;
	}

	section {
		min-width: 50%;
	}

	.bottom {
		grid-column: 1 / span 2;
		grid-row: stats;
		align-self: end;
	}
</style>
