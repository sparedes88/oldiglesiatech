import { Component, OnInit, Input } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';



@Component({
  selector: 'pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {

  constructor() { }
  @Input() contacts: any[];


  public todo = [
    {title: 'City', field: 'ciudad'},
    {title: 'Street', field: 'calle'},
    {title: 'State', field: 'provincia'},
    {title: 'Sex', field: 'sexo'},
    {title: 'Marital status', field: 'estadoCivil'}
  ];

  public done = [
    {title: 'First name', field: 'name'},
    {title: 'E-mail', field: 'email'},
    {title: 'Cell-phone', field: 'telefono'}

  ];

  ngOnInit() {
  }

  crearPdf() {

   console.log(this.contacts);

    const columns = [];
    const date = [];
    // LLENAR COLUMNAS SELECCIONADAS
    for(let item of this.done)
    {
      columns.push(item.title);
    }
    // LISTA DE CONTACTOS
    for(let contact of this.contacts)
    {
        const agregar = [];
        for(let col of columns)
        {
            if(col === "City")
            {
              agregar.push(contact.ciudad);
            }
            if(col === "Street")
            {
              agregar.push(contact.calle);
            }
            if(col === "State")
            {
              agregar.push(contact.provincia);
            }
            if(col === "Sex")
            {
              agregar.push(contact.sexo);
            }
            if(col === "Marital status")
            {
              agregar.push(contact.estadoCivil);
            }
            if(col === "First name")
            {
              agregar.push(contact.nombre+' ' +contact.apellido);
            }
            if(col === "E-mail")
            {
              agregar.push(contact.email);
            }
            if(col === "Cell-phone")
            {
              agregar.push(contact.telefono);
            }
        }
        date.push(agregar);
    }


    const doc = new jsPDF();
    var imgData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEMCAMAAABJD3txAAACl1BMVEX2oWD1mVHzkED5s37xfxz5u43+9vH91bj+5tX8zKr//Pr+/fzveg3wfBT+9OzyhivwgiPyijT+8Ob+9/LvfxvueAn0lEjyjz3+4s7+7d/96Nf93cX++vbwfRj+7+X1mlL3p2r2oF7//v38z6/4sHj7y6n91rr++vf7yaT6wJT4sHnxgyT2n1z5t4bzjTr6yKL/9e7+6dr/+fX+/fv93sf/+fT2pGXxiC/veg/yhy74sXr70rP7w5r+8Of/+PT/9O32oF33p2n/7+T1mlPyizb81Lf6xJ37x6Hxgyb+7N7817v2o2L1nlrwgB/5uorzkkP92sHwgB73pWfwgSD4qWzvexPzjDfueAf2nFb3q2/959b0nFX81Lj6wpj7zav6yKP+7N3/8ej4rnT//Pv5s3/807b7zq36vI/5u4z6xZ7+7eD7yqb6vI7+28P0l0zzjjv3rHD4tIDwgSL80LD3qm3xhCf1nVn4rnX2pGP+6dn92L75vpH1m1T95dL/+/jwfBb3r3fvexH7xZ/0l03zlUn7wpnwfRn4tIH5sn37yqf4rXP82L30k0X92b//9e//9/P807X5uov94c3+38j6wJX2oV/6vZDveQ72qWv9693xhCj0mE7yhizyiTP0kkT6uYrveQv7yaX7y6j/8ur3rHL+38n95NDzkUL+6Nj0lkrwfhn4tYH0k0f6vZH2o2H5t4f5toTxgiX7z6791rn3q27/8un/7+P0lkv969z80bH+9vD94Mr7zazzjDn+5dP3p2j8zKn80bL5uIj817zzkUH6uYn+5tT+7uL6v5P94Mv93MT6xJv6wZb90rT2pWb4rXH+6tv95NH948/7w5n1omH+8+zyijXxhSr+7uH828L5vpLudwX///8h3BRwAAAA3XRSTlP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////APk3Ca8AAAmkSURBVHja7d33QxRHFAdwMUri9aNJR0EELAgCKqJYwd57773E2LvRFGtiSdSoKRpjosaS3nvvvc/8MRH1uMLe7ru72Sm77/sjLLfHh+Nu6ptWFANOKyRALMRCLHtilSydWOsionN2YHGJ/FgbzhJJMvw1ybGcDxKJstApM5ZjFJEqWyTGyp1FJMuP0mI9niGbFaldJCnWgvZEvnwuJ1aWX0Ir0ldKrOy/ZbQiQ2TEyhwjpRVpLSHWmj0EsYBpcBHEAqY4nSAWMI8QgljAPEcQC5jCLgSxoF3nDgSxoF3nbgSxgEk9RxALGM9Lhk92WDLHpEmMlT/U+C/bjudMQht5sc54CWIBs8tHEAuY6jSCWMCMdBPEAqYIOsyAWHQYuJ2DWKcIYkHzAEEsYJzrCGJBhxn+IIgFTM0QgljA6ypinaG3MVZKzDP09sXKeoYgFhArexNBLCBW5gSCWECs8W6CWECsY/HN0NsS62CcM/R2xJoT7+yKDbE+I4gFxEpkcbvdsByDCGJBsRKxshtWI0EsKNaAPMQCY/1AEAuMtRax4Fh5iAXHIojFDWs7YsEzArHAKaeIBU4dYoGzkSIWNF0ciAXL3m7VlCJW0n2AnNlNKWIRIm3hGsRCLMRCLMRCLMRSAqvyv0FDkkRk84xVFWphVUwUufsy70mVsPr3FrxZdWKhMljOZ4Vv7V2mDNYn4vdBT3lTFawCCXaN71MFK08CrI2KYFXJUI+gmyqvrAkSYL2gCtZACbCeVwVrpHirManKNEq7SfPCUgDr6NuCrcaq1Dd0jBXZfPA3KDbqcPTY8nuEZHFZtRPHs3DwD7EQC7EQC7EQC7EQC7EQC7EQC7EQC7EQK0as/qV9e7USkUEvz+6pFlZNF5Fno3RdpRLWANFHhHVSCCtJ+OxOP2WwPhU/b/hohSpYmyWYkZ6nClaaBFgzFMHCVTSxvLKu4isL37NMwdqg6Kdh1Ufbx4/AdhYEK3/L7Wt7l9VgC94Ia+6UwPdrd9mpbzg8jr5haLnHqzl2GXXoENeowzdhV7hz+GKpNZ7VPeISV2fEiobV8gQOVwNiaWN10viF0osQSwPLuVHzUyK9GLFaYEU/FLUHYkVgOTpGb4LMQawwrNzReg22MsQKwXIYnIJzE7GC391v1Bl4BbECWemKoZdpd6zlgI7mQidi3c5DkG55BydiNcUPGsTY6kCsWymHDfl0dCAWpSeBA2Q7c83Fql+yTMyusP1PXgLvCiuFDicW9DQRy7Fa6H7D14FYPcEnnWWkmoZV/xARm+XARmkd+BEzBpiF1VH47E4xsG9YBn7E9h5zsCTYfT8Juvu+H/gh708xBUuGug7F0bE+/Pe7+cEn2wP+VphiBpbkFUOa4m2bHHi2S8Hnw/kXsMdaJMMqmoH6WIS82jzdVQSe4yww4ZUlQ5WjyUZYIdNdncFah9ljJUmAtc8Qi7iaJ3Aeg54A2os9VrF4qykLjLFI+tLAM84Bag1nj+UcJxxrNQVghUzgnAAu7TShUZovuppkLycMizQGrsucBHlctxl9w4qtIqnydhRSIFZwAifbB3jkZ80Zddi2eqKQArhJsybP8+iPOoSnuSDSNq8x1inbjWdFpHvg0ixDrTaP2x0rOIGTbzTMXERtj0W2BD4OUqbqXvcIRayQCRxPe0g7w95YpFdgSsJzLWoLtpgiVsQETmpGFKsiG8zuQDddNU/g9NSsDO2abYOpsNTT4OGX+rs/kju95Tf7GC3ItQJWtH8q3QmcluvbjJd6WwDLE1OP/lqg5e/4OPwbacbL4tXH8sS4K6Z5AscZts40LdMGax1ShsbaA58amJIo7Bv8ou9Xan2sfD+JOf785pn99Xe/NHowtT5WlpfEEW9W4OdrLoxq7b/ywAnY3dTGqozL6pZWZVy3SwyrqnpYWyG5frASOpSnGV82b6zCFcMFjpQeqc70xf/Tvkq+WLsFV89Pn5LIT5dXccV6iiidUp5Ya9S2Ild4Yo1SHGuagyOWT3Es0p8f1iLVrUgyx1eWW3Grrjzfs9YqjnWIJ9Ywta3Oz+eJ5ShXGmss3xb8/K4KW3Xi3TfML1DWqq+AUYcnDuxszTXr2Vh1pwKwOMc5g43VcWp9LGcHNlZl1PpYjpNsrBqp9bFKGG2s6kGtj5XL5qM3/QNqfaxUNnsUzhdR62PFspxBJzHXYlMRy/MSEyv3SGp9LA+bIp+xV0RUECvlLyZWaU9Q62MN9rOxyqTWx8ryMrHyfUWtj3WZkVU2tT5WNptJpOC6GQtjwfa8GaY3EyvJsTLZHJShV37AMlg5bKbb7mdkJTXWeDZW+iVTLILVmU21eYNiPNbAqmNklUqtj1WUzsTKsICYFbBK2VjNyqXWx+rBhApS9FB9rDI2VlvZWsmJdZ2NFahQq+pY3dlYLWRtJSPWYoFLP1TD6iRsYZ9yWM43GK2TscGh26yWM9gBy8Gu9qnlsXIZ1om1OlYuy5WEFsdKPUcQC2qVQRALGE9rgljA/Mn6zFILY6X4CWJBc9mHWPD84kUseLK8iAVPvt9aWBn3mpSS22/yvS2FZVa63in8O7MPYhln3d1bvuNGLMMsCdxzZR5iGaRPffBdPg2x9DM95K4XxyCWblaE3vY9H2Lp5euw+9ZsQiydhXkRNy6pRayoabFh2fEMYkXL+y1uXcWgZMQ4rlhtOFlN0liSUJj4sOlorli8TmyarHn3hxN92C+5Yq3ghFWnfftEp8Ve5IqVzOdMvtPRyliNTuhhkyhXLE6HgUX/rX5KpAc1kzMW7cIDq1/0+ydQrnIu5Y3FagmebkaY8Nfas4Hyx6LVR8y2Gqp7/7gWAU67sZKKwKJ0145Rph761U//9s9N0/Qoj/6Ak78fTKkgLLNzwGC3yBqNwVNXnaAnKxjrLcO9NTktBk8TrGShLlbjrU6cwQ63yA2a7vHUplhNp98Y7QcMr2SecCULZbHqb09+TTXYaRq6qZxBdQZVsRruCBjtYQ6evjBGpJVgrHV3DZ422B0fWAjBpDqDoliFzZVOvSP0r7yzEMIr1kos1m/B9yKj10zTWURsKlmoinU85FPOd5/+tZ72/n+onbG+CG0TGH3OefpTO2OlhLc20y5RySMS60JEP0Zke1N6rIGRvT73dsSKkpKWAwri+siyYx3WGKhyvYtYmtEcNE4vQiytPK21QuHmt4ilkZmRUOsHzb2Ib/Da2RH237d22YuFsjezBGIFVzPUHlqSTFWIuHLJd+Zt9k7/fRtVJcKw2jUNkd7zWAlVKMKwfr5ROpgqllYUg1iIhViIhVh2z/+zRpy3xxds2wAAAABJRU5ErkJggg=='

    doc.setLineWidth(0.5);
    doc.line(40, 27, 78, 27);
    doc.addImage(imgData, 'JPEG', 15, 10, 25, 25);
    doc.text(40, 25, "Report contact");
    doc.autoTable(columns, date,
      { margin: { top: 37 },  columnStyles: {
        id: {fillColor: 255} },
       } );
    doc.save('ListContact.pdf');
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }
}
