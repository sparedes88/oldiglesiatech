import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
export type Item = {
  id: string;
  name: string;
  containers: Array<Item>;
};

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input('onDragDrop') public onDragDrop$!: Subject<CdkDragDrop<Array<Item>>>;
  @Input() item!: Item;
  @Input() invert!: boolean;

  constructor() { }

  ngOnInit() { }

}
