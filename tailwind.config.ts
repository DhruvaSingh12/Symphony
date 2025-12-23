import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
	theme: {
		extend: {
            fontFamily: {
                sans: ["var(--figtree)", "sans-serif"],
            },
			colors: {
			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
		screens: {
			xs: '400px'
		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		keyframes: {
			'now-playing': {
				'0%, 100%': { height: '20%' },
				'50%': { height: '100%' },
			},
			marquee: {
				'0%': { transform: 'translateX(0%)' },
				'100%': { transform: 'translateX(-100%)' },
			},
			marquee2: {
				'0%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(0%)' },
			},
			'progress-indeterminate': {
				'0%': { transform: 'translateX(-100%)' },
				'50%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(-100%)' },
			},
		},
		animation: {
			'now-playing': 'now-playing 0.8s ease-in-out infinite',
			marquee: 'marquee 15s linear infinite',
			marquee2: 'marquee2 15s linear infinite',
			'progress-indeterminate': 'progress-indeterminate 2s linear infinite',
		},
  	}
  },
  plugins: [tailwindcssAnimate],
};

export default config;
