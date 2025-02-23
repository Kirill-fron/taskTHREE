import { useViewer, useBehaviorSubject } from "../../hooks";
import React, { useEffect, useState } from "react";
import * as THREE from "three";

interface ObjHierarchyProps {
    object: THREE.Object3D;
    children: ObjHierarchyProps[];
}

const ObjHierarchy: React.FC = () => {
    const viewer = useViewer();
    const status = useBehaviorSubject(viewer.status);
    const [hierarchy, setHierarchy] = useState<ObjHierarchyProps | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (viewer.model && status === 'idle') {
            const buildHierarchy = (object: THREE.Object3D): ObjHierarchyProps => {
                return {
                    object,
                    children: object.children.map((child) => buildHierarchy(child))
                }
            }
            setHierarchy(buildHierarchy(viewer.model));
            setExpandedNodes(new Set([viewer.model.id]));
        }
    }, [viewer.model, status]);

    const objHandleClick = (object: THREE.Object3D, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedId(object.id);
        viewer.highlightObject(object);
    }

    const toggleNode = (nodeId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        const newExpandedNodes = new Set(expandedNodes);
        if (newExpandedNodes.has(nodeId)) {
            newExpandedNodes.delete(nodeId);
        } else {
            newExpandedNodes.add(nodeId);
        }
        setExpandedNodes(newExpandedNodes);
    }

    const getStatusColor = (object: THREE.Object3D) => {
        const status = object.userData?.propertyValue?.statusCode;
        switch(status) {
            case 1: return "#ff4444";
            case 2: return "#ffaa00";
            case 3: return "#ffff00";
            case 4: return "#00ff00";
            default: return "#ffffff";
        }
    }

    const renderNode = (node: ObjHierarchyProps, level: number = 0) => {
        const isSelected = selectedId === node.object.id;
        const isExpanded = expandedNodes.has(node.object.id);
        const hasChildren = node.children.length > 0;

        return (
            <div key={node.object.id} style={{ marginLeft: `${level * 20}px`, marginBottom: "2px" }}>
                <div
                    onClick={(e) => objHandleClick(node.object, e)}
                    style={{
                        padding: "4px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        transition: "all 1s",
                        border: isSelected ? "1px solid rgba(255, 255, 255, 0.5)" : "1px solid transparent",
                    }}
                >
                    {hasChildren && (
                        <button 
                            onClick={(e) => toggleNode(node.object.id, e)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "white",
                                padding: "0 8px",
                                cursor: "pointer",
                                fontSize: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "transform 0.2s",
                                transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)"
                            }}
                        >
                            ▼
                        </button>
                    )}
                    
                    <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: getStatusColor(node.object),
                        marginRight: "8px"
                    }} />
                    
                    <span style={{ flexGrow: 1 }}>
                        {node.object.name || `Object_${node.object.id}`}
                    </span>
                    
                    {node.object.userData?.propertyValue && (
                        <span style={{
                            marginLeft: "auto",
                            fontSize: "0.8em",
                            opacity: 0.7
                        }}>
                            {node.object.userData.propertyValue.statusText}
                        </span>
                    )}
                </div>
                
                {hasChildren && isExpanded && (
                    <div style={{ marginTop: "2px" }}>
                        {node.children.map((child) => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    if (!hierarchy || status === 'loading' || status === 'error') {
        return null;
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
            minWidth: "300px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Object Hierarchy</h3>
            {renderNode(hierarchy)}
        </div>
    )
}

export default ObjHierarchy;
