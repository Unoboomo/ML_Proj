# Iteration Log + Reflections

## Iteration 1: Environment Setup & Proposal Changes

- **Context & Feedback Integration:** Adjusted Project Part 1 proposal from a "Go" button animation based on Prof's feedback. Want to have real-time reactivity and show simultaneous equivalence of $M = U \Sigma V^T$.
- **Environment Setup:** Cloned and configured the detached project repository (`ML_Proj`) in VS Code. Set up the Svelte/Vite local development server (`npm run dev`)
- **Math Formulation:** Defined the SVD function + parameters:

  - $V^T$: First transformation (rotation by angle $\theta_1$)
  - $\Sigma$: Axis scaling $(\sigma_x, \sigma_y)$
  - $U$: Second transformation (rotation by angle $\theta_2$)

## Iteration 2: Supporting Reflections

- **Problem:** Standard rotation matrices $\begin{bmatrix}\cos\theta & -\sin\theta \\ \sin\theta & \cos\theta\end{bmatrix}$ strictly have a determinant of $+1$. They are incapable of representing reflections ($\det = -1$) on their own.
- **Solution:** Expanded $U$ and $V^T$ to support reflections. Introduced $\phi$ and a reflection flag to handle reflections across any line passing through the origin at angle $\phi$:
  $$R_\phi = \begin{bmatrix} \cos(2\phi) & \sin(2\phi) \\ \sin(2\phi) & -\cos(2\phi) \end{bmatrix}$$
- **Engine Implementation:** Updated `calculateSVD` to allow for rotations and reflections, and added helper functions to handle matrix formatting and $U$ and $V^T$ matrix calculations
