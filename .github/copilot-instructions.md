# Copilot Instructions

## Package Manager

This project uses **yarn** as the package manager. Always use yarn commands instead of npm:

- `yarn` instead of `npm install`
- `yarn add <package>` instead of `npm install <package>`
- `yarn remove <package>` instead of `npm uninstall <package>`
- `yarn dev` instead of `npm run dev`
- `yarn build` instead of `npm run build`

## Commit Messages

Write commit messages in **imperative mood**, starting with a capital letter. Use a clear, descriptive sentence that explains what the commit does.

**Format:** `<Action> <what was changed/added>`

**Examples:**
- `Add README and Netlify configuration for Conway Cube project`
- `Refactor grid size and optimize performance by removing pulse-glow animation`
- `Fix cell rendering issue in 3D grid`
- `Update styles for better mobile responsiveness`

**Guidelines:**
- Start with a verb: Add, Fix, Update, Refactor, Remove, Improve, etc.
- Be descriptive but concise
- No period at the end
- Keep under 72 characters when possible

**For larger changes**, use a multi-line commit with a body:

```
Add new feature for 3D rotation controls

- Implement mouse drag rotation
- Add keyboard shortcuts for axis rotation
- Update UI with rotation speed slider
```
