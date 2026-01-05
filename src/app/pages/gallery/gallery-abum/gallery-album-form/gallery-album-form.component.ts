import {
  CdkDrag,
  CdkDragStart,
  CdkDropList, CdkDropListContainer, CdkDropListGroup
} from "@angular/cdk/drag-drop";
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { GalleryAlbumGalleryModel, GalleryAlbumModel, GalleryModel, GalleryPictureModel } from 'src/app/models/GalleryModel';
import { SortTypes, moveItemInFormArray } from 'src/app/models/Utility';
import { GalleryService } from 'src/app/services/gallery.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-gallery-album-form',
  templateUrl: `./gallery-album-form.component.html`,
  styleUrls: ['./gallery-album-form.component.scss']
})
export class GalleryAlbumFormComponent implements OnInit {

  form_group: FormGroup = this.form_builder.group({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    is_automatic: new FormControl(false),
    album_galleries: new FormArray([]),
    idSortType: new FormControl(2, [Validators.required]),
    idOrganization: new FormControl(undefined, [Validators.required]),
    created_by: new FormControl(undefined, [Validators.required]),
  });
  current_user: User;
  is_busy: boolean = false;

  idGalleryAlbum: number;
  album: GalleryAlbumModel;
  galleries: any[] = [];
  sort_types = SortTypes.filter(x => x.is_default);

  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList) placeholder: CdkDropList;

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropListContainer;
  public sourceIndex: number;


  constructor(
    private form_builder: FormBuilder,
    private router: Router,
    private activated_route: ActivatedRoute,
    private gallery_service: GalleryService,
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
    this.form_group.get('idOrganization').setValue(this.current_user.idIglesia);
    this.form_group.get('created_by').setValue(this.current_user.idUsuario);
  }

  get array_galleries(): FormArray {
    return this.form_group.get('album_galleries') as FormArray;
  }

  ngOnInit() {
    if (this.activated_route.snapshot.params['id']) {
      this.idGalleryAlbum = Number(this.activated_route.snapshot.params['id']);
    }
    this.handleInit()
  }

  async handleInit() {
    if (this.idGalleryAlbum) {
      this.form_group.addControl('id', new FormControl(this.idGalleryAlbum, [Validators.required]));
      await this.getDetail();
    } else {
      this.form_group.removeControl('id');
    }
    this.getGalleries();
  }

  async getDetail() {
    const params: Partial<GalleryAlbumModel> = {
      id: this.idGalleryAlbum,
      idOrganization: this.current_user.idIglesia
    }
    const response: any = await this.gallery_service.getAlbum(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.album = response;
      this.form_group.patchValue(this.album);
    }
  }

  async getGalleries() {
    const params: Partial<GalleryAlbumGalleryModel> = {
      idIglesia: this.current_user.idIglesia
    }
    let method;
    if (this.idGalleryAlbum) {
      params.idGalleryAlbum = this.idGalleryAlbum;
      params.idOrganization = params.idIglesia;
      method = this.gallery_service.getGalleriesByAlbum(params);
    } else {
      method = this.gallery_service.getGalleries(params);
    }
    const response: any = await method.toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.galleries = response;
      this.sortArray();
    }
  }

  sortArray() {
    const idSortType = Number(this.form_group.get('idSortType').value);
    if (idSortType != 5) {
      if (idSortType === 1) {
        this.galleries = this.galleries.sort((a, b) => {
          return a.id > b.id ? 1 : -1
        })
      } else if (idSortType === 2) {
        this.galleries = this.galleries.sort((a, b) => {
          return b.id > a.id ? 1 : -1
        })
      } else if (idSortType === 3) {
        this.galleries = this.galleries.sort((a, b) => {
          return a.name > b.name ? 1 : -1
        })
      } else if (idSortType === 4) {
        this.galleries = this.galleries.sort((a, b) => {
          return b.name > a.name ? 1 : -1
        })
      }
    }
    const temp_data: GalleryModel[] = this.array_galleries.value.filter(x => x.is_selected);
    console.log(this.galleries);

    this.clearArray();
    this.setArray();
    temp_data.forEach(element => {
      const new_sort: GalleryModel[] = this.array_galleries.value;
      const gallery_index = new_sort.findIndex(x => x.id == element.id);
      this.array_galleries.at(gallery_index).get('is_selected').setValue(true);
    });
  }

  clearArray() {
    while (this.array_galleries.length > 0) {
      this.array_galleries.removeAt(0);
    }
  }

  setArray() {
    this.galleries.forEach((x, index, arr) => {
      if (!x.sort_by) {
        x.sort_by = index + 1;
      }
      const gallery_control = this.createGalleryControl(x);
      this.array_galleries.push(gallery_control);
    })
  }

  createGalleryControl(gallery?: GalleryModel) {
    const form_group = this.form_builder.group({
      name: new FormControl(''),
      id: new FormControl(''),
      is_selected: new FormControl(false),
      sort_by: new FormControl(this.array_galleries.length + 1),
      gallery_cover: new FormGroup({
        src_path: new FormControl(),
        y_position: new FormControl(50),
        x_position: new FormControl(50),
        zoom: new FormControl(1)
      })
    });
    if (gallery) {
      form_group.patchValue(gallery);
    }
    return form_group;
  }

  async submit() {
    this.is_busy = true;
    if (this.form_group.valid) {
      const payload = this.form_group.value;
      if (!payload.is_automatic) {
        const selected_galleries = payload.album_galleries.filter(x => x.is_selected);
        if (selected_galleries.length === 0) {
          this.gallery_service.api.showToast(`You need to select at least 1 gallery.`, ToastType.info);
          this.is_busy = false;
          return;
        }
      } else {
        payload.album_galleries = [];
      }
      let method;
      if (payload.id) {
        method = this.gallery_service.updateAlbum(payload);
      } else {
        method = this.gallery_service.addAlbum(payload);
      }
      const response: any = await method.toPromise()
        .catch(error => {
          console.error(error);
          this.gallery_service.api.showToast(`Error saving the album.`, ToastType.error);
          return;
        });
      if (response) {
        //
        this.router.navigate(['/galleries/home'], {
          relativeTo: this.activated_route,
          queryParams: {
            tab: 'albums'
          }
        });
      }
      this.is_busy = false;
    } else {
      this.gallery_service.api.showToast(`Please fill all the info.`, ToastType.info);
      this.is_busy = false;
    }
  }

  calculateHeight(div_container: any) {
    const h = this.getHeight(div_container);
    return { height: `${h}px` };
  }

  getHeight(self_div) {
    const width = self_div.offsetWidth;
    const h = width / 1.777776;
    return h;
  }

  getNewStyle(photo: GalleryPictureModel, self_div: any) {
    const url = this.getSrc(photo, true);
    let zoom = (photo.zoom || 1) * 100;
    if (zoom < 100) {
      zoom = 100;
    }
    const h = this.getHeight(self_div);
    return {
      'background-image': `url('${url}')`,
      'background-size': `${zoom}%`,
      'background-position-x': `${photo.x_position}%`,
      'background-position-y': `${photo.y_position}%`,
      height: `${h}px`
    }
  }

  getSrc(photo: GalleryPictureModel, sanitize?: boolean): any {
    let src: string | SafeResourceUrl;

    // const photo: GalleryPictureModel = group.value;
    if (photo.temp_src) {
      // console.log(sanitize);
      if (sanitize) {
        src = photo.temp_src;
      } else {
        // src = this.sanitizer.bypassSecurityTrustResourceUrl(photo.temp_src);
      }
      // return `url( ${this.sanitizer.bypassSecurityTrustResourceUrl(group.get('temp_src').value)})`;
    } else if (!photo.src_path) {
      src = 'assets/img/default-image.jpg';
    } else if (photo.src_path.startsWith('http')) {
      src = photo.src_path;
    } else {
      src = `${environment.serverURL}${photo.src_path}`;
    }
    return src;
  }

  selectGallery(form_group: FormGroup, index: number) {
    const is_selected: boolean = form_group.get('is_selected').value;
    form_group.get('is_selected').setValue(!is_selected);
  }

  enter = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop == this.placeholder)
      return true;

    let phElement = this.placeholder.element.nativeElement;
    let dropElement = drop.element.nativeElement;

    let dragIndex = __indexOf(dropElement.parentNode.children, drag.dropContainer.element.nativeElement);
    let dropIndex = __indexOf(dropElement.parentNode.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      let sourceElement = this.source.element.nativeElement;
      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentNode.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentNode.insertBefore(phElement, (dragIndex < dropIndex)
      ? dropElement.nextSibling : dropElement);

    this.source.start();
    this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);

    return false;
  }

  drop() {
    if (!this.target)
      return;

    let phElement = this.placeholder.element.nativeElement;
    let parent = phElement.parentNode;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex != this.targetIndex) {
      moveItemInFormArray(this.array_galleries, this.sourceIndex, this.targetIndex);
    }
    console.log(this.array_galleries.value);
  }
}

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
};
