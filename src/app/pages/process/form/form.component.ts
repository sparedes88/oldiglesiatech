import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "src/app/services/user.service";
import { MatSnackBar } from "@angular/material";
import { ApiService } from "src/app/services/api.service";
import { ResourceModel } from "src/app/models/RessourceModel";
import { environment } from "src/environments/environment";
import { DomSanitizer } from "@angular/platform-browser";
import { ToastType } from "src/app/login/ToastTypes";
import { FileUploadService } from "src/app/services/file-upload.service";

@Component({
  selector: "app-process-form",
  templateUrl: "./form.component.html",
  styleUrls: ["./form.component.scss"]
})
export class FormComponent implements OnInit {
  constructor(
    public api: ApiService,
    public formBuilder: FormBuilder,
    public userService: UserService,
    public snackbar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private fus: FileUploadService
  ) {
    this.user = this.userService.getCurrentUser();
  }

  get file_info(): ResourceModel {
    if (this.processFormGroup) {
      if (this.processFormGroup.get('file_info')) {
        return this.processFormGroup.get('file_info').value;
      }
    }
  }

  @ViewChild('img_tag') img_tag: any;
  @Input() process: any;
  @Input() groups: any[] = [];
  @Input() levels: any[] = [];
  @Output() onSubmit = new EventEmitter();

  // Multiselect opts
  public multiSelectLevels: any = {
    singleSelection: false,
    idField: "idNivel",
    textField: "descripcion",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    allowSearchFilter: true
  };
  public multiSelectGroups: any = {
    singleSelection: false,
    idField: "idGroup",
    textField: "title",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    allowSearchFilter: true
  };

  // Current user
  public user: any;

  // Form
  public processFormGroup: FormGroup = this.formBuilder.group({
    idProcess: [""],
    name: ["", Validators.required],
    description: [""],
    groups: [[]],
    levels: [[]],
    status: [true],
    createdBy: [""],
    idOrganization: [""],
    img_file: new FormControl(),
    temp_src: new FormControl(undefined),
  });

  /** METHODS */

  ngOnInit() {
    // Set initial data
    this.processFormGroup.patchValue({
      createdBy: this.user.idUsuario,
      idOrganization: this.user.idIglesia
    });
    const promises = [];
    // Load data
    // promises.push(this.getGroups());
    // promises.push(this.getLevels());
    if (this.process) {
      promises.push(this.getProcessDetails(this.process));
    }
    Promise.all(promises).then((responses: any) => {
      if (this.process) {
        const process = responses[0];
        const groups = this.groups
          .filter(
            group => process.groups.includes(group.idGroup)
          )
        const levels = this.levels
          .filter(
            level => process.levels.includes(level.idNivel)
          )
        this.process.groups = groups;
        this.process.levels = levels;

        this.processFormGroup.addControl('idResource', new FormControl(this.process.idResource, []));
        this.processFormGroup.addControl('file_info', new FormControl(this.process.file_info, []));
        // this.processFormGroup.patchValue({
        //   idProcess: this.process.idProcess,
        //   name: this.process.name,
        //   description: this.process.description,
        //   groups: this.process.groups,
        //   levels: this.process.levels,
        //   status: this.process.status,
        //   createdBy: this.process.createdBy,
        //   idOrganization: this.process.idOrganization
        // });
        this.processFormGroup.patchValue(this.process);
        this.processFormGroup.get('groups').markAsPristine();
      }
    })
  }

  getProcessDetails(process: any, loading = true) {
    return new Promise((resolve, reject) => {
      this.api.get(`process/getProcess/${process.idProcess}`).subscribe(
        (res: any) => {
          return resolve(res.process);
        },
        err => {
          console.error(err);
          return reject(err);
        });
    });
  }

  async submit(form: FormGroup) {
    if (form.invalid) {
      return this.snackbar.open(`Please check the form and try again`, "Ok", {
        duration: 3000
      });
    }
    // Clone object
    let payload: any = Object.assign({}, form.value);

    let has_new_file = false;
    if (payload.img_file) {
      has_new_file = true;
    }
    if (has_new_file) {
      const response: any = await this.fus.uploadFile(payload.img_file, false, 'media')
        .toPromise()
        .catch(error => {
          console.error(error);
          return;
        });
      if (response) {
        payload.idResource = response.file_info.id
      } else {
        this.api.showToast(`Error uploading the file.`, ToastType.error);
        return;
      }
    }

    // Append field if needed
    if (!payload.levels) {
      payload.levels = [];
    }
    if (!payload.groups) {
      payload.groups = [];
    }

    // set ids
    payload.levels = payload.levels.map(level => level.idNivel);
    // Set categories
    payload.groups = payload.groups.map(group => group.idGroup);

    if (form.value.idProcess) {
      this.updateProcess(payload);
    } else {
      this.addProcess(payload);
    }
  }

  getLevels() {
    return new Promise((resolve, reject) => {
      this.api.get("getNiveles", { idIglesia: this.user.idIglesia }).subscribe(
        (data: any) => {
          // Filter only of levels exists
          if (data.niveles) {
            this.levels = data.niveles.filter(lvl => lvl.estatus == true);
          }
          return resolve(this.levels);
        },
        err => {
          console.error(err);
          return resolve([]);
        }
      );
    })
  }

  getGroups() {
    return new Promise((resolve, reject) => {
      this.api
        .get(`groups/getGroups`, { idIglesia: this.user.idIglesia })
        .subscribe(
          (data: any) => {
            if (data.groups) {
              this.groups = data.groups;
            }
            return resolve(data.groups);
          },
          error => {
            console.error(error);
            return resolve([]);
          });

    })
  }

  checkChanges($event) {
    const groups: number[] = this.processFormGroup.value.groups.map(group => group.idGroup);
    const groups_2: number[] = this.process.groups.map(group => group.idGroup);
    if (JSON.stringify(groups) === JSON.stringify(groups_2)) {
      this.processFormGroup.get('groups').markAsPristine();
    } else {
      this.processFormGroup.get('groups').markAsDirty();
    }
  }

  /**
   * Submit a new process
   * @param data
   */
  addProcess(data: any) {
    this.api.post(`process/addProcess`, data).subscribe(
      () => {
        this.onSubmit.emit();
        this.processFormGroup.reset();
      },
      err => console.error(err)
    );
  }

  updateProcess(data: any) {
    this.api.post(`process/updateProcess`, data).subscribe(
      () => {
        this.onSubmit.emit();
        this.processFormGroup.reset();
      },
      err => console.error(err)
    );
  }

  fixUrl() {
    if (this.processFormGroup.get('temp_src').value) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.processFormGroup.get('temp_src').value);
    } else if (this.file_info) {
      return `${environment.serverURL}${this.file_info.src_path}`;
    } else {
      return `/assets/img/default-cover-image.jpg`
    }
  }

  addDefaultEntryPhoto(file: File) {
    this.processFormGroup.get('img_file').setValue(file);

    if (file) {
      setTimeout(() => {
        this.img_tag.nativeElement.src = URL.createObjectURL(file);
        this.processFormGroup.get('temp_src').setValue(this.img_tag.nativeElement.src);
      }, 600);
      var reader = new FileReader();
      //Read the contents of Image File.
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {

        //Initiate the JavaScript Image object.
        var image = new Image();

        //Set the Base64 string return from FileReader as source.
        image.src = e.target.result as any;

        //Validate the File Height and Width.
        image.onload = () => {
          var height = image.height;
          var width = image.width;
          // const aspect_ratio = height / width;

          // const client_width = this.col_img_banner_container.nativeElement.clientWidth;

          // this.container = {
          //   width: client_width,
          //   height: client_width * aspect_ratio
          // }

          return true;;
        }
      };
      // this.edit_object.home_banner = true

    } else {
      this.processFormGroup.get('temp_src').setValue(undefined);
      setTimeout(() => {
        this.img_tag.nativeElement.src = this.fixUrl();
      }, 600);
    }
  }
}
