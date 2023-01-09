const devMode = true;
const template = document.createElement('template');

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
    this.$card = this._shadowRoot.querySelector('#card');
    
  }
  

  connectedCallback() {
    // console.log('connectedCallback', this.hue); // <= ['bar']
    this.init();
  }
  static get observedAttributes(){
    return [
      'src',
      'source',
      'hash',
      'uid',
      'aspect',
      'content',
      'theme',
      'hue',
      'duration',
      'intensity',
      'progress',
      'extended',
      'debug'
      // 'arweave', // deprecated
    ];
  }
  async init() {
    
    this.$card = this._shadowRoot.querySelector('#card');
    this.$iframe = this._shadowRoot.querySelector('iframe');
    this.$info = this._shadowRoot.querySelector('#info');
    this.$showDebugInfo = devMode || this.debug || false;
    if (!this.$showDebugInfo) {
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
      this.$info.innerHTML = `<span>hue: ${this.hue}, uid: ${this.uid}</span>`
    }
    if (this.theme && this.$info) {
      this.$info.innerHTML = `<pre>theme: ${this.theme}</pre>`
    }
    
    /**
     * SOURCES>...
     */
    if (this.src) {
      console.log('this.src', this.src)
    }
    if (this.source) {
      // console.log('this.source exists', this.source)
      const sourceValue = await this.svgFileToString(this.source);
      if (sourceValue) {
        this.sourceCode = sourceValue;
        
        if (this.$card) {
          this.$card.innerHTML = this.sourceCode;
          const firstChild = this.$card.firstChild;
          if (firstChild) {
            //  const svgId = firstChild.id
            this.svgId = firstChild.id;
          }
        }
      }
    }
    if (this.content && !this.hash) {
      this.$card.innerHTML = this.content;
    }
    if (this.hash && !this.src && this.$iframe) {
      const url2 = 'https://arweave.net/' + this.hash
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
      this.compileTheme(theme);
    }
    /**
     * EXTENDED/ENHANCED
     */
    if (this.extended) {
      this.handleExtend();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // console.log('::attr changed', name, newValue, oldValue)
    if (this.debug && oldValue && oldValue !== newValue) {
      console.log('::VIEWER attr changed', {name, oldValue, newValue })
    }
    switch (name) {
      case 'uid':
        this.uid = newValue;
        break;
      case 'src':
        if (this.$iframe) {
          this.$iframe.src = newValue;
        }
        break;
      case 'source':
        if (this.$iframe) {
          if (this.debug) {
            console.warn('source changed: ', newValue)
          }
          if (this.$iframe.srcDoc !== newValue) {
            console.warn('source changed: ', newValue)
            this.$iframe.srcDoc = newValue;
          }
        }
        break;
      case 'title':
        if (this.$iframe) {
          this.$iframe.title = newValue;
        }
        break;
      case 'content':
        // if (this.$iframe) {
        //   this.$iframe.src = this.content;
        // }
        if (this.hash) {
          console.log('hash exists, cannot set content')
          return
        }
        if (this.$card) {
          if (this.debug) {
            console.warn('content changed: ', newValue)
          }
          this.$card.innerHTML = this.content;
        } else {
          if (this.debug) {
            console.warn('card does not exist for content to set: ')
          }
        }
        
        break;
      case 'hue':
        if (this.$card) {
          
          const elementEl = this.$card.firstChild
          
          
          elementEl && elementEl.style.setProperty('--prmnt-hue', this.hue ? this.hue : null);
          const newTheme = this.compileThemeFromHue(this.hue)
          this.hueTheme = newTheme;
          let themeArray = newTheme.split('|');
          if (elementEl && themeArray.length ) {
            themeArray.map((color, index) => {
              elementEl.style.setProperty(`--c-c${index + 1}`, color);
            })
          }
        }
        break;
      case 'aspect':
        if (this.$card) {
         this.$card.style.setProperty('--aspectRatio', this.aspect ? this.aspect : null);
        }
        break;
      
      case 'theme':
        if (this.$card) {
          const el = this.$card.firstChild
          if (!el) {
            if (this.debug) {
              console.error(':VIEWER: cant set theme, no element')
            }
            return
          } else {
            el.style && el.style.setProperty('--prmnt-theme', this.theme ? this.theme : '');
            this.compileTheme(this.theme);
            
          }
        }
        break;
      case 'intensity':
        if (this.$card) {
          const el = this.$card.firstChild
          const value = this.intensity || ""
          el.style && el.style.setProperty('--prmnt-intensity', value);
        }
        break;
      case 'duration':
        if (this.$card) {
          const el = this.$card.firstChild
          el.style && el.style.setProperty('--prmnt-duration', this.duration ? this.duration : null);
        }
        break;
      case 'progress':
        if (this.$card) {
          const el = this.$card.firstChild
          el.style.setProperty('--prmnt-progress', this.progress ? this.progress : null);
        }
        break;
      case 'extended':
        // console.log('extended is', this.extended)
        if (this.debug) {
        console.log('extended card', this.$card)
        }
        if (this.$card) {
          this.handleExtend();
        }
        break;
      case 'debug':
        // console.log('DEBUG showing new value', this.debug, typeof this.debug)
        if (this.debug) {
          console.log('DEBUG is now set')
          this.$showDebugInfo = true;
        } else {
          console.log('DEBUG is now unset')
          this.$showDebugInfo = false;
        }
        break;
    }
  }


  
  /**
   * EXTEND LOGIC
   */
  handleExtend() {
    const el = this.$card.firstChild
    const existingStyleEl = el.style;
          
    const styleEl = document.createElement('style');
    styleEl.textContent = this.extended
          
    if (existingStyleEl) {
      const tempels = el.getElementsByTagName('style')
      const tempel = tempels[0]
      if (tempel) {
        el.removeChild(tempel)
      }
    }
    el.appendChild(styleEl);
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
      // this.sourceCode = text
      return text
    }).catch(error => {
      return error
    });
    return result
}
/**
   * THEME
   * Compiled a theme from a themeString
   * TODO: absttact into seperate module
   */
  compileTheme(theme) {
    let compiledHeadString
    let compiledElementString
    let themeArray
    if (!theme) {
      // handleClearTheme
      themeArray = []
      // console.log('removing theme!')
      compiledHeadString = this.compileHeadString(themeArray, 'test1234');
      compiledElementString = this.compileElementString(themeArray, 'test1234');
      
      
    } else {
    
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
      
      themeArray = theme.split('|');
      if (themeType === 'hexNumbers') {
        themeArray = themeArray.map(number => {
          let value = `#${number}`
          return value
        });
      }
      compiledHeadString = this.compileHeadString(themeArray, 'test1234');
      compiledElementString = this.compileElementString(themeArray, 'test1234');
    }
      let styleEl = document.createElement('style');
      styleEl.textContent = compiledHeadString
      const existingRootStyle = this._shadowRoot.style;
    
    
      if (existingRootStyle) {
        console.warn('existingRootStyle exists', existingRootStyle)
        this._shadowRoot.replaceChild(styleEl);
      } else {
        this._shadowRoot.appendChild(styleEl);

      }
    
    // ADD TO ELEMENT STYLES IN CASE EXISTING NEED TO BE OVERRIDEN
    const elementEl = this.$card && this.$card.firstChild
    if (elementEl) {
      
      const existingStyleElement = elementEl.style;
      
      if (existingStyleElement) {
        styleEl = elementEl.style 
        if (!theme) {
          styleEl.removeProperty(`--c-c1`);
          styleEl.removeProperty(`--c-c2`);
          styleEl.removeProperty(`--c-c3`);
          styleEl.removeProperty(`--c-c4`);
          styleEl.removeProperty(`--c-c5`);
          styleEl.removeProperty(`--prmnt-theme`);
        }
      } else {
        styleEl =  document.createElement('style');
      }
      const tempStyle = styleEl && elementEl.getAttribute && elementEl.getAttribute('style') || '';
      
      const appendedStyle = ` ${tempStyle}  ${compiledElementString}`
      elementEl.setAttribute && elementEl.setAttribute('style', appendedStyle);
      }
    return themeArray;
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
    // console.log('::VIEWER compileThemeFromHue', hue, theme)
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
      
    let compiledStyleString = `
        ${styleStringPrefix} 
        ${styleString} 
        ${styleStringSuffix}
        ${classesString}
        `;
    return compiledStyleString
  }
 /**
  * COMPILE ELEMENT STRING
   * Compiled the element styles
   */
  compileElementString(array, id) {
    const intensity = this.getAttribute('intensity')
    const duration = this.getAttribute('duration')
    const hue = this.getAttribute('hue')
    const theme = this.getAttribute('theme')
    const progress = this.getAttribute('progress')
    
    const styleStringPrefix = ``
    const styleStringSuffix = ``
    let styleString = ` `
    if (!array || !array.length) {
      console.log('no array, should remove css vars')
      styleString = styleString + `
`
      
    } else {
      array.map((item, index) => {
        styleString = styleString + `
--c-c${index + 1}: ${item};`
      });
    }
    
    if (intensity) {
      styleString = styleString + `
--prmnt-intensity: ${intensity};`;
    }
    if (duration) {
      styleString = styleString + `
--prmnt-duration: ${duration};`;
    }
    if (hue) {
      styleString = styleString + `
--prmnt-hue: ${hue};`;
    }
    if (theme) {
      styleString = styleString + `
--prmnt-theme: ${theme};`;
    }
    if (progress) {
    styleString = styleString + `
--prmnt-progress: ${progress};`;
    }
      
      
      const compiledElementStyleString = `
        ${styleStringPrefix} 
        ${styleString} 
        ${styleStringSuffix}
        
        `;
      if (this.debug) {
        console.log('::VIEWER compiledElementStyleString', compiledElementStyleString)
      }
    return compiledElementStyleString
  }

  /**
   * Compiled the classes
   * TODO: figure out if this can be removed or refactored
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
   * GETTERS AND SETTERS
   */
  /**
   * SRC
   */
  get src(){
    if (this.hasAttribute('src')) {
      return this.getAttribute('src') || undefined;
    }
    return undefined;
  }
  set src(val) {
    if (val) {
      this.setAttribute('src', value);
    } else {
      this.removeAttribute('src');
    }
  }
  /**
   * SOURCE
   * generally svg/html code 
   */
  get source(){
    if (this.hasAttribute('source')) {
      return this.getAttribute('source') || undefined;
    }
    return undefined;
  }
  set src(source) {
    if (source) {
      this.setAttribute('source', value);
    } else {
      this.removeAttribute('source');
    }
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
   * Get the hash property of the object.
   */
  get hash() {
    if (this.hasAttribute('hash')) {
      return this.getAttribute('hash') || undefined;
    }
    return undefined;
  }
  set hash(val) {
    if (val == null) {
      this.removeAttribute('hash');
    } else {
      this.setAttribute('hash', value);
    }
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
   * Get the extended style.
   */
  get extended() {
    if (this.hasAttribute('extended')) {
      return this.getAttribute('extended') || undefined;
    }
    return undefined;
  }
  set extended(val) {
    if (val) {
      this.setAttribute('extended', val);
    } else {
      this.removeAttribute('extended');
    }
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
  set theme(val) {
    if (val) {
      this.setAttribute('theme', val);
    } else {
      this.removeAttribute('theme');
    }
    
  }
  
  /**
   * HUE
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
   * PROGRESS.
   */
  get progress() {
    if (this.hasAttribute('progress')) {
      return this.getAttribute('progress') || undefined;
    }
    return undefined;
  }

  set progress(value) {
    console.log('set progress', value)
    if (val) {
      this.setAttribute('progress', value);
    } else {
      this.removeAttribute('progress');
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
  /**
   * DEBUGGING
   */
  get debug() {
    if (this.hasAttribute('debug')) {
      return this.getAttribute('debug') || undefined;
    }
    return undefined;
  }

  set debug(value) {
    if (value) {
      this.setAttribute('debug', value);
    } else {
      this.removeAttribute('debug');
    }
  }
  
}

window.customElements.define('arweave-viewer', ArweaveViewer);

