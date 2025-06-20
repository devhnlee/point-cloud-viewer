import { useState, useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { PLYLoader } from "three/addons/loaders/PLYLoader.js"
import { gsap } from "gsap"

export default function ThreeJSComponent() {
    const containerRef = useRef(null)
    const iframeRef = useRef(null)
    const domain = "https://novel-head-392156.framer.app/"
    const [iframeVisible, setIframeVisible] = useState(true);
    const [hotspotPos, setHotspotPos] = useState({ x: 0, y: 0 });
    const [hotspotVisible, setHotspotVisible] = useState(false);
    const [hovered, setHovered] = useState(false);

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
            camera.position.set(1.2620118298273393, 2.8424242433860067, -0.06559068747381998)
            camera.rotation.set(0.785, 0.11, -0.11)

            const renderer = new THREE.WebGLRenderer({ antialias: true })
            renderer.setSize(window.innerWidth, window.innerHeight)

            const container = containerRef.current
            container.appendChild(renderer.domElement)

            const controls = new OrbitControls(camera, renderer.domElement)
            controls.enableDamping = true

            const raycaster = new THREE.Raycaster()
            const mouse = new THREE.Vector2()

            const models = []
            let hoveredObject = null
            let selectedObject = null

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

            const moveCamera = (targetPosition) => {
                const distance = camera.position.distanceTo(targetPosition);

                const baseDuration = 4;
                const speedFactor = 0.2;

                const duration = baseDuration + (distance * speedFactor);

                gsap.to(camera.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration: duration,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        camera.updateProjectionMatrix();
                    }
                });
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

            const onWindowResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                updateIframeStyle()
            }
            window.addEventListener("resize", onWindowResize)

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

            const onMouseMove = (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

                if (iframeVisible) return
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
            }
            window.addEventListener("mousemove", onMouseMove)

            const onMouseClick = (event) => {
                raycaster.setFromCamera(mouse, camera)
                const intersects = raycaster.intersectObjects(models)

                if (intersects.length > 0) {
                    const redirectPath =
                        intersects[0].object.userData.redirectPath
                    if (selectedObject === intersects[0].object) {
                        window.location.href = domain + redirectPath
                        return
                    }
                    let container2 = document.createElement("iframe")
                    if (redirectPath !== "" && !selectedObject) {
                        if (!iframeRef.current) {
                            iframeRef.current = document.createElement("div")
                            iframeRef.current.appendChild(container2)
                            container2.style.width = "100%"
                            container2.style.height = "100%"
                            iframeRef.current.setAttribute(
                                "id",
                                "subpage_iframe"
                            )
                            iframeRef.current.style.position = "fixed"
                            iframeRef.current.style.border = "1px solid #ccc"
                            iframeRef.current.style.boxShadow =
                                "0 4px 8px rgba(0, 0, 0, 0.1)"
                            iframeRef.current.style.zIndex = "1000"
                            document.body.appendChild(iframeRef.current)
                        }
                        container2.src = domain + redirectPath
                        iframeRef.current.style.display = "block"
                        setIframeVisible(true)
                        const tempObject = intersects[0].object
                        selectedObject = tempObject

                        updateIframeStyle()
                    } else if (redirectPath === "" && iframeRef.current) {
                        iframeRef.current.style.display = "none"
                        setIframeVisible(false)
                        selectedObject = null
                    }
                } else {
                    if (iframeRef.current) {
                        iframeRef.current.style.display = "none"
                    }
                    selectedObject = null
                    setIframeVisible(false)
                }
            }
            window.addEventListener("click", onMouseClick)

            const onMouseDoubleClick = (event) => {
                raycaster.setFromCamera(mouse, camera)
                const intersects = raycaster.intersectObjects(models)

                if (intersects.length > 0) {
                    const redirectPath =
                        intersects[0].object.userData.redirectPath
                    if (redirectPath !== "") {
                        window.location.href = domain + redirectPath
                    }
                }
            }
            window.addEventListener("dblclick", onMouseDoubleClick)

            const onKeyDown = (event) => {
                if (event.key === 'c' || event.key === 'C') {
                    console.log('Camera position:', camera.position);
                    console.log('Camera rotation:', camera.rotation);
                }
            };
            window.addEventListener('keydown', onKeyDown);

            const RedirectSubpage = (path) => {
                window.location.href = domain + path
            }

            const animate = () => {
                requestAnimationFrame(animate)

                // Project 3D point to screen
                const screenPosition = new THREE.Vector3(0,0,0).clone().project(camera);
                const x = (screenPosition.x + 1) * 0.5 * window.innerWidth;
                const y = (-screenPosition.y + 1) * 0.5 * window.innerHeight;
                setHotspotPos({ x, y });

                controls.update()
                renderer.render(scene, camera)
            }

            animate()

            moveCamera(new THREE.Vector3(3.43717175983119, 0.2210791835609916, -0.13036073883462082))

            return () => {
                window.removeEventListener("resize", onWindowResize)
                window.removeEventListener("mousemove", onMouseMove)
                window.removeEventListener("click", onMouseClick)
                window.removeEventListener("dblclick", onMouseDoubleClick)
                window.removeEventListener("keydown", onKeyDown)
                if (iframeRef.current) {
                    document.body.removeChild(iframeRef.current)
                }
                container.removeChild(renderer.domElement)
                renderer.dispose()
            }
        }

        init()
    }, [])

    return(
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            <div
                className="hotspot"
                style={{
                position: "absolute",
                left: hotspotPos.x,
                top: hotspotPos.y,
                width: hovered ? "26px" : "20px",
                height: hovered ? "26px" : "20px",
                backgroundColor: hovered ? "orange" : "white",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                zIndex: 10,
                transition: "all 0.2s ease-in-out",
                display: hotspotVisible ? "block" : "none",
                }}
                onClick={() => console.log("Hotspot clicked")}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            />
            {/* <button onClick={() => {setAxonView()}}></button> */}
        </div>
    )
}
