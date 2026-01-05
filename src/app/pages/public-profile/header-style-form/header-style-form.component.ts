import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import { FileUploadService } from "src/app/services/file-upload.service";
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: "header-style-form",
  templateUrl: "./header-style-form.component.html",
  styleUrls: ["./header-style-form.component.scss"],
})
export class HeaderStyleFormComponent implements OnInit {
  constructor(public fileUpload: FileUploadService, private userService: UserService) {
    this.currentUser = this.userService.getCurrentUser()
  }

  currentUser: any = {}

  @Output() onSubmit = new EventEmitter();
  @Input() headerStyle: any;

  public uploading: boolean = false;
  logoSizes: Array<any> = [
    { title: "small", value: "64px" },
    { title: "medium", value: "100px" },
    { title: "large", value: "150px" },
    { title: "X large", value: "200px" },
  ];

  headerStyleFormGroup: any = {
    background_color: "#ffffff",
    primary_color: "#4a72b2",
    secondary_color: "#ffffff",
    inactive_color: "black",
    icon_color: "black",
    display_mode: "single_logo",
    secondary_logo: "",
    primary_logo: "",
    logo_size: '100px',
    favicon: ''
  };

  ngOnInit() {
    if (this.headerStyle) {
      this.headerStyleFormGroup = Object.assign({}, this.headerStyle);
      if (!this.headerStyleFormGroup.display_mode) {
        this.headerStyleFormGroup.display_mode = "single_logo";
      }
    }
  }

  onSubmitForm(form: NgForm) {
    this.onSubmit.emit(this.headerStyleFormGroup);
  }

  addSecondaryLogo(file) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, "builder/logos").subscribe(
        (data: any) => {
          console.log(data);
          this.headerStyleFormGroup.secondary_logo = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  addPrimaryLogo(file) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, "builder/logos").subscribe(
        (data: any) => {
          console.log(data);
          this.headerStyleFormGroup.primary_logo = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  addFavicon(file) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, `builder/favicon/${this.currentUser.idIglesia}`).subscribe(
        (data: any) => {
          console.log(data);
          this.headerStyleFormGroup.favicon = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
          let func = window["changeFavIcon"];
          func(this.headerStyleFormGroup.favicon);
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }
}
