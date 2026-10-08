<script>
	import Tex from "./Tex.svelte";
	import { calculateSVDFromTransformations } from "$utils/svd.js";
	import { endMatrix } from "$stores";

	function fmt(val) {
		return Number(val).toFixed(2);
	}

	// Reactive State
	let vIsReflection = false;
	let vAngle = 0;
	let sigmaX = 1;
	let sigmaY = 1;
	let uIsReflection = false;
	let uAngle = 0;

	$: svd = calculateSVDFromTransformations(
		vIsReflection,
		vAngle,
		sigmaX,
		sigmaY,
		uIsReflection,
		uAngle
	);

	$: if (svd && svd.M) {
		// 1. Update matrix values
		$endMatrix = [
			svd.M[0][0],
			svd.M[1][0],
			0,
			0,
			svd.M[0][1],
			svd.M[1][1],
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		];
	}
</script>

<div
	class="my-8 p-6 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-800 max-w-full font-sans pointer-events-auto"
>
	<h3 class="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
		Interactive SVD Decomposition (<Tex expr={"M = U \\Sigma V^T"} />)
	</h3>

	<!-- Interactive Sliders -->
	<div
		class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-800 p-4 rounded-lg mb-6"
	>
		<!-- V^T Controls -->
		<div class="space-y-2">
			<div class="flex justify-between items-center">
				<label class="font-bold text-rose-400 text-xs" for="v-mode"
					><Tex expr={"V^T"} /> Operation</label
				>
				<select
					id="v-mode"
					bind:value={vIsReflection}
					class="bg-gray-700 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none"
				>
					<option value={false}>Rotation (<Tex expr={"\\theta"} />)</option>
					<option value={true}>Reflection (<Tex expr={"\\phi"} />)</option>
				</select>
			</div>
			<label class="block text-xs text-gray-300" for="v-angle">
				{vIsReflection ? "Line Angle" : "Rotation"}: {vAngle}°
			</label>
			<input
				id="v-angle"
				type="range"
				min={vIsReflection ? 0 : -180}
				max={vIsReflection ? 180 : 180}
				bind:value={vAngle}
				class="w-full accent-rose-400"
			/>
		</div>

		<!-- Sigma Controls -->
		<div class="space-y-2">
			<label class="font-bold text-purple-400 text-xs" for="sigma-x"
				><Tex expr={"\\Sigma"} /> Axis Scaling</label
			>
			<div class="text-xs text-gray-300">Scale X: {fmt(sigmaX)}</div>
			<input
				id="sigma-x"
				type="range"
				min="-3"
				max="3"
				step="0.1"
				bind:value={sigmaX}
				class="w-full accent-purple-400"
			/>
			<div class="text-xs text-gray-300">Scale Y: {fmt(sigmaY)}</div>
			<input
				id="sigma-y"
				type="range"
				min="-3"
				max="3"
				step="0.1"
				bind:value={sigmaY}
				class="w-full accent-purple-400"
			/>
		</div>

		<!-- U Controls -->
		<div class="space-y-2">
			<div class="flex justify-between items-center">
				<label class="font-bold text-blue-400 text-xs" for="u-mode"
					><Tex expr={"U"} /> Operation</label
				>
				<select
					id="u-mode"
					bind:value={uIsReflection}
					class="bg-gray-700 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none"
				>
					<option value={false}>Rotation (<Tex expr={"\\theta"} />)</option>
					<option value={true}>Reflection (<Tex expr={"\\phi"} />)</option>
				</select>
			</div>
			<label class="block text-xs text-gray-300" for="u-angle">
				{uIsReflection ? "Line Angle" : "Rotation"}: {uAngle}°
			</label>
			<input
				id="u-angle"
				type="range"
				min={uIsReflection ? 0 : -180}
				max={uIsReflection ? 180 : 180}
				bind:value={uAngle}
				class="w-full accent-blue-400"
			/>
		</div>
	</div>

	<!-- Real-Time Equation Display -->
	<div
		class="flex flex-wrap items-center justify-center gap-3 font-mono text-xs bg-gray-800 p-4 rounded-lg overflow-x-auto"
	>
		<!-- M -->
		<div class="text-center">
			<div class="text-[10px] text-emerald-400 font-bold mb-1">
				Matrix <Tex expr={"M"} />
			</div>
			<div
				class="border-l-2 border-r-2 border-emerald-400 px-2 py-1 bg-gray-900"
			>
				<div>[{fmt(svd.M[0][0])}, {fmt(svd.M[0][1])}]</div>
				<div>[{fmt(svd.M[1][0])}, {fmt(svd.M[1][1])}]</div>
			</div>
		</div>

		<span class="text-base font-bold text-gray-400">=</span>

		<!-- U -->
		<div class="text-center">
			<div class="text-[10px] text-blue-400 font-bold mb-1">
				<Tex expr={"U"} />
			</div>
			<div class="border-l-2 border-r-2 border-blue-400 px-2 py-1 bg-gray-900">
				<div>[{fmt(svd.U[0][0])}, {fmt(svd.U[0][1])}]</div>
				<div>[{fmt(svd.U[1][0])}, {fmt(svd.U[1][1])}]</div>
			</div>
		</div>

		<span class="text-base text-gray-400">×</span>

		<!-- Sigma -->
		<div class="text-center">
			<div class="text-[10px] text-purple-400 font-bold mb-1">
				<Tex expr={"\\Sigma"} />
			</div>
			<div
				class="border-l-2 border-r-2 border-purple-400 px-2 py-1 bg-gray-900"
			>
				<div>[{fmt(svd.Sigma[0][0])}, {fmt(svd.Sigma[0][1])}]</div>
				<div>[{fmt(svd.Sigma[1][0])}, {fmt(svd.Sigma[1][1])}]</div>
			</div>
		</div>

		<span class="text-base text-gray-400">×</span>

		<!-- VT -->
		<div class="text-center">
			<div class="text-[10px] text-rose-400 font-bold mb-1">
				<Tex expr={"V^T"} />
			</div>
			<div class="border-l-2 border-r-2 border-rose-400 px-2 py-1 bg-gray-900">
				<div>[{fmt(svd.VT[0][0])}, {fmt(svd.VT[0][1])}]</div>
				<div>[{fmt(svd.VT[1][0])}, {fmt(svd.VT[1][1])}]</div>
			</div>
		</div>
	</div>
</div>
