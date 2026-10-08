export function calculateSVDFromTransformations(
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

/**
 * Calculates the geometric SVD of a 2x2 matrix [ [a, b], [c, d] ]
 * Matrix representation:
 * [ a  b ]
 * [ c  d ]
 *
 * @param {number[][]} A - 2x2 matrix as an array of rows
 * @returns {Object} Decomposition into rotation angles, rotation matrices, and scaling
 */
export function calculateSVDFromMatrix(A) {
	const a = A[0][0],
		b = A[0][1];
	const c = A[1][0],
		d = A[1][1];

	// 1. Eigenvalues of A^T * A
	const E1 = a * a + c * c;
	const E2 = b * b + d * d;
	const E3 = a * b + c * d;

	const trace = E1 + E2;
	const diff = E1 - E2;
	const delta = Math.sqrt(diff * diff + 4 * E3 * E3);

	// Singular values
	let sigma1 = Math.sqrt((trace + delta) / 2);
	let sigma2 = Math.sqrt(Math.max(0, (trace - delta) / 2));

	// 2. First transformation angle (V)
	const thetaV =
		Math.abs(E3) < 1e-12 && Math.abs(diff) < 1e-12
			? 0
			: 0.5 * Math.atan2(2 * E3, diff);

	const v00 = Math.cos(thetaV);
	const v01 = -Math.sin(thetaV);
	const v10 = Math.sin(thetaV);
	const v11 = Math.cos(thetaV);

	// V^T (Transpose of V)
	const VT = [
		[v00, v10],
		[v01, v11]
	];

	// 3. Compute U = A * V * Sigma^-1
	let u00, u01, u10, u11;

	if (sigma1 > 1e-12) {
		u00 = (a * v00 + b * v10) / sigma1;
		u10 = (c * v00 + d * v10) / sigma1;
	} else {
		u00 = 1;
		u10 = 0;
	}

	if (sigma2 > 1e-12) {
		u01 = (a * v01 + b * v11) / sigma2;
		u11 = (c * v01 + d * v11) / sigma2;
	} else {
		u01 = -u10;
		u11 = u00;
	}

	// 4. Keep U and V as pure rotations.
	// For det(A) < 0, absorb the reflection into
	// the second scaling axis as a negative scale.
	const detA = a * d - b * c;

	const uIsReflection = false;
	const vIsReflection = false;

	if (detA < 0) {
		sigma2 = -sigma2;

		// Compensate for the negative scale by flipping
		// the second column of U.
		u01 = -u01;
		u11 = -u11;
	}

	const U = [
		[u00, u01],
		[u10, u11]
	];

	// 5. Calculate rotation angles

	// First operation: VT
	const angleVDegrees = (Math.atan2(VT[1][0], VT[0][0]) * 180) / Math.PI;

	// Second operation: U
	const angleUDegrees = (Math.atan2(U[1][0], U[0][0]) * 180) / Math.PI;

	return {
		// First transformation: V^T
		rotation1: VT,
		vIsReflection,
		angleVDegrees,

		// Axis-aligned scaling
		scaling: [
			[sigma1, 0],
			[0, sigma2]
		],
		singularValues: [sigma1, sigma2],

		// Second transformation: U
		rotation2: U,
		uIsReflection,
		angleUDegrees
	};
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
