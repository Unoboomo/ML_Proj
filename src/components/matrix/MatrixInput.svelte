<script>
	import NumberSpinner from "svelte-number-spinner";
	import {
		endMatrix,
		show3d,
		vectorCoordsInput,
		inputVectorToggled
	} from "$stores";
	import { Matrix } from "ml-matrix";
	import { colorVector, egEndMatrix, eg3dMatrix } from "$data/variables";
	import { gsap } from "$utils/gsap.js";
	import { fly } from "svelte/transition";
	import NumberField from "$components/matrix/NumberField.svelte";
	import SVDControls from "$components/matrix/SVDControls.svelte";

	const transitionProps = { duration: 200, x: -30 };

	// TODO: Make this a spring?
	// TODO: For the progress bar too?
	// Make the interactions feel more playful; no sudden jumps

	const indices3d = [0, 1, 2, 4, 5, 6, 8, 9, 10];
	const indices2d = [0, 1, 4, 5];

	const colors = ["p", "s", "a"];

	$: dims = $show3d ? 3 : 2;

	const spinnerClass = `number-spinner`;

	// Compute matrix-vector multiplication
	let outputVector;
	$: {
		if ($show3d) {
			const A = new Matrix([
				[$endMatrix[0], $endMatrix[1], $endMatrix[2]],
				[$endMatrix[4], $endMatrix[5], $endMatrix[6]],
				[$endMatrix[8], $endMatrix[9], $endMatrix[10]]
			]);

			const v = new Matrix([$vectorCoordsInput]).transpose();

			const b = A.mmul(v);

			outputVector = [b.get(0, 0), b.get(1, 0), b.get(2, 0)];
		} else {
			const A = new Matrix([
				[$endMatrix[0], $endMatrix[1]],
				[$endMatrix[4], $endMatrix[5]]
			]);

			const v = new Matrix([
				[$vectorCoordsInput[0], $vectorCoordsInput[1]]
			]).transpose();

			const b = A.mmul(v);

			outputVector = [b.get(0, 0), b.get(1, 0)];
		}
	}

	// Animate back to the matrix the playground opened with.
	// Same in-place tween the scene uses, because matrixTween holds a
	// reference to the endMatrix array (never replace it).
	function resetMatrix() {
		gsap.to($endMatrix, {
			endArray: $show3d ? eg3dMatrix : egEndMatrix,
			duration: 0.4,
			onUpdate: () => ($endMatrix = $endMatrix)
		});
	}
</script>

<div class="flex gap-5 items-center pointer-events-auto">
	<!-- Matrix -->
	<div class="relative shadow-lg shadow-neutral-content/20">
		{#if $show3d}
			<div
				class="container font-serif grid grid-cols-3 grid-rows-3 px-3 bg-base-200"
			>
				{#each indices3d as idx, i (i)}
					{@const textColor = colors[i % 3]}
					<div>
						<NumberSpinner
							bind:value={$endMatrix[idx]}
							step={0.1}
							decimals={1}
							speed={0.1}
							class={spinnerClass}
							mainStyle={`color: hsl(var(--${textColor}));`}
						/>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="container font-serif grid grid-cols-2 grid-rows-2 px-3 bg-base-200"
			>
				{#each indices2d as idx, i (i)}
					{@const textColor = colors[i % 2]}
					<div>
						<NumberField
							bind:value={$endMatrix[idx]}
							decimals={1}
							step={0.1}
							style={`color: hsl(var(--${textColor}));`}
							label="matrix entry"
						/>
					</div>
				{/each}
			</div>
		{/if}

		<button
			class="btn btn-ghost btn-xs absolute left-1/2 top-full mt-1 -translate-x-1/2"
			title="Reset to the original matrix"
			on:click={resetMatrix}
		>
			↺ reset
		</button>
	</div>

	{#if $inputVectorToggled}
		<!-- Input Vector -->
		<div
			transition:fly={transitionProps}
			class="shadow-lg shadow-neutral-content/20"
		>
			<div
				class="font-serif grid grid-cols-1 grid-rows-2 px-3 bg-base-200"
				style:box-shadow="inset 0px 0px 0px 3px {colorVector}"
			>
				{#each $show3d ? [3, 4, 5] : [3, 4] as idx, i}
					{@const textColor = colors[i % 3]}
					<div>
						<NumberSpinner
							bind:value={$vectorCoordsInput[i]}
							step={0.1}
							decimals={1}
							speed={0.1}
							class={spinnerClass}
							mainStyle={`color: hsl(var(--${textColor}));`}
						/>
					</div>
				{/each}
			</div>
		</div>

		<div
			class="font-serif text-2xl font-black"
			transition:fly={transitionProps}
		>
			=
		</div>

		<!-- Output Vector -->
		<div transition:fly={transitionProps}>
			<div
				class="container font-serif grid grid-cols-1 grid-rows-2 px-3 bg-base-200"
			>
				{#each outputVector as coord, i (i)}
					<div class="number" style:color={colorVector}>
						{coord.toFixed(1)}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Fixed to the bottom-left of the screen; portals out of #inputs -->
<SVDControls />

<style lang="postcss">
	.container {
		box-shadow: inset 0px 0px 0px 3px white;
	}

	.number {
		@apply w-20 bg-base-200 px-2 py-2 text-right text-2xl;
	}

	:global(.number-spinner) {
		@apply w-20 bg-base-200 px-2 py-2 text-right text-2xl transition-all selection:text-inherit;

		&:hover {
			@apply bg-base-100;
		}

		&:focus {
			@apply bg-base-100 outline-none ring-1 ring-inset ring-info;
		}
	}
</style>
