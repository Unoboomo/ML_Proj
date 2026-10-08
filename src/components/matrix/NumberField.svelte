<script>
	// A text box for numbers.
	// - Applies live on every valid keystroke ("-", "1." etc. are ignored until valid)
	// - Shows the value rounded when idle, exactly what you typed while editing
	// - ArrowUp/ArrowDown step the value (Shift = x10, Alt = x0.1)
	export let value = 0;
	export let decimals = 2;
	export let step = 0.1;
	export let style = "";
	export let label = "";

	let editing = false;
	let draft = "";

	// avoid showing "-0.00"
	const clean = (n) => (Math.abs(n) < 0.5 * 10 ** -decimals ? 0 : n);
	const fmt = (n) => (Number.isFinite(n) ? clean(n).toFixed(decimals) : "");

	$: shown = editing ? draft : fmt(value);

	function onFocus(e) {
		editing = true;
		draft = fmt(value);
		e.currentTarget.select();
	}

	function onInput(e) {
		draft = e.currentTarget.value;
		const n = Number(draft);
		if (draft.trim() !== "" && Number.isFinite(n)) value = n;
	}

	function onKeydown(e) {
		if (e.key === "Enter") {
			e.currentTarget.blur();
			return;
		}
		if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

		e.preventDefault();
		const mult = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
		const dir = e.key === "ArrowUp" ? 1 : -1;
		const base = Number.isFinite(value) ? value : 0;
		value = +(base + dir * step * mult).toPrecision(12);
		draft = fmt(value);
	}
</script>

<input
	type="text"
	inputmode="decimal"
	autocomplete="off"
	spellcheck="false"
	class="field"
	aria-label={label}
	{style}
	value={shown}
	on:focus={onFocus}
	on:blur={() => (editing = false)}
	on:input={onInput}
	on:keydown={onKeydown}
/>

<style lang="postcss">
	.field {
		@apply w-24 bg-base-200 px-2 py-2 text-right text-lg tabular-nums transition-colors selection:text-inherit;

		&:hover {
			@apply bg-base-100;
		}

		&:focus {
			@apply bg-base-100 outline-none ring-1 ring-inset ring-info;
		}
	}
</style>
