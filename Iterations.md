# Iteration Log + Reflections

## Iteration 1: Environment Setup & Proposal Changes

- **Context & Feedback Integration:** Adjusted Project Part 1 proposal from a "Go" button animation based on Prof's feedback. Want to have real-time reactivity and show simultaneous equivalence of $M = U \Sigma V^T$.
- **Environment Setup:** Cloned and configured the detached project repository (`ML_Proj`) in VS Code. Set up the Svelte/Vite local development server (`npm run dev`)
- **Math Formulation:** Defined the SVD function + parameters:

  - $V^T$: First transformation (rotation by angle $\theta_1$)
  - $\Sigma$: Axis scaling $(\sigma_x, \sigma_y)$
  - $U$: Second transformation (rotation by angle $\theta_2$)
