import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ToastType } from "src/app/login/ToastTypes";
import { FileUploadService } from "src/app/services/file-upload.service";

@Component({
  selector: "footer-editor",
  templateUrl: "./footer-editor.component.html",
  styleUrls: ["./footer-editor.component.scss"],
})
export class FooterEditorComponent implements OnInit {
  constructor(private fileUpload: FileUploadService) { }

  @Input() footer = {
    rows: [
      {
        content: `<span>Write here</span>`,
      },
    ],
    background_color: "white",
    text_color: "black",
    background_image: "",
    background_position: "center",
    background_size: "cover",
  };
  @Output() onDelete = new EventEmitter();

  public uploading: boolean = true;
  public preview: boolean = false;
  public sizes: Array<string> = ["auto", "contain", "cover"];
  public positions: Array<string> = [
    "center",
    "top",
    "bottom",
    "left",
    "right",
  ];

  ngOnInit() { }

  insertRow() {
    if (this.footer.rows.length === 12) {
      this.fileUpload.api.showToast(`You only can add 12 columns.`, ToastType.info);
      return;
    }
    this.footer.rows.push({
      content: `<span>Write here</span>`,
    });
  }

  removeRow(index) {
    this.footer.rows.splice(index, 1);
  }

  addBgImage(file) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, "builder").subscribe(
        (data: any) => {
          console.log(data);
          this.footer.background_image = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  get customRowsClasses() {
    const number_value = 12 / this.footer.rows.length;
    const number_string = String(number_value);
    const index = number_string.indexOf('.');
    if (index !== -1) {
      const number_format = `${number_string[index - 1]}_${number_string[index + 1]}`;
      console.log(number_format);
      return `col-md-${number_format}`;
    } else {
      return `col-md-${number_value}`;
    }
  }

  deleteFooter() {
    if (confirm(`Are you sure you want to delete the footer?`))
      this.onDelete.emit();
  }

  deleteBgPhoto() {
    this.footer.background_image = undefined;
  }
}
