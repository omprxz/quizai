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
    daisyui: {
        themes: [
            "light", "dark", "autumn", "cupcake", "bumblebee", "emerald", 
            "corporate", "synthwave", "retro", "cyberpunk", "valentine", 
            "halloween", "garden", "forest", "aqua", "lofi", "pastel", 
            "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", 
            "business", "acid", "lemonade", "night", "coffee", "winter", 
            "dim", "nord", "sunset"
        ]
    }
};