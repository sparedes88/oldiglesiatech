import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/services/user.service";
import { ApiService } from "src/app/services/api.service";
import { FormBuilder } from "@angular/forms";
import { NgxSmartModalService } from "ngx-smart-modal";
import { getModules } from "./reportModules";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import { DesignRequestService } from "src/app/services/design-request.service";
import { GroupsService } from "src/app/services/groups.service";
import { MatSnackBar } from "@angular/material";

@Component({
  selector: "app-report-builder",
  templateUrl: "./report-builder.component.html",
  styleUrls: ["./report-builder.component.scss"]
})
export class ReportBuilderComponent implements OnInit {
  constructor(
    private api: ApiService,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private modal: NgxSmartModalService,
    private designRequestService: DesignRequestService,
    private groupsService: GroupsService
  ) {
    this.currentUser = userService.getCurrentUser();
  }

  public currentUser: any;
  public logo: string = "";
  public livePreview: boolean = true;

  // Main Data
  public reportModules: Array<any> = [];
  public selectedFields: Array<any> = [];

  // Report pats
  public savedTemplates: any[] = [];
  public contacts: any[] = [];
  public groups: any[] = [];
  public process: any[] = [];

  public globalTemplates: any[] = [];
  public reportTemplates: Array<any> = [];

  public printing: boolean = false;

  public selectedModule: any = -1;

  public unavailableMsg: `This field isn't available`;

  ngOnInit() {
    this.reportModules = getModules();
    this.getContacts();
    this.getProcess();
    this.getGroups();
    this.getLogo();
    this.getTemplates();
  }

  dropField(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
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
  }

  changeModule(index) {
    if (index != this.selectedModule) {
      this.selectedFields = [];
      this.reportModules = getModules();
      this.selectedModule = index;
    }
  }

  buildReport() {
    let report: any = {};
    let reportRows: any[] = [];
    // Generate row for selected module
    switch (this.availableModule.title) {
      case "Contacts":
        reportRows = this.getRows(this.contacts);
        break;

      case "Groups":
        reportRows = this.getRows(this.groups);
        break;

      case "Process":
        reportRows = this.getRows(this.process);
        break;

      default:
        break;
    }

    report.title = this.availableModule.title;
    report.cols = this.selectedFields;
    report.rows = reportRows;

    this.getPdf(report);
  }

  getPdf(report: any) {
    this.printing = true;

    this.api
      .post(
        `utils/report_builder`,
        { report: report, logo: this.logo },
        { observe: "response", responseType: "ArrayBuffer" }
      )
      .subscribe(
        (response: any) => {
          const contentType: string = response.headers.get("Content-Type");
          let fileBlob = new Blob([response.body], { type: contentType });

          const fileData = window.URL.createObjectURL(fileBlob);

          // Generate virtual link
          let link = document.createElement("a");
          link.href = fileData;
          link.download = `${this.availableModule.title}_report.pdf`;
          link.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window
            })
          );
          setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(fileData);
            link.remove();
            this.printing = false;
          }, 100);
        },
        err => {
          console.error(err);
          this.printing = false;
        }
      );
  }

  /**
   * Get rows for report
   */
  getRows(itemArray: any[]): Array<any> {
    // Loop each item in array
    const buildedArray: Array<any> = itemArray.map(arrayItem => {
      let newItem: any = {};

      // Then loop each selected fiend and
      // insert into new item
      this.selectedFields.map(field => {
        newItem[field.value] = arrayItem[field.value];
      });

      // Return a new item with only selected fields
      // 🎶 oh oh oh it's magic, you nooow 🎶
      return newItem;
    });

    return buildedArray;
  }

  getContacts() {
    this.api
      .get(`reportModules/contacts`, {
        idIglesia: this.currentUser.idIglesia
      })
      .subscribe(
        (contacts: any) => {
          this.contacts = contacts;
        },
        err => console.error(err)
      );
  }

  getGroups() {
    this.api
      .get("reportModules/groups", { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.groups = data;

          this.groups.map(group => {
            if (!group.event_activities) {
              group.event_activities = [];
            }

            if (!group.event_reviews) {
              group.event_reviews = [];
            }

            if (!group.event_finiances) {
              group.event_finiances = [];
            }

            if (!group.event_attendances) {
              group.event_attendances = [];
            }

            group.events.map(event => {
              // Get activities
              this.api
                .get(`groups/events/${event.idGroupEvent}/activities`, {
                  idIglesia: this.currentUser.idIglesia
                })
                .subscribe(
                  (res: any) => {
                    if (res.notes) {
                      res.notes = res.notes.map(n => n.description);
                    }
                    group.event_activities.push(...res.activities);
                  },
                  err => console.error(err)
                );

              // Get reviews
              this.api
                .get(`groups/events/${event.idGroupEvent}/reviews`, {
                  idIglesia: this.currentUser.idIglesia
                })
                .subscribe(
                  (res: any) => {
                    res.notes = []
                    group.event_reviews.push(...res.reviews);
                  },
                  err => console.error(err)
                );

              this.api
                .get(`groups/events/${event.idGroupEvent}/finances`, {
                  idIglesia: this.currentUser.idIglesia
                })
                .subscribe(
                  (res: any) => {
                    if (res.notes) {
                      res.notes = res.notes.map(n => n.description);
                    }
                    group.event_finances.push(...res.finances);
                  },
                  err => console.error(err)
                );

              this.api
                .get(`groups/events/${event.idGroupEvent}/attendances`, {
                  idIglesia: this.currentUser.idIglesia
                })
                .subscribe(
                  (res: any) =>
                    group.event_attendances.push(...res.attendances),
                  err => console.error(err)
                );
            });
          });
        },
        error => {
          console.error(error);
        }
      );
  }

  /**
   * Load process list from API
   */
  getProcess() {
    this.api
      .get(`reportModules/process`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.process = data;
        },
        err => {
          console.error(err);
        }
      );
  }

  get availableModule(): any {
    if (this.selectedModule > -1) {
      return this.reportModules[this.selectedModule];
    }

    return {
      fields: []
    };
  }

  get reportParams() {
    let report: any = {};
    if (this.availableModule) {
      report.title = this.availableModule.title;
      report.fields = this.selectedFields;
    }

    return report;
  }

  getLogo() {
    this.designRequestService.getDesignRequestDropdown().subscribe(
      (data: any) => {
        if (data.iglesias) {
          const organization = data.iglesias.find(
            ig => ig.idIglesia === this.currentUser.idIglesia
          );
          if (organization && organization.Logo) {
            this.logo = organization.Logo.split(
              "https://iglesia-tech-api.e2api.com"
            ).pop();
          }
        }
      },
      err => console.error(err)
    );
  }

  // Save current selection as template
  public templateForm: any = {};
  saveTemplate() {
    if (!this.reportTemplates || !this.reportTemplates.length) {
      this.reportTemplates = [];
    }

    if (!this.templateForm.templateName) {
      return alert("Please set a name for this template");
    }

    // Set template
    let template = Object.assign({}, this.reportParams);
    template.templateName = this.templateForm.templateName;

    this.api
      .post(`reportTemplates/saveTemplate`, {
        isGlobal: this.templateForm.isGlobal ? 1 : 0,
        jsonData: JSON.stringify(template),
        idOrganization: this.currentUser.idIglesia
      })
      .subscribe((data: any) => {
        this.getTemplates();
      });

    this.modal.getModal("saveTemplateModal").close();
  }

  getTemplates() {
    // Get global templates
    this.api.get("reportTemplates/globalTemplates").subscribe(
      (data: any) => {
        data.map(d => {
          d.jsonData = JSON.parse(d.jsonData);
        });
        this.globalTemplates = data;
      },
      err => console.error(err)
    );

    this.api
      .get(`reportTemplates/templatesByIglesia/${this.currentUser.idIglesia}`)
      .subscribe(
        (data: any) => {
          data.map(d => {
            d.jsonData = JSON.parse(d.jsonData);
          });
          this.reportTemplates = data;
        },
        err => console.error(err)
      );
  }

  setTemplate(template) {
    // Reload modules
    this.reportModules = getModules();

    // Set module
    let idx = this.reportModules.findIndex(
      r => r.title == template.jsonData.title
    );

    template.jsonData.fields.map(field => {
      let idy = this.reportModules[idx].fields.findIndex(
        re => re.title == field.title
      );

      this.reportModules[idx].fields.splice(idy, 1);
    });

    this.selectedModule = idx;
    this.selectedFields = template.jsonData.fields;
  }

  deleteTemplate(template) {
    if (
      !confirm(
        `Are you sure you want to delete this template: ${template.jsonData.title}?`
      )
    ) {
      return;
    }

    this.api.delete(`reportTemplates/deleteTemplate/${template.id}`).subscribe(
      () => {
        this.snackbar.open(`Templated deleted!`);
        this.getTemplates();
      },
      err => console.error(err)
    );
  }

  canDeleteTemplate(template): Boolean {
    return (
      template.idOrganization == this.currentUser.idIglesia ||
      this.currentUser.isSuperUser
    );
  }

  get reportPreview(): any {
    let report: any = {};
    let reportRows: any[] = [];
    if (!this.availableModule || !this.availableModule.title) {
      return {};
    }

    // Generate row for selected module
    switch (this.availableModule.title) {
      case "Contacts":
        reportRows = this.getRows(this.contacts);
        break;

      case "Groups":
        reportRows = this.getRows(this.groups);
        break;

      case "Process":
        reportRows = this.getRows(this.process);
        break;

      default:
        break;
    }

    report.title = this.availableModule.title;
    report.cols = this.selectedFields;
    report.rows = reportRows;

    return report;
  }
}
