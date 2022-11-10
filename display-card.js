const template = document.createElement('template');
const devMode = false;
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
  <div id="card">
  <iframe
  frameborder="0"
  allowfullscreen>
  </iframe>
  </div>
  <div id="info"></div>
  </div>
`

export default class ArweaveViewer extends HTMLElement {
  
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.hueTheme = null
    this.sourceCode = null
  }
  

  connectedCallback() {
    // console.log('connectedCallback', this.hue); // <= ['bar']
    this.init();
  }
  static get observedAttributes(){
    return [
      'src',
      'source',
      'id',
      'uid',
      'aspect',
      'content',
      'theme',
      'hue',
      'speed',
      'duration',
      'intensity',
      'progress'
    ];
  }
  async init() {
    this.$card = this._shadowRoot.querySelector('#card');
    this.$iframe = this._shadowRoot.querySelector('iframe');
    this.$info = this._shadowRoot.querySelector('#info');

    // console.log('::VIEWER init: ', this);
    // console.log('this.svgId', this.svgId)
    if (!devMode) {
      // removes the info node used for debugging
      // TODO: removce this functionality.
      this.$info && this.$info.remove()
    }
    if (this.$card) {
      this.$card.style.setProperty('--aspectRatio', this.aspect ? this.aspect : null);
      this.svgId = this.$card.firstChild && this.$card.firstChild.id;
    }
    
    if (this.hue && this.$info) {
      this.$info.innerHTML = `<span>hue: ${this.hue}</span>`
    }
    if (this.uid && this.$info) {
      // console.log('this.uid exists', this.uid)
      // console.log('this.$info exists', this.$info)
      this.$info.innerHTML = `<span>hue: ${this.hue}, uid: ${this.uid}</span>`
    }
    
    /**
     * SOURCES>...
     */
    if (this.source) {
      this.$card.innerHTML = this.sourceCode;
      const firstChild = this.$card && this.$card.firstChild;
      const svgId = firstChild.id
      this.svgId = svgId;
    }
    if (this.content && !this.hashId) {
      this.$card.innerHTML = this.content;
    }
    if (this.hashId && !this.src) {
      const url2 = 'https://arweave.net/' + this.hashId
      this.$iframe.src = url2;
    }
    /**
     * THEMES...
     */
    if (this.hue && !this.theme) {
      const newTheme = this.compileThemeFromHue(this.hue)
      this.hueTheme = newTheme;
      console.warn('::VIEWER newTheme', newTheme, this.hueTheme)
    }
    if (this.theme || this.hueTheme) {
      const theme = this.theme || this.hueTheme;
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
      
      let themeArray = theme.split('|');
      if (themeType === 'hexNumbers') {
        themeArray = themeArray.map(number => {
          let value = `#${number}`
          return value
        });
      }
      const compiledHeadString = this.compileHeadString(themeArray, 'test1234');
      const compiledElementString = this.compileElementString(themeArray, 'test1234');
      let styleEl = document.createElement('style');
      styleEl.textContent = compiledHeadString
      this._shadowRoot.appendChild(styleEl);
      // ADD TO ELEMENT STYLES IN CASE EXISTING NEED TO BE OVERRIDEN
      const elementEl = this.$card && this.$card.firstChild
      if (elementEl) {
        const styleEl = elementEl.style || document.createElement('style');
        const tempStyle = styleEl && elementEl && elementEl.getAttribute && elementEl.getAttribute('style') || '';
        const appendedStyle = ` ${tempStyle}  ${compiledElementString}`
        elementEl.setAttribute && elementEl.setAttribute('style', appendedStyle);
      }
      // LEAGACY:
      // this.$card.style.setProperty('--c-c', this.aspect ? this.aspect : null);
      // this.$iframe.src = this.src;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('::VIEWER attr changed', {name, oldValue, newValue })
    switch (name) {
      case 'uid':
        console.log('uid changed')
        this.uid = newValue;
        break;
      case 'src':
        this.iframe.src = newValue;
        break;
      case 'source':
        console.warn('source changed: UNHANDLED')
        // this.iframe.src = newValue;
        break;
      case 'title':
        this.iframe.title = newValue;
        break;
      case 'hue':
        if (this.$card) {
          const el = this.$card.firstChild
          el.style.setProperty('--prmnt-hue', this.hue ? this.hue : null);
        }
        break;
      case 'content':
        this.iframe.src = this.content;
        break;
      case 'aspect':
        if (this.$card) {
         this.$card.style.setProperty('--aspectRatio', this.aspect ? this.aspect : null);
        }
        break;
      case 'speed':
        if (this.$card) {
          const el = this.$card.firstChild
          el.style.setProperty('--prmnt-speed', this.speed ? this.speed : null);
        }
        break;
      case 'theme':
        if (this.$card) {
          const el = this.$card.firstChild
          el.style.setProperty('--prmnt-theme', this.theme ? this.theme : null);
        }
        break;
      case 'intensity':
        if (this.$card) {
          const el = this.$card.firstChild
          el.style.setProperty('--prmnt-intensity', this.intensity ? this.intensity : null);
        }
        break;
      case 'duration':
        if (this.$card) {
          const el = this.$card.firstChild
          el.style.setProperty('--prmnt-duration', this.duration ? this.duration : null);
        }
        break;
      case 'progress':
        if (this.$card) {
          const el = this.$card.firstChild
          el.style.setProperty('--prmnt-progress', this.progress ? this.progress : null);
        }
        break;
    }
  }


  
  /**
   * SVG FILE TO STRING
   * @param {source} 
   */
  svgFileToString(source){
    const result = fetch(source)
    .then(response => response.text())
    .then(text => {
      // console.log('source text: ', text);
      this.sourceCode = text
      return text
    }).catch(error => {
      return error
    });
    return result
}

  /**
   * THEME FROM HUE
   * Compiled a theme from a hue value
   * TODO: abstact into seperate module
   */
  compileThemeFromHue(hue) {
    const arrayLength = 5
    const minLimit = 10; // sets the darkest range. Ie contrast will be between 10 and 90;
    const maxLimit = 10; // sets the lightest range. Ie contrast will be between 10 and 90;
    const contrast = (100 - minLimit - maxLimit) / (arrayLength + 1); 
    // console.log('contrast', contrast)
    
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
  compileHeadString(array, id) {
    const styleStringPrefix = `:host{`
      const styleStringSuffix = `}`
      let styleString = ` `
    let classesString = ` 
      `
      
    array.map((item, index) => {
        // NEW LINE ENSURE THE CSS IS FORMATTED CORECTLY
      // TODO: minimise
        styleString = styleString + `--c-c${index + 1}: ${item};
        
        `
      });
      array.map((item, index) => {
        classesString = classesString + `
        ${id && `#${id}`} .cs-c${index + 1}{stroke: var(--c-c${index + 1});}
          `
      });
      
      const compiledStyleString = `
        ${styleStringPrefix} 
        ${styleString} 
        ${styleStringSuffix}
        ${classesString}
        `;
    console.log('::VIEWER compiledStyleString', compiledStyleString)
    return compiledStyleString
  }
 /**
   * Compiled the element styles
   */
  compileElementString(array, id) {
    const speed = this.getAttribute('speed')
    const intensity = this.getAttribute('intensity')
    const duration = this.getAttribute('duration')
    const hue = this.getAttribute('hue')
    
    const styleStringPrefix = ``
    const styleStringSuffix = ``
    let styleString = ` `
      array.map((item, index) => {
        styleString = styleString + `
--c-c${index + 1}: ${item};`
      });
    if (speed) {
      styleString = styleString + `
--prmnt-speed: ${speed};`;
    }
    if (intensity) {
      styleString = styleString + `
--prmnt-intensity: ${intensity};`;
    }
    if (duration) {
      styleString = styleString + `
--prmnt-intensity: ${duration};`;
    }
    if (hue) {
      styleString = styleString + `
--prmnt-intensity: ${hue};`;
    }
    if (theme) {
      styleString = styleString + `
--prmnt-theme: ${theme};`;
    }
      
      
      const compiledElementStyleString = `
        ${styleStringPrefix} 
        ${styleString} 
        ${styleStringSuffix}
        
        `;
    console.log('::VIEWER compiledElementStyleString', compiledElementStyleString)
    return compiledElementStyleString
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
   * UID.
   */
  get uid() {
    if (this.hasAttribute('uid')) {
      return this.getAttribute('uid') || undefined;
    }
    return undefined;
  }

  /**
   * SPEED
   */
  get speed() {
    if (this.hasAttribute('speed')) {
      return this.getAttribute('speed') || undefined;
    }
    return undefined;
  }

  set speed(value) {
    if (value) {
      this.setAttribute('speed', value);
    } else {
      this.removeAttribute('speed');
    }
  }
  
  /**
   * DURATION
   */
  get duration() {
    if (this.hasAttribute('duration')) {
      return this.getAttribute('duration') || undefined;
    }
    return undefined;
  }

  set duration(value) {
    if (value) {
      this.setAttribute('duration', value);
    } else {
      this.removeAttribute('duration');
    }
  }
  /**
   * INTENSITY
   */
  get intensity() {
    if (this.hasAttribute('intensity')) {
      return this.getAttribute('intensity') || undefined;
    }
    return undefined;
  }

  set intensity(value) {
    if (value) {
      this.setAttribute('intensity', value);
    } else {
      this.removeAttribute('intensity');
    }
  }
  
}

window.customElements.define('arweave-viewer', ArweaveViewer);

