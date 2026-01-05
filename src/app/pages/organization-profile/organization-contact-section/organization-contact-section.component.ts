import { ApiService } from './../../../services/api.service';
import { EventEmitter, Output } from '@angular/core';
import { AfterViewChecked, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { IglesiaContactoModel } from './../../../models/IglesiaContactoModel';
import { ToastType } from './../../../login/ToastTypes';
import { UserService } from './../../../services/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { Router } from '@angular/router';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkDropListInternal } from '@angular/cdk/drag-drop/typings/directives/drop-list';
import { AddressManagerComponent } from 'src/app/component/address-manager/address-manager/address-manager.component';

@Component({
  selector: 'app-organization-contact-section',
  templateUrl: './organization-contact-section.component.html',
  styleUrls: ['./organization-contact-section.component.scss']
})
export class OrganizationContactSectionComponent implements OnInit, AfterViewChecked {

  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('contact_type') contact_type: number = 3;
  @Input('iglesia') iglesia: any;

  @Output('refresh_meetings') refresh_meetings: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('address_manager') address_manager: AddressManagerComponent;
  @ViewChild(CdkDropList) placeholder: CdkDropList;
  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropListInternal;
  public sourceIndex: number;

  currentUser: User;
  show_detail: boolean = true;

  elements: {
    id: number,
    item_id: string,
    sort_by: number,
    is_last?: boolean,
    created_by?: number
  }[] = [
      {
        id: 0,
        item_id: 'drag_tech_item_1',
        sort_by: 2,
        is_last: true
      },
      {
        id: 0,
        item_id: 'drag_tech_item_2',
        sort_by: 3,
        is_last: true
      },
      {
        id: 0,
        item_id: 'drag_tech_item_3',
        sort_by: 1
      },
    ]

  constructor(
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private organizationService: OrganizationService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    if (!this.idOrganization) {
      if (this.currentUser) {
        this.idOrganization = this.currentUser.idIglesia;
      }
    }
    this.getContainers();
  }

  getContainers() {
    this.organizationService.getContainerSetting(this.idOrganization)
      .subscribe((response: any) => {
        this.elements = response.containers;
        setTimeout(() => {
          this.elements = this.elements.sort((a, b) => {
            return a.sort_by > b.sort_by ? 1 : -1;
          })
          this.elements.forEach(x => {
            if (this.currentUser) {
              x.created_by = this.currentUser.idUsuario;
            }
            const child_to_move = document.getElementById(x.item_id);
            const parent = child_to_move.parentElement;
            parent.removeChild(child_to_move);
            parent.appendChild(child_to_move);
          });
          this.elements.forEach(x => {
            const child_to_move = document.getElementById(x.item_id);
            const parent = child_to_move.parentElement;
            x.is_last = x.item_id !== parent.children[parent.children.length - 1].id;
          });
          const element_0 = this.elements.find(x => x.id === 0);
          if (element_0) {
            this.submitSettings();
          }
        }, 400);
      })
  }

  submitSettings(display_message?: boolean) {
    let success_message: string;
    let error_message: string;

    success_message = `Address saved successfully.`;
    error_message = `Error saving adddress.`;
    this.organizationService.api.post(`iglesias/container_settings/`, {
      idIglesia: this.idOrganization,
      containers: this.elements
    })
      .subscribe((response: any) => {
        if (display_message) {
          this.organizationService.api.showToast(`${success_message}`, ToastType.success);
        }
        // this.getContainers();
      }, err => {
        console.error(err);
        if (display_message) {
          this.organizationService.api.showToast(`${error_message}`, ToastType.error);
        }
      });
  }

  get can_edit() {
    if (this.currentUser) {
      return (this.currentUser.isSuperUser || this.currentUser.idUserType === 1) && this.is_edition_mode;
    }
    return false;
  }

  get is_edition_mode() {
    return this.view_mode === 'edition';
  }

  get organization_location() {
    if (this.address_manager.first_item) {
      return {
        lat: this.address_manager.first_item.value.lat,
        lng: this.address_manager.first_item.value.lng
      }
    }
  }

  dropLevel(event: CdkDragDrop<any>) {
    const parent_container = event.container;
    const parent = parent_container.element.nativeElement;
    const child_to_move = document.getElementById(`drag_tech_item_${event.previousIndex + 1}`);
    parent.removeChild(child_to_move);
    parent.appendChild(child_to_move);
    const child_on_before = parent.children[event.currentIndex];
    parent.insertBefore(child_to_move, child_on_before);
    // moveItemInArray(this.elements, event.previousIndex, event.currentIndex)
    // this.elements.map((x, index) => {
    //   x.is_last = x.item_id !== parent.children[parent.children.length - 1].id;
    //   x.sort_by = index + 1;
    // });
    for (let index = 0; index < parent.children.length; index++) {
      const element = parent.children[index];
      const x = this.elements.find(x => x.item_id === element.id);
      if (x) {
        x.is_last = x.item_id !== parent.children[parent.children.length - 1].id;
        x.sort_by = index + 1;
      }
    }
    this.submitSettings(true);
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
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

  getElement(item_id: string) {
    return this.elements.find(x => x.item_id === item_id);
  }
}


function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
};
