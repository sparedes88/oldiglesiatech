import { ToastType } from "./../../../login/ToastTypes";
import { GroupsService } from "./../../../services/groups.service";
import { GroupModel, GroupCategoryModel } from "./../../../models/GroupModel";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { Subject } from "rxjs";
import { DataTableDirective } from "angular-datatables";
import { UserService } from "src/app/services/user.service";
import { NgxSmartModalService, NgxSmartModalComponent } from "ngx-smart-modal";
import { GroupCategoryFormComponent } from "../group-category-form/group-category-form.component";
import { GroupFormComponent } from "../group-form/group-form.component";
import { environment } from "src/environments/environment";
import { ChatService } from "src/app/services/chat.service";
import { Channel } from "twilio-chat/lib/channel";
@Component({
  selector: "app-list-groups",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent implements OnInit {

  @ViewChild('group_form') group_form: GroupFormComponent;
  show_form: boolean = false;

  selected_group_id: number;

  constructor(
    public groupService: GroupsService,
    public modal: NgxSmartModalService,
    public userService: UserService,
    private chatService: ChatService,
  ) {
    // Load current user
    this.currentUser = this.userService.getCurrentUser();
  }

  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: "copy", className: "btn btn-outline-primary btn-sm" },
      {
        extend: "print",
        className: "btn btn-outline-primary btn-sm",
        action: this.print.bind(this),
      },
      { extend: "csv", className: "btn btn-outline-primary btn-sm" },
    ],
  };

  // data
  public currentUser: any;
  public groups: GroupModel[] = [];
  public totalGroups: number;
  public selectedGroup: any;
  public iframeCode: string;
  public iframeLang: string = "en";

  header_settings = {
    view_type: 'list',
    group_type_id: 2,
    text_color: '#ffffff',
    degrees: 112,
    main_color: '#e65100',
    main_percent: 72,
    second_color: '#ffb994',
    second_percent: 100,
    display_header: true,
    show_shadow: true,
    items_per_row: 2
  }

  ngOnInit() {
    this.getGroups();
    this.updateIframeCode();
  }

  updateIframeCode() {
    this.iframeCode = `<iframe
      src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/groups/organization/${this.currentUser.idIglesia}?lang=${this.iframeLang}"
      frameborder="0"
      width="100%"
      height="100%"
      style="min-height: 90vh">
    </iframe>`;
  }

  /**
   * Retrieve groups list from API
   */
  public interval
  getGroups() {
    this.groupService.getGroups().subscribe(
      (data: any) => {
        this.groups = data.groups;
        this.restartTable();
        this.totalGroups = this.groups.length;
        this.interval = setInterval(() => {
          if (this.chatService.chatClient) {
            console.log("interval")
            //this.chatService.getGroups()
            this.chatService.chatClient.on('channelUpdated', (reason) => {
              if (reason.updateReasons.includes('friendlyName') || reason.updateReasons.includes('uniqueName')) {
                this.chatService.getGroups()
                //this.getGroups()
              }
            });
            clearInterval(this.interval)
          }
        }, 1000)
      },
      (error) => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          // this.groupService.api.showToast(
          //   `There aren't groups yet.`,
          //   ToastType.info,
          //   `Nothing found.`
          // );
        } else {
          this.groupService.api.showToast(
            `Something happened while trying to get organization's groups.`,
            ToastType.error
          );
        }
      },
      () => this.dtTrigger.next()
    );
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  addGroup() {
    this.show_form = true;
    setTimeout(() => {
      this.group_form.init_map = false;
      this.group_form.group = undefined;
      this.group_form.formGroup.reset();
      this.group_form.ngOnInit();
    }, 250);
  }

  editGroup(group) {
    this.group_form.show_detail = false;
    this.show_form = true;
    setTimeout(() => {
      this.group_form.group = Object.assign({}, group);
      this.group_form.init_map = false;
      this.group_form.formGroup.reset();
      this.group_form.ngOnInit();
    }, 250);
  }

  updateGroup() {
    this.modal.getModal("editFormModal").close();
    setTimeout(() => {
      this.getGroups();
    }, 300);
  }

  fixUrl(url: string) {
    if (url) {
      if (url.includes("https")) {
        return url;
      } else {
        if (url.startsWith('/')) {
          return `${environment.serverURL}${url}`;
        }
        return `${environment.serverURL}/${url}`;
      }
    } else {
      return "assets/img/default-image.jpg";
    }
  }

  deleteGroup(group: GroupModel) {
    console.log(group)
    if (confirm(`Delete ${group.title}?`)) {
      this.groupService.deleteGroup(group).subscribe(
        (data) => {
          this.getGroups();
          this.groupService.api.showToast(
            `Group successfully deleted.`,
            ToastType.success
          );
          this.chatService.getChannelByUniqueName('ChatGroup-' + group.idGroup + '-' + group.picture).then((channel: Channel) => {
            channel.delete().then((deletedChannel: Channel) => {
              console.log("Success")
            }).catch((reason: any) => {
              console.log(reason)
              console.log("Channel not deleted")
            })
          }).catch((value) => {
            console.log(value)
            console.log("Channel not found")
          })
        },
        (err) => {
          console.error(err);
          this.groupService.api.showToast(
            `Error deleting group.`,
            ToastType.error
          );
        }
      );
    }
  }

  addCategory(
    categoryFormModal: NgxSmartModalComponent,
    group_category_form: GroupCategoryFormComponent
  ) {
    categoryFormModal.open();
    const group_category = new GroupCategoryModel();
    group_category_form.group_category = group_category;
  }

  onModalDidDismiss(categoryFormModal: NgxSmartModalComponent, response?: any) {
    categoryFormModal.close();
    if (this.show_form) {
      if (this.group_form) {
        this.group_form.getCategories();
      }
    }
  }

  print() {
    const path: string = `${environment.apiUrl}/groups/pdf?idIglesia=${this.currentUser.idIglesia}`;
    const win = window.open(path, "_blank");
    win.focus();
  }

  get groupEmbedCode() {
    return {
      entry_point: `<div id="groupApp"></div>`,
      scripts: `
<script>
var IDIGLESIA = ${this.currentUser.idIglesia}
var LANG = '${this.iframeLang}'
var VIEW_TYPE = '${this.header_settings.view_type}'
var HEADER_TEXT_COLOR = '${this.header_settings.text_color}'
var GROUP_TYPE = ${this.header_settings.group_type_id}
var DEGREES = ${this.header_settings.degrees}
var MAIN_COLOR = '${this.header_settings.main_color}'
var MAIN_PERCENT= ${this.header_settings.main_percent}
var SECOND_COLOR= '${this.header_settings.second_color}'
var SECOND_PERCENT= ${this.header_settings.second_percent}
var SHOW_SHADOW= ${this.header_settings.show_shadow}
var DISPLAY_HEADER= ${this.header_settings.display_header}
var ITEMS_PER_ROW= ${this.header_settings.items_per_row}
</script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"/>
<link rel="stylesheet" href="${environment.serverURL}/api/iglesiaTechApp/public/styles" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous" />
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
<script src="${environment.serverURL}/api/iglesiaTechApp/public/groups/scripts"></script>`,
      link: `${environment.server_calendar}/register/groups/details/${this.selected_group_id}?action=register`
    };
  }

  closeAndGetGroups() {
    this.getGroups();
    this.show_form = false;
  }

  closeGroup() {
    this.group_form.formGroup.reset();
    this.show_form = false;
  }

  async shareQR(qr_code) {
    const element = qr_code.qrcElement.nativeElement;
    const img_child = element.firstChild;
    try {
      const imgURL = img_child.src;
      const data = await fetch(imgURL);
      const blob = await data.blob();
      await window.navigator['clipboard'].write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      this.groupService.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }

  }

  getLink(){
    const group = this.groups.find(x=> x.idGroup === this.selected_group_id);
    if(group){
      if(group.is_external){
        return group.external_url;
      }
    }
    return this.groupEmbedCode.link;
  }
}
