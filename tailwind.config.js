/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/app/**/*.{js,ts,jsx,tsx}"],
    theme: {
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                mytheme: {
                    primary: "#e000ff",
                    secondary: "#00c000",
                    accent: "#009dff",
                    neutral: "#2c1e31",
                    "base-100": "#e6ffff",
                    info: "#00bfd6",
                    success: "#00e7b8",
                    warning: "#ff9900",
                    error: "#e44a66",
                }
            }
        ]
    }
};
