import { NotesHomeComponent } from './../../superuser/notes/notes-home/notes-home.component';
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import * as Moment from "moment";
import { UserService } from "src/app/services/user.service";
import { Observable } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";

class StepForm {
  constructor(
    type?: string,
    start_date?: string,
    notes?: string,
    days_alloted?: string,
    progress?: string
  ) {
    this.type = type;
    this.start_date = start_date;
    this.notes = notes;
    this.days_alloted = days_alloted;
    this.progress = progress;
  }
  type: string;
  start_date: string;
  notes: string;
  days_alloted: any;
  progress: any;
}

@Component({
  selector: "project-tracking-form",
  templateUrl: "./tracking-form.component.html",
  styleUrls: ["./tracking-form.component.scss"],
})
export class TrackingFormComponent implements OnInit {
  constructor(
    public api: ApiService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
    this.currentUser = UserService.getCurrentUser();
    const stepForm = this.route.snapshot.queryParams["step"];
    if (stepForm) {
      this.currentForm = stepForm;
    }
  }

  @Input() idIglesia: number
  //@Input() idIglesia: number = 99999
  @Input() iglesia: any
  @ViewChild('#linked_note_form')
  noteForm: NotesHomeComponent;
  currentUser: any = {};
  projectTrackingId: number;
  its_loaded = false

  // Data
  public first_meeting = {
    type: "first_meeting",
    start_date: Moment().format("YYYY-MM-DD"),
    notes: "",
    days_alloted: "",
    progress: 0,
  };
  public adminsInitiated = []
  public mockup = new StepForm();
  public initial_config = new StepForm();
  public content_development = new StepForm();
  public revision_meeting_1 = new StepForm();
  public revision_meeting_2 = new StepForm();
  public revision_meeting_3 = new StepForm();
  public web_maintenance = new StepForm();
  public mobile_app_development = new StepForm();
  public app_delivery = new StepForm();
  public platform_training = new StepForm();
  public linked_notes = []
  public all_notes = []
  public selected_notes = []
  public currentForm: string = "first_meeting";
  public saving: boolean = false;

  ngOnInit() {
    this.getProjectTracking();
    console.log(this.idIglesia)
    console.log(this.iglesia)
  }
  console(form) {
    /*console.log(form)
    this.api
      .get(`projectTracking/notes`, { projectTracking: this.projectTrackingId, projectTrackStep: 1 })
      .subscribe((data: any) => {
        console.log(data)
      });*/
  }
  async getAdminsInitiated() {
    this.api
      .get(`users/getAdmins`, {})
      .subscribe((data: any) => {
        console.log(data.users)
        this.adminsInitiated = data.users
      }, (error) => {
        console.log(error)
      }, () => {
        this.its_loaded = true
      });
  }
  getProjectTracking() {
    console.log(this.idIglesia)
    console.log(this.iglesia)
    if (this.idIglesia) {
      this.api
        .get(`projectTracking`, { idIglesia: this.idIglesia })
        .subscribe((data: any) => {
          console.log(data)
          if (data.id) {
            this.projectTrackingId = data.id;
            this.first_meeting = data.first_meeting;
            this.mockup = data.mockup;
            this.initial_config = data.initial_config;
            this.content_development = data.content_development;
            this.revision_meeting_1 = data.revision_meeting_1;
            this.revision_meeting_2 = data.revision_meeting_2;
            this.revision_meeting_3 = data.revision_meeting_3;
            this.web_maintenance = data.web_maintenance;
            this.mobile_app_development = data.mobile_app_development;
            this.app_delivery = data.app_delivery;
            this.platform_training = data.platform_training;
          }
          if (data.linked_notes) {
            for (var i = 0; i < 11; i++) {
              this.linked_notes[i] = data.linked_notes ? (data.linked_notes).filter(value => value.step == (i + 1)) : []
            }
          }
          //console.log(this.linked_notes)
          this.getAdminsInitiated()
          this.setFormArray();
          this.setStartDate();
        }, (error) => {
          console.log(error)
          for (var i = 0; i < 11; i++) {
            this.linked_notes[i] = []
          }
          this.getAdminsInitiated()
        }, () => {
          this.getAllNotes()
        });
    }
  }

  formArray: Array<any> = [];

  getAllNotes() {
    this.api
      .get(`notas/getNotasSelectByIdIglesia`, { idIglesia: this.idIglesia })
      .subscribe((data: any) => {
        //console.log(data)
        for (var i = 0; i < 11; i++) {
          this.all_notes[i] = data.notas.filter(({ idNotaIglesia: id1 }) => !this.linked_notes[i].some(({ idNotaIglesia: id2 }) => id2 === id1));
        }
      });
  }

  addNoteToProjectTracking(step) {
    /*console.log({
      projectTracking: this.projectTrackingId,
      projectTrackStep: step,
      noteList: this.selected_notes[step]
    })*/
    this.its_loaded = false
    this.api
      .post(`projectTracking/addNotesToTracking`, {
        projectTracking: this.projectTrackingId,
        projectTrackStep: step,
        noteList: this.selected_notes[step]
      })
      .subscribe((data: any) => {
        //console.log(data)
        this.selected_notes[step] = []
      }, (error) => {

      }, () => {
        this.getProjectTracking()
      });
  }

  setFormArray() {
    this.formArray = [
      { form: this.mockup, label: "Logo Creación", id: "mockup" },
      {
        form: this.initial_config,
        label: "Contenido - Web",
        id: "initial_config",
      },
      {
        form: this.revision_meeting_1,
        label: "Proceso - Web",
        id: "revision_meeting_1",
      },
      {
        form: this.revision_meeting_2,
        label: "Entregadas - Web",
        id: "revision_meeting_2",
      },
      {
        form: this.revision_meeting_3,
        label: "Stripe",
        id: "revision_meeting_3",
      },
      {
        form: this.content_development,
        label: "Dominio Migración",
        id: "content_development",
      },
      {
        form: this.mobile_app_development,
        label: "Google Business",
        id: "mobile_app_development",
      },
      {
        form: this.app_delivery,
        label: "App Móvil",
        id: "app_delivery",
      },
      {
        form: this.platform_training,
        label: "Panel Iglesia Tech",
        id: "platform_training",
      },
      {
        form: this.web_maintenance,
        label: "Soporte",
        id: "web_maintenance",
      },
    ];
  }

  setStartDate() {
    console.log(this.getStartDate("first_meeting"));

    this.mockup.start_date = this.getStartDate("first_meeting");
    this.initial_config.start_date = this.getStartDate("mockup");
    this.content_development.start_date = this.getStartDate("initial_config");
    this.revision_meeting_1.start_date = this.getStartDate(
      "content_development"
    );
    this.revision_meeting_2.start_date = this.getStartDate(
      "revision_meeting_1"
    );
    this.revision_meeting_3.start_date = this.getStartDate(
      "revision_meeting_2"
    );
    this.web_maintenance.start_date = this.getStartDate("revision_meeting_3");
    this.mobile_app_development.start_date = this.getStartDate(
      "web_maintenance"
    );
    this.app_delivery.start_date = this.getStartDate("mobile_app_development");
    this.platform_training.start_date = this.getStartDate("app_delivery");
  }

  saveProjectTracking(field) {
    this.saving = true;
    let request: Observable<any>;
    let payload = this.buildPayload();
    // Set current user as edit user

    if (this.projectTrackingId) {
      this.setUpdateUser(payload, field);
      this.setDateUpdate(payload, field);
      request = this.api.patch(
        `projectTracking/update/${this.projectTrackingId}`,
        payload
      );
    } else {
      this.setCreateUser(payload, field);
      this.setDateCreated(payload, field);
      request = this.api.post("projectTracking", payload);
    }

    request.subscribe(
      (response: any) => {
        console.log(response);
        this.getProjectTracking();
        this.toastr.success("Saved!");
      },

      (error) => {
        this.saving = false;
        console.error(error);
        this.toastr.error(`An error ocurred while saving!`);
      },
      () => {
        this.saving = false;
      }
    );
  }

  buildPayload(): any {
    let payload = {
      idIglesia: this.idIglesia,
      first_meeting: this.first_meeting,
      mockup: this.mockup,
      initial_config: this.initial_config,
      content_development: this.content_development,
      revision_meeting_1: this.revision_meeting_1,
      revision_meeting_2: this.revision_meeting_2,
      revision_meeting_3: this.revision_meeting_3,
      web_maintenance: this.web_maintenance,
      mobile_app_development: this.mobile_app_development,
      app_delivery: this.app_delivery,
      platform_training: this.platform_training,
    };

    console.log(payload);

    // Return payload
    return payload;
  }

  setUpdateUser(payload, field) {
    payload[
      field
    ].updated_by = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
  }

  setCreateUser(payload, field) {
    payload[
      field
    ].created_by = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
  }

  setDateUpdate(payload, field) {
    payload[field].updated_at = new Date().toISOString();
  }

  setDateCreated(payload, field) {
    payload[field].created_at = new Date().toISOString();
  }

  getStartDate(parent: string): string {
    return Moment(this[parent].start_date)
      .add(this[parent].days_alloted, "days")
      .format("YYYY-MM-DD");
  }
}
