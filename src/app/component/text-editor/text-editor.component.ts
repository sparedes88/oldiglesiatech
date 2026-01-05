import { Component, OnInit, forwardRef, Input, ViewChild, EventEmitter, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import ImageResize from "quill-image-resize-module";
import { Observable } from "rxjs";
import * as QuillNamespace from "quill";
import { UserService } from "src/app/services/user.service";
import { FileUploadService } from "src/app/services/file-upload.service";
// import { fontNames } from "./quillCustomFonts";
import { getFonts } from "./quillCustomFontsTest";

import { QuillEditorComponent } from "ngx-quill";
import { colors } from "src/app/models/Utility";
import { OrganizationModel } from "src/app/models/OrganizationModel";
import { OrganizationService } from "src/app/services/organization/organization.service";
import { ToastType } from "src/app/login/ToastTypes";
import { environment } from "src/environments/environment";

const noop = () => { };

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextEditorComponent),
  multi: true,
};

// Init custom Font selection

// QUILL INIT
let Quill: any = QuillNamespace;
Quill.register("modules/imageResize", ImageResize);
const Font: any = Quill.import("formats/font");

const fontSizeArr = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '32px', '36px', '42px', '48px', '54px', '68px', '72px', '84px', '98px'];

var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);


let fontNames = [];
getFonts().then((response: any) => {
  const fonts = response.fonts;
  const font_names = response.fontNames;
  fontNames = response.fontNames
  Font.whitelist = font_names;
  Quill.register(Font, true);
})

@Component({
  selector: "text-editor",
  templateUrl: "./text-editor.component.html",
  styleUrls: ["./text-editor.component.scss"],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class TextEditorComponent implements ControlValueAccessor, OnInit {

  currentUser: any;

  font_form: FormGroup;
  toggle_form: boolean = false;
  @Output('change') change: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public userService: UserService,
    public uploadService: FileUploadService,
    private form_builder: FormBuilder,
    private organizationService: OrganizationService
  ) {
    this.currentUser = this.userService.getCurrentUser();
    if (this.currentUser) {
      if (this.currentUser.isSuperUser) {
        this.font_form = this.form_builder.group({
          name: new FormControl('', [Validators.required]),
          file: new FormControl(undefined, [Validators.required]),
          font: new FormControl(undefined, [Validators.required]),
          ext: new FormControl(undefined, [Validators.required])
        });
      }
    }
  }

  public optionCtrl: FormControl = new FormControl();

  @Input() identifier: string = "fileUpload";
  @Input() lite: boolean = false;
  @Input() more_lite_options: boolean = true;
  @Input() height: string = '600px';
  @Input() hide_font_buttons: boolean = false;
  @Input() bubble: boolean = false;
  @Input() custom_class: string = '';

  // Quill component setings
  public modules: any = {
    toolbar: {
      container: [
        [{ font: fontNames }],
        ["blockquote", "code-block"],
        [{ size: fontSizeArr }],
        ["bold", "italic", "underline", "strike"],
        [{ header: 1 }, { header: 2 }],
        [{ color: colors.concat('color-picker_' + this.identifier) }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
      ],
    },
    imageResize: true,
  };
  public quill: any;

  //The internal data model
  private innerValue: any = "";

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;


  ngOnInit(): void {

    if (this.lite) {
      this.modules.toolbar = {
        container: [
          [
            { font: fontNames },
          ]
        ],
      };
      if (this.more_lite_options) {
        this.modules.toolbar.container[0].push(
          {
            color: colors.concat('color-picker_' + this.identifier)
          });
        this.modules.toolbar.container.push(
          [
            { align: [] }
          ]
        );
      }
    }
  }

  showColorPicker(value) {

    if (value.includes('color-picker')) {
      let picker: any = document.getElementById('color-picker_' + this.identifier);

      if (!picker) {
        picker = document.createElement('input');
        picker.id = 'color-picker_' + this.identifier;
        picker.type = 'color';
        picker.style.display = 'none';
        picker.value = '#FF0000';
        document.body.appendChild(picker);

        picker.addEventListener('change', () => {

          this.quill.format('color', picker.value);
        }, false);
      }
      picker.click();
    } else {
      this.quill.format('color', value);
    }
  }

  addSizePicker(value) {

    if (value.includes('custom-size-picker')) {
      let picker: any = document.getElementById('custom-size-picker_' + this.identifier);

      if (!picker) {
        picker = document.createElement('input');
        picker.id = 'custom-size-picker_' + this.identifier;
        picker.type = 'text';
        picker.style.display = 'none';
        document.body.appendChild(picker);

        picker.addEventListener('change', () => {
          this.quill.format('size', picker.value);
        }, false);
      }
      picker.click();
    } else {
      this.quill.format('size', value);
    }
  }

  //get accessor
  get value(): any {
    return this.innerValue;
  }

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
      this.change.emit(v);
    }
  }

  //Set touched on blur
  onBlur() {
    this.onTouchedCallback();
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  /** QUILL METHODS */
  onEditorCreated(quill) {
    const toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", this.imageHandler.bind(this));
    toolbar.addHandler("color", this.showColorPicker.bind(this));
    toolbar.addHandler("size", this.addSizePicker.bind(this));
    if (this.height) {
      if (!this.height.includes('%')) {
        const toolbar_height = toolbar.container.offsetHeight;
        const new_height = Number(this.height.replace('px', '')) - toolbar_height;
        console.log(new_height);
        quill.container.style.height = `${new_height}px`;
      }
    }

    this.quill = quill;
  }

  imageHandler(value) {
    const inputFile: any = document.getElementById(this.identifier);
    inputFile.click();
  }

  uploadPhoto() {
    const inputFile: any = document.getElementById(this.identifier);

    if (inputFile && inputFile.files && inputFile.files.length) {
      const file: File = inputFile.files[0];

      // Check file size
      let size = file.size / (1024 * 1024);
      if (size > 100) {
        alert(`ERROR: Max file size is 100m.`);
      }

      // Submit
      this.uploadService.uploadFile(file, true).subscribe((response: any) => {
        let range = this.quill.getSelection(true);
        this.quill.insertEmbed(
          range.index,
          "image",
          `${environment.serverURL}${response.file_info.src_path}`,
          "user"
        );
      });
    }
  }

  async print() {
    if (this.font_form.valid) {
      const payload = this.font_form.value;

      const iglesia_temp = new OrganizationModel();
      iglesia_temp.idIglesia = 0;
      iglesia_temp.topic = 'general_fonts';
      const image = payload.file;
      const image_response: any = await new Promise((resolve, reject) => {
        const indexPoint = (image.name as string).lastIndexOf('.');
        const extension = (image.name as string).substring(indexPoint);
        const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
        ).toString(36);
        const myUniqueFileName = ticks + extension;

        return resolve(this.organizationService.uploadFile(image, iglesia_temp, myUniqueFileName, 'fonts', true));
      });
      payload.link = `${image_response.file_info.src_path}`;
      // this.image.get('url').setValue(payload.picture);
      payload.created_by = this.currentUser.idUsuario;
      const response = await this.organizationService.api.post(`configuracionesTabs/fonts`, payload).toPromise();

      if (response) {
        this.organizationService.api.showToast(`Font saved successfully. You need to refresh the web site to see your new font.`, ToastType.success);
        this.font_form.reset();
        this.toggle_form = false;
      }
    } else {
      this.organizationService.api.showToast(`Please fill all the required fields.`, ToastType.error);
    }
  }

  addFontFile(file: File) {
    if (file) {
      const extension = file.name.substring(file.name.lastIndexOf('.') + 1);
      this.font_form.get('file').setValue(file);
      this.font_form.get('ext').setValue(extension);
    } else {
      this.font_form.get('file').setValue(undefined);
      this.font_form.get('ext').setValue(undefined);
    }
  }

  setValue(event) {
    console.log(event);
    // this.value = event.html;
    this.change.emit(event.html);

  }

}
