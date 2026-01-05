import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "profile-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
})
export class FooterComponent implements OnInit {
  constructor() { }

  @Input() footer: any;

  ngOnInit() { }

  get customRowsClasses() {
    const number_value = 12 / this.footer.rows.length;
    const number_string = String(number_value);
    const index = number_string.indexOf('.');
    if (index !== -1) {
      const number_format = `${number_string[index-1]}_${number_string[index + 1]}`;
      console.log(number_format);
      return `col-md-${number_format}`;
    } else {
      return `col-md-${number_value}`;
    }
  }

  get sectionStyle() {
    return {
      "background-color": this.footer.background_color,
      color: this.footer.text_color,
      "background-image": this.getBgImage(),
      "background-size": this.footer.background_size,
      "background-position": this.footer.background_position,
    };
  }

  getBgImage() {
    if (this.footer.background_image)
      return "url('" + this.footer.background_image + "')";
  }
}
