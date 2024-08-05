/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/app/**/*.{js,ts,jsx,tsx}"],
    theme: {},
    plugins: [
        require("daisyui"),
        function ({ addUtilities }) {
            addUtilities({
                '.hide-scrollbar': {
                    /* Firefox */
                    'scrollbar-width': 'none',
                    /* Safari and Chrome */
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                },
            });
        },
    ],
    daisyui: {
        themes: [
            "light", "autumn", "dark", "cupcake", "bumblebee", "emerald", 
            "corporate", "synthwave", "retro", "cyberpunk", "valentine", 
            "halloween", "garden", "forest", "aqua", "lofi", "pastel", 
            "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", 
            "business", "acid", "lemonade", "night", "coffee", "winter", 
            "dim", "nord", "sunset"
        ]
    }
};