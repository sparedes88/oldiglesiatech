import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { FileUploadService } from "src/app/services/file-upload.service";
import { ANIMATIONS, EASINGS } from "./animations";

@Component({
  selector: "app-section",
  templateUrl: "./section.component.html",
  styleUrls: ["./section.component.scss"],
})
export class SectionComponent implements OnInit {
  constructor(
    private domSanitizer: DomSanitizer,
    public fileUpload: FileUploadService
  ) {}

  @Input() section: any = {};
  @Input() displayMode: string = "edit";
  @Output() onDelete = new EventEmitter();
  @Output() onUpdate = new EventEmitter();
  @Output() onSelectUpdate = new EventEmitter();
  @Output() onChangeOrder = new EventEmitter();

  // Columns only
  public columnViewMode: string = "edit";
  public uploading: boolean = false;
  public animations: Array<string> = ANIMATIONS;
  public easings: Array<string> = EASINGS;

  ngOnInit() {
    if (this.displayMode == "prod") {
      this.columnViewMode = "preview";
    }

    // Set some defaults
    if (this.section.section_content) {
      if (!this.section.section_content.column_size) {
        this.section.section_content.column_size = 6;
      }

      if (!this.section.section_content.image_size) {
        this.section.section_content.image_size = 100;
      }

      if (!this.section.section_content.rows) {
        this.section.section_content.rows = [
          {
            content: "<h4>Click here to edit!<h4>",
          },
        ];
        // Set row config
        this.section.section_content.row_config = {
          mobile: 1,
          tablet: 3,
          desktop: 4,
        };
      }
    } else {
      this.section.section_content = {
        column_size: 6,
        image_size: 100,
        rows: [{ content: "<h4>Click here to edit!<h4>" }],
        row_config: {
          mobile: 1,
          tablet: 3,
          desktop: 4,
        },
        animations: {}
      };
    }

    if (!this.section.animation) {
      this.section.animation = {}
    }
  }

  emitDelete() {
    this.onDelete.emit();
  }

  emitUpdate() {
    this.onUpdate.emit(this.section);
  }

  emitSelectUpdate() {
    this.onSelectUpdate.emit();
  }

  emitChangeOrder() {
    this.onChangeOrder.emit();
  }

  togglePreview() {
    if (this.columnViewMode == "edit") {
      this.columnViewMode = "preview";
    } else {
      this.columnViewMode = "edit";
    }
  }

  addColImage(file) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, "builder").subscribe(
        (data: any) => {
          console.log(data);
          this.section.section_content.image = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  getImageUrl() {}

  get sectionStyle() {
    return {
      "background-color":
        this.columnViewMode == "edit" ? "white" : this.section.background_color,
      color:
        this.columnViewMode == "edit" ? "#505050" : this.section.text_color,
      "background-image":
        this.columnViewMode == "edit" ? "" : this.getBgImage(),
      "background-position": this.section.background_position,
      "background-size": this.section.background_size,
    };
  }

  desanityze(text: string = "") {
    if (text) {
      let ret = text.replace(/&gt;/g, ">");
      ret = ret.replace(/&lt;/g, "<");
      ret = ret.replace(/&quot;/g, '"');
      ret = ret.replace(/&apos;/g, "'");
      ret = ret.replace(/&amp;/g, "&");
      return ret;
    }
    return "";
  }

  /**Custom rows */
  insertCustomRow() {
    this.section.section_content.rows.push({
      content: "<h4>Click here to edit!<h4>",
    });
  }

  get customRowsClasses() {
    return `col-md-${12 / this.section.section_content.rows.length}`;
  }

  removeCustomRow(index) {
    this.section.section_content.rows.splice(index, 1);
  }

  getBgImage() {
    if (this.section.background_image)
      return "url('" + this.section.background_image + "')";
  }

  toTitle(text: string) {
    if (text) text.replace(/_/g, " ");
  }
}
