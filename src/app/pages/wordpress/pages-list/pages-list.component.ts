import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { WordpressService } from 'src/app/services/wordpress.service';
import * as QuillNamespace from "quill";
let Quill: any = QuillNamespace;
import ImageResize from "quill-image-resize-module";
import { ActivatedRoute } from "@angular/router";
Quill.register("modules/imageResize", ImageResize);

@Component({
  selector: 'app-pages-list',
  templateUrl: './pages-list.component.html',
  styleUrls: ['./pages-list.component.scss']
})
export class PagesListComponent implements OnInit {

  constructor(private api: ApiService,
    private userService: UserService,
    private modal: NgxSmartModalService,
    public route: ActivatedRoute,
    private wpService: WordpressService) {
    this.currentUser = userService.getCurrentUser();
    this.wpPageId = this.route.snapshot.params.id;
    console.log(this.route.snapshot.params.id)
  }
  public currentUser: any;
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
  public wpPageData
  public wpPageTitle
  public wpImages
  public wpPageDataPost = {}
  public wpConfig: any;
  public wordpressSettings: any;
  public configCompleted: boolean = false;
  @Input() wpPageId: number;
  @Output() onSubmit = new EventEmitter();
  ngOnInit() {
    console.log(this.wpPageId)
    this.getWordpressSettings()

  }
  public setPageId(id) {
    this.wpPageId = id
  }
  getWordpressSettings() {
    this.api
      .get(`wordpress`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.wordpressSettings = data;
          console.log(this.wordpressSettings)
          // Setup WP service
          let url = `${data.wordpressUrl}`;
          if (!url.endsWith('/')) {
            url += '/';
          }
          if (url.startsWith('http:')) {
            url = url.replace('http:', 'https:')
          }
          this.wpConfig = {
            url,
            token: data.authentication,
          };
          this.wpService.config = this.wpConfig;
          this.configCompleted = true;
          this.getDetails()
          this.getImages()
        },
        (err: any) => {
        },
        () => {
        }
      );
  }
  onEditorCreated(quill) {
    var toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", this.imageHandler);
    this.quill =
     quill;
  }
  keepOrder = (a, b) => {
    return a;
  }
  getImages() {
    //'wp-json/wp/v2/media/?per_page=100'
    this.wpService.GET('wp-json/wp/v2/media/?per_page=100&meta_value=true',
    ).subscribe(
      (data: any) => {
        this.wpImages = data
        console.log(this.wpImages)
      },
      (err) => {
        console.error(err);
      }
    );
  }
  returnImage(id){
    if(this.wpImages){
      return this.wpImages.find(element => element.id ==id).source_url;
    } else if (this.wpPageData.acf) {
      return this.wpPageData.acf.find(element => element.id ==id).url;
    } else {
      return 'https://img1.picmix.com/output/stamp/normal/8/5/2/9/509258_fb107.gif'
    }
  }
  imageChange(key, value) {
    this.wpPageDataPost[key]=value
  }
  post() {
    console.log(this.wpPageData)
    console.log(Object.keys(this.wpPageData))
    var keysArray = Object.keys(this.wpPageData)
    var post = {}
    keysArray.forEach((value)=>{
      post[value]=this.isObject(this.wpPageData[value]) ? this.wpPageData[value].id : this.wpPageData[value]
    })
    console.log(post)
    var postKeysArray = Object.keys(this.wpPageDataPost)
    console.log(this.wpPageDataPost)
    postKeysArray.forEach((value)=>{
      post[value]=this.isObject(this.wpPageDataPost[value]) ? this.wpPageDataPost[value].id : this.wpPageDataPost[value]
    })
    this.wpService.POST('wp-json/acf/v3/pages/' + this.wpPageId,
      {
        fields: post
      }
    ).subscribe(
      (data: any) => {
        console.log(data)
      },
      (err) => {
        console.error(err);
      }
    );
  }
  imageHandler(value) {
    const inputFile: any = document.getElementById("fileUpload");
    inputFile.click();
  }

  getDetails() {
    this.wpService.GET('wp-json/wp/v2/pages/' + this.wpPageId,
    ).subscribe(
      (data: any) => {
        this.wpPageTitle = data.title.rendered
        this.wpPageData = data.acf
      },
      (err) => {
        console.error(err);
      }
    );
  }
  isObject(obj) {
    return obj === Object(obj);
  }
}
