import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TextEditorModule } from "../text-editor/text-editor.module";
import { OrganizationDisclaimerComponent } from "./organization-disclaimer.component";
import { OrganizationDisclaimerSettingsComponent } from './organization-disclaimer-settings/organization-disclaimer-settings.component';
import { MatFormFieldModule, MatInputModule } from "@angular/material";

@NgModule({
    entryComponents: [
        OrganizationDisclaimerComponent,
        OrganizationDisclaimerSettingsComponent
    ],
    declarations: [
        OrganizationDisclaimerComponent,
        OrganizationDisclaimerSettingsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TextEditorModule,
        MatInputModule,
        MatFormFieldModule,
    ],
    exports: [
        OrganizationDisclaimerComponent,
        OrganizationDisclaimerSettingsComponent
    ]
})
export class OrganizationDisclaimerModule { }
