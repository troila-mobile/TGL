import * as THREE from "three"

export default class PipeLineInFloor {
    private pipeLine!: THREE.Mesh

    get pipeLineMesh() {
        return this.pipeLine
    }

    setOpacity(opacityNum: number) {
        let material: any = this.pipeLine.material;
        material.opacity = opacityNum;
    }

    loadLine(startDevice: THREE.Vector3, endDevice: THREE.Vector3, lineName: string, scene: THREE.Scene, startDeviceId?: string) {
        const loader = new THREE.TextureLoader();
        const lineColor = lineName === 'A路' ? require('./assets/aLineType.png').default : require('./assets/bLineType.png').default
        loader.load(lineColor, (texture) => {
            const Vector3Array: THREE.Vector3[] = this.getPositions(startDevice, endDevice, lineName, startDeviceId)
            this.drawLinesWithFlow(Vector3Array, texture, scene)
        }, undefined, (err) => {
            console.log("err=>>>>", err.error);
        })
    }

    loadFlowLine(startDevice: THREE.Vector3, endDevice: THREE.Vector3, lineName: string, scene: THREE.Scene) {
        const loader = new THREE.TextureLoader();
        const lineColor = lineName === 'A路' ? require('./assets/aLineType.png').default : require('./assets/bLineType.png').default
        loader.load(lineColor, (texture) => {
            const Vector3Array: THREE.Vector3[] = this.getPositions(startDevice, endDevice, lineName)
            this.drawLinesWithFlow(Vector3Array, texture, scene, true)
        }, undefined, (err) => {
            console.log("err=>>>>", err.error);
        })
    }

    drawLinesWithFlow(Vector3Array: THREE.Vector3[], texture: THREE.Texture, scene: THREE.Scene, isFlow?: boolean) {
        let curve = new THREE.CatmullRomCurve3(Vector3Array, false, 'catmullrom', 0.1);
        let tubeGeometry = new THREE.TubeBufferGeometry(curve, 200, 0.1);
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        // 设置x方向的偏移(沿着管道路径方向)，y方向默认1
        //等价texture.repeat= new THREE.Vector2(20,1)
        texture.repeat.set(40, 1)
        texture.needsUpdate = true

        let tubeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            color: 0xffffff,
        });

        // 设置数组材质对象作为网格模型材质参数
        let mesh = new THREE.Mesh(tubeGeometry, tubeMaterial); //网格模型对象Mesh
        // mesh.material.opacity = 0;
        this.pipeLine = mesh
        scene.add(this.pipeLine)
        if (isFlow) {
            setInterval(() => {
                texture.offset.x -= 0.1
            }, 100)
        }
    }

    getPositions(startDevice: THREE.Vector3, endDevice: THREE.Vector3, lineName: string, startDeviceId?: string) {
        let x1: number = Math.floor(startDevice.x * 100) / 100;
        let y1: number = Math.floor(startDevice.y * 100) / 100;
        let z1: number = Math.floor(startDevice.z * 100) / 100;

        let x2: number = Math.floor(endDevice.x * 100) / 100;
        let y2: number = Math.floor(endDevice.y * 100) / 100;
        let z2: number = Math.floor(endDevice.z * 100) / 100;

        if (startDeviceId === '1_94') {
            x2 -= 20
            z2 += 10
        } else if (startDeviceId === '1_95') {
            x2 -= 18
            z2 += 10
        } else if (startDeviceId === '1_96') {
            x2 -= 19
            z2 += 10
        } else if (startDeviceId === '1_97') {
            x2 -= 17
            z2 += 10
        }

        let Vector3Array: THREE.Vector3[] = [];

        const lineNameNum = lineName === 'A路' ? 5 : 5;

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