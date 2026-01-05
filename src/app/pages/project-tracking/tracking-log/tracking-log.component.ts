import { Component, OnInit, ViewChild } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { UserService } from "src/app/services/user.service";
import { ApiService } from "src/app/services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "project-tracking-log",
  templateUrl: "./tracking-log.component.html",
  styleUrls: ["./tracking-log.component.scss"],
})
export class TrackingLogComponent implements OnInit {
  constructor(private api: ApiService, private router: Router) {
    this.currentUser = UserService.getCurrentUser();
  }

  public currentUser: any = {};

  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [11, 25, 50, 100, 250, 500],
    buttons: [
      { extend: "copy", className: "btn btn-outline-primary btn-sm" },
      {
        extend: "print",
        className: "btn btn-outline-primary btn-sm",
      },
      { extend: "csv", className: "btn btn-outline-primary btn-sm" },
    ],
    orderFixed: [0, "asc"],
    rowGroup: {
      dataSrc: 0,
    },
    columnDefs: [
      {
        targets: [0],
        visible: false,
      },
    ],
  };

  public projectTrackingLog: Array<any> = [];
  public fields: any = [
    { key: "first_meeting", title: "Entrevista Inicial" },
    { key: "mockup", title: "Logo y Maqueta" },
    { key: "initial_config", title: "Configuracion Inicial" },
    { key: "content_development", title: "Desarrollo Contenido" },
    { key: "revision_meeting_1", title: "1era Revision" },
    { key: "revision_meeting_2", title: "2da Revision" },
    { key: "revision_meeting_3", title: "3era Revision" },
    { key: "web_maintenance", title: "Mantenimiento web" },
    { key: "mobile_app_development", title: "Dessarollo App Mobil" },
    { key: "app_delivery", title: "App en Tienda Entregada" },
    { key: "platform_training", title: "Entrenamiento de Plataforma" },
  ];

  ngOnInit() {
    this.getProjectTracking();
  }

  getProjectTracking() {
    this.api.get(`projectTracking/log`).subscribe(
      (data: any) => {
        this.projectTrackingLog = data || [];
      },
      (err) => console.error(err),
      () => this.dtTrigger.next()
    );
  }

  editStep(step: string, idIglesia) {
    this.router.navigate([`/admin/organization`], {
      queryParams: { step, idIglesia },
    });
  }
}
