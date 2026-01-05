import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsRoutingModule } from './events-routing.module';
import { EventFormV2Component } from './event-form-v2/event-form-v2.component';
import { Step1BasicInformationComponent } from './step1-basic-information/step1-basic-information.component';
import { Step2DetailsComponent } from './step2-details/step2-details.component';
import { Step3RegisterComponent } from './step3-register/step3-register.component';
import { Step4PublishComponent } from './step4-publish/step4-publish.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GooglePlacesModule } from 'src/app/component/google-places/google-places.module';

@NgModule({
  declarations: [EventFormV2Component, Step1BasicInformationComponent, Step2DetailsComponent, Step3RegisterComponent, Step4PublishComponent],
  imports: [
    EventsRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GooglePlacesModule
  ],
  exports: [
    EventFormV2Component
  ]
})

export class EventsModule {

  constructor() {
    console.log('TEST IMPORTED');

  }
}
