export function calculateSVD(theta1Deg, sigmaX, sigmaY, theta2Deg) {
	const rad1 = (theta1Deg * Math.PI) / 180;
	const rad2 = (theta2Deg * Math.PI) / 180;

	// V^T (First rotation)
	const VT = [
		[Math.cos(rad1), -Math.sin(rad1)],
		[Math.sin(rad1), Math.cos(rad1)]
	];

	// Sigma (Scaling)
	const Sigma = [
		[sigmaX, 0],
		[0, sigmaY]
	];

	// U (Second rotation)
	const U = [
		[Math.cos(rad2), -Math.sin(rad2)],
		[Math.sin(rad2), Math.cos(rad2)]
	];

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
