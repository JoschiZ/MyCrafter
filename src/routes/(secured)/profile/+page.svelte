<script lang="ts">
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';
	import HelperText from '@smui/textfield/helper-text';
	import Card from '@smui/card';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import snackbars from '$lib/stores/snackbars';
	import { openSnackbar } from '$lib/util/openSnackbar';
	import Button, { Label } from '@smui/button';
	import type { PageData } from './$types';
	import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
	import { TryParseInt } from '$lib/util/tryParse';
	import type { Character, UserRecipe } from '$db/user/UserModel';
	import Autocomplete from '@smui-extra/autocomplete';
	import { goto } from '$app/navigation';
	import GoldDisplay from '$lib/components/GoldDisplay.svelte';
	import { signOut } from '@auth/sveltekit/client';
	export let data: PageData;
	let importDump = '';
	let updateProfessionsButtonDisabled = false;

	let focused = false;
	let dirty = false;
	let invalid = false;

	function createSearchList(characters: Character[]) {
		let itemList: UserRecipe[] = [];
		for (const character of characters) {
			if (!character.professions) continue;
			for (const profession of character.professions) {
				if (!profession.recipes) continue;
				itemList = itemList.concat(profession.recipes);
			}
		}
		itemList.sort(function (a, b) {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
		return itemList;
	}

	let sekectedItemText = '';
	let itemList: UserRecipe[] = [];
	if (data.user) {
		itemList = createSearchList(data.user?.characters);
	}
	let selectedItem: UserRecipe;

	function onSearchKeyDown(e: CustomEvent<any>) {
		if (!data.user || !selectedItem) {
			return;
		}

		//@ts-expect-error Bad typing in SMUI
		if (e.keyCode === 13) {
			for (const character of data.user.characters) {
				if (!character.professions) {
					continue;
				}
				for (const profession of character.professions) {
					if (profession.recipes) {
						//This may be a bit expensive, but whatever it closes all Accordion Items
						for (const rec of profession.recipes) {
							const recipe = document.getElementById(
								`${character.name}-${profession.name}-${rec.recipeID}`
							)?.children[0] as HTMLElement;

							const prof = document.getElementById(`${character.name}-${profession.name}`)
								?.children[0] as HTMLElement;

							const char = document.getElementById(`${character.name}`)?.children[0] as HTMLElement;
							if (char.getAttribute('aria-expanded') == 'true') {
								setTimeout(() => char.click(), 200);
							}
							if (prof.getAttribute('aria-expanded') == 'true') {
								setTimeout(() => prof.click(), 200);
							}
							if (recipe.getAttribute('aria-expanded') == 'true') {
								setTimeout(() => recipe.click(), 125);
							}
						}
					}

					const recipe = document.getElementById(
						`${character.name}-${profession.name}-${selectedItem.recipeID}`
					)?.children[0] as HTMLElement;
					if (!recipe) {
						continue;
					}
					const prof = document.getElementById(`${character.name}-${profession.name}`)
						?.children[0] as HTMLElement;
					const char = document.getElementById(`${character.name}`)?.children[0] as HTMLElement;

					if (!prof || !char) {
						continue;
					}

					if (char.getAttribute('aria-expanded') == 'false') {
						setTimeout(() => char.click(), 200);
					}
					if (prof.getAttribute('aria-expanded') == 'false') {
						setTimeout(() => prof.click(), 200);
					}
					if (recipe.getAttribute('aria-expanded') == 'false') {
						setTimeout(() => recipe.click(), 125);
					}
				}
			}
		}
	}

	const updateProgressAction: SubmitFunction = () => {
		updateProfessionsButtonDisabled = true;
		setTimeout(function () {
			updateProfessionsButtonDisabled = false;
		}, 5000);
		return async ({ result }) => {
			if (result.type === 'failure') {
				if (result.status == 401) {
					await goto('/login');
				}

				const message = result.data?.message ? result.data.message : 'Unknown Error';
				openSnackbar($snackbars.error, message);
				await applyAction(result);
			} else if (result.type === 'success') {
				const message = result.data?.message ? result.data.message : 'Update Succeeded';

				openSnackbar($snackbars.success, message);

				await applyAction(result);
			}
		};
	};

	const updateProfessionsAction: SubmitFunction = () => {
		updateProfessionsButtonDisabled = true;
		setTimeout(function () {
			updateProfessionsButtonDisabled = false;
		}, 5000);

		return async ({ result }) => {
			if (result.type === 'failure') {
				if (result.status == 401) {
					await signOut();
					await goto('/login');
				}
				const message = result.data?.message ? result.data.message : 'Unknown Error';

				openSnackbar($snackbars.error, message);

				await applyAction(result);
			}
			if (result.type === 'success') {
				const message = result.data?.message ? result.data.message : 'Update Succeeded';
				if (data.user && result.data?.characters) {
					data.user.characters = result.data.characters;
				}
				openSnackbar($snackbars.success, message);

				await applyAction(result);
			}
		};
	};
</script>

<div class="layout">
	<section style="justify-self: end;">
		<Card padded>
			<div style="padding: 1rem;">
				<h2 class="mdc-typography--headline6" style="margin: 0;">Upload your crafter data!</h2>
			</div>
			<form use:enhance={updateProgressAction} method="POST" action="?/updateProgress">
				<input hidden name="profession-json" bind:value={importDump} />
				<Textfield textarea bind:value={importDump}>
					<input name="data" type="data" hidden bind:value={importDump} />
					<HelperText slot="helper">Insert your MyCrafter addon output</HelperText>
				</Textfield>
				<Button bind:disabled={updateProfessionsButtonDisabled} variant="raised"
					><Label>Update Progress</Label></Button
				>
			</form>
		</Card>
	</section>
	<section style="justify-self: start; mdc-elevation-s1">
		<Card padded>
			<div style="padding: 1rem;">
				<h2 class="mdc-typography--headline6" style="margin: 0;">Your Recipes</h2>
			</div>
			{#if data.user && data.user.characters.length > 0}
				<Autocomplete
					options={itemList}
					getOptionLabel={(item) => (item ? `${item.name}` : '')}
					bind:text={sekectedItemText}
					bind:value={selectedItem}
					variant="outlined"
					showMenuWithNoInput={false}
					on:keydown={onSearchKeyDown}
				>
					<Textfield label="search" variant="outlined" bind:value={sekectedItemText} />
				</Autocomplete>

				<Accordion multiple>
					{#each data.user.characters as character}
						{#if character.professions && character.professions.length > 0}
							<Panel extend id={`${character.name}`}>
								<Header>{character.name}-{character.realm.name}</Header>
								<Content>
									<Accordion multiple>
										{#each character.professions as profession}
											{#if profession.recipes}
												<Panel
													extend
													disabled={profession.recipes.length === 0}
													id={`${character.name}-${profession.name}`}
												>
													<Header>{profession.name}</Header>
													<Content>
														<Accordion multiple>
															{#each profession.recipes as recipe}
																<Panel
																	extend
																	variant="raised"
																	id={`${character.name}-${profession.name}-${recipe.recipeID}`}
																>
																	<Header>{recipe.name}</Header>
																	<Content>
																		<div>
																			<p>
																				{#if recipe.commission}
																					Commission: <GoldDisplay amount={recipe.commission} />
																				{/if}
																			</p>
																			<form
																				method="post"
																				action="?/updateCommission"
																				use:enhance={(formAction) => {
																					const formData = formAction.data;
																					const submitCommission = formData
																						.get('commission')
																						?.toString();

																					if (!submitCommission) {
																						openSnackbar(
																							$snackbars.warning,
																							'Comission was undefined'
																						);
																						formAction.cancel();
																						return;
																					}

																					const commissionNumber = TryParseInt(
																						submitCommission,
																						undefined
																					);

																					if (!commissionNumber) {
																						openSnackbar(
																							$snackbars.warning,
																							'Comission was not a number'
																						);
																						formAction.cancel();
																						return;
																					}
																					if (
																						submitCommission &&
																						recipe.commission &&
																						commissionNumber === recipe.commission
																					) {
																						openSnackbar(
																							$snackbars.warning,
																							'Old commission was equal to the new commission'
																						);
																						formAction.cancel();
																						return;
																					}

																					return async ({ result }) => {
																						if (result.type === 'failure') {
																							const message = result.data?.message
																								? result.data.message
																								: 'Unknown Error';
																							openSnackbar($snackbars.error, message);
																							await applyAction(result);
																						} else if (result.type === 'success') {
																							const message = result.data?.message
																								? result.data.message
																								: 'Update Succeeded';

																							recipe.commission = result.data?.commission;

																							openSnackbar($snackbars.success, message);

																							await applyAction(result);
																						}
																					};
																				}}
																			>
																				<input hidden name="recipeID" value={recipe.recipeID} />
																				<input
																					hidden
																					name="skillLineID"
																					value={profession.skillLineID}
																				/>
																				<input
																					hidden
																					name="characterID"
																					value={character.characterID}
																				/>
																				<Textfield
																					type="text"
																					bind:dirty
																					bind:invalid
																					value=""
																					updateInvalid
																					label="Commission"
																					style="min-width: 280px;"
																					input$autocomplete="text"
																					input$name="commission"
																					on:focus={() => (focused = true)}
																					on:blur={() => (focused = false)}
																					withTrailingIcon={true}
																				>
																					<svelte:fragment slot="trailingIcon">
																						<Button>
																							<Icon class="material-icons">send</Icon>
																						</Button>
																					</svelte:fragment>
																				</Textfield>
																			</form>
																		</div>
																	</Content>
																</Panel>
															{/each}
														</Accordion>
													</Content>
												</Panel>
											{/if}
										{/each}
									</Accordion>
								</Content>
							</Panel>
						{/if}
					{/each}
				</Accordion>
			{/if}
			<form use:enhance={updateProfessionsAction} method="POST" action="?/updateProfessions">
				<Button
					style="margin-top:19px"
					bind:disabled={updateProfessionsButtonDisabled}
					variant="raised"><Label>Update Profession Data</Label></Button
				>
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

	* :global(.sub-list) {
		padding-left: 10px;
	}
</style>
