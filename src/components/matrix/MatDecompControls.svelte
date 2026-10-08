<script>
	export let vIsReflection = false;
	export let vAngle = 0;
	export let sigmaX = 1;
	export let sigmaY = 1;
	export let uIsReflection = false;
	export let uAngle = 0;

	function fmt(val) {
		return Number(val).toFixed(1);
	}
</script>

<div
	class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-800 p-4 rounded-lg text-white"
>
	<!-- V^T Controls -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<label class="font-bold text-rose-400" for="v-mode">$V^T$ Operation</label
			>
			<select
				id="v-mode"
				bind:value={vIsReflection}
				class="bg-gray-700 text-xs rounded px-2 py-1"
			>
				<option value={false}>Rotation ($\theta$)</option>
				<option value={true}>Reflection ($\phi$)</option>
			</select>
		</div>
		<label class="block text-xs" for="v-angle">
			{vIsReflection ? "Line Angle" : "Rotation"}: {vAngle}°
		</label>
		<input
			id="v-angle"
			type="range"
			min={vIsReflection ? 0 : -180}
			max={vIsReflection ? 180 : 180}
			bind:value={vAngle}
			class="w-full"
		/>
	</div>

	<!-- Sigma Controls -->
	<div class="space-y-2">
		<label class="font-bold text-purple-400" for="sigma-x"
			>$\Sigma$ Axis Scaling</label
		>
		<div class="text-xs">Scale X: {fmt(sigmaX)}</div>
		<input
			id="sigma-x"
			type="range"
			min="-3"
			max="3"
			step="0.1"
			bind:value={sigmaX}
			class="w-full"
		/>
		<div class="text-xs">Scale Y: {fmt(sigmaY)}</div>
		<input
			id="sigma-y"
			type="range"
			min="-3"
			max="3"
			step="0.1"
			bind:value={sigmaY}
			class="w-full"
		/>
	</div>

	<!-- U Controls -->
	<div class="space-y-2">
		<div class="flex justify-between items-center">
			<label class="font-bold text-blue-400" for="u-mode">$U$ Operation</label>
			<select
				id="u-mode"
				bind:value={uIsReflection}
				class="bg-gray-700 text-xs rounded px-2 py-1"
			>
				<option value={false}>Rotation ($\theta$)</option>
				<option value={true}>Reflection ($\phi$)</option>
			</select>
		</div>
		<label class="block text-xs" for="u-angle">
			{uIsReflection ? "Line Angle" : "Rotation"}: {uAngle}°
		</label>
		<input
			id="u-angle"
			type="range"
			min={uIsReflection ? 0 : -180}
			max={uIsReflection ? 180 : 180}
			bind:value={uAngle}
			class="w-full"
		/>
	</div>
</div>
