import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "step-progress-bar",
  templateUrl: "./step-progress-bar.component.html",
  styleUrls: ["./step-progress-bar.component.scss"],
})
export class StepProgressBarComponent implements OnInit {
  constructor() {}

  @Input() progress: number = 0;

  ngOnInit() {}

  get progressClass(): string {
    if (this.progress <= 25) {
      return "bg-warning";
    }

    if (this.progress <= 50) {
      return "bg-info";
    }

    if (this.progress == 100) {
      return "bg-success";
    }
  }
}
