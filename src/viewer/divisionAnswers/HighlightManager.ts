import * as THREE from "three";

class HighlightManager {
  private _originalMaterials = new Map<THREE.Mesh, THREE.Material>();
  private _highlightedMeshes: THREE.Mesh[] = [];
  private _updateViewer: () => void;

  constructor(updateViewer: () => void) {
    this._updateViewer = updateViewer;
  }

  public highlightObjects(objects: THREE.Object3D[]) {
    this.clearHighlight();
    objects.forEach((object) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this._originalMaterials.set(child, child.material);
          const statusCode = child.userData.propertyValue?.statusCode || 1;
          const color = this.getStatusColor(statusCode);
          child.material = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7,
          });
          this._highlightedMeshes.push(child);
        }
      });
    });
    this._updateViewer();
  }

  public clearHighlight() {
    this._highlightedMeshes.forEach((mesh) => {
      if (this._originalMaterials.has(mesh)) {
        mesh.material = this._originalMaterials.get(mesh)!;
      }
    });
    this._highlightedMeshes = [];
    this._originalMaterials.clear();
    this._updateViewer();
  }

  private getStatusColor(statusCode: number) {
    switch (statusCode) {
      case 1: return 0xff4444;
      case 2: return 0xffaa00;
      case 3: return 0xffff00;
      case 4: return 0x00ff00;
      default: return 0xffffff;
    }
  }
}

export default HighlightManager;