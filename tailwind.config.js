import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
       
        light: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#4F46E5',
            600: '#0284c7',
            700: '#4F46E5',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          background: '#f8fafc',
          
          
          border: '#e2e8f0',
          input: '#e2e8f0',
        },
    
        
      }
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: '#f8fafc',
            
            primary: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              200: '#bae6fd',
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#4F46E5',
              600: '#0284c7',
              700: '#4F46E5',
              800: '#075985',
              900: '#0c4a6e',
              950: '#082f49',
              DEFAULT: '#4F46E5',
             
            },
            
          },
          layout: {
            disabledOpacity: "0.3",
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px"
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px"
            }
          }
        },
       
      },
    }),
  ],
};
