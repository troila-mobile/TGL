import WatchJS from 'melanke-watchjs';

export default class PanelString<T extends object, K extends keyof T>{
    private property: string
    private div: HTMLDivElement
    constructor(
        object: T,
        property: K
    ) {
        this.property = property as string
        this.div = document.createElement('div')
        this.div.style.padding = '0 10px'
        const p1 = document.createElement('div')
        p1.style.padding = '0 5px'
        p1.style.display = 'flex'
        p1.style.flexWrap = 'wrap'
        p1.style.justifyContent = 'space-between'
        p1.style.fontSize = '14px'
        p1.style.fontFamily = 'MicrosoftYaHei'
        p1.style.fontWeight = 'bold'
        p1.style.color = '#ffffff'
        p1.style.lineHeight = '36px'
        this.div.appendChild(p1)
        const span1 = document.createElement('span')
        span1.style.wordBreak = 'break-all'
        span1.style.textAlign = 'justify'
        const span2 = span1.cloneNode(true)
        p1.appendChild(span1)
        p1.appendChild(span2)
        this.setValue(object[property] as unknown as string)
        const watch = WatchJS.watch
        watch(object, property, () => {
            this.setValue(object[property] as unknown as string)
        });
    }
    private setText(text: string) {
        const span = this.div.querySelectorAll('span')[0]!
        span.textContent = text
        span.style.fontSize = '12px'
    }
    private setValue(value: string) {
        const span = this.div.querySelectorAll('span')[1]!
        span.textContent = value
        span.style.flex = '1'
        span.style.fontSize = '14px'
        span.style.fontWeight = 'bold'
        span.style.marginLeft = '10px'
        span.style.whiteSpace = 'nowrap'
        span.style.overflow = 'hidden'
        span.style.textOverflow = 'ellipsis'
    }
    get domElement() {
        return this.div
    }
    caption(title: string) {
        this.setText(title)
    }
}
