import * as THREE from "three"

export default class HomeParkAnimator {
    homePark!: THREE.Object3D      //对动画对象的引用

    clock?: THREE.Clock | null
    mixer?: THREE.AnimationMixer | null

    constructor(homePark: THREE.Object3D) {
        console.log('homePark', homePark)
        const mixer = new THREE.AnimationMixer(homePark);
        homePark.animations.forEach(obj => {
            let runAction = mixer.clipAction(obj);
            runAction.play()
        })

        this.homePark = homePark
        this.clock = new THREE.Clock();
        this.mixer = mixer
    }

    //首页动态效果动画循环
    updateHomeParkAnimations() {
        this.updateHomeModeAnimations()
        this.updateHomeTextureAnimations()
    }

    //首页模型动画
    updateHomeModeAnimations() {
        this.mixer && this.clock && this.mixer.update(this.clock.getDelta())
    }

    //首页纹理动画
    updateHomeTextureAnimations() {
        this.homePark.children.forEach((item) => {
            //移动变化动画
            if (item.children.length > 0) {
                item.children.forEach(obj => {
                    if (obj instanceof THREE.Mesh && obj.material) {
                        if (obj.material.map && obj.material.map.name) {
                            // console.log('map.name', obj.material.name)
                            let map = obj.material.map
                            let types = obj.material.name.split('-')
                            if (types[1] && types[1] === '1') {
                                let dir = types[2]
                                let rate = types[3] ? parseFloat(types[3]) : 2
                                if (dir === '1') {
                                    map.offset.x -= 0.001 * rate  //1表示-x, 2表示-y, 3表示x, 4表示y
                                } else if (dir === '2') {
                                    map.offset.y -= 0.001 * rate
                                } else if (dir === '3') {
                                    map.offset.x += 0.001 * rate
                                } else if (dir === '4') {
                                    map.offset.y += 0.001 * rate
                                }
                            }
                        }
                    }
                })
            }else {
                if (item instanceof THREE.Mesh && item.material) {
                    if (item.material.map && item.material.name) {
                        let map = item.material.map
                        let types = item.material.name.split('-')
                        if (types[1] && types[1] === '1') {
                            let dir = types[2]
                            let rate = types[3] ? parseFloat(types[3]) : 2
                            if (dir === '1') {
                                map.offset.x -= 0.001 * rate  //1表示-x, 2表示-y, 3表示x, 4表示y
                            } else if (dir === '2') {
                                map.offset.y -= 0.001 * rate
                            } else if (dir === '3') {
                                map.offset.x += 0.001 * rate
                            } else if (dir === '4') {
                                map.offset.y += 0.001 * rate
                            }
                        }
                    }
                }
            }
        })


    }
}