import { GroupsService } from 'src/app/services/groups.service';
import { Component, OnInit, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { GroupModel, GroupEventModel, GroupEventFinanceModel, GroupEventFinanceCategoryModel } from 'src/app/models/GroupModel';
import { User } from 'src/app/interfaces/user';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators, NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { environment } from 'src/environments/environment';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { Observable } from 'rxjs';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-view-event-finances',
  templateUrl: './view-event-finances.component.html',
  styleUrls: ['./view-event-finances.component.scss']
})
export class ViewEventFinancesComponent implements OnInit {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;

  @ViewChild('multi_select') multi_select: MultiSelectComponent;

  group: GroupModel;
  group_event: GroupEventModel;
  finances: GroupEventFinanceModel[] = [];
  finance_categories: GroupEventFinanceCategoryModel[] = [];
  attachments: any[] = [];

  currentUser: User;
  show_editable: boolean = false;
  show_loading: boolean = false;

  summary = {
    total_budget: 0,
    total_giving: 0,
    total_spent: 0,
    total_summary: 0
  };

  financeForm: FormGroup;

  financeStatusForm: FormGroup = this.formBuilder.group({
    statuses: this.formBuilder.array([])
  });

  selectTeamOptions: any = {
    singleSelection: true,
    idField: 'idGroupEventFinanceCategory',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  constructor(
    private userService: UserService,
    private groupService: GroupsService,
    private formBuilder: FormBuilder,
    private fus: FileUploadService
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

  getFinances() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      this.groupService.getEventFinances(this.group_event)
        .subscribe((response: any) => {
          this.finances = response.finances;
          this.summary = response.summary;
          this.financeStatusForm = this.formBuilder.group({
            statuses: this.formBuilder.array([])
          });
          this.finances.forEach(finance => {
            const control = this.financeStatusForm.controls.statuses as FormArray;
            control.push(this.formBuilder.group({
              is_spent: new FormControl(finance.is_spent, [
                Validators.required,
              ])
            }));
          });

          this.show_loading = false;
          return resolve(this.finances);
        }, error => {
          this.show_loading = false;
          if (error.error.msg.Code === 404) {
            this.finances = [];
            // const status = new GroupEventFinanceStatusModel();
            // status.name = 'Error getting status';
            // this.status_list = [status];
            return resolve([]);
          }
          console.error(error);
          this.groupService.api.showToast(`Error getting finances.`, ToastType.error);
          return reject([]);
        });
    });
  }

  dismiss() {
    this.deactivateForm();
    this.onDismiss.emit();
  }

  get cost_type_on_form() {
    return this.financeStatusForm.get('statuses') as FormArray;
  }

  getUrl(url) {
    return `${environment.serverURL}${url}`;
  }

  deleteFinance(event: GroupEventFinanceModel) {
    if (confirm(`Delete ${event.description}?`)) {
      this.groupService.deleteFinanceEvent(event)
        .subscribe(data => {
          this.getFinances();
          this.groupService.api.showToast(`Entry successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.groupService.api.showToast(`Error deleting entry.`, ToastType.error);
          });
    }
  }

  checkChange(control: FormControl, finance: GroupEventFinanceModel) {
    if (Boolean(JSON.parse(control.value)) === finance.is_spent) {
      control.markAsPristine();
    }
  }

  resetFinanceStatusForm(control: FormGroup, finance: GroupEventFinanceModel) {
    control.get('is_spent').setValue(finance.is_spent);
    control.get('is_spent').markAsPristine();
  }

  updateSpentType(control: FormGroup, finance: GroupEventFinanceModel) {
    const finance_temp = Object.assign({}, finance);
    finance_temp.is_spent = Boolean(JSON.parse(control.get('is_spent').value));
    if (finance_temp.is_spent === finance.is_spent) {
      control.get('is_spent').setValue(finance.is_spent);
      control.get('is_spent').markAsPristine();
    } else {
      finance_temp.receipt_files = JSON.stringify(finance.receipt_files);
      this.groupService.updateFinanceEvent(finance_temp)
        .subscribe(response => {
          this.groupService.api.showToast(`Type updated.`, ToastType.info);
          control.get('is_spent').setValue(finance_temp.is_spent);
          control.get('is_spent').markAsPristine();
          this.getFinances();
        }, error => {
          console.error(error);
          this.groupService.api.showToast(`Error updating the finance type. Reversing changes...`, ToastType.error);
          control.get('is_spent').setValue(finance.is_spent);
          control.get('is_spent').markAsPristine();
        });
    }
  }

  addFinance(financeForm: NgForm) {
    this.show_loading = true;
    if (financeForm.valid) {
      const payload = financeForm.value;
      payload.is_spent = Boolean(JSON.parse(this.financeForm.get('is_spent').value));
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.idGroupEventFinance) {
        // update
        subscription = this.groupService.updateFinanceEvent(payload);
        success_message = `Review updated successfully.`;
        error_message = `Error updating review.`;
      } else {
        // add
        subscription = this.groupService.addFinanceEvent(payload);
        success_message = `Review updated successfully.`;
        error_message = `Error updating review.`;
      }
      subscription
        .subscribe(response => {
          this.groupService.api.showToast(`${success_message}`, ToastType.success);
          this.getFinances();
          this.deactivateForm();
        }, error => {
          this.groupService.api.showToast(`${error_message}`, ToastType.error);
          console.error(error);
          this.show_loading = false;
        });
    } else {
      this.show_loading = false;
      this.groupService.api.showToast(`Some errors in form. Please check.`, ToastType.error);
    }
  }

  updateFinance(finance: GroupEventFinanceModel) {
    this.activateForm(Object.assign({}, finance));
  }

  activateForm(finance?: GroupEventFinanceModel) {
    this.groupService.getFinanceCategories()
      .subscribe((data: any) => {
        this.finance_categories = data.finance_categories;
        // setTimeout(() => {
        this.financeForm = this.formBuilder.group({
          idGroupEvent: [this.group_event.idGroupEvent, Validators.required],
          description: [finance ? finance.description : '', Validators.required],
          notes: [finance ? finance.notes : ''],
          idGroupEventFinanceCategory: [undefined, Validators.required],
          receipt_files: [''],
          budget: [finance ? finance.budget : ''],
          amount: [finance ? finance.amount : ''],
          created_by: [this.currentUser.idUsuario, Validators.required],
          is_spent: [finance ? finance.is_spent : false, Validators.required],
        });
        this.show_editable = true;
        if (finance) {
          this.financeForm.addControl('idGroupEventFinance', new FormControl(finance.idGroupEventFinance, Validators.required));
          this.attachments = finance.receipt_files as any[];
          this.financeForm.patchValue(
            {
              receipt_files: JSON.stringify(this.attachments)
            }
          );
        }
        // }, 100);
        setTimeout(() => {
          if (finance) {
            const category_array = this.finance_categories.filter(g => g.idGroupEventFinanceCategory === finance.idGroupEventFinanceCategory);
            this.multi_select.writeValue(category_array);

            const category = category_array[0];
            this.fixIdCategory(category);
            this.financeForm.patchValue({ idGroupEventFinanceCategory: finance.idGroupEventFinanceCategory });
          }
        }, 100);
      }, error => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          this.groupService.api.showToast(`There aren't finance categories. Please contact to support.`, ToastType.info, `Nothing found.`);
        } else {
          this.groupService.api.showToast(`Something happened while trying to get the finance categories. Please contact to support.`, ToastType.error);
        }
      });
  }

  deactivateForm() {
    this.show_editable = false;
    this.financeForm = undefined;
  }

  uploadPicture(input_file) {
    if (!this.getPermissions()) {
      input_file.onchange = (event: { target: { files: FileList } }) => {
        if (event.target.files.length > 0) {
          this.onFileChange(event.target.files);
        }
      };
      input_file.click();
    }
  }

  private async onFileChange(files: FileList) {
    if (files.length && files.length > 0) {
      // this.processing = true;
      console.log(`Processing ${files.length} file(s).`);
      // setTimeout(() => {
      //   // Fake add attachment
      //   // this.processing = false;
      //   this.fus.uploadFile()
      // }, 1000);
      // this.message.has_attachments = true;
      const array = Array.from(files);
      for (const file of array) {
        const url: any = await this.fus.uploadFile(file, true, `events_files`).toPromise();
        this.attachments.push({ name: file.name, url: this.fus.cleanPhotoUrl(url.response) });
        // .subscribe((response: any) => {

        // });
      }
      this.financeForm.patchValue(
        { receipt_files: JSON.stringify(this.attachments) }
      );
    }
  }

  fixIdCategory(event) {
    this.financeForm.patchValue({ idGroupEventFinanceCategory: event.idGroupEventFinanceCategory });
  }

  print() {
    const path: string = `${environment.apiUrl}/groups/events/${this.group_event.idGroupEvent}/finances/pdf/`;

    const win = window.open(path, '_blank');
    win.focus();
  }


}
