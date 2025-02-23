import "./App.css";
import Loading from "./components/loading";
import ViewerComponent from "./components/viewer-component";
import ObjHierarchy from "./components/obj-hierarchy/ObjHierarchy";

function App() {
  return (
    <>
      <ViewerComponent>
        <Loading />
        {/* 
          TODO Создай здесь виджет
          виджет должен отображать иерархию THREE.Object3D в переменной viewer.model 
          клик по объекту иерархии должен хайлатить объект во вьювере
          */}
        <ObjHierarchy />
      </ViewerComponent>
    </>
  );
}

export default App;
