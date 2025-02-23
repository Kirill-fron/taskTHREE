import { useViewer } from "../../hooks";
import React, { useEffect, useState } from "react";
import * as THREE from "three";

interface ObjHierarchyProps {
    object: THREE.Object3D;
    children: ObjHierarchyProps[];
}


const ObjHierarchy: React.FC = () => {
    const viewer = useViewer();
    const [hierarchy, setHierarchy] = useState<ObjHierarchyProps | null>(null);

    useEffect(() => {
        if (viewer.model) {
            const bildHierarchy = (object: THREE.Object3D): ObjHierarchyProps => {
                return {
                    object,
                    children: object.children.map((child) => bildHierarchy(child))
                }
            }

            setHierarchy(bildHierarchy(viewer.model));
        }
    }, [viewer.model])


    const objHendleClick = (object: THREE.Object3D) => {


        console.log("Select jbject", object.name || object.id)
    }


    const renderNode = (node: ObjHierarchyProps, level: number = 0) => (

        <div key={node.object.id} style={{ marginLeft: `${level * 20}px` }}>
            <div
                onClick={() => objHendleClick(node.object)}
                style={{
                    padding: "4px",
                    cursor: "pointer",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    marginBottom: "2px",
                    borderRadius: "4px",
                }}
            >
                {node.object.name || `Object_${node.object.id}`}
            </div>
            {node.children.map((child) => renderNode(child, level + 1))}

        </div>

    )

    if (!hierarchy) {
        return null
    }


    return (
        <div style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "16px",
            borderRadius: "8px",
            color: "white",
            maxHeight: "80vh",
            overflowY: "auto",
            minWidth: "200px"
        }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Obj Hierarchy</h3>
            {renderNode(hierarchy)}
        </div>
    )
}

export default ObjHierarchy
