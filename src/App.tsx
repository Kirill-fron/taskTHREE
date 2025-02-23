import "./App.css";
import Loading from "./components/loading";
import ViewerComponent from "./components/viewer-component";
import ObjHierarchy from "./components/objHierarchy";
function App() {
  return (
    <>
      <ViewerComponent>
        <Loading />
        <ObjHierarchy />
      </ViewerComponent>
    </>
  );
}

export default App;
