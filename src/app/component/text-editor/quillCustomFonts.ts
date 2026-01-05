import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import * as QuillNamespace from "quill";

let Quill: any = QuillNamespace;
const Font: any = Quill.import("formats/font");

@Injectable()
export class CustomFonts extends Font {
  fonts: string[];
  fontNames: string[];

  constructor(private http: HttpClient) {
    super();
    console.log(this);
  }

  async initFonts() {
    this.fonts = await this.http.get(`${environment.serverURL}/api/iglesiaTechApp/configuracionesTabs/getFonts`).toPromise() as any;
    console.log(this.fonts);

    this.fonts.forEach((font) => {
      let fontName: string = getFontName(font);
      fontStyles +=
        ".ql-snow .ql-picker.ql-font .ql-picker-label[data-value=" +
        fontName +
        "]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=" +
        fontName +
        "]::before {" +
        "content: '" +
        font +
        "';" +
        "font-family: '" +
        font +
        "', sans-serif;" +
        "}" +
        ".ql-font-" +
        fontName +
        "{" +
        " font-family: '" +
        font +
        "', sans-serif;" +
        "}";
    });

    /**
     * Insert css styles into html body
     */
    let node = document.createElement("style");
    node.innerHTML = fontStyles;
    document.body.appendChild(node);

    this.fontNames = this.fonts.map((font) => getFontName(font));
    console.log(this.fontNames);

  }

}

/** Define available font names */
let fonts: Array<string> = [
  "Arial",
  "Courier",
  "Garamond",
  "Tahoma",
  "Times New Roman",
  "Verdana",
  "Roboto",
  "Dancing Script",
  "Lobster",
  "Pacifico",
  "Righteous",
  "Shadows Into Light",
  "Questrial",
  "Cormorant Garamond",
  "Permanent Marker",
  "Didact Gothic",
  "Marck Script",
  "Josefin Slab",
  'Montserrat',
  'Pattaya',
  'Dancing Script'
];

/**
 * Convert name to snake case
 * @param font String
 */
function getFontName(font: string): string {
  return font.toLowerCase().replace(/\s/g, "-");
}

async function getFonts() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", `${environment.serverURL}/api/iglesiaTechApp/configuracionesTabs/getFonts`, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
  xhr.onreadystatechange = function () {
    if (this.readyState != 4) return;
    if (this.status == 200) {
      fonts = JSON.parse(this.responseText);

      console.log(fonts);
      // we get the returned data
    }

    // end of state change: it can be after some time (async)
  };
  console.log(xhr);
  console.log();
  fonts = JSON.parse(xhr.response);
  return fonts;
}

getFonts()

console.log('Test POSITION');

/**
 * Store available fonts in snakecase
 */
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
    ".ql-snow .ql-picker.ql-font .ql-picker-label[data-value=" +
    fontName +
    "]::before, .ql-snow .ql-picker.ql-font .ql-picker-item[data-value=" +
    fontName +
    "]::before {" +
    "content: '" +
    font +
    "';" +
    "font-family: '" +
    font +
    "', sans-serif;" +
    "}" +
    ".ql-font-" +
    fontName +
    "{" +
    " font-family: '" +
    font +
    "', sans-serif;" +
    "}";
});

/**
 * Insert css styles into html body
 */
let node = document.createElement("style");
node.innerHTML = fontStyles;
document.body.appendChild(node);

export { fontNames };
