const template = document.createElement('template');

{/* <div class="card-body">ggg</div> */}
template.innerHTML = `
  <style>
    :host {
      --aspectRatio: 16/9;
    }
    div {
      padding-top: calc(100% / (var(--aspectRatio)));
      position: relative;
      width: 100%;
      background: pink;
      object-fit: contain;
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

class DisplayCard extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }
  connectedCallback() {
    this.$card = this._shadowRoot.querySelector('div');
    this.$iframe = this._shadowRoot.querySelector('iframe');
    this.$card.style.setProperty('--aspectRatio', this.aspect ?? null);
    // console.log('this.$card', this.$card, this.$iframe)

    if (this.content) {
      // const url = 'http://arweave.net/LUW9bB3NHQOKr_Wgy8bVXCEViV52nopHA9ASkW4yS8s' //  + this.hashId
      // const url2 = 'http://arweave.net/' + this.hashId
      const parser = new DOMParser();
      const doc3 = parser.parseFromString(this.content, "text/html");
      console.log('doc3', doc3);

      // var html_string = "<html><body><h1>My epic iframe</p></body></html>";
      this.$iframe.srcdoc = this.content;

      // this.$iframe.src = doc3;
    }
    if (this.hashId && !this.src) {
      const url = 'http://arweave.net/LUW9bB3NHQOKr_Wgy8bVXCEViV52nopHA9ASkW4yS8s' //  + this.hashId
      const url2 = 'http://arweave.net/' + this.hashId
      this.$iframe.src = url;
    }
    if (this.src && !this.hashId) {
      this.$iframe.src = this.src;
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
        this.$card.style.setProperty('--aspectRatio', this.aspect ?? null);
        break;
    }
  }

  get observedAttributes(){
    return [
      'src',
      'id',
      'aspect',
      'content'
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
}
window.customElements.define('display-card', DisplayCard);
