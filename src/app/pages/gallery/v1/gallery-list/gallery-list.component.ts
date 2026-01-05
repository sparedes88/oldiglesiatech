import { Component, OnInit, ViewChild } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";
import { DataTableDirective } from "angular-datatables";
import { Subject, config } from "rxjs";
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: "app-gallery-list",
  templateUrl: "./gallery-list.component.html",
  styleUrls: ["./gallery-list.component.scss"],
})
export class GalleryListComponent implements OnInit {
  constructor(private api: ApiService, private modal: NgxSmartModalService) {
    this.currentUser = UserService.getCurrentUser();
  }

  currentUser: any = {};
  galleries: any[] = [];

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
      },
      { extend: "csv", className: "btn btn-outline-primary btn-sm" },
    ],
  };

  ngOnInit() {
    this.getGalleries();
  }

  getGalleries() {
    this.api
      .get("galleries", { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          if (data) {
            data.map((d) => {
              d.photos = JSON.parse(d.photos);
            });
            this.restartTable();
          }
          this.galleries = data;
        },
        (err) => {
          console.error(err);
        },
        () => {
          this.dtTrigger.next();
        }
      );
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  deleteGallery(gallery: any) {
    if (
      confirm(
        `Are you sure you want to delete this gallery: ${gallery.name}\n
        This action can't be undone`
      )
    ) {
      this.api.delete(`galleries/${gallery.id}`).subscribe(
        () => {
          this.getGalleries();
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  openGalleryIframe(id) {
    this.selectedGallery = id
    this.modal.getModal('iframeCodeModal').open()
  }

  selectedGallery: any
  get iframeCode() {
    return `<iframe
    src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/gallery/${
      this.selectedGallery
    }"
    frameborder="0"
    width="100%"
    height="100%"
    style="min-height: 90vh">
  </iframe>`;
  }
}
