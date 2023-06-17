import * as THREE from 'three'
import Experience from './Experience.js'

import VirtualScroll from 'virtual-scroll'

import red from "../../public/assets/matcap-red.jpg";
import green from "../../public/assets/matcap-green.jpg";
import blue from "../../public/assets/matcap-blue.jpg";

import bg_red from "../../public/assets/bg-red.jpg";
import bg_green from "../../public/assets/bg-green.jpg";
import bg_blue from "../../public/assets/bg-blue.jpg";

import vertex from "./Shader/canvas/vertex.glsl";
import fragment from "./Shader/canvas/fragment.glsl";

export default class Renderer {
	constructor(_options = {}) {
		this.experience = new Experience()
		this.config = this.experience.config
		this.debug = this.experience.debug
		this.stats = this.experience.stats
		this.time = this.experience.time
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.camera = this.experience.camera.instance

    this.scenes = [
      {
        bg: bg_red,
        matcap: red,
        geometry: new THREE.BoxGeometry(0.1, 0.1, 0.1)
      }, 
      {
        bg: bg_green,
        matcap: green,
        geometry: new THREE.TorusGeometry(0.1, 0.01, 16, 100)
      }, 
      {
        bg: bg_blue,
        matcap: blue,
        geometry: new THREE.SphereGeometry(0.05, 32, 32)
      }
    ]

		this.postScene = new THREE.Scene()

		let fustumSize = 1
		let aspect = 1
		this.postCamera = new THREE.OrthographicCamera(
			fustumSize * aspect / -2,
			fustumSize * aspect / 2,
			fustumSize / 2,
			fustumSize / -2,
			-1000,
			1000
		)

		this.current = 0;
		this.currentState = 0;
		this.scroller = new VirtualScroll();
		this.scroller.on(e => {
			this.currentState -= e.deltaY / 10000;
			this.currentState = (this.currentState + 3000) % 3;
		})


		// Debug
		if (this.debug) {
			this.debugFolder = this.debug.addFolder('renderer')
		}



		this.setInstance()
		this.initPost();

    this.scenes.forEach((o, index) => {
      o.scene = this.createScene(o.bg, o.matcap, o.geometry)
      this.instance.compile(o.scene, this.camera)
      o.target = new THREE.WebGLRenderTarget(this.config.width, this.config.height)
    })
	}

	setInstance() {
		this.clearColor = '#010101'

		// Renderer
		this.instance = new THREE.WebGLRenderer({
			alpha: false,
			antialias: true
		})
		this.instance.domElement.style.position = 'absolute'
		this.instance.domElement.style.top = 0
		this.instance.domElement.style.left = 0
		this.instance.domElement.style.width = '100%'
		this.instance.domElement.style.height = '100%'

		// this.instance.setClearColor(this.clearColor, 0)
		this.instance.setSize(this.config.width, this.config.height)
		this.instance.setPixelRatio(this.config.pixelRatio)

		this.instance.physicallyCorrectLights = true
		// this.instance.gammaOutPut = true
		this.instance.outputColorSpace = THREE.SRGBColorSpace
		// this.instance.shadowMap.type = THREE.PCFSoftShadowMap
		// this.instance.shadowMap.enabled = false
		this.instance.toneMapping = THREE.NoToneMapping
		this.instance.toneMappingExposure = 1

		this.context = this.instance.getContext()

		// Add stats panel
		if (this.stats) {
			this.stats.setRenderPanel(this.context)
		}

		// Debug
		if (this.debug) {
			this.debugFolder
				.addColor(
					this,
					'clearColor'
				)
				.onChange(() => {
					this.instance.setClearColor(this.clearColor)
				})

			this.debugFolder
				.add(
					this.instance,
					'toneMapping',
					{
						'NoToneMapping': THREE.NoToneMapping,
						'LinearToneMapping': THREE.LinearToneMapping,
						'ReinhardToneMapping': THREE.ReinhardToneMapping,
						'CineonToneMapping': THREE.CineonToneMapping,
						'ACESFilmicToneMapping': THREE.ACESFilmicToneMapping
					}
				)
				.onChange(() => {
					this.scene.traverse((_child) => {
						if (_child instanceof THREE.Mesh)
							_child.material.needsUpdate = true
					})
				})

			this.debugFolder
				.add(
					this.instance,
					'toneMappingExposure'
				)
				.min(0)
				.max(10)
		}
	}

  createScene(background, matcap, geometry) {
    let scene = new THREE.Scene()

		let bgTexture = new THREE.TextureLoader().load(background)
    scene.background = bgTexture;

    let material = new THREE.MeshMatcapMaterial({ 
      matcap: new THREE.TextureLoader().load(matcap),
    })

    let mesh = new THREE.Mesh(geometry, material)

    for(let i = 0; i < 300; i++) {
      let random = new THREE.Vector3().randomDirection()
      let clone = mesh.clone()
      clone.position.copy(random.multiplyScalar(1))
      clone.rotation.x = Math.random() * Math.PI * 2
      clone.rotation.y = Math.random() * Math.PI * 2
      scene.add(clone)
    }

    return scene
  }

	initPost() {
		this.material = new THREE.ShaderMaterial({
			side: THREE.DoubleSide,
			uniforms: {
				uTexture1: { value: new THREE.TextureLoader().load(bg_red) },
				uTexture2: { value: new THREE.TextureLoader().load(bg_green) },
				progress: { value: 0 },
				time: { value: 0 },
			},
			vertexShader: vertex,
			fragmentShader: fragment,
		})

		// Debug
		if (this.debug) {
			this.debugFolder
				.add(
					this.material.uniforms.progress,
					'value'
				)
				.min(0)
				.max(1)
		}

		let quad = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1),
			this.material
		)

		this.postScene.add(quad)
	}

	resize() {
		// Instance
		this.instance.setSize(this.config.width, this.config.height)
		this.instance.setPixelRatio(this.config.pixelRatio)

		// Post process
		this.postProcess.composer.setSize(this.config.width, this.config.height)
		this.postProcess.composer.setPixelRatio(this.config.pixelRatio)
	}

	update() {
		if (this.stats) {
			this.stats.beforeRender()
		}

		if (!this.material) return

		this.current = Math.floor(this.currentState)
		this.next = Math.floor((this.current + 1) % this.scenes.length)
		this.progress = this.currentState % 1

		console.log(this.current, this.next, this.progress)

		this.instance.setRenderTarget(this.scenes[this.current].target)
		this.instance.render(this.scenes[this.current].scene, this.camera)

		this.instance.setRenderTarget(this.scenes[this.next].target)
		this.instance.render(this.scenes[this.next].scene, this.camera)

		this.instance.setRenderTarget(null)

		this.material.uniforms.uTexture1.value = this.scenes[this.current].target.texture;
		this.material.uniforms.uTexture2.value = this.scenes[this.next].target.texture;
		this.material.uniforms.progress.value = this.progress;
		this.material.uniforms.time.value = this.time.elapsed * 0.005;

		// update scenes
		this.scenes.forEach((o, index) => {
			o.scene.rotation.x = this.time.elapsed * 0.0005
			o.scene.rotation.y = this.time.elapsed * 0.0005
		})

		this.instance.render(this.postScene, this.postCamera)


		if (this.stats) {
			this.stats.afterRender()
		}
	}

	destroy() {
		this.instance.renderLists.dispose()
		this.instance.dispose()
		this.renderTarget.dispose()
		this.postProcess.composer.renderTarget1.dispose()
		this.postProcess.composer.renderTarget2.dispose()
	}
}