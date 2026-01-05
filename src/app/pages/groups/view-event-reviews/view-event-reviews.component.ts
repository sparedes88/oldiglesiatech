import { Component, OnInit, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { GroupsService } from 'src/app/services/groups.service';
import { FormBuilder, FormGroup, NgForm, Validators, FormControl, FormArray } from '@angular/forms';
import { GroupModel, GroupEventModel, GroupEventReviewModel, GroupEventReviewStatusModel } from 'src/app/models/GroupModel';
import { User } from 'src/app/interfaces/user';
import { Observable } from 'rxjs';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';
import { ToastType } from 'src/app/login/ToastTypes';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-event-reviews',
  templateUrl: './view-event-reviews.component.html',
  styleUrls: ['./view-event-reviews.component.scss']
})
export class ViewEventReviewsComponent implements OnInit {

  @ViewChild('multi_select') multi_select: MultiSelectComponent;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;

  group: GroupModel;
  group_event: GroupEventModel;
  reviews: GroupEventReviewModel[] = [];
  status_list: GroupEventReviewStatusModel[] = [];
  groups: GroupModel[] = [];

  currentUser: User;
  show_editable: boolean = false;
  show_loading: boolean = false;

  reviewForm: FormGroup;

  reviewStatusForm: FormGroup = this.formBuilder.group({
    statuses: this.formBuilder.array([])
  });

  selectTeamOptions: any = {
    singleSelection: true,
    idField: 'idGroup',
    textField: 'title',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  constructor(
    private userService: UserService,
    private groupService: GroupsService,
    private formBuilder: FormBuilder
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
  }

  getPermissions() {
    if (this.group) {

      // read only
      if (this.group.is_leader) {
        return false;
      }
      if (this.currentUser.isSuperUser) {
        return false;
      }
      if (this.currentUser.idUserType === 1) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  getReviews() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      this.groupService.getEventReviews(this.group_event)
        .subscribe((response: any) => {
          this.reviews = response.reviews;
          this.status_list = response.statuses;
          this.reviewStatusForm = this.formBuilder.group({
            statuses: this.formBuilder.array([])
          });
          this.reviews.forEach(review => {
            const control = this.reviewStatusForm.controls.statuses as FormArray;
            control.push(this.formBuilder.group({
              idGroupEventReviewStatus: new FormControl(review.idGroupEventReviewStatus, [
                Validators.required,
              ])
            }));
          });

          this.show_loading = false;
          return resolve(this.reviews);
        }, error => {
          this.show_loading = false;
          if (error.error.msg.Code === 404) {
            this.reviews = [];
            const status = new GroupEventReviewStatusModel();
            status.name = 'Error getting status';
            this.status_list = [status];
            return resolve([]);
          }
          console.error(error);
          this.groupService.api.showToast(`Error getting reviews.`, ToastType.error);
          return reject([]);
        });
    });
  }

  dismiss() {
    this.deactivateForm();
    this.onDismiss.emit();
  }

  deactivateForm() {
    this.show_editable = false;
    this.reviewForm = undefined;
  }

  addReview(reviewForm: NgForm) {
    this.show_loading = true;
    if (reviewForm.valid) {
      const payload = reviewForm.value;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.idGroupEventReview) {
        // update
        subscription = this.groupService.updateReviewEvent(payload);
        success_message = `Review updated successfully.`;
        error_message = `Error updating review.`;
      } else {
        // add
        subscription = this.groupService.addReviewEvent(payload);
        success_message = `Review added successfully.`;
        error_message = `Error adding review.`;
      }
      subscription
        .subscribe(response => {
          this.getReviews();
          this.deactivateForm();
          this.groupService.api.showToast(`${success_message}`, ToastType.success);
        }, error => {
          console.error(error);
          this.groupService.api.showToast(`${error_message}`, ToastType.error);
          this.show_loading = false;
        });
    } else {
      this.show_loading = false;
      this.groupService.api.showToast(`Some errors in form. Please check.`, ToastType.error);
    }
  }

  updateReview(event: GroupEventReviewModel) {
    this.activateForm(Object.assign({}, event));
  }

  deleteReview(event: GroupEventReviewModel) {
    if (confirm(`Delete ${event.description}?`)) {
      this.groupService.deleteActivityReview(event)
        .subscribe(data => {
          this.getReviews();
          this.groupService.api.showToast(`Review successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.groupService.api.showToast(`Error deleting review.`, ToastType.error);
          });
    }
  }

  fixIdGroup(event) {
    this.reviewForm.patchValue({ idGroupTeam: event.idGroup });
  }

  activateForm(review?: GroupEventReviewModel) {
    this.groupService.getTeamGroups()
      .subscribe((data: any) => {
        this.groups = data.groups;
        this.reviewForm = this.formBuilder.group({
          idGroupEvent: [this.group_event.idGroupEvent, Validators.required],
          description: [review ? review.description : '', Validators.required],
          idGroupTeam: [undefined, Validators.required],
          created_by: [this.currentUser.idUsuario, Validators.required],
          notes: this.formBuilder.array([])
        });

        this.show_editable = true;
        if (review) {
          this.reviewForm.addControl('idGroupEventReview', new FormControl(review.idGroupEventReview, Validators.required));

          review.notes.forEach(note => {
            const control = this.reviewForm.controls.notes as FormArray;

            control.push(this.formBuilder.group({
              idGroupEventReviewNote: new FormControl(note.idGroupEventReviewNote, [
                Validators.required,
              ]),
              description: new FormControl(note.description, [
                Validators.required,
              ])
            }));
          });
        }
        setTimeout(() => {
          if (review) {
            const group_array = this.groups.filter(g => g.idGroup === review.idGroupTeam);
            this.multi_select.writeValue(group_array);

            const group = group_array[0];
            this.fixIdGroup(group);
          }
        }, 100);
      }, error => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          this.groupService.api.showToast(`There aren't team groups. You need at least 1 team group to continue.`, ToastType.info, `Nothing found.`);
        } else {
          this.groupService.api.showToast(`Something happened while trying to get organization's groups.`, ToastType.error);
        }
      });
  }

  get notes_on_form() {
    return (this.reviewForm.controls.notes as FormArray).controls;
  }

  get status_on_form(): FormArray {
    return this.reviewStatusForm.get('statuses') as FormArray;
  }

  deleteNote(i: number) {
    (this.reviewForm.controls.notes as FormArray).removeAt(i);
  }

  addNote() {
    const control = this.reviewForm.controls.notes as FormArray;
    control.push(this.formBuilder.group({
      idGroupEventReviewNote: new FormControl(null),
      description: new FormControl('', [
        Validators.required,
      ])
    }));
  }

  checkChange(control: FormControl, review: GroupEventReviewModel) {
    // Compared as string because the form parse the value as string.
    if (control.value === 'undefined') {
      control.markAsPristine();
      return;
    }
    if (Number(JSON.parse(control.value)) === review.idGroupEventReviewStatus) {
      control.markAsPristine();
    }
  }

  resetReviewStatusForm(control: FormGroup, review: GroupEventReviewModel) {
    control.get('idGroupEventReviewStatus').setValue(review.idGroupEventReviewStatus);
    control.get('idGroupEventReviewStatus').markAsPristine();
  }

  updateMemberType(control: FormGroup, review: GroupEventReviewModel) {
    // Compared as string because the form parse the value as string.
    if (control.value === 'undefined') {
      control.markAsPristine();
      return;
    }
    const review_temp = Object.assign({}, review);
    review_temp.idGroupEventReviewStatus = Number(JSON.parse(control.get('idGroupEventReviewStatus').value));
    if (review_temp.idGroupEventReviewStatus === review.idGroupEventReviewStatus) {
      control.get('idGroupEventReviewStatus').setValue(review.idGroupEventReviewStatus);
      control.get('idGroupEventReviewStatus').markAsPristine();
    } else {
      this.groupService.updateReviewEvent(review_temp)
        .subscribe(response => {
          this.groupService.api.showToast(`Status updated.`, ToastType.info);
          control.get('idGroupEventReviewStatus').setValue(review_temp.idGroupEventReviewStatus);
          control.get('idGroupEventReviewStatus').markAsPristine();
        }, error => {
          console.error(error);
          this.groupService.api.showToast(`Error updating the task's status. Reversing changes...`, ToastType.error);
          control.get('idGroupEventReviewStatus').setValue(review.idGroupEventReviewStatus);
          control.get('idGroupEventReviewStatus').markAsPristine();
        });
    }

  }

  print() {
    const path: string = `${environment.apiUrl}/groups/events/${this.group_event.idGroupEvent}/reviews/pdf/`;

    const win = window.open(path, '_blank');
    win.focus();
  }

}
