import { Component, OnInit } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";
import { NgxSmartModalService } from "ngx-smart-modal";
import * as jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DownloadServiceService } from "src/app/download-service.service";
import { HttpResponse } from "@angular/common/http";

@Component({
  selector: "app-orgchart",
  templateUrl: "./orgchart.component.html",
  styleUrls: ["./orgchart.component.scss"]
})
export class OrgchartComponent implements OnInit {
  constructor(
    private api: ApiService,
    public userService: UserService,
    private modal: NgxSmartModalService,
    private downloadService: DownloadServiceService
  ) {
    this.user = this.userService.getCurrentUser();
  }

  // User
  user: any = {};

  data: any = {
    children: []
  };

  printing: boolean = false;

  ngOnInit() {
    this.data = {
      name: this.user.iglesia,
      title: "Organization",
      children: []
    };

    this.getProcess();
  }

  getProcess() {
    this.api
      .get(`process/getProcess`, { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          data.processes
            .filter(pr => pr.status == true)
            .map(pr => {
              this.getProcessDetails(pr);
            });
        },
        err => {
          console.error(err);
        }
      );
  }

  getProcessDetails(process: any, loading = true) {
    process.levels = undefined;
    this.api.get(`process/getProcess/${process.idProcess}`).subscribe(
      (res: any) => {
        if (res.msg.Code == 200) {
          this.getLevelsForProcess(process, res.process.levels);
        }
      },
      err => console.error(err)
    );
  }

  getLevelsForProcess(process: any, levels: any[]) {
    this.api
      .get(`getNiveles`, { idIglesia: this.user.idIglesia })
      .subscribe((res: any) => {
        process.levels = res.niveles
          .filter(
            level => levels.includes(level.idNivel) && level.estatus == true
          )
          .sort((a, b) => a.orden - b.orden);

        // Data item
        let dataitem: any = {
          name: process.name,
          title: "Process",
          children: []
        };

        process.levels.map(prLevel => {
          let prlevelChild: any = {
            name: prLevel.descripcion,
            title: "Level",
            children: []
          };

          prLevel.requisitos.map(requisito => {
            let requisitoChild: any = {
              name: requisito.descripcion,
              title: "Step",
              children: []
            };

            prlevelChild.children.push(requisitoChild);
          });

          dataitem.children.push(prlevelChild);
        });

        this.data.children.push(dataitem);
      });
  }

  printChart() {
    this.printing = true;
    const data = document.getElementById("orgChartId");

    html2canvas(data, { scale: 2 }).then(canvas => {
      const image = canvas.toDataURL("image/png");
      let fileBlob: any;

      this.api
        .post(
          `utils/img2pdf`,
          { image: image, title: "Process chart", subtitle: this.user.iglesia },
          { observe: "response", responseType: "ArrayBuffer" }
        )
        .subscribe(
          (response: any) => {
            const contentType: string = response.headers.get("Content-Type");
            fileBlob = new Blob([response.body], { type: contentType });

            const fileData = window.URL.createObjectURL(fileBlob);

            // Generate virtual link
            let link = document.createElement("a");
            link.href = fileData;
            link.download = "process_chart.pdf";
            link.dispatchEvent(
              new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
              })
            );
            setTimeout(() => {
              // For Firefox it is necessary to delay revoking the ObjectURL
              window.URL.revokeObjectURL(response.body);
              link.remove();
              this.printing = false;
            }, 100);
          },
          err => console.error(err)
        );
    });
  }
}
