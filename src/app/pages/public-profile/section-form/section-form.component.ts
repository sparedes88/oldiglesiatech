import { MatSnackBar } from '@angular/material';
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { FileUploadService } from "src/app/services/file-upload.service";
import { ApiService } from "src/app/services/api.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "section-form",
  templateUrl: "./section-form.component.html",
  styleUrls: ["./section-form.component.scss"],
})
export class SectionFormComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    public fileUpload: FileUploadService,
    public api: ApiService,
    private snackbar: MatSnackBar
  ) { }

  @Input() idIglesia: number;
  @Input() section: any;
  @Output() onSubmit = new EventEmitter();
  api_url = environment.apiUrl;
  // Form
  public sectionForm = {
    title: "",
    section_type: '',
    section_content: {
      id: undefined,
      value: '',
      iframe_height: undefined,
      view_type: 'list',
      group_type_id: 2,
      text_color: '#ffffff',
      degrees: 112,
      main_color: '#e65100',
      main_percent: 72,
      second_color: '#ffb994',
      second_percent: 100,
      lang: 'en'
    },
    columns_type: "",
    active: true,
    background_color: "#ffffff",
    text_color: "#505050",
    background_image: "",
    background_size: "cover",
    background_position: "center",
    container: false,
    gallery_id: ''
  };

  public iframes: Array<any> = [];
  public sectionTypes: Array<any> = [
    "iframe",
    "columns",
    "custom-columns",
    "gallery",
  ];
  public uploading: boolean = true;
  public sizes: Array<string> = ["auto", "contain", "cover"];
  public positions: Array<string> = [
    "center",
    "top",
    "bottom",
    "left",
    "right",
  ];

  selected_contact_inbox_id: number;
  mailingLists: any[] = [];

  ngOnInit() {
    this.initOptions();
    if (this.section) {
      this.sectionForm = Object.assign({}, this.section);
      if (!this.sectionForm.background_color) {
        this.sectionForm.background_color = "#ffffff";
      }
      if (!this.sectionForm.text_color) {
        this.sectionForm.text_color = "#505050";
      }
    }

    this.getGalleries();
  }

  initOptions() {
    this.iframes = [
      {
        label: "Events Grid",
        id: "iframe_events_grid",
        value: `${this.api_url}/public/events/organization/${this.idIglesia}?lang=en&slider=false`,
        iframe_height: 600
      },
      {
        label: "Events Carousel",
        id: "iframe_events_carousel",
        value: `${this.api_url}/public/events/organization/${this.idIglesia}?lang=en&slider=true`,
        iframe_height: 600
      },
      {
        label: "Groups",
        id: "iframe_groups",
        value: `${this.api_url}/public/groups/organization/${this.idIglesia}?lang=en`,
        iframe_height: 550,
        view_type: 'list',
        group_type_id: 2,
        text_color: '#ffffff',
        degrees: 112,
        main_color: '#e65100',
        main_percent: 72,
        second_color: '#ffb994',
        second_percent: 100,
        lang: 'en'
      },
      {
        label: "Playlists",
        id: "iframe_playlists",
        value: `${this.api_url}/public/playlists/organization/${this.idIglesia}?lang=en`,
        iframe_height: 600
      },
      {
        label: "Registration",
        id: "iframe_registration",
        value: `${this.api_url}/public/registration/organization/${this.idIglesia}?lang=en`,
        iframe_height: 500
      },
      {
        label: "Contact",
        id: "iframe_contact",
        value: `${this.api_url}/public/contact_inbox/${this.selected_contact_inbox_id}?lang=en`,
        iframe_height: 500,
        lang: 'en'
      },
      {
        label: "Donations",
        id: 'iframe_donations',
        value: `https://iglesiatech.app/donations/${this.idIglesia}`,
        iframe_height: 404
      },
    ];
  }

  public galleries: any[] = [];

  submitForm(form: FormGroup) {
    if (form.invalid) {
      return alert(`Please check the form and try again`);
    }
    if (this.sectionForm.section_content) {
      if (this.sectionForm.section_content.id === 'iframe_groups' || this.sectionForm.section_content.id === 'iframe_contact') {
        if (this.sectionForm.section_content.id === 'iframe_contact') {
          if (!this.selected_contact_inbox_id) {
            this.snackbar.open(`You need to select a contact inbox.`, `Done`, { duration: 3000 });
            return;
          }
        }

        let params = ``;
        Object.keys(this.sectionForm.section_content).forEach(key => {
          if (key !== 'label'
            && key !== 'id'
            && key !== 'value'
            && key !== 'iframe_height') {
            params = `${params}${this.getParam(key)}`;
          }
        });
        params = `${params.substring(1)}`
        if (params) {
          params = `?${params}`;
        }
        params = params.replace(/#/g, '%23');
        if (this.sectionForm.section_content.id === 'iframe_groups') {
          this.sectionForm.section_content.value = `${this.api_url}/public/groups/organization/${this.idIglesia}${params}`;
        } else {
          this.sectionForm.section_content.value = `${this.api_url}/public/contact_inbox/${this.selected_contact_inbox_id}${params}`;
        }
      }
    }
    this.onSubmit.emit(this.sectionForm);
  }
  getParam(key: string) {
    const obj: {
      value: any,
      name: string
    } = {
      value: this.sectionForm.section_content[key],
      name: key
    }
    return `&${obj.name}=${obj.value}`
  }

  addBgImage(file) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, "builder").subscribe(
        (data: any) => {
          this.sectionForm.background_image = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  deleteBgPhoto() {
    this.sectionForm.background_image = undefined;
  }

  getGalleries() {
    this.api.get("galleries", { idIglesia: this.idIglesia }).subscribe(
      (data: any) => (this.galleries = data),
      (err) => console.error(err)
    );
  }

  checkIframeType(event) {
    if (this.sectionForm.section_content.id === 'iframe_contact') {
      this.getMailingLists();
    } else {
      this.selected_contact_inbox_id = undefined;
    }

  }

  getMailingLists() {
    this.api
      .get(`mailingList/`, { idIglesia: this.idIglesia })
      .subscribe(
        (data: any) => {
          this.mailingLists = data;
          this.selected_contact_inbox_id = undefined;
        },
        (error) => console.error(error)
      );
  }
}
