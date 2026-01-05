import { Router } from '@angular/router';
import { ToastType } from './../../../login/ToastTypes';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AutocompleteResponseModel } from './../../../component/google-places/google-places.component';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Observable, observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { ActivatedRoute } from '@angular/router';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { EntryGroupModel } from '../EntryGroupModel';
import { environment } from 'src/environments/environment';
import { Item } from './list-item/item';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {

  show_categories: boolean = true;

  constructor(
    private api: ApiService,
    private userService: UserService,
    private toastr: ToastrService,
    private modal: NgxSmartModalService,
    private route: ActivatedRoute,
    private fileUpload: FileUploadService,
    private form_builder: FormBuilder,
    private router: Router
  ) {
    this.communityId = route.snapshot.params.id;
    this.parentItem = new Item({ name: 'parent-item' });
  }

  get embedCode() {
    return {
      entry_point: `<div id="mainApp"></div>`,
      scripts: `<link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/community/styles">
<script>var COMMUNITYID = ${this.communityId};</script>
<script src="https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyCHpkB-V5ZoA2IH3MA1c4VPF1KL20Khlqk"></script>
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/community/scripts"></script>
      `,
    };
  }

  // <script src="https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyDN2PcO56WsBoYuRhUq2MkZn_eHO0in2Dg"></script>
  @ViewChild('photo_input') photo_input: ElementRef;

  public currentUser: any = this.userService.getCurrentUser();
  public communityForm = {
    id: null,
    name: '',
    description: null,
    category: '',
    idIglesia: undefined,
  };

  saving: boolean = false;

  selectedEntry: any;

  // Data tables
  // @ViewChild(DataTableDirective)
  // dtElement: DataTableDirective;
  // dtTrigger: Subject<any> = new Subject();
  // dtOptions: any = {
  //   dom: 'Blfrtip',
  //   lengthMenu: [10, 25, 50, 100, 250, 500],
  //   buttons: [
  //     { extend: 'copy', className: 'btn btn-outline-primary btn-sm' },
  //     { extend: 'print', className: 'btn btn-outline-primary btn-sm' },
  //     { extend: 'csv', className: 'btn btn-outline-primary btn-sm' },
  //   ],
  // };

  community: any = {};
  communityId: any;
  tabIndex: number = 0;
  entries: any[] = [];
  groups: any[] = [];
  uploading: boolean = false;
  categories: any[] = [];
  entry_groups: EntryGroupModel[] = [];
  entry_containers: EntryGroupModel[] = [];

  // Community Forms
  public communityStyleSettings = {
    button_color: '#e65100',
    social_links_color: '#e65100',
    text_color: '#55606b',
    title_color: '#e65100',
    sub_title_color: '#55606b',
    default_entry_picture: null,
    logo_picture: null,
    banner_picture: null,
    featured_entries: 'Featured',
    order_by: 'created_at',
    main_title_color: '#e65100',
    header_background: '#002986',
    header_text_color: '#002986',
    entry_text_color: '#ffffff'
  };

  // Entry form
  public entryForm = {
    id: null,
    idCommunityBox: '',
    business_name: '',
    contact_first_name: '',
    contact_last_name: '',
    business_summary: '',
    industry: '',
    phone: '',
    contact_email: '',
    locations: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    photo: '',
    featured: false,
    radius: null,
    lat: null,
    lng: null,
    idEntryGroup: null,
    sort_by: 1,
    assign_users: [],
    assign_users_ids: [],
    users: [],
    assigned_users: [],
    created_by: this.currentUser.idUsuario
  };

  public containerForm = {
    id: null,
    idOrganization: this.currentUser.idIglesia,
    idCommunityBox: null,
    name: '',
    description: '',
    picture: '',
    show_opened: false,
    parent_container_id: null,
    sort_by: 1,
    created_by: this.currentUser.idUsuario,
    type: undefined,
    is_root_level: false
  };

  settings_form: FormGroup = this.form_builder.group({
    show_name: new FormControl(true),
    show_contact: new FormControl(true),
    show_phone: new FormControl(true),
    show_email: new FormControl(true),
    show_address: new FormControl(true),
    users: new FormControl([])
  });

  public selectCatOptions: any = {
    singleSelection: false,
    idField: 'idUsuario',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  users: any[] = []
  available_users: any[] = []

  public getAddress(address: AutocompleteResponseModel) {
    if (address) {
      this.entryForm.lat = address.place.geometry.location.lat();
      this.entryForm.lng = address.place.geometry.location.lng();
      this.entryForm.locations = address.place.formatted_address;
    }
  }

  ngOnInit() {
    this.entryForm.idCommunityBox = this.communityId;
    this.checkUserType();
    this.getUsers();

    this.onDragDrop$.subscribe(this.onDragDrop);
    // // this.parentItem.containers.push(new Item({
    //   name: 'test1',
    //   children: [
    //     new Item({ name: 'subItem1' }),
    //     new Item({ name: 'subItem2' }),
    //     new Item({ name: 'subItem3' })
    //   ]
    // }));
    // this.parentItem.containers.push(new Item({
    //   name: 'test2',
    //   children: [
    //     new Item({ name: 'subItem4' }),
    //     new Item({ name: 'subItem5' }),
    //     new Item({
    //       name: 'subItem6', children: [
    //         new Item({ name: 'subItem8' })
    //       ]
    //     })
    //   ]
    // }));
    // this.parentItem.containers.push(new Item({ name: 'test3' }));

  }
  getUsers() {
    const subscription = this.api.get(`getUsuarios`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (contacts: any) => {
          this.users = contacts.usuarios.filter(u => u.estatus && u.idUserType === 2);
          this.users.forEach(element => {
            element.full_name = `${element.nombre} ${element.apellido}`;
          });
          if (this.community.assign_users_ids) {
            this.setUsers();
          }
        }, err => console.error(err),
        () => { });

  }

  setUsers() {
    const users = this.users.filter(x => this.community.assign_users_ids.includes(x.idUsuario));
    this.settings_form.get('users').patchValue(users);

    this.setAvailableUsers();
  }

  setAvailableUsers() {
    const used_users = this.settings_form.get('users').value.map(x => x.idUsuario);
    this.available_users = this.users.filter(x => !used_users.includes(x.idUsuario));
  }

  async checkUserType() {
    if (this.currentUser) {
      if (this.haveLimitedPermission()) {
        const response = await this.api.post(`communityBox/${this.communityId}/users/verify`, {
          idUser: this.currentUser.idUsuario
        }).toPromise()
          .catch(error => {
            console.error(error);
            if (error.error.status === 403) {
              this.api.showToast(`You don't have permission to see this community box.`, ToastType.error);
              this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
            } else {
              this.api.showToast(`Couldn't verify your user`, ToastType.error);
            }
          });
        if (response) {
          this.getCommunity();
        }
      } else {
        this.getCommunity();
      }
    }
  }
  haveLimitedPermission() {
    let limited: boolean = false;
    if (this.community) {
      if (this.community.idUser === this.currentUser.idUsuario) {
        limited = false;
      } else {
        limited = true;
      }
    }
    return (this.currentUser.idUserType === 2 && !this.currentUser.isSuperUser) && limited;
  }

  getCommunity() {
    let observable: Observable<any>;
    if (this.haveLimitedPermission()) {
      observable = this.api.post(`communityBox/${this.communityId}/users/get`, { idUser: this.currentUser.idUsuario })
    } else {
      observable = this.api.get(`communityBox/${this.communityId}`)
    }
    const subscription = observable.subscribe(
      (data: any) => {
        subscription.unsubscribe();
        this.community = data;
        this.communityStyleSettings = this.community.style_settings;
        this.entry_groups = [];
        this.community.type = 'directory';
        this.settings_form.patchValue(this.community.column_settings);
        if (this.users.length > 0) {
          this.setUsers();
        }
      },
      (err) => {
        subscription.unsubscribe();
        console.error(err);
      }
    );
  }

  getEntries() {
    this.api.get(`communityBox/${this.communityId}/entries_extended`).subscribe(
      (data: any) => {
        this.groups = data;
        this.entries = data;
        // this.restartTable();
        this.entry_containers.forEach(x => {
          const group = data.find(entry => entry.idEntryGroup == x.idEntryGroup);
          if (group) {
            x.entries = group.entries;
          } else {
            x.entries = [];
          }
        });
      },
      (err) => {
        console.error(err);
      },
      () => {
        // this.dtTrigger.next();
      }
    );
  }

  addPhoto(file: File) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, 'community').subscribe(
        (data: any) => {
          this.entryForm.photo = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  addPhotoContainer(file: File) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, 'community').subscribe(
        (data: any) => {
          this.containerForm.picture = `${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  addDefaultEntryPhoto(file: File) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, 'community').subscribe(
        (data: any) => {
          this.communityStyleSettings.default_entry_picture = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  addDefaultLogo(file: File) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, 'community').subscribe(
        (data: any) => {
          this.communityStyleSettings.logo_picture = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  addDefaultBanner(file: File) {
    if (file) {
      this.uploading = true;
      this.fileUpload.uploadFile(file, true, 'community').subscribe(
        (data: any) => {
          this.communityStyleSettings.banner_picture = `${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  submitEntry(form: NgForm) {
    if (form.invalid) {
      this.toastr.error(`Please check the form and try again`, 'Error');
    }

    this.saving = true;
    let request: Observable<any>;
    this.entryForm.idCommunityBox = this.communityId;

    this.entryForm.users = this.entryForm.assigned_users.map(x => x.idUsuario);

    this.entryForm.created_by = this.currentUser.idUsuario;

    if (this.entryForm.id) {
      request = this.api.patch(
        `communityBox/${this.communityId}/entries/${this.entryForm.id}`,
        this.entryForm
      );
    } else {
      request = this.api.post(
        `communityBox/${this.communityId}/entries`,
        this.entryForm
      );
    }

    request.subscribe(
      (data: any) => {
        this.getCommunity();
        this.toastr.success('Entry saved!', 'Success');
        this.modal.getModal('entryFormModal').close();
        this.saving = false;
      },
      (err) => {
        console.error(err);
        this.toastr.error(`Can't save entry!`, 'Error');
        this.saving = false;
      }
    );
  }

  updateCommunity(hide_message?: boolean) {
    this.uploading = true;
    const settings = this.settings_form.value;
    settings.users = settings.users.map(x => x.idUsuario);
    this.api
      .patch(`communityBox/${this.communityId}`, {
        ...this.community,
        style_settings: this.communityStyleSettings,
        settings,
        created_by: this.currentUser.idUsuario
      })
      .subscribe(
        (data: any) => {
          this.getCommunity();
          this.uploading = false;
          if (!hide_message) {
            this.api.showToast(`Info saved successfully`, ToastType.success);
          }
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
  }

  openEditForm(entry) {
    this.photo_input.nativeElement.value = null;
    this.entryForm = Object.assign({}, entry);
    this.entryForm.assigned_users = this.available_users.filter(x => entry.assign_users_ids.includes(x.idUsuario));

    this.modal.getModal('entryFormModal').open();
  }

  openEditContainerForm(group) {
    this.photo_input.nativeElement.value = null;
    this.containerForm = Object.assign({}, group);
    this.modal.getModal('containerFormModal').open();
  }

  handleAction(ev: { item: Item, action: 'add' | 'delete' | 'edit' | 'view' }) {
    if (ev.action === 'add') {
      this.openAddForm(ev.item);
    } else if (ev.action === 'edit') {
      this.openEditForm(ev.item);
    } else if (ev.action === 'view') {
      this.openEntryDetails(ev.item);
    } else if (ev.action === 'delete') {
      this.deleteEntry(ev.item);
    }
  }

  handleActionContainer(ev: { item: Item, form: FormGroup, action: 'add' | 'delete' | 'edit' }) {
    if (ev.action === 'add') {
      this.openAddContainerForm(ev.item);
    } else if (ev.action === 'edit') {
      this.openEditContainerForm(ev.item);
    } else if (ev.action === 'delete') {
      this.deleteContainer(ev.item);
    }
  }

  openAddForm(item?: Item) {
    this.photo_input.nativeElement.value = null;
    this.entryForm = {
      id: null,
      idCommunityBox: '',
      business_name: '',
      contact_first_name: '',
      contact_last_name: '',
      business_summary: '',
      industry: '',
      phone: '',
      contact_email: '',
      locations: '',
      website: '',
      instagram: '',
      twitter: '',
      facebook: '',
      photo: '',
      featured: false,
      radius: null,
      lat: null,
      lng: null,
      idEntryGroup: null,
      sort_by: item.entries.length + 1,
      assign_users: [],
      assign_users_ids: [],
      users: [],
      assigned_users: [],
      created_by: this.currentUser.idUsuario
    };
    if (item) {
      if (item.type !== 'directory') {
        this.entryForm.idEntryGroup = item.id;
      }
    }
    this.modal.getModal('entryFormModal').open();
  }

  openAddContainerForm(item?: Item) {
    this.photo_input.nativeElement.value = null;
    this.containerForm = {
      id: null,
      idOrganization: this.currentUser.idIglesia,
      idCommunityBox: '',
      name: '',
      description: '',
      picture: '',
      show_opened: false,
      parent_container_id: null,
      sort_by: item.containers.length + 1,
      created_by: this.currentUser.idUsuario,
      type: item.type,
      is_root_level: item.is_root_level
    };
    if (item) {
      if (item.type !== 'directory') {
        this.containerForm.parent_container_id = item.id;
      }
    }
    this.modal.getModal('containerFormModal').open();
  }

  deleteEntry(entry) {
    if (
      confirm(
        `Are you sure you want to delete this entry: ${entry.business_name}'\nThis action can't be undone.`
      )
    ) {
      this.api
        .delete(`communityBox/${this.communityId}/entries/${entry.id}`)
        .subscribe(
          (data: any) => this.getCommunity(),
          (err) => console.error(err)
        );
    }
  }

  deleteContainer(group) {
    if (
      confirm(
        `Are you sure you want to delete this group: '${group.name}'\nThis action can't be undone.`
      )
    ) {
      this.api
        .delete(`communityBox/${this.communityId}/containers/${group.id}?deleted_by=${this.currentUser.idUsuario}`)
        .subscribe(
          (data: any) => this.getCommunity(),
          (err) => console.error(err)
        );
    }
  }

  openEntryDetails(entry) {
    this.selectedEntry = entry;
    this.modal.getModal('entryModal').open();
  }

  /** Destroy table instance */
  // restartTable(): void {
  //   if (this.dtElement.dtInstance) {
  //     this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //       dtInstance.destroy();
  //     });
  //   }
  // }

  showEntryGroups(manage_categories_modal: NgxSmartModalComponent) {
    this.show_categories = false;
    setTimeout(() => {
      this.show_categories = true;
    }, 100);
    manage_categories_modal.open();
  }

  openSortModal(sort_modal: NgxSmartModalComponent) {
    sort_modal.open();
  }

  fixUrl(picture: string) {
    if (picture) {
      if (picture.startsWith('http')) {
        return picture;
      } else {
        return `${environment.serverURL}${picture}`;
      }
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    // moveItemInArray(this.entries, event.previousIndex, event.currentIndex);
    // this.entries.forEach((x, index) => x.sort_by = index + 1);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    const groups = [];
    this.entry_containers.forEach(g => {
      const entries = [];
      g.entries.forEach((x, index) => {
        x.sort_by = index + 1;
        entries.push({
          id: x.id,
          sort_by: x.sort_by,
          idEntryGroup: g.idEntryGroup
        });
      });
      groups.push({
        idEntryGroup: g.idEntryGroup,
        name: g.name,
        entries
      });
    });
    this.api.patch(`communityBox/${this.communityId}/sort/`, groups)
      .subscribe(response => {
        console.info(response);
      });
  }

  reload(event) {
    if (event) {
      this.ngOnInit();
    }
  }

  public onDragDrop$ = new Subject<CdkDragDrop<Array<Item>>>();
  public invert: boolean = true;
  sorting: boolean = false;

  public parentItem: Item;
  public get connectedDropListsIds(): string[] {
    // We reverse ids here to respect items nesting hierarchy
    return this.getIdsRecursive(this.community).reverse();
  }

  // get available_users() {
  //   if (this.community) {
  //     const used_users = this.settings_form.get('users').value.map(x => x.idUsuario);
  //     return this.users.filter(x => !used_users.includes(x.idUsuario));
  //   }
  //   return this.users;
  // }

  private onDragDrop = (event: CdkDragDrop<Array<Item>>) => {
    if (event.container === event.previousContainer) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  };

  public onDragDropV1(event: CdkDragDrop<Item>) {
    event.container.element.nativeElement.classList.remove('active');

    const movingItem: Item = event.item.data;

    if (this.canBeDropped(event)) {
      if (movingItem.type === 'container') {
        event.container.data.containers.push(movingItem);
        event.previousContainer.data.containers = event.previousContainer.data.containers.filter((child) => child.uId !== movingItem.uId);
      } else {
        event.container.data.entries.push(movingItem);
        event.previousContainer.data.entries = event.previousContainer.data.entries.filter((child) => child.uId !== movingItem.uId);
      }
    } else {
      if (movingItem.type === 'entry') {
        moveItemInArray(
          event.container.data.entries,
          event.previousIndex,
          event.currentIndex
        );

      } else {
        moveItemInArray(
          event.container.data.containers,
          event.previousIndex,
          event.currentIndex
        );
      }
    }
    this.updateSortElements(event.container.data);
  }

  private getIdsRecursive(item: Item): string[] {
    let ids = [item.uId];
    item.containers.forEach((childItem) => { ids = ids.concat(this.getIdsRecursive(childItem)) });
    return ids;
  }


  private canBeDropped(event: CdkDragDrop<Item, Item>): boolean {
    const movingItem: Item = event.item.data;
    if (!movingItem) {
      return true;
    }
    return event.previousContainer.id !== event.container.id
      && this.isNotSelfDrop(event)
      && !this.hasChild(movingItem, event.container.data);
  }

  private isNotSelfDrop(event: CdkDragDrop<Item> | CdkDragEnter<Item> | CdkDragExit<Item>): boolean {
    return event.container.data.uId !== event.item.data.uId;
  }

  private hasChild(parentItem: Item, childItem: Item): boolean {
    if (parentItem.type === 'entry') {
      return false;
    }
    const hasChild = parentItem.containers.some((item) => item.uId === childItem.uId);
    return hasChild ? true : parentItem.containers.some((item) => this.hasChild(item, childItem));
  }

  sortElement(event) {
    this.updateSortElements(event.item);
  }

  updateSortElements(parent: Item) {
    parent.containers.forEach((x, index) => {
      x.sort_by = index + 1;
      if (parent.type !== 'directory') {
        x.parent_container_id = parent.id;
      } else {
        x.parent_container_id = undefined;
      }
    });
    parent.entries.forEach((x, index) => {
      x.sort_by = index + 1;
      if (parent.type !== 'directory') {
        x.idEntryGroup = parent.id;
      } else {
        x.idEntryGroup = undefined;
      }
    });
    const body = {
      idEntryGroup: parent.id,
      parent_container_id: parent.id,
      containers: parent.containers,
      entries: parent.entries
    }
    if (parent.type === 'directory') {
      body.idEntryGroup = undefined;
      body.parent_container_id = undefined;
    }
    this.api.patch(`communityBox/${this.communityId}/sort/`, [body])
      .subscribe(response => {
        console.info(response);
      });
  }

  submitContainer(form: NgForm) {
    if (form.invalid) {
      this.toastr.error(`Please check the form and try again`, 'Error');
    }

    this.saving = true;
    let request: Observable<any>;
    this.containerForm.idCommunityBox = this.communityId;
    if (this.containerForm.type === 'directory' && !this.containerForm.is_root_level) {
      if (this.containerForm.picture) {
        this.community.style_settings.banner_picture = this.containerForm.picture;
        this.communityStyleSettings.banner_picture = this.containerForm.picture;
      }
      this.community.name = this.containerForm.name;
      this.community.description = this.containerForm.description;
      this.updateCommunity();
      this.modal.getModal('containerFormModal').close();
      this.saving = false;
    } else {
      if (this.containerForm.id) {
        request = this.api.patch(
          `communityBox/${this.communityId}/containers/${this.containerForm.id}`,
          this.containerForm
        );
      } else {
        request = this.api.post(
          `communityBox/${this.communityId}/containers`,
          this.containerForm
        );
      }
      request.subscribe(
        (data: any) => {
          this.getCommunity();
          this.toastr.success('Group saved!', 'Success');
          this.modal.getModal('containerFormModal').close();
          this.saving = false;
        },
        (err) => {
          console.error(err);
          this.toastr.error(`Can't save group!`, 'Error');
          this.saving = false;
        }
      );
    }
  }

}
