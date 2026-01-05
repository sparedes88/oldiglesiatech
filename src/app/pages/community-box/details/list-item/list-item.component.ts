import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Item } from './item';
import * as uuid from 'uuid';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {

  @Input() item: Item;
  @Input() parentItem?: Item;
  @Input() sort_mode: boolean;
  @Input() has_limited_permission: boolean;
  @Input() public set connectedDropListsIds(ids: string[]) {
    this.allDropListsIds = ids;
  }
  @Output() itemDrop: EventEmitter<CdkDragDrop<Item>>
  @Output() sortItem: EventEmitter<{ item: Item, action: string }>
  @Output() makeAction: EventEmitter<{ item: Item, action: 'add' | 'delete' | 'edit' | 'view' }>
  @Output() makeActionContainer: EventEmitter<{ item: Item, form: FormGroup, action: 'add' | 'delete' | 'edit' | 'view' }>

  form_element: FormGroup;

  public get connectedDropListsIds(): string[] {
    return this.allDropListsIds.filter((id) => id !== this.item.uId);
  }
  public allDropListsIds: string[];

  public get dragDisabled(): boolean {
    return !this.parentItem;
  }

  public get parentItemId(): string {
    return this.dragDisabled ? '' : this.parentItem.uId;
  }

  constructor(
    private form_builder: FormBuilder,
    private api: ApiService,
    private toastr: ToastrService,
  ) {
    this.allDropListsIds = [];
    this.itemDrop = new EventEmitter();
    this.sortItem = new EventEmitter();
    this.makeAction = new EventEmitter();
    this.makeActionContainer = new EventEmitter();
    this.form_element = this.form_builder.group({
      id: new FormControl(undefined, []),
      name: new FormControl(undefined, [Validators.required]),
      description: new FormControl(undefined, []),
      picture: new FormControl(undefined, []),
      show_opened: new FormControl(false)
    })
  }

  ngOnInit(): void {
    this.form_element.patchValue(this.item);
  }

  public onDragDropAll(event: CdkDragDrop<Item, Item>): void {
    this.itemDrop.emit(event);
  }

  public onDragDrop(event: CdkDragDrop<Item, Item>): void {
    this.itemDrop.emit(event);
  }

  triggerAction(item: Item, action) {
    this.makeAction.emit({ item, action });
  }

  triggerContainerAction(item: Item, form: FormGroup, action) {
    if (action == 'add') {
      if (item.type == 'directory') {
        item.is_root_level = true;
      }
    }
    this.makeActionContainer.emit({ item, form, action });
  }

  is_first(item) {
    return this.parentItem ? this.parentItem.containers.indexOf(item) === 0 : true;
  }

  is_last(item) {
    return this.parentItem ? this.parentItem.containers.indexOf(item) === this.parentItem.containers.length - 1 : true;
  }

  onSortItem(item: Item, action: string) {
    // this.sortItem.emit({ item, action });
    if (this.parentItem) {
      const index = this.parentItem.containers.indexOf(item);
      let new_index: number;
      if (action === 'up') {
        if (index !== 0) {
          new_index = index - 1;
        } else {
          new_index = 0;
        }
      } else {
        if (index !== this.parentItem.containers.length - 1) {
          new_index = index + 1;
        } else {
          new_index = index;
        }
      }
      moveItemInArray(this.parentItem.containers, index, new_index);
      this.sortItem.emit({ item: this.parentItem, action });
    }
  }

  addContainer(item?: Item) {
    if (item) {
      let parent_container_id;
      if (this.parentItem) {
        parent_container_id = this.parentItem.id;
      }
      const container: Item = {
        uId: uuid.v4(),
        id: undefined,
        containers: [],
        entries: [],
        name: 'Just added',
        sort_by: item.containers.length + 1,
        parent_container_id: item.id
      }
      item.containers.push(container);
    }

  }

  updateContainer(item, form_element: FormGroup) {
    // this.saving = true;
    // let request: Observable<any>;
    // this.containerForm.idCommunityBox = this.communityId;
    const payload = Object.assign({}, form_element.value);
    if (form_element.value.id) {
      this.api.patch(
        `communityBox/${item.idCommunityBox}/containers/${item.id}`,
        payload
      ).subscribe(respose => {
        this.toastr.success('Group saved!', 'Success');
        form_element.markAsPristine();
      });
    }
  }

}
