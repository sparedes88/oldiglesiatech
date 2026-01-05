import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { GalleryAlbumModel } from 'src/app/models/GalleryModel';
import { GalleryService } from 'src/app/services/gallery.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-gallery-album-list',
  templateUrl: `./gallery-album-list.component.html`,
  styleUrls: ['./gallery-album-list.component.scss']
})
export class GalleryAlbumListComponent implements OnInit {

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

  @Input('idOrganization') idOrganization: number;
  @Input('hide_header') hide_header: boolean = false;

  albums: any[] = [];
  current_user: User;

  constructor(
    private gallery_service: GalleryService,
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    if (!this.idOrganization) {
      this.idOrganization = this.current_user.idUsuario;
    }
    this.getAlbums();
  }

  async getAlbums() {
    let params = {
      idOrganization: this.idOrganization
    }
    const response: any = await this.gallery_service.getAlbums(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    this.restartTable();
    if (response) {
      this.albums = response;
    }
    this.dtTrigger.next();

  }
  async deleteAlbum(album: any) {
    if (
      confirm(
        `Are you sure you want to delete this album: ${album.name}\n
        This action can't be undone`
      )
    ) {
      const payload: Partial<GalleryAlbumModel> = {
        id: album.id,
        deleted_by: this.current_user.idUsuario
      }
      const response: any = await this.gallery_service.deleteAlbum(payload).toPromise()
        .catch(error => {
          console.error(error);
          this.gallery_service.api.showToast(`Error deleting album. Please try again in a few seconds`, ToastType.error);
          return;
        });
      if (response) {
        this.getAlbums();
      }
    }
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }
}
