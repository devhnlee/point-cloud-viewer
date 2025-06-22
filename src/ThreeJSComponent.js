import { useState, useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { PLYLoader } from "three/addons/loaders/PLYLoader.js"
import { gsap } from "gsap"

export default function ThreeJSComponent() {
    const containerRef = useRef(null)
    const iframeRef = useRef(null)
    const cameraRef = useRef(null)
    const domain = "https://novel-head-392156.framer.app/"
    const iframeVisible = useRef(true)
    const [hotspotVisible, setHotspotVisible] = useState(false);
    const [hotspots, setHotspots] = useState([]);

    let hoveredObject = null;
    let selectedObject = null;

    const moveCamera = (targetVec3, objectVec3) => {
        if (cameraRef.current) {
            const camera = cameraRef.current;
            const distance = camera.position.distanceTo(targetVec3);
            const baseDuration = 2;
            const speedFactor = 0.2;
            const duration = baseDuration + distance * speedFactor;

            gsap.to(camera.position, {
                x: targetVec3.x,
                y: targetVec3.y,
                z: targetVec3.z,
                duration,
                ease: "power2.inOut",
                onUpdate: () => {
                    camera.lookAt(objectVec3);
                    camera.updateProjectionMatrix();
                }
            });
        }
    };

    const addHotspot = (label, worldPosition, viewPosition) => {
        setHotspots((prev) => [
        ...prev,
        {
            label,
            worldPosition,
            viewPosition,
            screenPosition: { x: 0, y: 0 },
            hovered: false,
            labelHovered: false,
        },
        ]);
    };

    const setAxonView = () => {
        iframeVisible.current = false
        setHotspotVisible(true)
        moveCamera(new THREE.Vector3(3.16, 3.25, 3.2), new THREE.Vector3(0, 0, 0))
    }

    useEffect(() => {
        if (!containerRef.current || containerRef.current.querySelector("canvas")) return; // TODO: need to remove this guard before deployment

        // const loadPLYLoader = async () => {
        //     const { PLYLoader } = await import(
        //         "https://unpkg.com/three@0.152.2/examples/jsm/loaders/PLYLoader.js"
        //     )
        //     return PLYLoader
        // }

        const init = async () => {
            // const PLYLoader = await loadPLYLoader()

            const scene = new THREE.Scene()

            const light = new THREE.SpotLight()
            light.position.set(500, 500, 500)
            light.intensity = 3
            scene.add(light)

            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.001,
                100000
            )
            camera.position.set(1.26, 2.84, -0.065)
            camera.rotation.set(0.785, 0.11, -0.11)
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({ antialias: true })
            renderer.setSize(window.innerWidth, window.innerHeight)

            const container = containerRef.current
            container.appendChild(renderer.domElement)

            const controls = new OrbitControls(camera, renderer.domElement)
            controls.enableDamping = true

            const raycaster = new THREE.Raycaster()
            const mouse = new THREE.Vector2()

            const models = []

            const loadModel = (path, position, redirectPath = "") => {
                const loader = new PLYLoader()
                loader.load(path, (geometry) => {
                    const material = new THREE.PointsMaterial({
                        size: 0.01,
                        vertexColors: true,
                        transparent: true,
                    })
                    const object = new THREE.Points(geometry, material)
                    object.position.copy(position)
                    object.userData.redirectPath = redirectPath
                    scene.add(object)
                    models.push(object)
                })
            }

            // Load multiple models
            loadModel(
                "https://raw.githubusercontent.com/Fredge69/CoAl_Website/main/street_PC.ply",
                new THREE.Vector3(0, 0, 0),
                ""
            )
            loadModel(
                "https://raw.githubusercontent.com/Fredge69/CoAl_Website/main/spatial wellness_PC.ply",
                new THREE.Vector3(0, 0, 0),
                "spatialwellness"
            )
            loadModel(
                "https://raw.githubusercontent.com/Fredge69/CoAl_Website/main/osbm_PC.ply",
                new THREE.Vector3(0, 0, 0),
                "obsm"
            )
            loadModel(
                "https://raw.githubusercontent.com/Fredge69/CoAl_Website/main/easy pair_PC.ply",
                new THREE.Vector3(0, 0, 0),
                "easypair"
            )
            loadModel(
                "https://raw.githubusercontent.com/Fredge69/CoAl_Website/main/living archive_PC.ply",
                new THREE.Vector3(0, 0, 0),
                "livingarchive"
            )

            const hotspotList = [
            { label: "spatial wellness", worldPosition: new THREE.Vector3(-0.6, 0.75, -1.25), viewPosition: new THREE.Vector3(-0.54, 0.74, -3.58) },
            { label: "obsm", worldPosition: new THREE.Vector3(0.8, -0.5, 2.3), viewPosition: new THREE.Vector3(0.1, 0.69, 0.326) },
            { label: "easy pair", worldPosition: new THREE.Vector3(-4, 1.55, 0), viewPosition: new THREE.Vector3(-5.2, 1.65, 0.01) },
            { label: "living archive", worldPosition: new THREE.Vector3(-1.5, 1, 1.4), viewPosition: new THREE.Vector3(-1.88, 3.63, 0.28) },
            ];

            hotspotList.forEach(({ label, worldPosition, viewPosition }) => addHotspot(label, worldPosition, viewPosition));

            window.addEventListener("resize", () => {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                updateIframeStyle()
            })

            const updateIframeStyle = () => {
                if (iframeRef.current) {
                    const width = Math.min(window.innerWidth * 0.8, 600)
                    const height = Math.min(window.innerHeight * 0.6, 400)
                    iframeRef.current.style.width = `${width}px`
                    iframeRef.current.style.height = `${height}px`
                    iframeRef.current.style.left = `calc(50% - ${width / 2}px)`
                    iframeRef.current.style.top = `calc(50% - ${height / 2}px)`
                }
            }

            window.addEventListener("mousemove", (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1.3

                if (iframeVisible.current) return
                raycaster.setFromCamera(mouse, camera)
                const intersects = raycaster.intersectObjects(models)

                if (intersects.length > 0) {
                    if (hoveredObject !== intersects[0].object) {
                        hoveredObject = intersects[0].object
                        hoveredObject.material.size = 0.005

                        hoveredObject.material.opacity = 1
                        hoveredObject.material.vertexColors = true
                        models.forEach((model) => {
                            if (model !== hoveredObject) {
                                model.material.size = 0.001
                                model.material.opacity = 0.1
                                model.material.vertexColors = false
                            }
                        })
                    }
                } else if (hoveredObject) {
                    models.forEach((model) => {
                        model.material.size = 0.01
                        model.material.opacity = 1
                    })
                    hoveredObject = null
                }
            })

            // const onMouseClick = (event) => {
            //     raycaster.setFromCamera(mouse, camera)
            //     const intersects = raycaster.intersectObjects(models)

            //     if (intersects.length > 0 && !iframeVisible) {
            //         const redirectPath =
            //             intersects[0].object.userData.redirectPath
            //         if (selectedObject === intersects[0].object) {
            //             window.location.href = domain + redirectPath
            //             return
            //         }
            //         let container2 = document.createElement("iframe")
            //         if (redirectPath !== "" && !selectedObject) {
            //             if (!iframeRef.current) {
            //                 iframeRef.current = document.createElement("div")
            //                 iframeRef.current.appendChild(container2)
            //                 container2.style.width = "100%"
            //                 container2.style.height = "100%"
            //                 iframeRef.current.setAttribute(
            //                     "id",
            //                     "subpage_iframe"
            //                 )
            //                 iframeRef.current.style.position = "fixed"
            //                 iframeRef.current.style.border = "1px solid #ccc"
            //                 iframeRef.current.style.boxShadow =
            //                     "0 4px 8px rgba(0, 0, 0, 0.1)"
            //                 iframeRef.current.style.zIndex = "1000"
            //                 document.body.appendChild(iframeRef.current)
            //             }
            //             container2.src = domain + redirectPath
            //             iframeRef.current.style.display = "block"
            //             setIframeVisible(true)
            //             const tempObject = intersects[0].object
            //             selectedObject = tempObject

            //             updateIframeStyle()
            //         } else if (redirectPath === "" && iframeRef.current) {
            //             iframeRef.current.style.display = "none"
            //             setIframeVisible(false)
            //             selectedObject = null
            //         }
            //     } else {
            //         if (iframeRef.current) {
            //             iframeRef.current.style.display = "none"
            //         }
            //         selectedObject = null
            //         setIframeVisible(true)
            //     }
            // }
            // window.addEventListener("click", onMouseClick)

            window.addEventListener('keydown', (event) => {
                if (event.key === 'c' || event.key === 'C') {
                    console.log('Camera position:', camera.position);
                    console.log('Camera rotation:', camera.rotation);
                }
            });

            const RedirectSubpage = (path) => {
                window.location.href = domain + path
            }

            const animate = () => {
                requestAnimationFrame(animate)

                setHotspots((prev) =>
                    prev.map((hotspot) => {
                        const screenPosition = hotspot.worldPosition.clone().project(camera);
                        const x = (screenPosition.x + 1) * 0.5 * window.innerWidth;
                        const y = (-screenPosition.y + 1) * 0.5 * window.innerHeight;
                        return { ...hotspot, screenPosition: { x, y } };
                    })
                );

                controls.update()
                renderer.render(scene, camera)
            }

            animate()

            moveCamera(new THREE.Vector3(3.44, 0.221, -0.13), new THREE.Vector3(0, 0, 0))

            return () => {
                window.removeEventListener("resize")
                window.removeEventListener("mousemove")
                // window.removeEventListener("click", onMouseClick)
                window.removeEventListener("keydown")
                if (iframeRef.current) {
                    document.body.removeChild(iframeRef.current)
                }
                container.removeChild(renderer.domElement)
                renderer.dispose()
            }
        }

        init()
    }, [iframeVisible])

    return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        {/* Three.js mount point */}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* Hotspot UI */}
        {hotspots.map((hotspot, idx) => (
        <div key={idx}>
            <div
                style={{
                position: "absolute",
                left: hotspot.screenPosition.x,
                top: hotspot.screenPosition.y,
                width: hotspot.hovered ? "15px" : "13px",
                height: hotspot.hovered ? "15px" : "13px",
                backgroundColor: hotspot.hovered ? "orange" : "#ff6600",
                boxShadow: hotspot.hovered ? "0 0 10px rgba(255, 102, 0, 0.5)" : "none",
                border: "2px solid #fff",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                zIndex: 10,
                display: hotspotVisible ? "block" : "none"
                }}
                onClick={() => moveCamera(hotspot.viewPosition, hotspot.worldPosition)}
                onMouseEnter={() => {
                setHotspots((prev) => {
                    const updated = [...prev];
                    updated[idx].hovered = true;
                    return [...updated];
                });
                }}
                onMouseLeave={() => {
                setHotspots((prev) => {
                    const updated = [...prev];
                    updated[idx].hovered = false;
                    return [...updated];
                });
                }}
            />
            <div
                style={{
                position: "absolute",
                left: hotspot.screenPosition.x,
                top: hotspot.screenPosition.y - 50,
                transform: "translateX(-50%)",
                fontFamily: "'Lineal Bold', sans-serif",
                fontWeight: "bold",
                fontSize: "16px",
                color: hotspot.labelHovered ? "#ff6600" : "#fff",
                backgroundColor: "rgba(0, 0, 0, 0.62)",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                userSelect: "none",
                zIndex: 10,
                whiteSpace: "nowrap",
                display: hotspotVisible ? "block" : "none"
                }}
                onMouseEnter={() => {
                setHotspots((prev) => {
                    const updated = [...prev];
                    updated[idx].labelHovered = true;
                    return [...updated];
                });
                }}
                onMouseLeave={() => {
                setHotspots((prev) => {
                    const updated = [...prev];
                    updated[idx].labelHovered = false;
                    return [...updated];
                });
                }}
                onClick={() => moveCamera(hotspot.viewPosition, hotspot.worldPosition)}
            >
                {hotspot.label}
            </div>
        </div>
      ))}

        <button
        style={{
            position: "absolute",
            bottom: "500px",
            right: "20px",
            zIndex: 11,
            padding: "10px 16px",
        }}
        onClick={setAxonView}
        >
        Set Axon View
        </button>
    </div>
    );

}
