<script>
	export let svd;

	function fmt(val) {
		return val.toFixed(2);
	}
</script>

<div
	class="flex flex-wrap items-center justify-center gap-4 font-mono text-sm bg-gray-800 p-4 rounded-lg text-white"
>
	<!-- Unified M -->
	<div class="text-center">
		<div class="text-xs text-emerald-400 font-bold mb-1">Matrix $M$</div>
		<div class="border-l-2 border-r-2 border-emerald-400 px-2 py-1">
			<div>[{fmt(svd.M[0][0])}, {fmt(svd.M[0][1])}]</div>
			<div>[{fmt(svd.M[1][0])}, {fmt(svd.M[1][1])}]</div>
		</div>
	</div>

	<span class="text-xl font-bold">=</span>

	<!-- U -->
	<div class="text-center">
		<div class="text-xs text-blue-400 font-bold mb-1">$U$</div>
		<div class="border-l-2 border-r-2 border-blue-400 px-2 py-1">
			<div>[{fmt(svd.U[0][0])}, {fmt(svd.U[0][1])}]</div>
			<div>[{fmt(svd.U[1][0])}, {fmt(svd.U[1][1])}]</div>
		</div>
	</div>

	<span class="text-lg">×</span>

	<!-- Sigma -->
	<div class="text-center">
		<div class="text-xs text-purple-400 font-bold mb-1">$\Sigma$</div>
		<div class="border-l-2 border-r-2 border-purple-400 px-2 py-1">
			<div>[{fmt(svd.Sigma[0][0])}, {fmt(svd.Sigma[0][1])}]</div>
			<div>[{fmt(svd.Sigma[1][0])}, {fmt(svd.Sigma[1][1])}]</div>
		</div>
	</div>

	<span class="text-lg">×</span>

	<!-- VT -->
	<div class="text-center">
		<div class="text-xs text-rose-400 font-bold mb-1">$V^T$</div>
		<div class="border-l-2 border-r-2 border-rose-400 px-2 py-1">
			<div>[{fmt(svd.VT[0][0])}, {fmt(svd.VT[0][1])}]</div>
			<div>[{fmt(svd.VT[1][0])}, {fmt(svd.VT[1][1])}]</div>
		</div>
	</div>
</div>
