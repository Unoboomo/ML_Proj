<script>
	import NumberSpinner from "svelte-number-spinner";
	import {
		endMatrix,
		show3d,
		vectorCoordsInput,
		inputVectorToggled
	} from "$stores";
	import { Matrix } from "ml-matrix";
	import { colorVector } from "$data/variables";
	import { fly } from "svelte/transition";
	import NumberField from "$components/matrix/NumberField.svelte";
	import {
		calculateSVDFromMatrix,
		calculateSVDFromTransformations
	} from "$utils/svd";

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

	// ---------------------------------------------------------------
	// 2D decomposition controls: endMatrix (top-left 2x2) = U · Σ · Vᵀ
	// U and Vᵀ are each a rotation or a reflection, Σ is per-axis scaling.
	//
	// The two directions are kept in sync by comparing results instead of
	// tracking who edited last:
	//   matrix → controls: skipped if the controls already produce this matrix
	//   controls → matrix: skipped if the matrix already equals the controls
	// so neither direction can retrigger the other, and the controls don't
	// jump around while you drag them.
	// ---------------------------------------------------------------
	const EPS = 1e-6;

	let factors = {
		u: { refl: false, angle: 0 },
		v: { refl: false, angle: 0 }
	};
	let sigma = [1, 1];

	const flat2d = (m) => [m[0], m[1], m[4], m[5]];
	const sameMatrix = (p, q) => p.every((x, i) => Math.abs(x - q[i]) < EPS);

	function composed(f, s) {
		const { M } = calculateSVDFromTransformations(
			f.v.refl,
			f.v.angle,
			s[0],
			s[1],
			f.u.refl,
			f.u.angle
		);
		return [M[0][0], M[0][1], M[1][0], M[1][1]];
	}

	// matrix → controls
	function syncFromMatrix(m) {
		const target = flat2d(m);
		if (sameMatrix(composed(factors, sigma), target)) return;
		console.log("resync", target, composed(factors, sigma));
		const svd = calculateSVDFromMatrix([
			[target[0], target[1]],
			[target[2], target[3]]
		]);
		factors = {
			u: { refl: svd.uIsReflection, angle: svd.angleUDegrees },
			v: { refl: svd.vIsReflection, angle: svd.angleVDegrees }
		};
		sigma = svd.singularValues;
	}

	// controls → matrix
	function applyControls(f, s) {
		const next = composed(f, s);
		if (sameMatrix(next, flat2d($endMatrix))) return;

		endMatrix.update((m) => {
			[m[0], m[1], m[4], m[5]] = next;
			return m;
		});
	}

	syncFromMatrix($endMatrix); // initialise the controls on mount
	$: syncFromMatrix($endMatrix); // must stay above applyControls
	$: applyControls(factors, sigma);

	const parts = [
		{ key: "u", label: "U", note: "turns last", color: "p" },
		{ key: "s", label: "Σ", note: "stretches", color: "s" },
		{ key: "v", label: "Vᵀ", note: "turns first", color: "a" }
	];
</script>

<div class="flex flex-col gap-4 pointer-events-auto">
	<div class="flex gap-5 items-center">
		<!-- Matrix -->
		<div class="shadow-lg shadow-neutral-content/20">
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

	{#if !$show3d}
		<!-- SVD: U · Σ · Vᵀ -->
		<div
			class="flex gap-3 items-start font-serif"
			transition:fly={transitionProps}
		>
			{#each parts as part (part.key)}
				{@const textColor = `color: hsl(var(--${part.color}));`}
				<div class="flex flex-col items-center gap-1">
					<div class="shadow-lg shadow-neutral-content/20">
						{#if part.key === "s"}
							<div
								class="container grid grid-cols-2 grid-rows-2 items-center px-3 bg-base-200"
							>
								<NumberField
									bind:value={sigma[0]}
									decimals={2}
									step={0.1}
									style={textColor}
									label="x scale"
								/>
								<span class="svd-zero">0</span>
								<span class="svd-zero">0</span>
								<NumberField
									bind:value={sigma[1]}
									decimals={2}
									step={0.1}
									style={textColor}
									label="y scale"
								/>
							</div>
						{:else}
							<div class="container flex items-center px-3 bg-base-200">
								<NumberField
									bind:value={factors[part.key].angle}
									decimals={1}
									step={1}
									style={textColor}
									label="{part.label} angle in degrees"
								/>
								<span class="pr-1 text-lg">°</span>
							</div>
						{/if}
					</div>

					{#if part.key !== "s"}
						<button
							class="btn btn-xs btn-ghost"
							title={factors[part.key].refl
								? "Reflecting across a line at this angle. Click to rotate instead."
								: "Rotating by this angle. Click to reflect across a line at this angle instead."}
							on:click={() =>
								(factors[part.key].refl = !factors[part.key].refl)}
						>
							{factors[part.key].refl ? "reflection" : "rotation"}
						</button>
					{/if}

					<span class="text-sm">
						{part.label}
						<span class="opacity-60">{part.note}</span>
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.container {
		box-shadow: inset 0px 0px 0px 3px white;
	}

	.number {
		@apply w-20 bg-base-200 px-2 py-2 text-right text-2xl;
	}

	.svd-zero {
		@apply w-24 px-2 py-2 text-right text-lg opacity-30;
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
