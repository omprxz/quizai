/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/app/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                c1: {
                    DEFAULT: "#3D52A0",
                    50: "#e3e7f2",
                    100: "#c7cfe5",
                    200: "#8fa0cb",
                    300: "#5762b2",
                    400: "#3e4791",
                    500: "#3d52a0",
                    600: "#243970",
                    700: "#1b2852",
                    800: "#131c39",
                    900: "#0c1223"
                },
                c2: {
                    DEFAULT: "#7091E6",
                    50: "#e8effc",
                    100: "#d2def9",
                    200: "#a4bef4",
                    300: "#759def",
                    400: "#5988ea",
                    500: "#7091e6",
                    600: "#4a6cc2",
                    700: "#3a5596",
                    800: "#2b4071",
                    900: "#1e2c50"
                },
                c3: {
                    DEFAULT: "#8697C4",
                    50: "#ebebf1",
                    100: "#d8d8e2",
                    200: "#b0b0c5",
                    300: "#8989a9",
                    400: "#727298",
                    500: "#8697c4",
                    600: "#535385",
                    700: "#404068",
                    800: "#2e2e4a",
                    900: "#1f1f30"
                },
                c4: {
                    DEFAULT: "#ADBBDA",
                    50: "#f3f3f7",
                    100: "#e7e7ef",
                    200: "#cfcfdf",
                    300: "#b7b7cf",
                    400: "#a2a2c1",
                    500: "#adbbda",
                    600: "#7b7b8b",
                    700: "#60606d",
                    800: "#484851",
                    900: "#333336"
                },
                c5: {
                    DEFAULT: "#EDE8F5",
                    50: "#fbfafc",
                    100: "#f7f5f9",
                    200: "#efebf2",
                    300: "#e7e2ec",
                    400: "#e1dbeb",
                    500: "#ede8f5",
                    600: "#e5e0ef",
                    700: "#dfd8ea",
                    800: "#d7d0e4",
                    900: "#d1c8df"
                }
            }
        }
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
