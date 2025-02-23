import * as THREE from "three";
import CameraControls from "camera-controls";
import * as uuid from "uuid";
import * as RX from "rxjs";
import ModelLoader from "./divisionAnswers/ModelLoader";
import LightManager from "./divisionAnswers/LightManager";
import HighlightManager from "./divisionAnswers/HighlightManager";
import ResizeHandler from "./divisionAnswers/ResizeHandler";

CameraControls.install({ THREE });

export type ViewerStatus = "loading" | "error" | "idle";

class Viewer {
  public id: string;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public model: THREE.Object3D | undefined;
  public status = new RX.BehaviorSubject<ViewerStatus>("idle");

  private _renderer: THREE.WebGLRenderer;
  private _cameraControl: CameraControls;
  private _renderNeeded = true;
  private _clock = new THREE.Clock();
  private _highlightManager: HighlightManager;
  private _modelLoader: ModelLoader;

  constructor(container: HTMLDivElement) {
    this.id = uuid.v4();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#333333");

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(10, 10, 10);

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this._renderer.domElement);

    this._cameraControl = new CameraControls(this.camera, this._renderer.domElement);
    this._cameraControl.dollyToCursor = true;
    this._cameraControl.dollySpeed = 0.4;
    this._cameraControl.draggingSmoothTime = 0;
    this._cameraControl.smoothTime = 0;
    this._cameraControl.mouseButtons.right = CameraControls.ACTION.ROTATE;
    this._cameraControl.mouseButtons.left = CameraControls.ACTION.NONE;

    this._highlightManager = new HighlightManager(() => this.updateViewer());
    this._modelLoader = new ModelLoader();
    
    LightManager.setupLights(this.scene);
    
    ResizeHandler.setup(this);

    this.loadModel();
    this.updateViewer();
  }

  private async loadModel() {
    this.status.next("loading");
    try {
      const object3d = await this._modelLoader.loadModel();
      if (object3d) {
        object3d.rotateX(-Math.PI / 2);
        this.scene.add(object3d);
        const boundingBox = new THREE.Box3().setFromObject(object3d);
        this._cameraControl.fitToBox(boundingBox, false);
        this.model = object3d;
        this.status.next("idle");
      } else {
        this.status.next("error");
      }
    } catch {
      this.status.next("error");
    }
  }

  public updateViewer() {
    this._renderNeeded = true;
    this._render();
  }

  private _render = () => {
    const clockDelta = this._clock.getDelta();
    const hasControlsUpdated = this._cameraControl.update(clockDelta);

    if (hasControlsUpdated || this._renderNeeded) {
      this._renderer.render(this.scene, this.camera);
      this._renderNeeded = false;
    }

    window.requestAnimationFrame(this._render);
  };

  public highlightObject(object: THREE.Object3D) {
    this._highlightManager.highlightObjects([object]);
  }

  public highlightObjects(objects: THREE.Object3D[]) {
    this._highlightManager.highlightObjects(objects);
  }

  public clearHighlight() {
    this._highlightManager.clearHighlight();
  }

  public dispose() {
    ResizeHandler.cleanup(this);
    this._renderer.domElement.remove();
    this._renderer.dispose();
    this._cameraControl.dispose();
    this.scene.clear();
    this._renderNeeded = false;
  }
}

export default Viewer;


