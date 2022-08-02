const template = document.createElement('template');

template.innerHTML = `
  <div class="card">
    <div class="card-body"></div>
  </div>
`

class DisplayCard extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
  }
  connectedCallback() {
    var xmlHttp = new XMLHttpRequest();
    const url = `http://arweave.net/${this.hashId}`
    xmlHttp.open( "GET", url , false );
    xmlHttp.send( null );
    console.log(xmlHttp.responseText)
    this.$card = this._shadowRoot.querySelector('div');
    let responseObj = JSON.parse(xmlHttp.responseText);
    let $townName = document.createElement('p');
    // $townName.innerHTML = `Town: ${responseObj.name}`;
    $townName.innerHTML = `hash: ${responseObj.name}`;
    this._shadowRoot.appendChild($townName);
    // let $temperature =  document.createElement('p');
    // $temperature.innerHTML = `${parseInt(responseObj.main.temp - 273)} &deg;C`
    // this._shadowRoot.appendChild($temperature);
  }
  get hashId() {
    return this.getAttribute('id');
  }
}
window.customElements.define('display-card', DisplayCard);
