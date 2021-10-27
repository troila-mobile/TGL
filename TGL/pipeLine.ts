import * as THREE from "three"
import { BaseObject } from "."

export default class PipeLine {
    private pipeLine!: THREE.Mesh
    private textureNum!: number
    get pipeLineMesh() {
        return this.pipeLine
    }

    setOpacity(opacityNum: number) {
        let material: any = this.pipeLine.material;
        material.opacity = opacityNum;
    }

    load(startDevice: BaseObject, endDevice: BaseObject, lineName: string, scene: THREE.Scene) {
        this.creatLines(startDevice, endDevice, lineName, scene)
    }

    loadfFlowLine(startDevice: BaseObject, endDevice: BaseObject, lineName: string, scene: THREE.Scene) {
        this.creatLines(startDevice, endDevice, lineName, scene, true)
    }

    creatLines(startDevice: BaseObject, endDevice: BaseObject, lineName: string, scene: THREE.Scene, isFlow?: boolean) {
        const loader = new THREE.TextureLoader();
        const lineColor = lineName === 'A路' ? require('./assets/aLineType.png').default : require('./assets/bLineType.png').default
        loader.load(lineColor, (texture) => {
            const Vector3Array: THREE.Vector3[] = this.getPositions(startDevice, endDevice, lineName)

            var curve = new THREE.CatmullRomCurve3(Vector3Array, false, 'catmullrom', 0.01);

            var tubeGeometry = new THREE.TubeBufferGeometry(curve, 200, 0.1);
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            // 设置x方向的偏移(沿着管道路径方向)，y方向默认1
            //等价texture.repeat= new THREE.Vector2(20,1)
            texture.repeat.set(this.textureNum * 0.01 + 20, 1)
            texture.needsUpdate = true

            var tubeMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                color: 0xffffff,
            });

            // 设置数组材质对象作为网格模型材质参数
            let mesh = new THREE.Mesh(tubeGeometry, tubeMaterial); //网格模型对象Mesh
            // mesh.material.opacity = 0;
            this.pipeLine = mesh
            if (isFlow) {
                setInterval(() => {
                    texture.offset.x -= 0.1
                }, 100)
            }
            scene.add(this.pipeLine)
        }, undefined, (err) => {
            console.log("err=>>>>", err.error);
        })
    }



    getPositions(startDevice: BaseObject, endDevice: BaseObject, lineName: string) {

        let x1: number = Math.floor(startDevice.worldPosition.x * 100) / 100;
        let y1: number = Math.floor(startDevice.worldPosition.y * 100) / 100;
        let z1: number = Math.floor(startDevice.worldPosition.z * 100) / 100;

        let x2: number = Math.floor(endDevice.worldPosition.x * 100) / 100;
        let y2: number = Math.floor(endDevice.worldPosition.y * 100) / 100;
        let z2: number = Math.floor(endDevice.worldPosition.z * 100) / 100;
        let Vector3Array: THREE.Vector3[] = [];

        const lineNameNum = lineName === 'A路' ? 8 : 8;
        this.textureNum = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2)

        if (lineName === 'A路') {
            Vector3Array.push(new THREE.Vector3(x1, y1, z1))
            Vector3Array.push(new THREE.Vector3(x1, y1 - lineNameNum, z1))
            if (z1 !== z2) {
                Vector3Array.push(new THREE.Vector3(x1, y1 - lineNameNum, z2))
                if (x1 !== x2) {
                    Vector3Array.push(new THREE.Vector3(x2, y1 - lineNameNum, z2))
                }
            }
            Vector3Array.push(new THREE.Vector3(x2, y2 - lineNameNum, z2))
            Vector3Array.push(new THREE.Vector3(x2, y2, z2))
        } else {
            Vector3Array.push(new THREE.Vector3(x1, y1, z1))
            Vector3Array.push(new THREE.Vector3(x1, y1 + lineNameNum, z1))
            if (z1 !== z2) {
                Vector3Array.push(new THREE.Vector3(x1, y2 + lineNameNum, z1))
                if (x1 !== x2) {
                    Vector3Array.push(new THREE.Vector3(x2, y2 + lineNameNum, z1))
                }
            }
            Vector3Array.push(new THREE.Vector3(x2, y2 + lineNameNum, z2))
            Vector3Array.push(new THREE.Vector3(x2, y2, z2))
        }

        return Vector3Array
    }

}