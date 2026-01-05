import { ToastType } from './../contact/toastTypes';
import { PagesListComponent } from './pages-list/pages-list.component';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WordpressService } from 'src/app/services/wordpress.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { isObject } from 'util';
import * as QuillNamespace from "quill";
let Quill: any = QuillNamespace;
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import ImageResize from "quill-image-resize-module";
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { Column, FilterSettingsModel, GridComponent, PageSettingsModel, PdfQueryCellInfoEventArgs, SearchSettingsModel, ToolbarItems } from '@syncfusion/ej2-angular-grids';
Quill.register("modules/imageResize", ImageResize);
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { PdfStandardFont, PdfFontFamily, PdfFontStyle } from '@syncfusion/ej2-pdf-export';
import { iglesia_tech_base_64 } from 'src/app/models/Utility';
@Component({
  selector: 'app-wordpress',
  templateUrl: './wordpress.component.html',
  styleUrls: ['./wordpress.component.scss'],
})
export class WordpressComponent implements OnInit {
  constructor(
    private api: ApiService,
    private userService: UserService,
    private modal: NgxSmartModalService,
    private wpService: WordpressService,
    private organizationService: OrganizationService
  ) {
    this.currentUser = userService.getCurrentUser();
  }

  // Datatable
  @ViewChildren(DataTableDirective)
  @ViewChild('grid') public grid: GridComponent;
  @ViewChild('canvas') public canvas;
  dtElements: QueryList<DataTableDirective>;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any[] = [];
  dtTrigger1: Subject<any> = new Subject();
  filters: any = { type: "", name: "", value: "" };
  fields: any = { type: "", name: "", value: "" };
  // Data
  public currentUser: any;
  public wordpressSettings: any;
  public wpPosts: any[] = [];
  public wpData = {
    tags: [],
    categories: [],
    authors: [],
  };
  public wpPages: any[] = []
  public selectedTab = "Posts"
  public wpPageId: any
  public wpConfig: any;
  public selectedPost: any;
  public configCompleted: boolean = false;
  public searchTxt: string = ''
  public searchName: string = ''
  public filterStatus: string = ''
  public filterType: string = ''
  public quill: any;
  public wpImages
  public searchSettings: SearchSettingsModel;
  public toolbar: ToolbarItems[];
  public customAttributes: object;
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
  filterOptions: FilterSettingsModel = {
    //showFilterBarOperator: true,
    //showFilterBarStatus: true
  };
  queryCellInfo(args: any): void {
    if (args.column.field === 'name') {
      args.cell.color = '#1abb9c';
    }
  }
  onColumnMenuClick(event) {
    //this.grid.refreshColumns();
  }
  dataBound() {
    console.log(this.grid.width)
    //this.grid.autoFitColumns();
    //this.grid.autoFitColumns(['email', 'complete_name'])
    var headercelldiv = this.grid.element.getElementsByClassName("e-headercelldiv") as any;
    for (var i=0; i<headercelldiv.length; i++){
      headercelldiv[i].style.height = 'auto';
    };
  }
  pdfExportComplete(): void {
    (this.grid.columns[0] as Column).visible = true;
    (this.grid.columns[1] as Column).visible = true;
    this.grid.refreshColumns();
  }
  pdfQueryCellInfo(args: PdfQueryCellInfoEventArgs): void {
    args.style = {
      fontSize: 16
    };
    if (args.column.field === 'name') {
      args.style = {
        textBrushColor: '#1abb9c',
        fontSize: 16
      };
    }
    if (args.column.field === 'categories') {
      args.value = (args.data as any).categories.map(port => port.name).join(', ');
      // args.style.fontSize = 16;
    }
    if (args.column.field === 'production') {
      // pink
      args.style = {
        textBrushColor: '#ff1493',
      };
    }
    if (args.column.field === 'man_days_allotted') {
      args.style = {
        textBrushColor: '#1abb9c',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'mandays_spent') {
      // orange
      args.style = {
        textBrushColor: '#e75b26',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'man_days_remaining') {
      // red
      args.style = {
        textBrushColor: '#cc3030',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'regular_cost') {
      // blue
      args.style = {
        textBrushColor: '#3498db',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'overtime_cost') {
      args.style = {
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'estimated_cost_usd') {
      // green
      args.style = {
        textBrushColor: '#1abb9c',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'daily_produce_summary.labor_cost') {
      // blue
      args.style = {
        textBrushColor: '#3498db',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'labor_cost_remaining_usd') {
      // red
      args.style = {
        textBrushColor: '#cc3030',
        textAlignment: 'Right'
      };
    }
    if (args.column.field === 'total_production') {
      // blue
      args.style = {
        textBrushColor: '#3498db',
      };
    }
    if (args.column.field === 'project_production') {
      // green
      args.style = {
        textBrushColor: '#1abb9c',
        textAlignment: 'Right'
      };
    }
    args.style.fontSize = 16;
  }
  pageSettings: PageSettingsModel = {
    pageSize: 5,
    pageSizes: true
  }
  toDataUrl(url, callback) {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        const image = new Image();
        image.onload = () => {
          canvas.height = image.naturalHeight;
          canvas.width = image.naturalWidth;
          ctx.drawImage(image, 0, 0);
          const base_64 = canvas.toDataURL(`image/jpeg`) as string;
          const result = base_64.replace(`data:image/jpeg;base64,`, '');
          callback({
            base_64: result,
            height: image.naturalHeight,
            width: image.naturalWidth
          });
        }
        image.src = reader.result as string;
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }
  getCompanyLogo() {
    let url;
    if (this.currentUser && this.currentUser.logoPic) {
      return `${environment.serverURL}${this.currentUser.logoPic}`;
    }
    return 'assets/img/default-image.jpg';
  }
  getResize(original_obj: { base_64: string, height: number, width: number }) {
    const desired_height = 130;
    const percent = desired_height / original_obj.height;
    original_obj.height = original_obj.height * percent;
    original_obj.width = original_obj.width * percent;
    return original_obj;
  }
  toolbarClick(args: ClickEventArgs): void {
    switch (args.item.text) {
      case 'PDF Export':
        this.toDataUrl(this.getCompanyLogo(), (base_64_obj) => {
          const base_64 = base_64_obj.base_64;
          const resize = this.getResize(base_64_obj);
          this.grid.pdfExport({
            theme: {
              header: {
                fontSize: 16,
                bold: true,
                fontName: 'Calibri',
                border: {
                  color: '#000000', dashStyle: 'Solid'
                },
                fontColor: '#e65100'
              },
            },
            header: {
              fromTop: 0,
              height: 160,
              contents: [
                {
                  type: 'Text',
                  value: 'CONTACTS REPORT',
                  position: {
                    x: 10,
                    y: 65
                  },
                  size: {
                    height: 35,
                    width: 1100
                  },
                  style: {
                    hAlign: 'Left',
                    fontSize: 22
                  },
                  font: new PdfStandardFont(PdfFontFamily.Helvetica, 20, PdfFontStyle.Bold)
                },
                {
                  type: 'Text',
                  value: `DATE: ${moment().format('MMM/DD/YYYY')}`,
                  position: {
                    x: 10,
                    y: 95
                  },
                  size: {
                    height: 20,
                    width: 1100
                  },
                  style: {
                    hAlign: 'Left',
                    fontSize: 12,
                    textBrushColor: '#808080'
                  },
                  font: new PdfStandardFont(PdfFontFamily.Helvetica, 12, PdfFontStyle.Regular)
                },
                {
                  type: 'Image',
                  src: base_64,
                  position: {
                    x: 1000,
                    y: 10
                  },
                  size: {
                    height: resize.height,
                    width: resize.width
                  }
                }
              ]
            },
            footer: {
              fromBottom: 10,
              height: 80,
              contents: [
                {
                  type: 'Image',
                  src: iglesia_tech_base_64,
                  position: {
                    x: 0,
                    y: 0
                  },
                  size: {
                    height: 50,
                    width: 84
                  },
                  style: {
                    vAlign: 'Middle'
                  }
                },
                {
                  type: 'PageNumber',
                  pageNumberType: 'Arabic',
                  format: 'Page {$current} of {$total}',
                  position: { x: 10, y: 60 },
                  style: { textBrushColor: '#585858', fontSize: 15 }
                },
              ]
            },
            pageOrientation: 'Landscape',
            pageSize: 'Legal',
          });
        })
        this.grid.refreshColumns();
        break;
      case 'Excel Export':
        this.grid.excelExport();
        break;
      case 'CSV Export':
        this.grid.csvExport();
        break;
    }
  }
  ngOnInit() {
    this.getWordpressSettings()
    this.dtOptions[0] = {
      dom: 'Blfrtip',
      lengthMenu: [10, 25, 50, 100, 250, 500],
      buttons: [
        { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
        { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
        { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
      ],
      order: [[0, 'desc']],
      searchable: false,
    };
    this.dtOptions[1] = {
      order: [],
      search: false,
      searching: false,
      lengthChange: false,
      ordering: false,
    };
    this.toolbar = ['Search'];
    this.searchSettings = { fields: ['title_name'] };
    this.customAttributes = {class: 'customcss'};
  }
  fixUrl(image: string) {
    if (image) {
      return `${this.organizationService.api.baseUrl}${image}`;
    }
    return '/assets/img/iglesia-home.png';
  }
  displayToConsole(): void {
    console.log(this.dtElements)
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      dtElement.dtInstance.then((dtInstance: any) => {
        console.log(`The DataTable ${index} instance ID is: ${dtInstance.table().node().id}`);
      });
    });
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
  ngAfterViewInit() {
    //this.rerender()

    //this.dtTrigger.next();
  }
  updateFilters() {
    this.filters = Object.assign({}, this.fields);
  }
  change(item?) {
    //console.log(item)
  }
  rerender(id): void {
    this.dtElements.find(item => item['el'].nativeElement.id == 'table2').dtOptions.order = []
    this.dtElements.find(item => item['el'].nativeElement.id == 'table2').dtOptions.search = false
    this.dtElements.find(item => item['el'].nativeElement.id == 'table2').dtOptions.searching = false

    /*this.dtElements.forEach((item: DataTableDirective, index: number) => {
      var idTable = 'table2'
      console.log(item)
      if (item['el'].nativeElement.id == idTable) {
        item.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.draw();
          //this.dtTrigger1.next();
        })
      }
    })*/
    /*this.dtElements[0].dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });*/
  }
  saveField(type, value, name, page_id) {
    const key = name
    console.log('{"' + key + '":"' + value + '"}')
    var jsobj = {}
    jsobj[key] = value
    console.log(jsobj)
    this.wpService.POST('wp-json/acf/v3/pages/' + page_id,
      {
        fields: jsobj
      }
    ).subscribe(
      (data: any) => {
        console.log(data)
        this.getFields(false)
        this.api.showToast('Success', ToastType.success)
      },
      (err) => {
        console.error(err);
        this.api.showToast('Error editing the field', ToastType.error)
      }
    );
  }
  onEditorCreated(quill) {
    var toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", this.imageHandler);
    console.log(quill)
    this.quill =quill;
  }
  imageHandler(value) {
    const inputFile: any = document.getElementById("fileUpload");
    inputFile.click();
  }
  openEditModal(pageDetail: PagesListComponent, id: number) {
    console.log("openeditmodal")
    console.log(id)
    this.modal.getModal('pageDetail').open();
  }
  keepOrder = (a, b) => {
    return a;
  }
  getWordpressSettings() {
    this.api
      .get(`wordpress`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.wordpressSettings = data;
          // Setup WP service
          let url = `${data.wordpressUrl}`;
          if (!url.endsWith('/')) {
            url += '/';
          }
          if (url.startsWith('http:')) {
            url = url.replace('http:', 'http:')
          }
          this.wpConfig = {
            url,
            token: data.authentication,
          };
          console.log(this.wpConfig)
          this.wpService.config = this.wpConfig;
          this.configCompleted = true;
        },
        (err: any) => {
          console.error(err);
          this.modal.getModal('setupWPModal').open();
        },
        () => {
          this.getWordpressPosts();
          this.getAllTags();
          this.getAllCategories();
          this.getFields(true)
          this.getImages()
          //this.getDetails()
        }
      );
  }

  getWordpressPosts() {
    this.wpService.GET('wp-json/wp/v2/posts', { status: 'publish' }).subscribe(
      (posts: any) => {
        this.resetTable();
        this.wpPosts = posts;
      },
      (err) => {
        console.error(err);
        this.configCompleted = false;
      },
      () => {
        this.dtTrigger.next();
      }
    );
  }

  /** POST Methods */
  getAllTags() {
    this.wpService.GET('wp-json/wp/v2/tags').subscribe(
      (data: any) => {
        this.wpData.tags = data;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getFields(is_init: boolean) {
    this.wpService.GET('wp-json/wp/v2/pages/?per_page=100',
    ).subscribe(
      (data: any) => {
        this.wpPages = data
        this.wpPages = this.wpPages.filter(value => !Array.isArray(value.acf))
        this.wpPages.forEach((value) => {
          if (!Array.isArray(value.acf)) {
            if (Object.keys(value.acf).length > 3) {
              var filter = Object.keys(value.acf).slice(0, 3)
              filter.push(" and " + (Object.keys(value.acf).length - 3) + " more")
              value.string = filter.join(', ')
              value.keys = filter
            } else {
              var filter = Object.keys(value.acf)
              value.keys = filter
              value.string = filter.join(' ,')
            }
          } else {
            value.keys = ['None']
            value.string = 'None'
          }
        })
        this.wpPages.forEach((value) => {
          value.title_name = value.title.rendered
          var keysArray = Object.keys(value.acf)
          var urls = []
          var images = []
          var tags = []
          var notFilled = []
          var elements = []
          var type = ''
          keysArray.forEach((key) => {
            if (isObject(value.acf[key])) {
              type = 'img'
            } else if (!isObject(value.acf[key]) && this.isHTML(value.acf[key])) {
              type = 'tag'
            } else if (!isObject(value.acf[key]) && !this.isHTML(value.acf[key])) {
              type = 'url'
            }
            if (String(value.acf[key]).length != 0 && value.acf[key] != null && value.acf[key] != undefined) {
              var str = (type == 'tag' ? String(value.acf[key]).replace(/<\/?[^>]+(>|$)/g, "") : value.acf[key])
              elements.push({ name: key, value: value.acf[key], type: type, shown: false, status: 'fld', editing: false, string: str })
            } else {
              type = 'nfd'
              notFilled.push({ name: key, value: value.acf[key], type: type, shown: false, status: 'nfd', editing: false })
            }
          })
          value.fields = elements
          value.notFilled = notFilled
          value.fields_count = elements.length
          value.notFilled_count = notFilled.length
        })
        this.wpPages.sort(((a, b) => (a.notFilled_count < b.notFilled_count) ? 1 : -1))
        console.log(this.wpPages)
        if (is_init == true) {
          setTimeout(() => {
            this.dtTrigger1.next();
            $('#table2').on('draw.dt', () => {
              this.evento()
            });
          }, 50);
        }
        /*data.forEach(element => {
          console.log(element.id+' keys: '+Object.keys(element.acf).length)
        });*/
      },
      (err) => {
        console.error(err);
      }
    );
  }
  /*compare( a, b ) {
    if ( a.fields_count < b.notFilled_count ){
      return -1;
    }
    if ( a.fields_count > b.notFilled_count){
      return 1;
    }
    return 0;
  }*/
  /*check(name: string, value: string, type: string) {
    if(name && value && type){
      if ((this.searchTxt).length != 0) {
        console.log(name)
        console.log(value)
        console.log(type)
        if (name.includes(this.searchTxt) || value.includes(this.searchTxt) || (this.searchTxt == type)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    } else {
      return true
    }
  }*/
  evento() {
    const table = this.dtElements.find(item => item['el'].nativeElement.id == 'table2')
    table.dtOptions = { search: false }
    table.dtInstance.then((dtInstance: DataTables.Api) => {
      //dtInstance.search('contacto').draw()
      //this.dtTrigger1.next();
      this.searchTxt = dtInstance.search()
      console.log(dtInstance.search())
    })
    /*this.dtElements.forEach((item: DataTableDirective, index: number) => {
      if (item['el'].nativeElement.id == 'table2') {
        item.dtInstance.then((dtInstance: DataTables.Api) => {
          //dtInstance.search('contacto').draw()
          //this.dtTrigger1.next();
          console.log(dtInstance.search())
        })
      }
    })*/
  }
  isHTML(str) {
    var a = document.createElement('div');
    a.innerHTML = str;

    for (var c = a.childNodes, i = c.length; i--;) {
      if (c[i].nodeType == 1) return true;
    }

    return false;
  }
  postField() {
    this.wpService.POST('wp-json/acf/v3/pages/52',
      {
        fields:
        {
          'seccion_1-slider-versiculo':
            "Hebreos 13:8 Reina-Valera 1960 8 Jesucristo es el mismo ayer, y hoy, y por los siglos. Modificación desde post distribute estuvo aquí :)"
        }
      }
    ).subscribe(
      (data: any) => {
        console.log(data)
        /*data.forEach(element => {
          console.log(element.id+' keys: '+Object.keys(element.acf).length)
        });*/
      },
      (err) => {
        console.error(err);
      }
    );
  }

  getAllCategories() {
    this.wpService.GET('wp-json/wp/v2/categories').subscribe(
      (data: any) => {
        this.wpData.categories = data;
      },
      (err) => {
        console.error(err);
      }
    );
  }
  getDetails() {
    this.wpService.GET('wp-json/acf/v3/52',
    ).subscribe(
      (data: any) => {
        console.log(data)
      },
      (err) => {
        console.error(err);
      }
    );
  }
  getPostTags(ids: Array<any>) {
    const tags = [];
    ids.map((id) => {
      const tag = this.wpData.tags.find((t) => t.id === id);
      tags.push(tag);
    });

    return tags;
  }

  // POST
  handlePostSubmit(data) {
    this.getWordpressSettings();
    this.modal.getModal('postFormModal').close();
    this.selectedPost = undefined;
  }

  openEditPost(post: any) {
    this.selectedPost = post;
    this.modal.getModal('postFormModal').open();
  }

  // Datatable
  resetTable() {
    console.log("resett")
    /*if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }*/
    /*this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    })*/
  }
}
