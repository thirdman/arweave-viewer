const template = document.createElement('template');
// padding-top: calc(100% / (var(--aspectRatio)));
//       position: relative;
template.innerHTML = `
  <style>
    :host {
      --aspectRatio: 16/9;
    }
    
    div {
      position: relative;
      width: 100%;
      aspect-ratio: var(--aspectRatio);
      
    }
    div.card{
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
    div.card svg{
      width: 100%;
      height: 100%;

    }
    div iframe {
      position: absolute;
      top: 0;
      right: 0;
      width: 100% !important;
      height: 100% !important;
    }
  </style>
  <div class="card">
    <iframe
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
`

export default class ArweaveViewer extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    
  }
  connectedCallback() {
    
    this.$card = this._shadowRoot.querySelector('div');
    this.$iframe = this._shadowRoot.querySelector('iframe');
    this.$card.style.setProperty('--aspectRatio', this.aspect ? this.aspect : null);
    


    // console.log('this.$card', this.$card, this.$iframe)

    if (this.content && !this.hashId) {
      // const url = 'http://arweave.net/LUW9bB3NHQOKr_Wgy8bVXCEViV52nopHA9ASkW4yS8s' //  + this.hashId
      // const url2 = 'http://arweave.net/' + this.hashId
      const parser = new DOMParser();
      const doc3 = parser.parseFromString(this.content, "text/html");
      // console.log('doc3', doc3);

      // var html_string = "<html><body><h1>My epic iframe</p></body></html>";
      // this.$iframe.srcdoc = this.content;
      this.$card.innerHTML = this.content;;

      // this.$iframe.src = doc3;
    }
    if (this.hashId && !this.src) {
      //const url = 'http://arweave.net/LUW9bB3NHQOKr_Wgy8bVXCEViV52nopHA9ASkW4yS8s' //  + this.hashId
      const url2 = 'http://arweave.net/' + this.hashId
      this.$iframe.src = url2;
    }
    // if (this.src && !this.hashId) {
    //   this.$iframe.src = this.src;
    // }
    if (this.theme) {
      console.log('theme: ', this.theme)
      console.log('this.theme.substring(0, 3)', this.theme.substring(0, 3));
      let themeType = 'hex';
      if (this.theme.substring(0, 3) === 'hsl') {
        themeType = 'hsl'
      }
      if (this.theme.substring(0, 3) === 'rgb') {
        themeType = 'rgb'
      }
      // const themeType = this.theme.substring(0, 3) === 'hsl' ? 'hsl' : 'hex';
      const themeArray = themeType === 'hex' ? this.theme.split(',') : this.theme.split('|');
      console.log('themeArray', themeArray);
      const styleStringPrefix = `:host{`
      const styleStringSuffix = `}`
      let styleString = ` `
      themeArray.map((item, index) => {
        // this.$card.style.setProperty(`--c-c${index+1}`, item);  
        // this.$card.style.setProperty(`background`, item);  
        styleString = styleString + `
          --c-c${index + 1}: ${item};
          `
        console.log('item', item)
      });
      const compiledStyleString = `
        ${styleStringPrefix} 
        ${styleString} 
        ${styleStringSuffix} 
        `;
      // console.log('compiledStyleString', compiledStyleString)
        
      let styleEl = document.createElement('style');
      // this.$style = this._shadowRoot.querySelector('style');
      styleEl.textContent = compiledStyleString
      this._shadowRoot.appendChild(styleEl);
      // console.log('styleEl', styleEl)

    // `:host{
    
    //   --c-c1: #fff;
    //   --c-c2: #000;
    //   --c-c3: #000;
    //   --c-c4: #000;
    //   --c-c5: #000;
    //   --c-c6: #000;
      
    // }
    // .cf-c1, .cf-c1 path{
    //   fill: var(--c-c1);
    // }`;
    
      // this.$card.style.setProperty('--c-c', this.aspect ? this.aspect : null);
      // this.$iframe.src = this.src;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'src':
        this.iframe.src = newValue;
        break;
      case 'title':
        this.iframe.title = newValue;
        break;
      case 'content':
        this.iframe.src = content;
        break;
      case 'aspect':
        this.$card.style.setProperty('--aspectRatio', this.aspect ? this.aspect : null);
        break;
    }
  }

  get observedAttributes(){
    return [
      'src',
      'id',
      'aspect',
      'content',
      'theme'
    ];
  }
  
  /**
   * Get src property of the object.
   */
  get src(){
    if (this.hasAttribute('src')) {
      return this.getAttribute('src') || undefined;
    }

    return undefined;
  }
  /**
   * Get aspect property of the object.
   */
  get aspect(){
    if (this.hasAttribute('aspect')) {
      return this.getAttribute('aspect') || undefined;
    }

    return undefined;
  }

  /**
   * Set aspect property of the object.
   */
  set aspect(value) {
    if (value == null) {
      this.removeAttribute('aspect');
    } else if (value.match(/\d+\/\d+/)) {
      this.setAttribute('aspect', value);
    }
  }
  
  /**
   * Get the hash Id property of the object.
   */
  get hashId() {
    if (this.hasAttribute('id')) {
      return this.getAttribute('id') || undefined;
    }

    return undefined;
  }
  
  /**
   * Get the content string.
   */
  get content() {
    if (this.hasAttribute('content')) {
      return this.getAttribute('content') || undefined;
    }

    return undefined;
  }
  
  /**
   * Get the theme.
   */
  get theme() {
    if (this.hasAttribute('theme')) {
      return this.getAttribute('theme') || undefined;
    }

    return undefined;
  }
}

window.customElements.define('arweave-viewer', ArweaveViewer);
