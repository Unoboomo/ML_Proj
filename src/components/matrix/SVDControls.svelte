<script>
	import { endMatrix, show3d, showPlayground } from "$stores";
	import { fly } from "svelte/transition";
	import NumberField from "$components/matrix/NumberField.svelte";
	import {
		calculateSVDFromMatrix,
		calculateSVDFromTransformations
	} from "$utils/svd";

	// The scene tweens #inputs with a CSS transform, and a transformed ancestor
	// turns `position: fixed` into "fixed relative to that ancestor". So the
	// panel moves itself out to <body> (or to the element carrying data-theme,
	// so the daisyUI colors still apply) and pins to the real viewport corner.
	function portal(node) {
		const themed = document.querySelector("[data-theme]");
		const host =
			themed && themed !== document.documentElement
				? themed
				: document.body;
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

	// Read-only view of the actual matrices
	$: A = flat2d($endMatrix);
	$: mats = decompose(factors, sigma);
	$: shown = {
		u: mats.U.flat(),
		s: mats.Sigma.flat(),
		v: mats.VT.flat()
	};
	const fmt = (n) => (Math.abs(n) < 0.005 ? 0 : n).toFixed(2);

	const parts = [
		{ key: "u", label: "U", note: "turns last", color: "p" },
		{ key: "s", label: "Σ", note: "stretches", color: "s" },
		{ key: "v", label: "Vᵀ", note: "turns first", color: "a" }
	];
</script>

{#if visible}
	<div
		use:portal
		class="pointer-events-auto fixed bottom-4 left-4 z-50 max-w-[calc(100vw-2rem)] overflow-x-auto bg-base-100/85 p-3 font-serif text-base-content backdrop-blur-sm"
		transition:fly={{ duration: 200, x: -30 }}
	>
		<div class="eq">
			<!-- Row 1: A = U Σ Vᵀ -->
			<div class="shadow-lg shadow-neutral-content/20">
				<div class="brackets">
					<div class="cells">
						{#each A as v, i (i)}
							<span class="cell"><span>{fmt(v)}</span></span>
						{/each}
					</div>
				</div>
			</div>
			<div class="equals">=</div>
			{#each parts as part (part.key)}
				<div class="shadow-lg shadow-neutral-content/20">
					<div class="brackets" style="color: hsl(var(--{part.color}))">
						<div class="cells">
							{#each shown[part.key] as v, i (i)}
								<span class="cell">
									<span
										class:zero={part.key === "s" && (i === 1 || i === 2)}
									>
										{fmt(v)}
									</span>
								</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}

			<!-- Row 2: controls under their matrix -->
			<div />
			<div />
			{#each parts as part (part.key)}
				<div class="controls" style="color: hsl(var(--{part.color}))">
					{#if part.key === "s"}
						<div class="field-row">
							<span>x scale</span>
							<NumberField
								bind:value={sigma[0]}
								decimals={2}
								step={0.1}
								label="x scale"
							/>
						</div>
						<div class="field-row">
							<span>y scale</span>
							<NumberField
								bind:value={sigma[1]}
								decimals={2}
								step={0.1}
								label="y scale"
							/>
						</div>
					{:else}
						<div class="field-row">
							<span>{factors[part.key].refl ? "mirror line" : "angle"}</span>
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
							⇄ {factors[part.key].refl ? "reflection" : "rotation"}
						</button>
					{/if}
				</div>
			{/each}

			<!-- Row 3: labels -->
			<div class="label">
				<span class="name">A</span>
				<span class="note">output</span>
			</div>
			<div />
			{#each parts as part (part.key)}
				<div class="label">
					<span class="name" style="color: hsl(var(--{part.color}))">
						{part.label}
					</span>
					<span class="note">{part.note}</span>
				</div>
			{/each}
		</div>

		<div class="mt-2 flex flex-col gap-1 text-sm">
			<p>A = U Σ Vᵀ, applied right to left: Vᵀ, then Σ, then U.</p>
			<p>
				Type a value and press <kbd class="kbd kbd-sm">Enter</kbd> to confirm,
				<kbd class="kbd kbd-sm">Esc</kbd> to cancel.
			</p>
			<p>
				Click <b>rotation</b> / <b>reflection</b> under U or Vᵀ to switch
				between them.
			</p>
		</div>
	</div>
{/if}

<style lang="postcss">
	/* Columns: A, =, U, Σ, Vᵀ. Rows: matrices, controls, labels */
	.eq {
		display: grid;
		grid-template-columns: repeat(5, auto);
		column-gap: 1.25rem;
		row-gap: 0.5rem;
		align-items: center;
		justify-items: center;
	}

	/*
	 * Bracket look, same trick as the matrix inputs: the white inset outline is
	 * only visible in the side padding (the corner ticks and the vertical bars),
	 * because the opaque cells cover it everywhere else.
	 */
	.brackets {
		@apply bg-base-200;
		padding: 0 0.75rem;
		box-shadow: inset 0px 0px 0px 3px white;
	}

	.cells {
		display: grid;
		grid-template-columns: repeat(2, auto);
	}

	.cell {
		@apply bg-base-200 px-2 py-2 text-right text-xl tabular-nums;
		min-width: 4.25rem;
	}

	/* off-diagonal zeros of Σ (dim the text only, never the opaque cell) */
	.zero {
		opacity: 0.55;
	}

	.equals {
		@apply text-3xl font-black;
	}

	.controls {
		@apply flex flex-col items-center gap-1;
	}

	.field-row {
		@apply flex items-center gap-2 text-sm font-bold;
	}

	/* give the inputs a visible edge now that they sit outside the matrix boxes */
	.field-row :global(.field) {
		box-shadow: inset 0px 0px 0px 1px hsl(var(--bc) / 0.4);
	}

	.label {
		@apply flex flex-col items-center text-center leading-tight;
	}

	.name {
		@apply text-lg font-black;
	}

	.note {
		@apply text-sm;
		color: hsl(var(--bc));
	}
</style>