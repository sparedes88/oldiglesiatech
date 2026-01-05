import { Component, OnInit, Input } from "@angular/core";
import { FileUploadService } from "src/app/services/file-upload.service";

@Component({
  selector: "slider-editor",
  templateUrl: "./slider-editor.component.html",
  styleUrls: ["./slider-editor.component.scss"],
})
export class SliderEditorComponent implements OnInit {
  constructor(private fileUpload: FileUploadService) { }

  @Input() slides: Array<any> = [];
  @Input() lang: string = "en";

  currentTabIndex: number = 0;
  uploading: boolean = false;
  verticalPositions: Array<string> = ["top", "bottom", "center"];
  horizontalPositions: Array<string> = ["left", "right", "center"];
  backgroundSizes: Array<string> = ["cover", "contain", "auto"];
  backgroundPositions: Array<string> = [
    "center",
    "top",
    "bottom",
    "left",
    "right",
  ];
  preview: boolean = false;

  ngOnInit() {
    if (!this.slides) {
      this.slides = [];
    }

    if (!this.slides.length) {
      this.addSlide();
    }
  }

  get currentSlide(): any {
    if (this.slidesByLang && this.currentTabIndex != undefined) {
      return this.slidesByLang[this.currentTabIndex];
    }
  }

  addSlide() {
    this.slides.push({
      content: "<span>Write here!</span>",
      lang: this.lang,
    });
  }

  addBgImage(file) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, "builder").subscribe(
        (data: any) => {
          console.log(data);
          this.currentSlide.background_image = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  get slidesByLang() {
    return this.slides.filter((slide: any) => {
      if (!slide.lang && this.lang == "en") {
        return true;
      } else {
        return slide.lang == this.lang;
      }
    });
  }

  deleteSlider(currentTabIndex) {
    const slide = this.slidesByLang[currentTabIndex];
    const index = this.slides.indexOf(slide);
    this.slides.splice(index, 1);
  }
}
