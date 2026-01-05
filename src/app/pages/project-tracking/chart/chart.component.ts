import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  Input,
} from "@angular/core";
import { gantt } from "dhtmlx-gantt";
import { Task, Link } from "./chartClasses";
import { ApiService } from "src/app/services/api.service";
import * as moment from "moment";

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: "project-progress-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.scss"],
})
export class ChartComponent implements OnInit {
  constructor(private api: ApiService) {}

  @ViewChild("gantt_chart") ganttContainer: ElementRef;
  @Input() idIglesia: any = 2;

  // Data
  public data: Array<Task> = [];
  public links: Array<Link> = [];

  public fields: any = [
    "first_meeting",
    "mockup",
    "initial_config",
    "content_development",
    "revision_meeting_1",
    "revision_meeting_2",
    "revision_meeting_3",
    "web_maintenance",
    "mobile_app_development",
    "app_delivery",
    "platform_training",
  ];

  ngOnInit() {
    gantt.config.xml_date = "%Y-%m-%d";
    gantt.config.readonly = true;
    gantt.init(this.ganttContainer.nativeElement);
    gantt.templates.progress_text = function (start, end, task) {
      return (
        "<span style='float: left;margin-left: 5px;color: white;font-weight: bold;'>" +
        Math.round(task.progress * 100) +
        "% </span>"
      );
    };
    this.getChartData();
  }

  getChartData() {
    if (this.idIglesia) {
      this.api.get(`projectTracking`, { idIglesia: this.idIglesia }).subscribe(
        (trackingData: any) => {
          if (trackingData) {
            // Insert Initial meeting
            this.insertData(trackingData);
            this.insertLinks();
          }
        },
        (err: any) => {
          console.error(err);
        },
        () => {
          gantt.parse({ data: this.data, links: this.links });
        }
      );
    }
  }

  buildTask(data, text: string, id?: number): Task {
    return {
      id: id,
      duration: data.days_alloted,
      start_date: data.start_date,
      progress: this.getProgress(data.progress),
      text: text,
    } as Task;
  }

  getProgress(progress: number) {
    if (progress) return progress / 100;
  }

  insertData(trackingData) {
    this.data.push(
      this.buildTask(trackingData.first_meeting, "Reunión Inicial", 1)
    );
    // Mockup
    this.data.push(this.buildTask(trackingData.mockup, "Logo creación", 2));
    // Initial config
    this.data.push(
      this.buildTask(trackingData.initial_config, "Contenido - Web", 3)
    );
    // Content development
    this.data.push(
      this.buildTask(
        trackingData.content_development,
        "Proceso - Web",
        4
      )
    );
    // revision meeting #1
    this.data.push(
      this.buildTask(trackingData.revision_meeting_1, "Entregadas - Web", 5)
    );
    // revision meeting #2
    this.data.push(
      this.buildTask(trackingData.revision_meeting_2, "Stripe", 6)
    );
    // revision meeting #3
    this.data.push(
      this.buildTask(trackingData.revision_meeting_3, "Dominio Migración", 7)
    );
    // Web maintenance
    this.data.push(
      this.buildTask(trackingData.web_maintenance, "Google Business", 8)
    );
    // app delivery
    this.data.push(
      this.buildTask(
        trackingData.mobile_app_development,
        "App móvil",
        9
      )
    );
    // platform training
    this.data.push(
      this.buildTask(trackingData.app_delivery, "Panel Iglesia Tech", 10)
    );
    // platform training
    this.data.push(
      this.buildTask(
        trackingData.platform_training,
        "Soporte",
        11
      )
    );
  }

  insertLinks() {
    const links: any[] = [
      { id: 1, source: 1, target: 2, type: "0" },
      { id: 2, source: 2, target: 3, type: "0" },
      { id: 3, source: 3, target: 4, type: "0" },
      { id: 4, source: 4, target: 5, type: "0" },
      { id: 5, source: 5, target: 6, type: "0" },
      { id: 6, source: 6, target: 7, type: "0" },
      { id: 8, source: 7, target: 8, type: "0" },
      { id: 9, source: 8, target: 9, type: "0" },
      { id: 10, source: 9, target: 10, type: "0" },
      { id: 11, source: 10, target: 11, type: "0" },
    ];

    this.links = links;
  }
}
