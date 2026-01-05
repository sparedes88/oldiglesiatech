import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { MatSnackBar } from "@angular/material";
import { UserService } from "src/app/services/user.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";

// QUILL INIT
import * as QuillNamespace from "quill";
let Quill: any = QuillNamespace;
import ImageResize from "quill-image-resize-module";
import { WordpressService } from "src/app/services/wordpress.service";
import { Observable } from "rxjs";
import { NgxSmartModalService } from "ngx-smart-modal";
Quill.register("modules/imageResize", ImageResize);

@Component({
  selector: "post-form",
  templateUrl: "./post-form.component.html",
  styleUrls: ["./post-form.component.scss"],
})
export class PostFormComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private api: ApiService,
    private wordpress: WordpressService,
    private modal: NgxSmartModalService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  @Input() wpConfig: any;
  @Input() wpData: any = {};
  @Input() post: any;
  @Output() onSubmit = new EventEmitter();

  // Data
  public currentUser: any;
  uploadingCover: Boolean = false;
  public groups: any[] = [];
  public mailingLists: any[] = [];
  visiblePixieModal: boolean = false;

  // Quill component setings
  public modules: any = {
    toolbar: {
      container: [
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ header: 1 }, { header: 2 }],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
      ],
    },
    imageResize: true,
  };
  public quill: any;
  public loadedPhotos: any[] = [];

  // Post from
  public uploading: boolean;
  public postFormGroup: FormGroup = this.formBuilder.group({
    id: [null],
    date: [],
    status: ["publish", Validators.required],
    title: ["", Validators.required],
    content: ["", Validators.required],
    featured_media: [],
    tags: [],
    categories: [],
  });

  public postMedia: any;

  // Options
  public notifyContacts: string = null;
  public selectedGroups: any = [];
  public selectedMailingLists: any = [];
  public notifyBy: string = "email";

  /** COMPONENT METHODS */

  ngOnInit() {
    this.getGroups();
    this.getMailingLists();
    console.log(this.wpData)
    // Preload post Update mode
    if (this.post)
      this.postFormGroup.patchValue({
        id: this.post.id,
        date: this.post.date,
        status: this.post.status,
        title: this.post.title.rendered,
        content: this.post.content.rendered,
        featured_media: this.post.featured_media,
        tags: this.post.tags,
        categories: this.post.categories,
      });
  }

  getGroups() {
    this.api
      .get(`groups/getGroups`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          if (data.groups) {
            this.groups = data.groups;
            this.selectedGroups = [this.groups[0].idGroup]
          }
        },
        (error) => console.error(error)
      );
  }

  getMailingLists() {
    this.api
      .get(`mailingList/`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.mailingLists = data;
        },
        (error) => console.error(error)
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.wordpress.config = this.wpConfig;
  }

  /** QUILL METHODS */
  onEditorCreated(quill) {
    var toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", this.imageHandler);
    this.quill = quill;
  }

  imageHandler(value) {
    const inputFile: any = document.getElementById("fileUpload");
    inputFile.click();
  }

  uploadPhoto() {
    const inputFile: any = document.getElementById("fileUpload");

    if (inputFile && inputFile.files && inputFile.files.length) {
      const file: File = inputFile.files[0];

      // Check file size
      let size = file.size / (1024 * 1024);
      console.log(size);
      if (size > 100) {
        return this.snackbar.open(`ERROR: Max file size is 100m.`, "OK", {
          duration: 3000,
        });
      }

      // Submit
      this.uploadFile(file, (data: any) => {
        let range = this.quill.getSelection(true);
        this.quill.insertEmbed(range.index, "image", data.source_url);
      });
    }
  }

  submitPost(form: FormGroup) {
    if (form.invalid) {
      return this.snackbar.open("Please check the form and try again.", "OK", {
        duration: 3000,
      });
    }

    this.uploading = true;

    // Build payload
    let payload = form.value;

    // Create array of tags:
    if (payload.date) {
      payload.date = moment(payload.date).toISOString();
    } else {
      payload.date = null;
    }

    // Save post in server
    let request: Observable<any>;
    let successMessage: string;

    if (payload.id) {
      /*request = this.wordpress.PATCH(
        `wp-json/wp/v2/posts/${payload.id}`,
        payload
      );*/
      successMessage = "The post was updated!";
    } else {
      request = this.wordpress.POST(`wp-json/wp/v2/posts`, payload);
      successMessage = "The post was created!";
    }

    request.subscribe(
      (data: any) => {
        this.onSubmit.emit(data);
        this.snackbar.open(successMessage, "OK", { duration: 3000 });
        this.uploading = false;
        this.sendNotifications(data);
      },
      (err) => {
        console.error(err);
        this.snackbar.open(
          `Can't save the Post, please check the form and try again.`,
          "OK",
          { duration: 3000 }
        );
        this.uploading = false;
      }
    );
  }

  handleFileInput(files: FileList) {
    const file = files.item(0);
    this.uploadingCover = true;
    this.snackbar.open(`Uploading Photo, please wait...`, "", {
      duration: 3000,
    });
    if (file) {
      this.uploadFile(file, (data) => {
        // Set Featured image
        this.postMedia = data;
        this.postFormGroup.patchValue({ featured_media: data.id });
        this.uploadingCover = false;
      });
    }
  }

  handlePixieExport(file) {
    this.uploadingCover = true;
    this.visiblePixieModal = false;
    this.snackbar.open(`Uploading Photo, please wait...`, "", {
      duration: 3000,
    });
    this.uploadFile(file, (data) => {
      // Set Featured image
      this.postMedia = data;
      this.postFormGroup.patchValue({ featured_media: data.id });
      this.uploadingCover = false;
    });
  }

  uploadFile(file: any, callback: Function) {
    const formData = new FormData();
    formData.append("file", file);

    this.wordpress.POST(`wp-json/wp/v2/media`, formData).subscribe(
      (data: any) => {
        callback(data);
      },
      (err) => {
        console.error(err);
      }
    );
  }

  sendNotifications(post) {
    if (this.notifyContacts) {
      const payload: any = {};

      // Set notification type
      payload.idIglesia = this.currentUser.idIglesia;

      if (this.notifyContacts == "all") {
        payload.groups = "all";
      } else {
        payload.groups = this.selectedGroups;
        payload.mailingLists = this.selectedMailingLists
      }
      payload.wordpressUrl = this.wpConfig.url;
      payload.postId = post.id;
      payload.notify_by = this.notifyBy;

      // Send post
      this.api.post(`wordpress/distribute`, payload).subscribe(
        (response) => {
          console.log(response);
        },
        (err) => console.error(err)
      );
    }
  }
}
