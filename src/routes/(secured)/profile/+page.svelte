<script lang="ts">
	import type { PageData } from './$types';
	import Select, { Option } from '@smui/select';
	import type { Character } from '$db/user/type/User';
    import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';

	export let data: PageData;

	let characters = data.user?.characters ? data.user.characters : [];

	function getFirstCharacter(characters: Character[] | undefined) {
		if (characters && characters[0]) {
			return characters[0];
		}
	}

	let selectedCharacter = getFirstCharacter(characters);


    let importDump = ""
</script>

{#if !data.session}
	<p>Pleases log in with your<a href="/auth/signin">battlenet account </a></p>
{:else}
	<form>
		<Select
			key={(char) => `${char ? char.id : ''}`}
			bind:value={selectedCharacter}
			label="Character"
		>
			{#each characters as character}
				<Option value={character}>{character.name + "-" + character.realm.name}</Option>
			{/each}
		</Select>
        <Textfield textarea bind:value={importDump}>
            <HelperText slot="helper">Insert your MyCrafter addon output</HelperText>
        </Textfield>
	</form>
{/if}
