/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'calc(var(--radius) + 4px)',
  			'2xl': 'calc(var(--radius) + 8px)',
  			'3xl': 'calc(var(--radius) + 16px)',
  		},
  		fontSize: {
  			'xs': ['0.75rem', { lineHeight: '1rem' }],
  			'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  			'base': ['1rem', { lineHeight: '1.5rem' }],
  			'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  			'xl': ['1.25rem', { lineHeight: '1.75rem' }],
  			'2xl': ['1.5rem', { lineHeight: '2rem' }],
  			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  			'5xl': ['3rem', { lineHeight: '1' }],
  			'6xl': ['3.75rem', { lineHeight: '1' }],
  			'7xl': ['4.5rem', { lineHeight: '1' }],
  			'8xl': ['6rem', { lineHeight: '1' }],
  			'9xl': ['8rem', { lineHeight: '1' }],
  		},
  		fontFamily: {
  			sans: ['Inter', 'system-ui', 'sans-serif'],
  			display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
  		},
  		fontWeight: {
  			thin: '100',
  			extralight: '200',
  			light: '300',
  			normal: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700',
  			extrabold: '800',
  			black: '900',
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'112': '28rem',
  			'128': '32rem',
  		},
  		transitionDuration: {
  			'150': '150ms',
  			'200': '200ms',
  			'300': '300ms',
  			'400': '400ms',
  			'500': '500ms',
  			'700': '700ms',
  		},
  		transitionTimingFunction: {
  			'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
  		},
  		animation: {
  			'fade-in': 'fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  			'fade-out': 'fade-out 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-in': 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-out': 'slide-out 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  			'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  			'scale-out': 'scale-out 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  			'bounce-in': 'bounce-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'shimmer': 'shimmer 2s linear infinite',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.16, 1, 0.3, 1) infinite',
  			'float': 'float 3s ease-in-out infinite',

  			// 추가 애니메이션
  			'fadeIn': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  			'fadeInFast': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slideDown': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slideUp': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  			'scaleIn': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  		},
  		keyframes: {
  			'fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			'fade-out': {
  				'0%': { opacity: '1' },
  				'100%': { opacity: '0' },
  			},
  			'slide-in': {
  				'0%': { transform: 'translateY(10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			'slide-out': {
  				'0%': { transform: 'translateY(0)', opacity: '1' },
  				'100%': { transform: 'translateY(-10px)', opacity: '0' },
  			},
  			'scale-in': {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  			'scale-out': {
  				'0%': { transform: 'scale(1)', opacity: '1' },
  				'100%': { transform: 'scale(0.95)', opacity: '0' },
  			},
  			'bounce-in': {
  				'0%': { transform: 'scale(0.3)', opacity: '0' },
  				'50%': { transform: 'scale(1.05)' },
  				'70%': { transform: 'scale(0.9)' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  			'shimmer': {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' },
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' },
  			},

  			// 추가 keyframes
  			'fadeIn': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			'slideDown': {
  				'0%': { transform: 'translateY(-20px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			'slideUp': {
  				'0%': { transform: 'translateY(20px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			'scaleIn': {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  		},
  		boxShadow: {
  			// XS - 미세한 깊이
  			'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  			// SM - 얇은 깊이
  			'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',

  			// MD - 기본 깊이
  			'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',

  			// LG - 표준 카드
  			'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',

  			// XL - 강조 요소
  			'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',

  			// 2XL - 최상위 레이어
  			'2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  			// Inner Shadow
  			'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  			// Premium Shadow (호버용)
  			'premium': '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 105, 255, 0.1)',

  			// Glow Effects
  			'glow-primary': '0 0 30px rgba(0, 105, 255, 0.4)',
  			'glow-blue': '0 0 20px rgba(0, 105, 255, 0.3)',

  			// 기존 shadows
  			'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  			'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
  			'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
  			'glow-purple': '0 0 20px rgba(147, 51, 234, 0.5)',
  			'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			'background-secondary': 'hsl(var(--background-secondary))',
  			'background-tertiary': 'hsl(var(--background-tertiary))',
  			'background-overlay': 'hsl(var(--background-overlay))',
  			'background-elevated': 'hsl(var(--background-elevated))',

  			// Primary Color (파랑)
  			primary: {
  				50: '#e6f2ff',
  				100: '#cce5ff',
  				200: '#99ccff',
  				300: '#66b3ff',
  				400: '#3399ff',
  				500: '#0069ff',  // 기본 Primary
  				600: '#0054cc',
  				700: '#003f99',
  				800: '#002a66',
  				900: '#001533',
  				950: '#000a1a',
  			},

  			// Secondary Color (하늘색)
  			secondary: {
  				50: '#f0f9ff',
  				100: '#e0f2fe',
  				200: '#bae6fd',
  				300: '#7dd3fc',
  				400: '#38bdf8',
  				500: '#0ea5e9',  // 기본 Secondary
  				600: '#0284c7',
  				700: '#0369a1',
  				800: '#075985',
  				900: '#0c4a6e',
  				950: '#082f49',
  			},

  			// Semantic Colors
  			success: {
  				50: '#f0fdf4',
  				100: 'hsl(var(--success-100))',
  				500: '#22c55e',
  				600: '#16a34a',
  				700: 'hsl(var(--success-700))',
  			},
  			warning: {
  				50: '#fffbeb',
  				100: 'hsl(var(--warning-100))',
  				500: '#f59e0b',
  				600: '#d97706',
  				700: 'hsl(var(--warning-700))',
  			},
  			error: {
  				50: '#fef2f2',
  				100: 'hsl(var(--error-100))',
  				500: '#ef4444',
  				600: '#dc2626',
  				700: 'hsl(var(--error-700))',
  			},
  			info: {
  				50: '#eff6ff',
  				100: 'hsl(var(--info-100))',
  				500: '#3b82f6',
  				600: '#2563eb',
  				700: 'hsl(var(--info-700))',
  			},

  			// Glass morphism
  			glass: {
  				100: 'rgba(255, 255, 255, 0.1)',
  				200: 'rgba(255, 255, 255, 0.2)',
  				300: 'rgba(255, 255, 255, 0.3)',
  				400: 'rgba(255, 255, 255, 0.4)',
  				500: 'rgba(255, 255, 255, 0.5)',
  			},

  			// Brand colors
  			brand: {
  				50: 'hsl(var(--brand-50))',
  				100: 'hsl(var(--brand-100))',
  				200: 'hsl(var(--brand-200))',
  				300: 'hsl(var(--brand-300))',
  				400: 'hsl(var(--brand-400))',
  				500: 'hsl(var(--brand-500))',
  				600: 'hsl(var(--brand-600))',
  				700: 'hsl(var(--brand-700))',
  				800: 'hsl(var(--brand-800))',
  				900: 'hsl(var(--brand-900))',
  			},

  			// Gradient colors
  			gradient: {
  				'primary-start': 'hsl(var(--gradient-primary-start))',
  				'primary-end': 'hsl(var(--gradient-primary-end))',
  				'secondary-start': 'hsl(var(--gradient-secondary-start))',
  				'secondary-end': 'hsl(var(--gradient-secondary-end))',
  				'accent-start': 'hsl(var(--gradient-accent-start))',
  				'accent-end': 'hsl(var(--gradient-accent-end))',
  			},

  			// Existing shadcn colors
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
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

