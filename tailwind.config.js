/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/app/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
            screens: {
                'print': { 'raw': 'print' },
            }
        }
    },
    plugins: [
        require("daisyui"),
    ],
    darkMode: ['class', '[data-theme="night"]'],
    daisyui: {
        themes: [
            "autumn", {
              "night": {
                ...require("daisyui/src/theming/themes")["night"],
                error: "hsl(0, 84.2%, 60.2%)",
              }
            }, "light", "dark", "coffee", "corporate", "retro", "black", "valentine", "night"
        ],
        darkTheme: "night",
    }
};