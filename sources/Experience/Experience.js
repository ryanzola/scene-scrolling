import * as THREE from "three";
import GUI from "lil-gui";

import Time from "./Utils/Time.js";
import Sizes from "./Utils/Sizes.js";
import Stats from "./Utils/Stats.js";

import Resources from "./Resources.js";
import Renderer from "./Renderer.js";
import Camera from "./Camera.js";
import World from "./World.js";

import assets from "./assets.js";

import red from "../../public/assets/matcap-red.jpg";
import green from "../../public/assets/matcap-green.jpg";
import blue from "../../public/assets/matcap-blue.jpg";

import bg_red from "../../public/assets/bg-red.jpg";
import bg_green from "../../public/assets/bg-green.jpg";
import bg_blue from "../../public/assets/bg-blue.jpg";

export default class Experience {
  static instance;

  constructor(_options = {}) {
    if (Experience.instance) {
      return Experience.instance;
    }
    Experience.instance = this;

    // Options
    this.targetElement = _options.targetElement;

    if (!this.targetElement) {
      console.warn("Missing 'targetElement' property");
      return;
    }

    this.scenes = [
      {
        bg: bg_red,
        matcap: red
      }, 
      {
        bg: bg_green,
        matcap: green
      }, 
      {
        bg: bg_blue,
        matcap: blue
      }
    ]

    this.time = new Time();
    this.sizes = new Sizes();
    this.setConfig();
    this.setDebug();
    this.setStats();
    this.setScene();
    this.setCamera();
    this.setRenderer();
    this.setResources();
    this.setWorld();

    this.sizes.on("resize", () => {
      this.resize();
    });

    this.update();
  }

  setConfig() {
    this.config = {};

    // Debug
    this.config.debug = window.location.hash === "#debug";

    // Pixel ratio
    this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);

    // Width and height
    const boundings = this.targetElement.getBoundingClientRect();
    this.config.width = boundings.width;
    this.config.height = boundings.height || window.innerHeight;
  }

  setDebug() {
    if (this.config.debug) {
      this.debug = new GUI();
    }
  }

  setStats() {
    if (this.config.debug) {
      this.stats = new Stats(true);
    }
  }

  createScene({ color = 'blue'}) {
    const scenes = {
      red: {
        bg: bg_red,
        matcap: red
      },
      green: {
        bg: bg_green,
        matcap: green
      },
      blue: {
        bg: bg_blue,
        matcap: blue
      }
    }


    let scene = new THREE.Scene()
    scene.background = new THREE.TextureLoader().load(scenes[color].bg)

    let material = new THREE.MeshMatcapMaterial({ 
      matcap: new THREE.TextureLoader().load(scenes[color].matcap)
    })
    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
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

  setScene() {
    this.scene = this.createScene({ color: 'green'});
  }

  setCamera() {
    this.camera = new Camera();
  }

  setRenderer() {
    this.renderer = new Renderer({ rendererInstance: this.rendererInstance });

    this.targetElement.appendChild(this.renderer.instance.domElement);
  }

  setResources() {
    this.resources = new Resources(assets);
  }

  setWorld() {
    // this.world = new World();
  }

  update() {
    if (this.stats) this.stats.update();

    this.camera.update();

    if (this.world) this.world.update();

    if (this.renderer) this.renderer.update();

    window.requestAnimationFrame(() => {
      this.update();
    });
  }

  resize() {
    // Config
    const boundings = this.targetElement.getBoundingClientRect();
    this.config.width = boundings.width;
    this.config.height = boundings.height;

    this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);

    if (this.camera) this.camera.resize();

    if (this.renderer) this.renderer.resize();

    if (this.world) this.world.resize();
  }

  destroy() {}
}
