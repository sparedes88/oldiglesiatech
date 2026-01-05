import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import { NguCarouselConfig } from "@ngu/carousel";

@Component({
  selector: "slider",
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.scss"],
})
export class SliderComponent implements OnInit {
  constructor(private _cdr: ChangeDetectorRef) {}

  @Input() slides: Array<any> = [];
  @Input() lang: string = "en";

  public carouselTile: NguCarouselConfig = {
    grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
    slide: 1,
    speed: 400,
    point: {
      visible: true,
    },
    loop: true,
    load: 2,
    velocity: 0,
    touch: true,
    easing: "cubic-bezier(.5,.12,.55,.72)",
    animation: "lazy",
    interval: {
      timing: 5000,
      initialDelay: 0,
    },
    vertical:{
      height: 450,
      enabled: false
    }
  };

  ngAfterViewInit() {
    this._cdr.detectChanges();
  }

  ngOnInit() {}

  get slidesByLang(): Array<any> {
    return this.slides.filter((slide: any) => {
      if (!slide.lang && this.lang == "en") {
        return true;
      } else {
        return slide.lang == this.lang;
      }
    });
  }
}
