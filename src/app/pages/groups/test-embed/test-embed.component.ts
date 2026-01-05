import { Component, OnInit } from '@angular/core';

interface Scripts {
  name: string;
  src: string;
}

@Component({
  selector: 'app-test-embed',
  templateUrl: './test-embed.component.html',
  styleUrls: ['./test-embed.component.scss']
})
export class TestEmbedComponent implements OnInit {

  private scripts: any = {};
  private styles: any = {};
  private scripts_resource: Scripts[] = [
    {
      name: 'VueJSScript',
      src: `https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js`
    },
    {
      name: 'AxiosScript',
      src: `https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js`
    },
    {
      name: 'MomentScript',
      src: `https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js`
    },
    {
      name: 'MomentMinScript',
      src: `https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js`
    },
    {
      name: 'GroupScript',
      src: `http://localhost:9999/api/iglesiaTechApp/public/groups/scripts`
    }
  ];

  private styles_resource: Scripts[] = [
    {
      name: 'FlexBoxGrid',
      src: `https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css`
    },
    {
      name: 'GoogleFont',
      src: `https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap`
    },
    {
      name: 'LocalStyles',
      src: `http://localhost:9999/api/iglesiaTechApp/public/styles`
    },
  ];

  constructor() { }

  ngOnInit() {

    const node = document.createElement('script');
    node.text = `
    var IDIGLESIA = 8372
    var LANG = 'en'
    `;
    node.type = 'text/javascript';
    node.async = true;
    // node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);


    // <link
    //   rel="stylesheet"
    //   href="http://localhost:9999/api/iglesiaTechApp/public/styles"
    // />
    // <script src="http://localhost:9999/api/iglesiaTechApp/public/groups/scripts"></script>

    this.scripts_resource.forEach((script: Scripts) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });

    this.styles_resource.forEach((script: Scripts) => {
      this.styles[script.name] = {
        loaded: false,
        src: script.src
      };
    });


    this.load('VueJSScript', 'AxiosScript', 'MomentScript', 'GroupScript')
      .then(data => {
      }).catch(error => {
        console.error(error);
      });
    this.loadStyles('FlexBoxGrid', 'GoogleFont', 'LocalStyles')
      .then(data => {
      }).catch(error => {
        console.error(error);
      });
  }

  load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadStyles(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadStyle(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      // resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        // load script
        const script = document.createElement('script') as any;
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  // IE
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  // Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }

  loadStyle(name: string) {
    return new Promise((resolve, reject) => {
      // resolve if already loaded
      if (this.styles[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        // load script
        const script = document.createElement('link') as any;
        script.rel = 'stylesheet';
        script.href = this.styles[name].src;
        if (script.readyState) {  // IE
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              this.styles[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  // Others
          script.onload = () => {
            this.styles[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }




}
