const template = document.createElement('template');
const devMode = false,
template.innerHTML = `
  <style>
    :host {
      --aspectRatio: 1/1;
    }
    
    div#info {
      position: relative;
      width: 100%;      
    }
    div#card{
      height: 100%;
      width: 100%;
      object-fit: cover;
      aspect-ratio: var(--aspectRatio);
    }
    div#card svg{
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
  <div class="wrapper">
  <div id="info"></div>
  <div id="card">
    <iframe
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
  </div>
`

export default class ArweaveViewer extends HTMLElement {
  
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.hueTheme = null
    this.sourceCode = null
    console.log('constructor this.hue', this.hue); 
  }
  connectedCallback() {
    this.init();
    
    console.log('connectedCallback', this.hue); // <= ['bar']
  }
  
  async init() {
    this.$card = this._shadowRoot.querySelector('#card');
    this.$iframe = this._shadowRoot.querySelector('iframe');
    this.$info = this._shadowRoot.querySelector('#info');
    if (!devMode) {
      this.$info.remove()
    }
    console.log('this.$info', this.$info);
    this.$card.style.setProperty('--aspectRatio', this.aspect ? this.aspect : null);
    
    // console.log('this.$card', this.$card, this.$iframe)
    if (this.hue && this.$info) {
      this.$info.innerHTML = `<span>hue: ${this.hue}</span>`
    }
    if (this.uid && this.$info) {
      console.log('this.uid exists', this.uid)
      this.$info.innerHTML = `<span>hue: ${this.hue}, uid: ${this.uid}</span>`
    }
    if (this.hue && !this.theme) {
      const newTheme = this.compileThemeFromHue(this.hue)
      this.hueTheme = newTheme;
      console.log('newTheme', newTheme, this.hueTheme)
    }
    if (this.source) {
      // console.log('source:', this.source)
      
      const sourceValue = await this.svgFileToString(this.source);
      // console.log('source sourcevalue: ', sourceValue)
      // this._sourceCode = sourceValue;

      // console.log('source now: ', this.sourceCode)
      
      // const parser = new DOMParser();
      // if (parser) {
        
      //   const fragment = parser.parseFromString(this.source, "text/html");
      //   console.log('source: fragment', fragment)
      //   console.log('source: outerHTML', fragment.outerHTML)
      //   // var tmp = document.createElement("div");
      //   // tmp.appendChild(fragment);
      //   // console.log('source: tmp' , tmp); // <p>Test</p>
      //   // console.log('source: outerHTML' , tmp.innerHTML); // <p>Test</p>

      //   const s = new XMLSerializer().serializeToString(fragment)
      //   const encodedData = window.btoa(s);
      // console.log('source: ',{s, encodedData})

      //   // console.log('doc3', doc3);
      // }      
      this.$card.innerHTML = this.sourceCode;
      
    }
    if (this.content && !this.hashId) {
      // const url = 'http://arweave.net/LUW9bB3NHQOKr_Wgy8bVXCEViV52nopHA9ASkW4yS8s' //  + this.hashId
      // const url2 = 'http://arweave.net/' + this.hashId
        this.$card.innerHTML = this.content;
      
    }
    if (this.hashId && !this.src) {
      //const url = 'http://arweave.net/LUW9bB3NHQOKr_Wgy8bVXCEViV52nopHA9ASkW4yS8s' //  + this.hashId
      const url2 = 'https://arweave.net/' + this.hashId
      this.$iframe.src = url2;
    }
    // if (this.src && !this.hashId) {
    //   this.$iframe.src = this.src;
    // }
    if (this.theme || this.hueTheme) {
      // console.log('theme: ', this.theme)
      const theme = this.theme || this.hueTheme;
      // console.log('theme', theme)
      // console.log('this.theme.substring(0, 3)', theme.substring(0, 3));
      let themeType;
      if (theme.substring(0, 1) === '#') {
        themeType = 'hex'
      }
      if (theme.substring(0, 3) === 'hsl') {
        themeType = 'hsl'
      }
      if (theme.substring(0, 3) === 'rgb') {
        themeType = 'rgb'
      }
      if (!themeType) {
        themeType = 'hexNumbers'
      }
      
      // const themeType = theme.substring(0, 3) === 'hsl' ? 'hsl' : 'hex';
      // let themeArray = (themeType === 'hex' || themeType === 'hexNumbers') ? theme.split(',') : theme.split('|');
      let themeArray = theme.split('|');
      console.log('about to split theme from string', theme, themeArray)
      if (themeType === 'hexNumbers') {
        console.log('themeTYpe hexnumbers add #: ', themeArray)
        themeArray = themeArray.map(number => {
          let value = `#${number}`
          console.log('themeTYpe value', value)
          return value
        });
        console.log('themeTYpe from hexnumbers now', themeArray)
      }
      // console.log('themeArray', themeArray);
      const compiledHeadString = this.compileHeadString(themeArray);
      let styleEl = document.createElement('style');
      styleEl.textContent = compiledHeadString
      this._shadowRoot.appendChild(styleEl);
      // const compiledClasses = this.compileClasses(themeArray);
      // let styleEl2 = document.createElement('style');
      // styleEl2.textContent = compiledClasses
      // console.log('styleEl2', styleEl2)
      // this._shadowRoot.appendChild(styleEl2);
      // console.log('this._shadowRoot', this._shadowRoot)
      

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
    // const tesChild = document.createElement('div')
    //   tesChild.innerHTML=`<span>blah ${this.hue}</span>`
    //   this.$card.innerHTML = `<span>blah ${this.hue}</span>`
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attr changed', name, oldValue, newValue)
    switch (name) {
      case 'uid':
        console.log('uid changed')
        this.uid = newValue;
        break;
      case 'src':
        this.iframe.src = newValue;
        break;
      case 'source':
        // this.iframe.src = newValue;
        break;
      case 'title':
        this.iframe.title = newValue;
        break;
      case 'hue':
        // this.iframe.hue = newValue;
        console.log('this.hue was changed', this.hue)
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
      'source',
      'id',
      'uid',
      'aspect',
      'content',
      'theme',
      'hue',
    ];
  }
  /**
   * SVG FILE TO STRING
   * @param {source} 
   */
  svgFileToString(source){
    const result = fetch(source)
    .then(response => response.text())
    .then(text => {
      console.log('source text: ', text);
      // do whatever
      this.sourceCode = text
      return text
    }).catch(error => {
      return error
    });
    return result
}

  /**
   * Compiled a theme from a hue value
   */
  compileThemeFromHue(hue) {
    const arrayLength = 5
    const minLimit = 10; // sets the darkest range. Ie contrast will be between 10 and 90;
    const maxLimit = 10; // sets the lightest range. Ie contrast will be between 10 and 90;
    const contrast = (100 - minLimit - maxLimit) / (arrayLength + 1); 
    console.log('contrast', contrast)
    
    const array = Array.from(Array(arrayLength).keys())
    const theme = array.map((_, index) => { 
      const lightness = minLimit + ((index + 1) * contrast)
      const value = `hsl(${hue}, 50%, ${lightness}%)`
      return value
    })
    const themeString = theme.join('|');
    console.log('hue', hue, theme)
    return themeString
  }
  /**
   * Compiled the head styles
   */
  compileHeadString(array) {
    const styleStringPrefix = `:host{`
      const styleStringSuffix = `}`
      let styleString = ` `
    let classesString = ` 
      `
      
      array.map((item, index) => {
        // this.$card.style.setProperty(`--c-c${index+1}`, item);  
        // this.$card.style.setProperty(`background`, item);  
        
        styleString = styleString + `--c-c${index + 1}: ${item};
        
          `
        // console.log('item', item)
      });
      array.map((item, index) => {
        classesString = classesString + `
        .cs-c${index + 1}{stroke: var(--c-c${index + 1});}
          `
        // console.log('item', item)
      });
      
      const compiledStyleString = `
        ${styleStringPrefix} 
        ${styleString} 
        ${styleStringSuffix}
        ${classesString}
        `;
    return compiledStyleString
  }
 
  /**
   * Compiled the classes
   */
  compileClasses(array) {
    // let classString = `
    //   svg{border: 1px solid red;}
      
    //   --c-c2: lime;
    //   .cs-c2{stoke: var(--c-c2);}
    //   .cs-c3{stoke: var(--c-c3);}
    //   .cs-c4{stoke: var(--c-c4);}
    //   .cs-c5{stoke: var(--c-c5);}
      
    //   .cf-c1{fill: var(--c-c1);}
    //   .cf-c2{fill: var(--c-c2);}
    //   .cf-c3{fill: var(--c-c3);}
    //   .cf-c4{fill: var(--c-c4);}
    //   .cf-c5{fill: var(--c-c5);}
    // `
    // // .cf-c${index + 1}{fill: var(--c-c${index + 1})};
    //   array.map((item, index) => {
    //     classString = classString + `
      
    //        --c-c${index + 1}: ${item};
    //       .cs-c${index + 1}{stroke: var(--c-c1)};
    //       `
    //     // console.log('item', item)
    //   });
      
    //   console.log('compileClasses', classString)
    // return classString
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
   * Get source 
   */
  get source(){
    if (this.hasAttribute('source')) {
      return this.getAttribute('source') || undefined;
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
  
  
  /**
   * Get the hue.
   */
  get hue() {
    if (this.hasAttribute('hue')) {
      return this.getAttribute('hue') || undefined;
    }
    return undefined;
  }

  set hue(value) {
    console.log('set hue', value)
    if (val) {
      this.setAttribute('hue', value);
    } else {
      this.removeAttribute('hue');
    }
  }

  /**
   * Get the UID.
   */
  get uid() {
    if (this.hasAttribute('uid')) {
      return this.getAttribute('uid') || undefined;
    }
    return undefined;
  }
  
}

window.customElements.define('arweave-viewer', ArweaveViewer);

