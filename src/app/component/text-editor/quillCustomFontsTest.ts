import { environment } from "src/environments/environment";

function getFonts() {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `${environment.serverURL}/api/iglesiaTechApp/configuracionesTabs/fonts/name`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    xhr.onreadystatechange = function () {
      if (this.readyState != 4) return;
      if (this.status == 200) {
        const fonts = JSON.parse(this.responseText);
        const fontNames: Array<string> = fonts.map((font) => getFontName(font));

        /**
 * Store css stules
 */
        let fontStyles: string = "";

        /**
         * Generate font styles for each available font
         */
        fonts.forEach((font) => {
          let fontName: string = getFontName(font);
          fontStyles +=
            `
            .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=${fontName}]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=${fontName}]::before {content: '${font}';font-family: '${font}', sans-serif;}
          .ql-font-${fontName}{ font-family: '${font}', sans-serif;}
            .ql-bubble .ql-picker.ql-font .ql-picker-label[data-value=${fontName}]::before, .ql-bubble .ql-picker.ql-font .ql-picker-item[data-value=${fontName}]::before {content: '${font}';font-family: '${font}', sans-serif;}
          .ql-font-${fontName}{ font-family: '${font}', sans-serif;}

          `
        });

        /**
         * Insert css styles into html body
         */
        let node = document.createElement("style");
        node.innerHTML = fontStyles;
        document.body.appendChild(node);
        return resolve({ fonts, fontNames });
        // we get the returned data
      }

      // end of state change: it can be after some time (async)
    };
  });
}

function getFontName(font: string): string {
  return font.toLowerCase().replace(/\s/g, "-");
}

export {
  getFonts
}
