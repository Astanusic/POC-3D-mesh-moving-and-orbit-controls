import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import {
  OrbitControls,
  MapControls,
} from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import KeyboardManager from './KeyboardManager'

export default class App {
  constructor(_options) {
    this.canvas = _options.canvas
    this.clock = new THREE.Clock()
    this.mouse = new THREE.Vector2()
    this.keyboard = new KeyboardManager({
      domElement: document,
    })
    this.cameraOffset = 150

    this.setRenderer()
    this.setPlane()
    this.setPlayer()
    this.setCamera()
    this.setLights()
    this.setObstacles()

    this.loop()

    window.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    window.addEventListener('mouseup', this.onMouseUp.bind(this), false)
  }

  setRenderer() {
    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.scene.background = new THREE.Color('lightblue')
    this.scene.fog = new THREE.FogExp2(0xc9c3f2, 0.001)
  }

  // setWorld() {
  //   this.player = {}
  //   this.player.start = 0

  //   this.world = new CANNON.World()
  //   this.world.gravity.set(0, -10, 0)
  //   this.world.broadphase = new CANNON.NaiveBroadphase()
  //   this.world.solver.iterations = 10

  //   this.player.shape = new CANNON.Box(new CANNON.Vec3(5, 5, 5))
  //   this.player.body = new CANNON.Body({
  //     mass: 1,
  //   })
  //   this.player.body.addShape(this.player.shape)
  //   this.player.body.position.set(0, 50, 0)
  //   this.player.body.angularFactor = new CANNON.Vec3(0, 1, 0)
  //   this.player.body.interpolatedPosition = new CANNON.Vec3(0, 5, 0)
  //   // this.player.body.KINEMATIC = 4
  //   console.log(this.player.body)
  //   // this.player.body.linearFactor = new CANNON.Vec3(1, 1, 0)

  //   this.world.addBody(this.player.body)

  //   this.planeBody = new CANNON.Body({
  //     mass: 0,
  //   })
  //   this.planeShape = new CANNON.Plane()
  //   this.planeBody.addShape(this.planeShape)
  //   this.planeBody.quaternion.setFromAxisAngle(
  //     new CANNON.Vec3(1, 0, 0),
  //     -Math.PI / 2
  //   )
  //   console.log(this.planeShape)
  //   cannonDebugger(this.scene, this.world.bodies)
  //   this.world.addBody(this.planeBody)
  // }

  setPlane() {
    this.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(10000, 10000),
      new THREE.MeshToonMaterial({ color: 'brown' })
    )

    this.plane.rotation.x = -Math.PI / 2
    this.plane.receiveShadow = true
    this.scene.add(this.plane)
  }

  setPlayer() {
    this.container = new THREE.Object3D()
    this.player = new THREE.Mesh(
      new THREE.BoxBufferGeometry(10, 30, 10),
      new THREE.MeshPhongMaterial({ color: 'orange', wireframe: false })
    )

    this.player.castShadow = true
    this.player.position.set(0, 5, 0)
    this.container.add(this.player)
    this.scene.add(this.container)
  }

  setCamera() {
    this.objCam = new THREE.Object3D()
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    this.camera2 = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    this.camera.position.set(0, 30, 50)
    this.camera.isFollow = true
    this.objCam.add(this.camera)
    this.scene.add(this.objCam)
    console.log(this.renderer)
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    )
    this.orbitControls.enableKeys = false
    this.orbitControls.enableZoom = false
    this.orbitControls.minDistance = 300
    this.orbitControls.maxDistance = 300
    this.orbitControls.minPolarAngle = Math.PI / 4
    this.orbitControls.maxPolarAngle = -Math.PI / 2
    this.orbitControls.rotateSpeed = 0.5
    // this.orbitControls.minAzimuthAngle = -Math.PI / 2
    // this.orbitControls.maxAzimuthAngle = Math.PI / 2

    console.log(this.orbitControls)
  }

  setLights() {
    this.ambLight = new THREE.AmbientLight()
    this.ambLight.intensity = 0.85
    this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02)
    this.hemiLight.intensity = 0.2

    this.dirLight = new THREE.DirectionalLight(0xffffff)
    this.dirLight.castShadow = true
    this.dirLight.position.set(-200, 400, -200)
    this.dirLight.castShadow = true
    this.dirLight.shadow.camera.top = 100
    this.dirLight.shadow.camera.bottom = -100
    this.dirLight.shadow.camera.left = -80
    this.dirLight.shadow.camera.right = 80

    this.helper = new THREE.CameraHelper(this.dirLight.shadow.camera)
    // this.scene.add(this.helper)

    this.scene.add(this.ambLight, this.hemiLight)

    this.light1 = new THREE.PointLight(0xffd790, 1, 50)
    this.light1.castShadow = true
    this.light1.add(
      new THREE.Mesh(
        new THREE.SphereBufferGeometry(1.2, 16, 8),
        new THREE.MeshStandardMaterial({
          emissive: 0xffffee,
          emissiveIntensity: 1,
          color: 0x000000,
        })
      )
    )
    this.light2 = new THREE.PointLight(0xffd790, 0.5, 10)
    this.light2.add(
      new THREE.Mesh(
        new THREE.SphereBufferGeometry(1.2, 16, 8),
        new THREE.MeshStandardMaterial({
          emissive: 0xffffee,
          emissiveIntensity: 1,
          color: 0x000000,
        })
      )
    )
    this.container2 = new THREE.Object3D()
    this.container2.add(this.light1)
    // this.scene.add(this.light1)
    // this.scene.add(this.light2)
    this.scene.add(this.container2)
  }
  setObstacles() {
    this.obstacles = []
    const obastaclesNb = 8
    const material = new THREE.MeshPhongMaterial({ color: 'grey' })

    for (let i = 0; i < obastaclesNb; i++) {
      const obsMesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(
          Math.ceil(Math.random() * 500),
          Math.ceil(Math.random() * 500),
          Math.ceil(Math.random() * 500)
        ),
        material
      )
      obsMesh.receiveShadow = true
      obsMesh.position.set(
        Math.ceil(Math.random() * 800) * (Math.round(Math.random()) ? 1 : -1),
        10,
        Math.ceil(Math.random() * 800) * (Math.round(Math.random()) ? 1 : -1)
      )

      console.log(obsMesh)
      this.scene.add(obsMesh)
    }
  }

  onMouseDown(e) {
    // e.preventDefault()
    console.log(e.which)
    this.camera.isFollow = !this.camera.isFollow
    console.log('mouse down camera', this.camera.isFollow)
    console.log('mouse downzd orbit', this.orbitControls)

    // if (e.which === 1) {
    //   this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1
    //   this.mouse.y =
    //     -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1

    //   this.raycaster.setFromCamera(this.mouse, this.camera)

    //   const intersects = this.raycaster.intersectObjects(this.scene.children)

    //   if (intersects.length > 0) {
    //     this.movements.push(intersects[0].point)
    //     console.log(this.movements)
    //   }
    // }
  }
  onMouseUp(e) {
    e.preventDefault()
    this.camera.isFollow = !this.camera.isFollow
    console.log('mouse up', this.camera.isFollow)

    // if (e.which === 1) {
    //   this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1
    //   this.mouse.y =
    //     -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1

    //   this.raycaster.setFromCamera(this.mouse, this.camera)

    //   const intersects = this.raycaster.intersectObjects(this.scene.children)

    //   if (intersects.length > 0) {
    //     this.movements.push(intersects[0].point)
    //     console.log(this.movements)
    //   }
    // }
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this))
    const delta = this.clock.getDelta()

    this.orbitControls.update()
    // this.camera.position.set(
    //   this.player.position.x,
    //   this.player.position.y + this.cameraOffset + 200,
    //   this.player.position.z + this.cameraOffset + 200
    // )
    // this.camera.position.copy(this.player.position)
    this.clone = this.player.position.clone()

    this.container2.position.copy(this.clone)
    // this.camera.position.copy(this.player.position)
    this.orbitControls.target = new THREE.Vector3(
      this.player.position.x,
      this.player.position.y,
      this.player.position.z
    )
    this.light1.position.set(10, 20, 0)
    this.light2.position.set(
      this.player.position.x,
      this.player.position.y,
      this.player.position.z
    )

    // this.container2.rotation.y += 0.005
    this.container2.rotation.y += 0.004

    if (this.keyboard.pressed('z')) {
      this.player.translateZ(50 * -delta)
      // this.player.translateZ(-testDist)
    }
    if (this.keyboard.pressed('shift+z')) {
      this.player.translateZ(80 * -delta)
      // this.player.translateZ(-testDist)
    }
    if (this.keyboard.pressed('s')) {
      this.player.translateZ(50 * delta)
    }
    if (this.keyboard.pressed('q')) {
      // this.player.translateX(30 * -delta)
      this.player.rotation.y += delta * 3

      // this.player.body.quaternion.setFromAxisAngle(
      //   new CANNON.Vec3(0, 1, 0),
      //   this.player.start
      // )
    }
    if (this.keyboard.pressed('d')) {
      // this.player.translateX(30 * delta)
      this.player.rotation.y -= delta * 3

      // this.player.translateZ(testDist)
    }

    // this.camera.updateProjectionMatrix()

    this.renderer.render(this.scene, this.camera)
  }
}
