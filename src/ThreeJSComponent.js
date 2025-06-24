import { useState, useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { PLYLoader } from "three/addons/loaders/PLYLoader.js"
import { gsap } from "gsap"


export default function ThreeJSComponent() {
    const containerRef = useRef(null)
    const iframeRef = useRef(null)
    const cameraRef = useRef(null)
    const allModelVisible = useRef(true)
    const iframeVisible = useRef(false)
    const models = useRef([])
    const controls = useRef(null)

    const domain = "https://novel-head-392156.framer.app/"
    const [hotspotVisible, setHotspotVisible] = useState(false)
    const [hotspots, setHotspots] = useState([])

    let hoveredObject = null
    let selectedObject = null

    const moveCamera = (dstPosition, dstTarget, baseDuration, ease) => {
        if (cameraRef.current) {
            const camera = cameraRef.current
            const distance = camera.position.distanceTo(dstPosition)
            const speedFactor = 0.2
            const duration = baseDuration + distance * speedFactor

            gsap.to(camera.position, {
                x: dstPosition.x,
                y: dstPosition.y,
                z: dstPosition.z,
                duration,
                ease: ease,
            })

            gsap.to(controls.current.target, {
                x: dstTarget.x,
                y: dstTarget.y,
                z: dstTarget.z,
                duration,
                ease: ease,
            })
        }
    }

    const updateMaterial = (target) => {
        target.material.opacity = 1
        target.material.size = 0.01
        target.material.vertexColors = true
        target.material.needsUpdate = true
        models.current.forEach((model) => {
            if (model !== target) {
                model.material.opacity = 0.5
                model.material.size = 0.007
                model.material.vertexColors = true
                model.material.needsUpdate = true
            }
        })
    }

    const hideIframe = () => {
        if (iframeRef.current) {
            iframeRef.current.style.display = "none"
            selectedObject = null
            iframeRef.current.remove() // clean up
            iframeRef.current = null
            return
        }
    }

    const setAxonView = () => {
        allModelVisible.current = false
        iframeVisible.current = false
        setHotspotVisible(true)
        hideIframe()
        moveCamera(new THREE.Vector3(3.16, 3.25, 3.2), new THREE.Vector3(0, 0, 0), 2.5, "power2.inOut")
        models.current.forEach((model) => {
            model.material.opacity = 1
            model.material.size = 0.01
            model.material.vertexColors = true
            model.material.needsUpdate = true
        })
    }

    const setOsbmView = () => {
        allModelVisible.current = true
        setHotspotVisible(false)
        hideIframe()
        moveCamera(new THREE.Vector3(0.48, 0.177, 0.38), new THREE.Vector3(0.7, -0.5, 2.3), 2.5, "power2.inOut")
        iframeVisible.current = true
        const osbm = models.current.find(model => model.userData.redirectPath === "osbm")
        updateMaterial(osbm)
    }

    const setEasypairView = () => {
        allModelVisible.current = true
        setHotspotVisible(false)
        hideIframe()
        moveCamera(new THREE.Vector3(-2.5, 1.65, 0.01), new THREE.Vector3(-4, 1.55, 0), 2.5, "power2.inOut")
        iframeVisible.current = true
        const easypair = models.current.find(model => model.userData.redirectPath === "easypair")
        updateMaterial(easypair)
    }

    const setLivingarchiveView = () => {
        allModelVisible.current = true
        setHotspotVisible(false)
        hideIframe()
        moveCamera(new THREE.Vector3(-1.45, 1.94, 0.25), new THREE.Vector3(-1.45, 1, 0.249), 2.5, "power2.inOut")
        // moveCamera(new THREE.Vector3(-1.45, 1.94, 0.25), new THREE.Vector3(1.57, 6.46, 0.0064), 2.5, "power2.inOut")
        iframeVisible.current = true
        const livingarchive = models.current.find(model => model.userData.redirectPath === "livingarchive")
        updateMaterial(livingarchive)
    }

    const setSpatialWellnessView = () => {
        allModelVisible.current = true
        setHotspotVisible(false)
        hideIframe()
        moveCamera(new THREE.Vector3(-0.64, 0.23, -2.08), new THREE.Vector3(-0.51, 0.15, -0.824), 2.5, "power2.inOut")
        iframeVisible.current = true
        const spatialwellness = models.current.find(model => model.userData.redirectPath === "spatialwellness")
        updateMaterial(spatialwellness)
    }

    useEffect(() => {
        if (!containerRef.current || containerRef.current.querySelector("canvas")) return // TODO: need to remove this guard before deployment

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
            camera.position.set(1.17, 0.07, -0.044)
            cameraRef.current = camera

            const renderer = new THREE.WebGLRenderer({ antialias: true })
            renderer.setSize(window.innerWidth, window.innerHeight)

            const container = containerRef.current
            container.appendChild(renderer.domElement)

            controls.current = new OrbitControls(camera, renderer.domElement)
            controls.current.enableDamping = true

            const raycaster = new THREE.Raycaster()
            raycaster.params.Points.threshold = 0.05;
            const mouse = new THREE.Vector2()

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
                    models.current.push(object)
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
                { label: "spatial wellness", worldPosition: new THREE.Vector3(-0.7, 1.2, -2), action: setSpatialWellnessView },
                { label: "osbm", worldPosition: new THREE.Vector3(0.8, -0.5, 2.3), action: setOsbmView },
                { label: "easy pair", worldPosition: new THREE.Vector3(-4, 1.55, 0), action: setEasypairView },
                { label: "living archive", worldPosition: new THREE.Vector3(-1.5, 1, 1.4), action: setLivingarchiveView },
            ]

            const addHotspot = (label, worldPosition, action) => {
                setHotspots((prev) => [
                ...prev,
                {
                    label,
                    worldPosition,
                    action,
                    screenPosition: { x: 0, y: 0 },
                    hovered: false,
                    labelHovered: false,
                },
                ])
            }

            hotspotList.forEach(({ label, worldPosition, action }) => addHotspot(label, worldPosition, action))

            window.addEventListener("resize", () => {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                updateIframeStyle()
            })

            const updateIframeStyle = () => {
                if (!iframeRef.current) return;

                const vw = window.innerWidth;
                const vh = window.innerHeight;

                let width, height;

                // Mobile (<=768px): portrait aspect (400x600)
                if (vw <= 768) {
                    width = 400;
                    height = 600;
                }
                // Tablet (<=1024px): landscape aspect (600x400)
                else if (vw <= 1024) {
                    width = 600;
                    height = 400;
                }
                // Desktop: larger iframe (800x450 or fit in viewport)
                else {
                    width = Math.min(800, vw * 0.8);
                    height = Math.min(450, vh * 0.8);
                }

                iframeRef.current.style.width = `${width}px`
                iframeRef.current.style.height = `${height}px`
                iframeRef.current.style.left = `calc(50% - ${width / 2}px)`
                iframeRef.current.style.top = `calc(50% - ${height / 2}px)`
            }

            window.addEventListener("mousemove", (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1.3

                if (allModelVisible.current || event.buttons !== 0 ) return

                raycaster.setFromCamera(mouse, camera)
                const intersects = raycaster.intersectObjects(models.current)

                if (intersects.length > 0) {
                    if (hoveredObject !== intersects[0].object) {
                        hoveredObject = intersects[0].object
                        hoveredObject.material.size = 0.005

                        hoveredObject.material.opacity = 1
                        hoveredObject.material.vertexColors = true
                        models.current.forEach((model) => {
                            if (model !== hoveredObject) {
                                model.material.size = 0.001
                                model.material.opacity = 0.25
                                model.material.vertexColors = false
                            }
                        })
                    }
                } else if (hoveredObject) {
                    models.current.forEach((model) => {
                        model.material.size = 0.01
                        model.material.opacity = 1
                    })
                    hoveredObject = null
                }
            })

            window.addEventListener("click", (event) => {
                raycaster.setFromCamera(mouse, camera)
                const intersects = raycaster.intersectObjects(models.current)

                if (!iframeVisible.current) return

                // Close iframe if already open
                if (iframeRef.current) {
                    iframeRef.current.style.display = "none"
                    selectedObject = null
                    iframeRef.current.remove() // clean up
                    iframeRef.current = null
                    return
                }

                // Open new iframe if intersection is detected
                if (intersects.length > 0) {
                    const redirectPath = intersects[0].object.userData.redirectPath
                    if (redirectPath === "") return

                    const targetURL = domain + redirectPath

                    // Create iframe container
                    iframeRef.current = document.createElement("div")
                    iframeRef.current.setAttribute("id", "subpage_iframe")
                    iframeRef.current.style.position = "fixed"
                    iframeRef.current.style.top = "0"
                    iframeRef.current.style.left = "0"
                    iframeRef.current.style.width = "100vw"
                    iframeRef.current.style.height = "100vh"
                    iframeRef.current.style.zIndex = "1000"
                    iframeRef.current.style.border = "1px solid #ccc"
                    iframeRef.current.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)"
                    iframeRef.current.style.opacity = "0.8"
                    iframeRef.current.style.display = "block"

                    // Create iframe element
                    const iframeElement = document.createElement("iframe")
                    iframeElement.src = targetURL
                    iframeElement.style.width = "100%"
                    iframeElement.style.height = "100%"
                    iframeElement.style.border = "none"

                    // Create transparent overlay to capture click
                    const overlay = document.createElement("div")
                    overlay.style.position = "absolute"
                    overlay.style.top = "0"
                    overlay.style.left = "0"
                    overlay.style.width = "100%"
                    overlay.style.height = "100%"
                    overlay.style.zIndex = "1001"
                    overlay.style.cursor = "pointer"
                    overlay.style.background = "transparent"

                    overlay.addEventListener("click", () => {
                        window.open(targetURL, "_self")
                    })

                    // Append elements
                    iframeRef.current.appendChild(iframeElement)
                    iframeRef.current.appendChild(overlay)
                    document.body.appendChild(iframeRef.current)

                    // Save selected object
                    selectedObject = intersects[0].object

                    updateIframeStyle()
                }
            })


            window.addEventListener("keydown", (event) => {
                if(event.key == 'C' || event.key == "c") {
                    console.log(">>> Camera position: ", cameraRef.current.position);
                    console.log(">>> Camera rotation: ", cameraRef.current.rotation);
                }
            })

            const animate = () => {
                requestAnimationFrame(animate)

                setHotspots((prev) =>
                    prev.map((hotspot) => {
                        const screenPosition = hotspot.worldPosition.clone().project(camera)
                        const x = (screenPosition.x + 1) * 0.5 * window.innerWidth
                        const y = (-screenPosition.y + 1) * 0.5 * window.innerHeight
                        return { ...hotspot, screenPosition: { x, y } }
                    })
                )

                controls.current.update()
                renderer.render(scene, camera)
            }

            animate()

            moveCamera(new THREE.Vector3(3.44, 0.221, -0.13), new THREE.Vector3(0, 0, 0), 5, "linear")

            return () => {
                window.removeEventListener("resize")
                window.removeEventListener("mousemove")
                window.removeEventListener("click")
                window.removeEventListener("keydown")
                if (iframeRef.current) {
                    document.body.removeChild(iframeRef.current)
                }
                container.removeChild(renderer.domElement)
                renderer.dispose()
            }
        }

        init()
    }, [])

    return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {hotspots.map((hotspot, idx) => (
        <div key={idx}>
            <div
                style={{
                    position: "absolute",
                    left: hotspot.screenPosition.x,
                    top: hotspot.screenPosition.y,
                    width: hotspot.hovered ? "18px" : "15px",
                    height: hotspot.hovered ? "18px" : "15px",
                    backgroundColor: hotspot.hovered ? "orange" : "red",
                    boxShadow: hotspot.hovered ? "0 0 10px rgba(255, 102, 0, 0.5)" : "none",
                    border: "2px solid #fff",
                    borderRadius: "50%",
                    transform: "translate(-50%, -50%)",
                    cursor: "pointer",
                    zIndex: 10,
                    display: hotspotVisible ? "block" : "none"
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    hotspot.action()
                }}
                onMouseEnter={() => {
                setHotspots((prev) => {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], hovered: true }
                    return updated
                })
                }}
                onMouseLeave={() => {
                setHotspots((prev) => {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], hovered: false }
                    return updated
                })
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
                        updated[idx] = { ...updated[idx], hovered: true }
                        return updated
                    })
                }}
                onMouseLeave={() => {
                    setHotspots((prev) => {
                        const updated = [...prev];
                        updated[idx] = { ...updated[idx], hovered: false }
                        return updated
                    })
                }}
                onClick={(e) => {
                    e.stopPropagation()
                    hotspot.action()
                }}
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
    )

}
