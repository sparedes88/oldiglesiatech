import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "slide-item",
  templateUrl: "./slide-item.component.html",
  styleUrls: ["./slide-item.component.scss"],
})
export class SlideItemComponent implements OnInit {
  constructor() {}

  @Input() slide: any = {};
  @Input() height: string = '50vh'

  ngOnInit() {}

  getBgImage() {
    if (this.slide.background_image)
      return `url(${this.slide.background_image})`;
  }

  get sliderStyle() {
    return {
      "background-image": this.getBgImage(),
      "align-items": this.alignItems,
      "justify-content": this.justifyContent,
      "background-size": this.slide.background_size,
      "background-position": this.slide.background_position,
      "min-height": this.height
    };
  }

  get alignItems(): string {
    let value: string = "flex-start";

    switch (this.slide.vertical_position) {
      case "top":
        value = "flex-start";
        break;
      case "bottom":
        value = "flex-end";
        break;
      case "center":
        value = "center";
        break;
    }

    return value;
  }

  get justifyContent(): string {
    let value: string = "flex-start";
    switch (this.slide.horizontal_position) {
      case "left":
        value = "flex-start";
        break;
      case "right":
        value = "flex-end";
        break;
      case "center":
        value = "center";
        break;
    }
    return value;
  }
}
