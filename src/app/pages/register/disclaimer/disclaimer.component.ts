import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.scss']
})
export class DisclaimerComponent implements OnInit {

  idOrganization: number;

  constructor(
    private activated_route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.idOrganization = Number(this.activated_route.snapshot.paramMap.get('id'));
  }

}
