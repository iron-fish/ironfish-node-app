import { Global } from "@emotion/react";

export function LoadFonts() {
  return (
    <Global
      styles={`
@font-face {
  font-family: 'extended-regular';
  src: url('/fonts/extendedregular/favoritextended-regular-webfont.eot');
  src: url('/fonts/extendedregular/favoritextended-regular-webfont.eot?#iefix')
    format('embedded-opentype'),
  url('/fonts/extendedregular/favoritextended-regular-webfont.woff2')
    format('woff2'),
  url('/fonts/extendedregular/favoritextended-regular-webfont.woff')
    format('woff'),
  url('/fonts/extendedregular/favoritextended-regular-webfont.ttf')
    format('truetype'),
  url('/fonts/extendedregular/favoritextended-regular-webfont.svg#_.book')
    format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'mono-regular';
  src: url('/fonts/monoregular/favoritmono-regular-webfont.eot');
  src: url('/fonts/monoregular/favoritmono-regular-webfont.eot?#iefix')
    format('embedded-opentype'),
  url('/fonts/monoregular/favoritmono-regular-webfont.woff2')
    format('woff2'),
  url('/fonts/monoregular/favoritmono-regular-webfont.woff')
    format('woff'),
  url('/fonts/monoregular/favoritmono-regular-webfont.ttf')
    format('truetype'),
  url('/fonts/monoregular/favoritmono-regular-webfont.svg#_.book')
    format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'favorit-regular';
  src: url('/fonts/regular/favorit-regular-webfont.eot');
  src: url('/fonts/regular/favorit-regular-webfont.eot?#iefix')
    format('embedded-opentype'),
  url('/fonts/regular/favorit-regular-webfont.woff2') format('woff2'),
  url('/fonts/regular/favorit-regular-webfont.woff') format('woff'),
  url('/fonts/regular/favorit-regular-webfont.ttf') format('truetype'),
  url('/fonts/regular/favorit-regular-webfont.svg#_.book')
    format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
      `}
    />
  );
}
