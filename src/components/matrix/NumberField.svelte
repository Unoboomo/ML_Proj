<script>
	// A text box for numbers.
	// - Typing only edits a draft. Enter applies it.
	// - Escape, or clicking away, throws the draft away.
	// - ArrowUp/ArrowDown step the value and apply right away
	//   (Shift = x10, Alt = x0.1)
	export let value = 0;
	export let decimals = 2;
	export let step = 0.1;
	export let style = "";
	export let label = "";
	export let big = false;

	let editing = false;
	let draft = "";

	// avoid showing "-0.00"
	const clean = (n) => (Math.abs(n) < 0.5 * 10 ** -decimals ? 0 : n);
	const fmt = (n) => (Number.isFinite(n) ? clean(n).toFixed(decimals) : "");

	$: shown = editing ? draft : fmt(value);
	$: pending = editing && draft !== fmt(value);

	function onFocus(e) {
		editing = true;
		draft = fmt(value);
		e.currentTarget.select();
	}

	function commit() {
		const n = Number(draft);
		if (draft.trim() !== "" && Number.isFinite(n)) value = n;
	}

	function onKeydown(e) {
		if (e.key === "Enter") {
			commit();
			e.currentTarget.blur();
			return;
		}
		if (e.key === "Escape") {
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
	class:big
	class:pending
	title={pending ? "Enter to apply, Esc to cancel" : ""}
	aria-label={label}
	{style}
	value={shown}
	on:focus={onFocus}
	on:blur={() => (editing = false)}
	on:input={(e) => (draft = e.currentTarget.value)}
	on:keydown={onKeydown}
/>

<style lang="postcss">
	.field {
		@apply w-24 bg-base-200 px-2 py-2 text-right text-lg tabular-nums transition-colors selection:text-inherit;
	}

	.field.big {
		@apply w-32 py-1 text-3xl;
	}

	.field:hover {
		@apply bg-base-100;
	}

	.field:focus {
		@apply bg-base-100 outline-none ring-1 ring-inset ring-info;
	}

	/* Typed but not applied yet */
	.field.pending {
		@apply ring-1 ring-inset ring-warning;
	}
</style>
