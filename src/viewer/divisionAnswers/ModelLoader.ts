import * as THREE from "three";
import axios from "axios";
import parseJSON, { findThreeJSJSON } from "../../utils/parse-json";

class ModelLoader {
  private readonly MODEL_URL =
    "https://storage.yandexcloud.net/lahta.contextmachine.online/files/pretty_ceiling_props.json";

  public async loadModel(): Promise<THREE.Object3D | null> {
    try {
      const response = await axios.get(this.MODEL_URL, {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Expires: "0" },
      });
      const jsonObject = findThreeJSJSON(response.data);
      if (jsonObject) {
        const object3d = await parseJSON(jsonObject);
        this.assignPropertyValues(object3d);
        return object3d;
      }
      return null;
    } catch (error) {
      console.error("Failed to load model", error);
      return null;
    }
  }

  private assignPropertyValues(object: THREE.Object3D) {
    let counter = 1;
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const progressStatuses: Record<number, string> = {
          1: "В планах",
          2: "В процессе",
          3: "Частичная установка",
          4: "Установлено",
        };
        const statusIndex = (child.id % 4) + 1;
        child.name = `Деталь здания ${counter} (${progressStatuses[statusIndex]})`;
        counter++;
        child.userData.propertyValue = {
          statusCode: statusIndex,
          statusText: progressStatuses[statusIndex],
        };
      }
    });
  }
}

export default ModelLoader;