import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "fullscreen-modal",
  templateUrl: "./fullscreen-modal.component.html",
  styleUrls: ["./fullscreen-modal.component.scss"],
})
export class FullscreenModalComponent implements OnInit {
  constructor() {}

  modalVisible = false

  @Output() visibilityChange = new EventEmitter();

  @Input()
  get visible(): boolean {
    return this.modalVisible
  }
  set visible(val) {
    this.modalVisible = val
    this.visibilityChange.emit(this.visible)

    if (this.modalVisible) {
      this.forceFullScreen()
    } else {
      this.removeFullScreen()
    }
  }

  ngOnInit() {}

  forceFullScreen() {
    const modals: any = document.getElementsByClassName('full-screen-modal')

    for (let modal of modals) {
      modal.classList.add("forced-fullscreen");
      console.log(modal);
    }
  }

  removeFullScreen() {
    const modals: any = document.getElementsByClassName('full-screen-modal')

    for (let modal of modals) {
      modal.classList.remove("forced-fullscreen");
      console.log(modal);
    }
  }

}
