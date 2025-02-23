import { useViewer, useBehaviorSubject } from "../hooks";
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
    const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

    const statusButtons = [
        { code: 1, text: "В планах", color: "#ff4444" },
        { code: 2, text: "В процессе", color: "#ffaa00" },
        { code: 3, text: "Частичная установка", color: "#ffff00" },
        { code: 4, text: "Установлено", color: "#00ff00" },
    ];

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
        switch (status) {
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
                        {node.object.name || `Деталь здания ${node.object.id}`}
                    </span>


                </div>

                {hasChildren && isExpanded && (
                    <div style={{ marginTop: "2px" }}>
                        {node.children.map((child) => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        )
    }

    const highlightByStatus = (statusCode: number) => {
        if (selectedStatus === statusCode) {
            setSelectedStatus(null);
            viewer.clearHighlight();
            return;
        }

        setSelectedStatus(statusCode);
        if (viewer.model) {
            const objectsWithStatus: THREE.Object3D[] = [];
            viewer.model.traverse((child) => {
                if (child instanceof THREE.Mesh &&
                    child.userData?.propertyValue?.statusCode === statusCode) {
                    objectsWithStatus.push(child);
                }
            });

            viewer.highlightObjects(objectsWithStatus);
        }
    };

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
            minWidth: "400px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Конструкция здания</h3>

            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap'
            }}>
                {statusButtons.map(status => (
                    <button
                        key={status.code}
                        onClick={() => highlightByStatus(status.code)}
                        style={{
                            backgroundColor: selectedStatus === status.code
                                ? status.color
                                : 'transparent',
                            border: `1px solid ${status.color}`,
                            color: selectedStatus === status.code
                                ? '#000'
                                : status.color,
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: status.color
                        }} />
                        {status.text}
                    </button>
                ))}
            </div>

            {renderNode(hierarchy)}
        </div>
    )
}

export default ObjHierarchy;
