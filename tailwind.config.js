const typography = require('@tailwindcss/typography');
const colors = require('tailwindcss/colors');

const makePrimaryColor =
  l =>
    ({ opacityValue }) => {
      return (
        `hsl(var(--primary-hue) var(--primary-saturation) ${l}%` +
        (opacityValue ? ` / ${opacityValue})` : ')')
      )
    }

module.exports = {
	prefix: 'sr-',
	content: [
		'./hugo_stats.json',
		"./**/*.{html, js}", // for using this as theme, this line is required
	],
	safelist: [
		'max-w-screen-xl',
		'max-w-[90rem]',
		'max-w-full'
	],
	theme: {
		screens: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px'
		  },
		  fontSize: {
			xs: '.75rem',
			sm: '.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem',
			'5xl': '3rem',
			'6xl': '4rem'
		  },
		  letterSpacing: {
			tight: '-0.015em'
		  },
		  colors: {
			transparent: 'transparent',
			current: 'currentColor',
			black: '#000',
			white: '#fff',
			gray: colors.gray,
			slate: colors.slate,
			neutral: colors.neutral,
			red: colors.red,
			orange: colors.orange,
			green: colors.green,
      		indigo: colors.indigo,
			blue: colors.blue,
			yellow: colors.yellow,
			amber: colors.amber,
			primary: {
			  50: makePrimaryColor(97),
			  100: makePrimaryColor(94),
			  200: makePrimaryColor(86),
			  300: makePrimaryColor(77),
			  400: makePrimaryColor(66),
			  500: makePrimaryColor(50),
			  600: makePrimaryColor(45),
			  700: makePrimaryColor(39),
			  750: makePrimaryColor(35),
			  800: makePrimaryColor(32),
			  900: makePrimaryColor(24)
			}
		  },
		extend: {
			colors: {
				dark: '#111', // #212121
			}
		}
	},
	darkMode: ['class', 'html[class~="dark"]'],
	plugins: [typography],
};
