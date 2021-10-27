import PanelTemString from "./panelTemString";

export default class PanelTem {
    private container: HTMLElement

    constructor({
        width,
        height,
        backgroundImage,
    }: {
        width: string,
        height: string,
        backgroundImage: string,
    }) {
        this.container = document.createElement('div')
        this.container.style.width = width
        this.container.style.height = height
        this.container.style.backgroundImage = backgroundImage
        this.container.style.backgroundRepeat = 'no-repeat'
        this.container.style.backgroundSize = '100% 100%'
    }

    addString<T extends object, K extends keyof T, U extends keyof T>(object: T, property: K, url: U) {
        const string = new PanelTemString(object, property, url)
        this.container.appendChild(string.domElement)
        return string
    }

    get domElement() {
        return this.container
    }
}
