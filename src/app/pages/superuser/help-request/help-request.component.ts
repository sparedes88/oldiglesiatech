import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from "@angular/core";
import { environment } from "src/environments/environment";
import { GroupsService } from "src/app/services/groups.service";
import { NgxSmartModalService, NgxSmartModalComponent } from "ngx-smart-modal";
import { UserService } from "src/app/services/user.service";
import { DataTableDirective } from "angular-datatables";
import { Observable, Subject } from "rxjs";
import { ToastType } from "src/app/login/ToastTypes";
import { GroupEventModel, GroupModel } from "src/app/models/GroupModel";
import { OrganizationModel } from "src/app/models/OrganizationModel";
import { OrganizationService } from "src/app/services/organization/organization.service";
import { FileUploadService } from "src/app/services/file-upload.service";

@Component({
  selector: 'app-help-request',
  templateUrl: './help-request.component.html',
  styleUrls: ['./help-request.component.scss']
})
export class HelpRequestComponent implements OnInit {

  constructor(
    public groupsService: GroupsService,
    public modal: NgxSmartModalService,
    public userService: UserService,
    public organizationService: OrganizationService,
    public fus: FileUploadService,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }
  public currentUser: any;
  public requests: any[] = []
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
  ngOnInit() {
    this.getRequests()
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
  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }
  uploadPicture(input_file, idGroupEvent, idGroup) {
    input_file.onchange = (event: { target: { files: File[] } }) => {
      if (event.target.files.length > 0) {
        this.uploadImage(event.target.files[0], idGroupEvent, idGroup);
      }
    };
    input_file.click();
  }
  showAlert(is_active, idGroupEvent, idGroup) {
    console.log(is_active)
    if (!is_active) {
      if (window.confirm("Are you sure? If you dismark the help request, it will disappear from this page.")) {
        this.groupsService.updateEventHelpRequest(false, idGroupEvent).subscribe(
          (data: any) => {
            console.log(data)
          },
          (error) => {
            console.error(error);
            if (error.error.msg.Code === 404) {
              // this.groupsService.api.showToast(
              //   `There aren't events yet.`,
              //   ToastType.info,
              //   `Nothing found.`
              // );
            } else {
              this.groupsService.api.showToast(
                `Something happened while trying to update event.`,
                ToastType.error
              );
            }
          },
          () => this.getRequests()
        );
      } else {
        this.getRequests()
      }
    }
  }
  uploadImage(photo, idGroupEvent, idGroup) {
    const indexPoint = (photo.name as string).lastIndexOf('.');
    const extension = (photo.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);

    let myUniqueFileName: string;
    if (idGroupEvent) {
      myUniqueFileName = `group_event_picture_${idGroup}_${idGroupEvent}_${ticks}${extension}`;
    }

    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.currentUser.idIglesia;
    iglesia_temp.topic = this.currentUser.topic;

    this.organizationService
      .uploadFile(photo, iglesia_temp, myUniqueFileName, `events_pictures`)
      .then((response: any) => {
        console.log(idGroupEvent + ' , ' + idGroup)
        this.groupsService.updateEventPicture(this.fus.cleanPhotoUrl(response.response), idGroupEvent).subscribe(
          (data: any) => {
            console.log(data)
          },
          (error) => {
            console.error(error);
            if (error.error.msg.Code === 404) {
              // this.groupsService.api.showToast(
              //   `There aren't events yet.`,
              //   ToastType.info,
              //   `Nothing found.`
              // );
            } else {
              this.groupsService.api.showToast(
                `Something happened while trying to update event.`,
                ToastType.error
              );
            }
          },
          () => this.requests.forEach((value) => {
            if (value.idGroupEvent == idGroupEvent && value.idGroup == idGroup) {
              value.picture = this.fus.cleanPhotoUrl(response.response);
            }
          })
        );

        // const group = Object.assign({}, this.group_event);
        //   this.groupsService.updateGroup(group)
        //     .subscribe(response_updated => {
        //       this.groupsService.api.showToast(`Slider updated successfully`, ToastType.success);
        //     }, error => {
        //       console.error(error);
        //       this.groupsService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
        //     });
        // });
      });
  }
  getRequests() {
    this.groupsService.getHelpRequests().subscribe(
      (data: any) => {
        console.log(data)
        this.requests = data.requests;
        this.restartTable();
      },
      (error) => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          // this.groupsService.api.showToast(
          //   `There aren't events yet.`,
          //   ToastType.info,
          //   `Nothing found.`
          // );
        } else {
          this.groupsService.api.showToast(
            `Something happened while trying to get organization's events.`,
            ToastType.error
          );
        }
      },
      () => { this.dtTrigger.next(); this.updateRequestCount(); }
    );
  }
  updateRequestCount() {
    let subscription: Observable<any>;

    subscription = this.groupsService.getRequestCount();
    subscription.subscribe(response => {
      this.groupsService.helpRequestCount = response.count
    }, error => {
      console.error(error);
    });
  }
  print() {
    const path: string = `${environment.apiUrl}/groups/events_organization/pdf?idIglesia=${this.currentUser.idIglesia}`;
    const win = window.open(path, "_blank");
    win.focus();
  }

  goToDesignRequest(idDesignRequest: number) {
    if (this.currentUser.isSuperUser) {
      this.router.navigate([`/admin/design-request/detail/${idDesignRequest}`]);
    }
  }

  updateStatus(value, event) {
    console.log(value);
    console.log(event);
    if (value != '0') {
      const confirmation = confirm(`Are you sure you want to update the status for the ${event.events_count} ${event.events_count > 1 ? 'event' : 'events'} associated.`);
      if (confirmation) {
        this.groupsService.updateEventStatus(value, event.idGroupEvent).subscribe(
          (data: any) => {
            console.log(data)
            this.groupsService.api.showToast(
              `Status update successfully.`,
              ToastType.success
            );
          },
          (error) => {
            console.error(error);
            if (error.error.msg.Code === 404) {
              // this.groupsService.api.showToast(
              //   `There aren't events yet.`,
              //   ToastType.info,
              //   `Nothing found.`
              // );
            } else {
              this.groupsService.api.showToast(
                `Something happened while trying to update the status.`,
                ToastType.error
              );
            }
          }
        );
      } else {
        if (event.publish_status == 'draft') {
          event.publish_status = 'publish';
        } else if (event.publish_status == 'publish') {
          event.publish_status = 'draft';
        }
      }
    } else {
      this.groupsService.api.showToast(
        `Please select an valid option`,
        ToastType.info
      );
    }
  }

}
