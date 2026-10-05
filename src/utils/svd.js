export function calculateSVD(
	// V^T parameters
	vIsReflection, // boolean: false = Rotation, true = Reflection
	vAngleDeg, // theta if rotation, phi (line angle) if reflection

	// Sigma parameters (Axis scaling)
	sigmaX, // scale along X-axis
	sigmaY, // scale along Y-axis

	// U parameters
	uIsReflection, // boolean: false = Rotation, true = Reflection
	uAngleDeg // theta if rotation, phi (line angle) if reflection
) {
	// V^T (First rotation/reflection)
	const VT = computeOrthogonalMatrix(vIsReflection, vAngleDeg);

	// Sigma (Scaling)
	const Sigma = [
		[sigmaX, 0],
		[0, sigmaY]
	];

	// U (Second rotation/reflection)
	const U = computeOrthogonalMatrix(uIsReflection, uAngleDeg);

	// --- SVT = Sigma * VT ---
	const SVT = [
		[Sigma[0][0] * VT[0][0], Sigma[0][0] * VT[0][1]],
		[Sigma[1][1] * VT[1][0], Sigma[1][1] * VT[1][1]]
	];

	// --- M = U * SVT ---
	const M = [
		[
			U[0][0] * SVT[0][0] + U[0][1] * SVT[1][0],
			U[0][0] * SVT[0][1] + U[0][1] * SVT[1][1]
		],
		[
			U[1][0] * SVT[0][0] + U[1][1] * SVT[1][0],
			U[1][0] * SVT[0][1] + U[1][1] * SVT[1][1]
		]
	];

	return { VT, Sigma, U, M };
}

function computeOrthogonalMatrix(isReflection, angleDeg) {
	if (!isReflection) {
		// Pure Rotation by vAngleDeg
		const rad = (angleDeg * Math.PI) / 180;
		return [
			[Math.cos(rad), -Math.sin(rad)],
			[Math.sin(rad), Math.cos(rad)]
		];
	} else {
		// Reflection across line at angle vAngleDeg
		const rad2 = (2 * angleDeg * Math.PI) / 180;
		return [
			[Math.cos(rad2), Math.sin(rad2)],
			[Math.sin(rad2), -Math.cos(rad2)]
		];
	}
}

export function formatMatrix(matrix, decimals = 2) {
	return matrix.map((row) => row.map((val) => Number(val.toFixed(decimals))));
}
