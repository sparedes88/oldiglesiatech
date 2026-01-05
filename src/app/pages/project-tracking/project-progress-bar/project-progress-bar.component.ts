import { Component, OnInit, Input } from "@angular/core";
import { ApiService } from "src/app/services/api.service";

@Component({
  selector: "project-progress-bar",
  templateUrl: "./project-progress-bar.component.html",
  styleUrls: ["./project-progress-bar.component.scss"],
})
export class ProjectProgressBarComponent implements OnInit {
  constructor(public api: ApiService) {}

  @Input() idIglesia: number;

  ngOnInit() {
    this.getProjectTracking();
  }

  fields = [
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

  currentProgress: any = 0;

  getProjectTracking() {
    console.log("?")
    this.api
      .get(`projectTracking`, { idIglesia: this.idIglesia })
      .subscribe((data: any) => {
        console.log(data);

        let progress: number = 0;
        this.fields.map((f) => {
          if (data[f].progress) {
            progress += data[f].progress;
          }
        });
        this.currentProgress = (progress / this.fields.length).toFixed(0);
      },(error)=>{console.log(error)});
  }

  get progressClass(): string {
    if (this.currentProgress <= 25) {
      return "bg-warning";
    }

    if (this.currentProgress <= 50) {
      return "bg-info";
    }

    if (this.currentProgress == 100) {
      return "bg-success";
    }
  }
}
