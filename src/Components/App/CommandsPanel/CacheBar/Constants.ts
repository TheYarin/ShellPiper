import { lighten, Theme } from "@material-ui/core";

export const availableCacheBarColor = (theme: Theme) => lighten(theme.palette.primary.main, 0.81);
// lighten(theme.palette.primary.main, 0.76);
export const cacheToUseBarColor = (theme: Theme) => lighten(theme.palette.primary.main, 0.42);
