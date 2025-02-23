import Viewer from "../viewer";

class ResizeHandler {
  public static setup(viewer: Viewer) {
    window.addEventListener("resize", () => this.onResize(viewer));
  }

  public static cleanup(viewer: Viewer) {
    window.removeEventListener("resize", () => this.onResize(viewer));
  }

  private static onResize(viewer: Viewer) {
    viewer.camera.aspect = window.innerWidth / window.innerHeight;
    viewer.camera.updateProjectionMatrix();
    viewer.updateViewer();
  }
}

export default ResizeHandler;