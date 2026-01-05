import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";
import { DataTableDirective } from "angular-datatables";
import { Subject, config } from "rxjs";
import { NgxSmartModalService } from 'ngx-smart-modal';
import { environment } from "src/environments/environment";
import { RandomService } from "src/app/services/random.service";
import { ToastType } from "src/app/login/ToastTypes";

@Component({
  selector: "app-gallery-list-v2",
  templateUrl: "./gallery-list-v2.component.html",
  styleUrls: ["./gallery-list-v2.component.scss"],
})
export class GalleryListV2Component implements OnInit {

  @Input('hide_header') hide_header: boolean = false;

  constructor(private api: ApiService, private modal: NgxSmartModalService) {
    this.currentUser = UserService.getCurrentUser();
  }

  currentUser: any = {};
  galleries: any[] = [];
  frame_id: string;

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
            // data.map((d) => {
            //   d.photos = JSON.parse(d.photos);
            // });
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
      this.api.delete(`galleries/v2/delete/${gallery.id}`, {deleted_by: this.currentUser.idUsuario}).subscribe(
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
    this.frame_id = `id_${RandomService.makeId(5)}`;
  }

  selectedGallery: any
  get iframeCode() {
    return {
      frame: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.currentUser.idIglesia}&site_id=none&module=galleries&id=${this.selectedGallery}" id="${this.frame_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#${this.frame_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#${this.frame_id}"), 1000);
</script>`,
      url: `${environment.site_url}/sync-site/frame?idOrganization=${this.currentUser.idIglesia}&site_id=none&module=galleries&id=${this.selectedGallery}`
    }
  }

  async copyValue(value, field: 'link' | 'code') {
    const blob = new Blob([value], { type: 'text/plain' })
    await window.navigator['clipboard'].write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    this.api.showToast(`${field[0].toUpperCase()}${field.substring(1)} copied!`, ToastType.success);
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
      this.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }

  }
}
