![npm](https://img.shields.io/npm/v/arweave-viewer)
![npm bundle size](https://img.shields.io/bundlephobia/min/arweave-viewer)
![NPM](https://img.shields.io/npm/l/arweave-viewer)

# arweave-viewer
Web Component to display arweave content.

Run `npx http-server` to view docs

# dynamic-svg-renderer
This web component takes a source code or arweave hash reference and renders a svg image that responds to attribute changes. Key Attributes are
- theme: theme string
- hue: id for generative theme.
- duration: number
- intensity: number
- depth: number
- progress: number

## Source
The content of the svg can be set multiple ways
- source: url of source code. eg `source="https://arweave.net/15khInB7-fbJMLokDdGBFQ4ZVdJYJ2EA8q1yokGfqRA"` This can also be a dataUrl, which is useful for svg based nft.
- content: innerHtml content for the render iframe. eg `content="<svg></svg>"`
- hash:arweave hash id. (will load content from url. DEPRECATED. Should use source attribute instead)
- src: ?

## PROPS
- uid: optional uid id to insert into svg. For multiple images in same page if you want to reference one 
optional/deprecated:
- debug: flag to switch on debug information
- style: Style string to pass into viewer card attribute 
