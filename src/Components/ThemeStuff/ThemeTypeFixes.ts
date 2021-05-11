// Shamelessly stolen from N1TZANKL's kippa-aduma

// import { PaletteColor } from "@material-ui/core/styles/createPalette";

// declare module '@material-ui/core/styles/createPalette' {
//   interface Palette {
//     primary: PaletteColor;
//     secondary: PaletteColor;
//   }
//   interface SimplePaletteColorOptions {
//     main: string;
//     dark?: string;
//     light?: string;
//     veryLight?: string;
//     superLight?: string;
//   }
// }

declare module "@material-ui/core/styles/createMuiTheme" {
  interface Theme {
    constants: {
      consoleBackground: string;
      consoleTextColor: string;
      lowProfileButtonColor: string;
      lowProfileButtonHoverColor: string;
      // appBackgroundDark: string;
      // appBackgroundHighlight: string;
    };
  }
  interface ThemeOptions {
    constants: {
      consoleBackground: string;
      consoleTextColor: string;
      lowProfileButtonColor: string;
      lowProfileButtonHoverColor: string;
      // appBackgroundDark: string;
      // appBackgroundHighlight: string;
    };
  }
}
