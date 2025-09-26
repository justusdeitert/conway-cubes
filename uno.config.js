import { defineConfig, presetUno, presetIcons } from 'unocss';

export default defineConfig({
    presets: [
        presetUno({
            dark: 'class',
        }),
        presetIcons({
            scale: 1.2,
            cdn: 'https://esm.sh/',
            extraProperties: {
                display: 'inline-block',
                'vertical-align': 'middle',
            },
        }),
    ],
    theme: {
        colors: {
            // Base dark colors
            dark: '#0a0a0b',
            'dark-surface': '#111113',
            'dark-elevated': '#18181b',
            'dark-border': '#27272a',
            'dark-overlay': 'rgba(10, 10, 11, 0.85)',
            // Accent - emerald/cyber green
            accent: '#10b981',
            'accent-bright': '#34d399',
            'accent-dim': '#059669',
            'accent-glow': 'rgba(16, 185, 129, 0.5)',
            // Text colors
            'text-primary': '#fafafa',
            'text-secondary': '#a1a1aa',
            'text-muted': '#52525b',
        },
        fontFamily: {
            orbitron: ['Orbitron', 'sans-serif'],
        },
    },
    shortcuts: {
        // Glass panel effect
        'glass-panel': 'bg-dark-overlay backdrop-blur-xl border border-dark-border/50',
        // Glow effects
        'glow-text': 'text-accent drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]',
        'glow-box': 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        // Button styles
        'btn': 'relative px-6 py-3 min-w-[120px] h-[54px] bg-dark-elevated border border-dark-border text-text-secondary font-orbitron text-sm uppercase tracking-wider cursor-pointer transition-all duration-300 flex flex-col items-center justify-center',
        'btn-hover': 'hover:bg-dark-surface hover:border-accent/50 hover:text-accent hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        'btn-active': 'active:scale-95 active:bg-accent/10',
        'btn-disabled': 'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-dark-elevated disabled:hover:border-dark-border disabled:hover:text-text-secondary disabled:hover:shadow-none',
        // Combined button
        'btn-base': 'btn btn-hover btn-active btn-disabled',
        // Modern action pill
        'action-pill': 'flex items-center gap-1 p-1.5 bg-dark-elevated/90 backdrop-blur-lg rounded-full border border-dark-border/50 shadow-lg shadow-black/20',
        'action-btn': 'relative w-11 h-11 flex items-center justify-center rounded-full bg-transparent border-0 text-text-secondary cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-text-primary active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-secondary',
        'action-btn-primary': 'bg-accent/20 text-accent hover:bg-accent/30 hover:text-accent-bright hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
        'action-divider': 'w-px h-6 bg-dark-border/50 mx-1',
        // Modern slider pill
        'slider-pill': 'flex items-center gap-3 px-4 py-2.5 bg-dark-elevated/90 backdrop-blur-lg rounded-full border border-dark-border/50 shadow-lg shadow-black/20 transition-all duration-200 hover:border-dark-border',
        'slider-input': 'w-24 h-1.5 appearance-none bg-transparent cursor-pointer',
        'slider-value': 'text-xs text-accent font-medium min-w-[3.5rem] text-right tabular-nums',
    },
});
