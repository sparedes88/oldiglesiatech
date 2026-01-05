import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'level-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class LevelFormComponent implements OnInit {

  constructor(
    public api: ApiService,
    public userService: UserService,
    public formBuilder: FormBuilder,
    private fus: FileUploadService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  @Input() level: any;
  @Input() order: any = 0;
  @Output() onSubmit = new EventEmitter();

  // Data
  public currentUser: any;
  public levelFormGroup: FormGroup = this.formBuilder.group({
    idNivel: [''],
    descripcion: ['', Validators.required],
    requisitos: this.formBuilder.array([]),
    estatus: [true],
    orden: this.order + 1
  });

  ngOnInit() {
    if (this.level) {
      this.levelFormGroup.patchValue({
        idNivel: this.level.idNivel,
        descripcion: this.level.descripcion,
        orden: this.level.orden,
        estatus: this.level.estatus
      });
      // Append requirements
      const requirementsArray = this.levelFormGroup.get('requisitos') as FormArray;
      if (this.level.requisitos && this.level.requisitos.length) {
        this.level.requisitos.map(req => {
          // Only active requirements
          if (req.estatus == true) {
            // Append form group
            requirementsArray.push(
              this.formBuilder.group({
                idRequisito: req.idRequisito,
                descripcion: req.descripcion,
                estatus: true,
                full_description: [req.full_description ? req.full_description : req.descripcion, Validators.required],
                frame_video: [req.frame_video],
                files: [JSON.stringify(req.files)],
                files_json: [req.files],
                orden: [req.orden]
              })
            );
          }
        });
      }
    } else {
      const requirementsArray = this.levelFormGroup.get('requisitos') as FormArray;
      requirementsArray.push(this.createRequirement());
    }
  }

  createRequirement(): FormGroup {
    return this.formBuilder.group({
      idRequisito: [''],
      descripcion: ['', Validators.required],
      full_description: ['', Validators.required],
      frame_video: [''],
      files: [''],
      files_json: []
    });
  }

  addRequirement(): void {
    const req = this.levelFormGroup.get('requisitos') as FormArray;
    req.push(this.createRequirement());
  }

  deleteRequirement(index) {
    const control = this.levelFormGroup.controls.requisitos as FormArray;
    control.removeAt(index);
  }

  submitForm(form: FormGroup) {
    if (form.invalid) {
      return alert(`Please check the form and try again`);
    }

    this.onSubmit.emit(form.value);
  }

  public clearForm() {
    this.levelFormGroup.reset();
  }

  uploadFiles(input_file: any, req_group_form: FormGroup) {
    console.log(req_group_form);

    input_file.onchange = (event: { target: { files: FileList } }) => {
      if (event.target.files.length > 0) {
        this.onFileChange(event.target.files, req_group_form);
      }
    };
    input_file.click();
  }

  private async onFileChange(files: FileList, req_group_form: FormGroup) {
    if (files.length && files.length > 0) {
      // this.processing = true;
      console.log(`Processing ${files.length} file(s).`);
      // setTimeout(() => {
      //   // Fake add attachment
      //   // this.processing = false;
      //   this.fus.uploadFile()
      // }, 1000);
      // this.message.has_attachments = true;
      const array = Array.from(files);
      const attachments = req_group_form.get('files_json').value;
      console.log(attachments);
      for (const file of array) {
        const url: any = await this.fus.uploadFile(file, true, `events_files`).toPromise();
        attachments.push({ name: file.name, url: this.fus.cleanPhotoUrl(url.response) });
        // .subscribe((response: any) => {

        // });
      }
      req_group_form.patchValue(
        {
          files: JSON.stringify(attachments),
          files_json: attachments
        }
      );
    }
  }

  getUrl(url) {
    return `${environment.serverURL}${url}`;
  }

}
