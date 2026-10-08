<script>
	import { endMatrix, show3d, showPlayground } from "$stores";
	import { fly } from "svelte/transition";
	import NumberField from "$components/matrix/NumberField.svelte";
	import {
		calculateSVDFromMatrix,
		calculateSVDFromTransformations
	} from "$utils/svd";

	// The scene tweens #inputs with a CSS transform, and a transformed ancestor
	// turns `position: fixed` into "fixed relative to that ancestor". So this
	// moves itself out to <body> (or to the element carrying data-theme, so the
	// daisyUI colors still apply) and pins to the real viewport.
	function portal(node) {
		const themed = document.querySelector("[data-theme]");
		const host =
			themed && themed !== document.documentElement ? themed : document.body;
		host.appendChild(node);
		return { destroy: () => node.remove() };
	}

	// Only in the 2D playground
	$: visible = $showPlayground && !$show3d;

	// ---------------------------------------------------------------
	// endMatrix (top-left 2x2) = U · Σ · Vᵀ
	// U and Vᵀ are each a rotation or a reflection, Σ is per-axis scaling.
	//
	// The two directions are kept in sync by comparing results instead of
	// tracking who edited last:
	//   matrix → controls: skipped if the controls already produce this matrix
	//   controls → matrix: skipped if the matrix already equals the controls
	// ---------------------------------------------------------------
	const EPS = 1e-6;

	let factors = {
		u: { refl: false, angle: 0 },
		v: { refl: false, angle: 0 }
	};
	let sigma = [1, 1];

	const flat2d = (m) => [m[0], m[1], m[4], m[5]];
	const sameMatrix = (p, q) => p.every((x, i) => Math.abs(x - q[i]) < EPS);

	function decompose(f, s) {
		return calculateSVDFromTransformations(
			f.v.refl,
			f.v.angle,
			s[0],
			s[1],
			f.u.refl,
			f.u.angle
		);
	}

	function composed(f, s) {
		const { M } = decompose(f, s);
		return [M[0][0], M[0][1], M[1][0], M[1][1]];
	}

	// matrix → controls
	function syncFromMatrix(m) {
		const target = flat2d(m);
		if (sameMatrix(composed(factors, sigma), target)) return;

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
	// Mutate in place: Scene's matrixTween holds a reference to this array.
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

	// What gets displayed
	$: A = flat2d($endMatrix);
	$: mats = decompose(factors, sigma);

	const fmt = (n) => (Math.abs(n) < 0.005 ? 0 : n).toFixed(2);
	const deg = (n) => (Math.abs(n) < 0.05 ? 0 : n).toFixed(1);

	const parts = [
		{ key: "u", label: "U", order: "applied 3rd", color: "p" },
		{ key: "s", label: "Σ", order: "applied 2nd", color: "s" },
		{ key: "v", label: "Vᵀ", order: "applied 1st", color: "a" }
	];
</script>

{#if visible}
	<div
		use:portal
		class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-start px-4"
	>
		<div
			class="panel pointer-events-auto max-w-full overflow-x-auto bg-base-200 px-8 py-5 font-serif shadow-lg shadow-neutral-content/20"
			transition:fly={{ duration: 250, x: -30 }}
		>
			<div class="eq">
				<!-- Row 1: names -->
				<div class="name">A</div>
				<div />
				{#each parts as part (part.key)}
					<div class="name" style="color: hsl(var(--{part.color}))">
						{part.label}
					</div>
				{/each}

				<!-- Row 2: A = U Σ Vᵀ -->
				<div class="bracket">
					<div class="cells">
						{#each A as v, i (i)}
							<span class="cell">{fmt(v)}</span>
						{/each}
					</div>
				</div>
				<div class="equals">=</div>
				{#each parts as part (part.key)}
					<div class="bracket" style="color: hsl(var(--{part.color}))">
						<div class="cells">
							{#if part.key === "s"}
								<NumberField
									big
									bind:value={sigma[0]}
									decimals={2}
									step={0.1}
									label="x scale"
								/>
								<span class="cell zero">0</span>
								<span class="cell zero">0</span>
								<NumberField
									big
									bind:value={sigma[1]}
									decimals={2}
									step={0.1}
									label="y scale"
								/>
							{:else}
								{#each (part.key === "u" ? mats.U : mats.VT).flat() as v, i (i)}
									<span class="cell">{fmt(v)}</span>
								{/each}
							{/if}
						</div>
					</div>
				{/each}

				<!-- Row 3: controls -->
				<div />
				<div />
				{#each parts as part (part.key)}
					{#if part.key === "s"}
						<div />
					{:else}
						<div
							class="flex flex-col items-center gap-1"
							style="color: hsl(var(--{part.color}))"
						>
							<div class="flex items-center gap-1">
								<span class="text-sm opacity-60">
									{factors[part.key].refl ? "mirror line" : "angle"}
								</span>
								<NumberField
									bind:value={factors[part.key].angle}
									decimals={1}
									step={1}
									label="{part.label} angle in degrees"
								/>
								<span class="text-lg">°</span>
							</div>
							<button
								class="btn btn-ghost btn-xs"
								title={factors[part.key].refl
									? "Reflecting across a line at this angle. Click to rotate instead."
									: "Rotating by this angle. Click to reflect across a line at this angle instead."}
								on:click={() =>
									(factors[part.key].refl = !factors[part.key].refl)}
							>
								switch to {factors[part.key].refl ? "rotation" : "reflection"}
							</button>
						</div>
					{/if}
				{/each}

				<!-- Row 4: captions -->
				<div class="caption">
					<span>transformation</span>
					<span>the matrix you edit</span>
				</div>
				<div />
				{#each parts as part (part.key)}
					<div class="caption" style="color: hsl(var(--{part.color}))">
						<span>{part.order}</span>
						{#if part.key === "s"}
							<span>
								stretches x by {fmt(sigma[0])}, y by {fmt(sigma[1])}
								{#if sigma[0] < 0 || sigma[1] < 0}
									(a negative value flips that axis)
								{/if}
							</span>
						{:else}
							<span>
								{factors[part.key].refl
									? "reflects across the line at"
									: "rotates by"}
								{deg(factors[part.key].angle)}°
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	/* Same inset outline as the matrix boxes */
	.panel {
		box-shadow: inset 0px 0px 0px 3px white;
	}

	/* Five columns: A, =, U, Σ, Vᵀ; four rows: name, matrix, controls, caption */
	.eq {
		display: grid;
		grid-template-columns: repeat(5, auto);
		column-gap: 1.5rem;
		row-gap: 0.6rem;
		align-items: center;
		justify-items: center;
	}

	.name {
		@apply text-2xl font-black;
	}

	.equals {
		@apply text-4xl font-black;
	}

	/* Matrix brackets, drawn with borders */
	.bracket {
		position: relative;
		padding: 0.35rem 1.1rem;
	}
	.bracket::before,
	.bracket::after {
		content: "";
		position: absolute;
		top: 0;
		bottom: 0;
		width: 0.6rem;
		border: 3px solid currentColor;
	}
	.bracket::before {
		left: 0;
		border-right: none;
	}
	.bracket::after {
		right: 0;
		border-left: none;
	}

	.cells {
		display: grid;
		grid-template-columns: repeat(2, auto);
		column-gap: 1rem;
		row-gap: 0.25rem;
		align-items: center;
		justify-items: end;
	}

	.cell {
		@apply text-3xl tabular-nums;
		min-width: 4.5rem;
		text-align: right;
	}

	/* Matches the width of a big NumberField (w-32) */
	.zero {
		min-width: 8rem;
		opacity: 0.3;
	}

	.caption {
		@apply flex flex-col items-center text-center text-sm leading-tight;
		max-width: 12rem;
	}
	.caption span:first-child {
		@apply font-bold;
	}
	.caption span:last-child {
		@apply opacity-70;
	}
</style>
