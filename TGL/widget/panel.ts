import PanelString from "./panelString"

export default class Panel {
    private container: HTMLElement
    constructor({
        width
    }: {
        width: string
    }) {
        this.container = document.createElement('div')
        this.container.style.width = width
        this.container.style.height = '75px'
        //this.container.style.backgroundColor = 'rgba(17,17,17,0.8)'
        // this.container.style.backgroundImage = `url('${require('../../assets/hover_bg.png').default}')`
        this.container.style.backgroundRepeat = 'no-repeat'
    }
    addString<T extends object, K extends keyof T>(object: T, property: K) {
        const string = new PanelString(object, property)
        this.container.appendChild(string.domElement)
        return string
    }
    get domElement() {
        return this.container
    }
}
