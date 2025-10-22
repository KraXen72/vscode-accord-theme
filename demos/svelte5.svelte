<script lang="ts">
	import { enhance } from '$app/forms';
	import { transposeKey } from '$lib/music';
	import { urlWithParams } from '$lib/util';
	import LyricsToolbar from '@comp/LyricsToolbar.svelte';
	import ContentEditor from '@comp/ContentEditor.svelte';
	import PdfPreview from '@comp/PdfPreview.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';

	type FormErrors = {
		errors?: Record<string, string>;
		data?: Record<string, string>;
	};

	let { data, form }: { data: PageData; form: FormErrors | null } = $props();

	// --- UI State (local only) ---
	// Editor content state
	let content = $state(data.revision?.content || '');
	let comment = $state(data.revision?.comment || '');
	let arrangementName = $state(data.arrangement?.arrangementName || '');
	
	// Base key (from revision or song default)
	const baseKey = data.revision?.key || data.song.originalKey || 'C';
	
	// PDF styling state
	let pdfStyle = $state({
		fontSize: data.revision?.fontSize || 16,
		lineHeight: data.revision?.lineHeight || 1.5,
		fontFamily: 'Serif',
		chordColor: '#0000ff',
		pageMargins: 15,
		twoColumns: false
	});

	// Transpose and notation preferences
	let preferFlats = $state(false);
	let preferH = $state(false);
	let transpose = $state(0);
	let currentDisplayedKey = $state(baseKey);
	let validationError = $state('');
	let pdfDownloadFn: (() => Promise<void>) | null = null;

	// Construct cancel URL from return state
	const cancelUrl = $derived(() => {
		if (data.returnState.setId) {
			return `/set/${data.returnState.setId}/edit`;
		}
		return `/song/${data.songId}`;
	});

	// Display text for arrangement
	const arrangementDisplayName = $derived(() => {
		if (data.mode === 'arrangement' && !data.arrangement) {
			return arrangementName || 'Nový aranžmán';
		}
		return data.arrangement?.arrangementName || 'Neznámy aranžmán';
	});

	// Form submission handler
	const submitRevision: SubmitFunction = ({ formData }) => {
		validationError = '';
		
		// Add mode and IDs
		formData.set('mode', data.mode);
		formData.set('songId', data.songId.toString());
		if (data.arrangementId) {
			formData.set('arrangementId', data.arrangementId.toString());
		}
		if (data.returnState.setId) {
			formData.set('setId', data.returnState.setId.toString());
		}
		
		// Add content and styling
		formData.set('content', content);
		formData.set('key', currentDisplayedKey);
		formData.set('comment', comment);
		formData.set('fontSize', pdfStyle.fontSize.toString());
		formData.set('lineHeight', pdfStyle.lineHeight.toString());
		
		// Add arrangement name for new arrangements
		if (data.mode === 'arrangement' && !data.arrangementId) {
			formData.set('arrangementName', arrangementName);
		}

		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				await update();
			} else if (result.type === 'failure') {
				if (result.data?.errors) {
					validationError = Object.values(result.data.errors)[0] as string;
				} else if (result.data?.error) {
					validationError = result.data.error as string;
				}
			}
		};
	};

	function handlePdfStyleChange(newStyles: any) {
		pdfStyle = { ...pdfStyle, ...newStyles };
	}

	function handleTranspose(newTranspose: number) {
		transpose = newTranspose;
		const transposedKey = transposeKey(baseKey, newTranspose, preferFlats, preferH);
		currentDisplayedKey = transposedKey.key;
	}

	function handleNotationChange(params: { preferFlats: boolean; preferH: boolean }) {
		preferFlats = params.preferFlats;
		preferH = params.preferH;
		const transposedKey = transposeKey(baseKey, transpose, params.preferFlats, params.preferH);
		currentDisplayedKey = transposedKey.key;
	}
</script>

<form method="POST" use:enhance={submitRevision}>
	<main>
		<header>
			<h1 class="text-2xl font-bold text-primary">
				{#if data.mode === 'revision'}
					Nová revízia
				{:else if data.mode === 'arrangement' && data.arrangementId}
					Upraviť aranžmán
				{:else}
					Vytvoriť nový aranžmán
				{/if}
			</h1>
			<div class="flex gap-y-4 flex-col">
				<div>
					<h2 class="text-lg font-medium">{data.song.songTitle || 'Pieseň'}</h2>
					<span class="text-sm text-base-content/70">
						<span class="w-full flex justify-between">
							<span>Autor: <span class="font-medium">{data.song.author || 'Neznámy autor'}</span></span>
							<span>Originálna tónina: {data.song.originalKey || 'Neznáma'}</span>
						</span>
						{#if data.mode === 'revision' || (data.mode === 'arrangement' && data.arrangement)}
							<span class="w-full flex justify-between mt-1">
								<span>Aranžmán: <span class="font-medium">{arrangementDisplayName()}</span></span>
							</span>
						{/if}
					</span>
				</div>

				<!-- Main Action Buttons -->
				<div class="flex gap-2 w-full">
					{#if data.mode === 'revision'}
						<input
							type="text"
							class="input w-full text-sm"
							placeholder="Poznámka k úpravám"
							bind:value={comment}
						/>
					{:else}
						<div class="flex flex-col w-full">
							<label class="input w-full">
								<span class="text-base-content/70">Názov aranžmánu</span>
								<input
									type="text"
									class="text-sm focus:ring-transparent"
									class:input-error={form?.errors?.arrangementName}
									placeholder="napr. Akustická verzia"
									bind:value={arrangementName}
								/>
							</label>
							{#if form?.errors?.arrangementName}
								<span class="text-error text-xs mt-1">{form.errors.arrangementName}</span>
							{/if}
						</div>
					{/if}
					<a href={cancelUrl()} class="btn btn-soft">Zrušiť</a>
					<button
						type="button"
						class="btn"
						onclick={() => pdfDownloadFn?.()}
						disabled={!content.trim()}
					>
						<span class="iconify lucide--download text-lg"></span> PDF
					</button>
					<button type="submit" value="save" class="btn btn-primary">
						{#if data.mode === 'revision'} Uložiť revíziu {:else} Vytvoriť aranžmán {/if}
					</button>
				</div>

				<!-- Unified Toolbar Component -->
				<LyricsToolbar
					onTranspose={handleTranspose}
					onNotationChange={handleNotationChange}
					onPdfStyleChange={handlePdfStyleChange}
					initialPdfStyle={pdfStyle}
					initialNotationConfig={{
						preferFlats: preferFlats,
						preferH: preferH
					}}
					initialTranspose={transpose}
					baseKey={baseKey}
				/>
			</div>
		</header>

		<!-- Left Column: Editor -->
		<ContentEditor
			content={content}
			onContentChange={(newContent) => (content = newContent)}
			placeholder="Zadajte text piesne s akordmi..."
		/>

		<!-- Right Column: PDF Preview -->
		<PdfPreview
			content={content}
			songTitle={data.song.songTitle}
			author={data.song.author}
			{pdfStyle}
			onDownload={(filename, pdfBytes) => {
				console.log(`PDF downloaded: ${filename}, size: ${pdfBytes.length} bytes`);
			}}
			onDownloadRequest={(downloadFn) => {
				pdfDownloadFn = downloadFn;
			}}
			onError={(message) => {
				validationError = message;
			}}
		/>

		<div class="validation-container">
			<div class="min-h-[1.5rem] flex items-center">
				{#if validationError}
					<div class="alert alert-error py-2 px-4">
						<span class="iconify lucide--alert-circle text-base"></span>
						<span class="text-sm">{validationError}</span>
					</div>
				{/if}
			</div>
		</div>
	</main>
</form>

<style>
	main {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: min-content 1fr;
		gap: 1rem;
		padding: 1rem;
		height: calc(100vh - 5rem);
	}
	header {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.validation-container {
		grid-column: 1 / -1;
	}
</style>

