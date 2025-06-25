import { useState, useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { gsap } from "gsap"

export default function ThreeJSComponent(props) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const iframeRef = useRef<any>(null)

    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const allModelVisible = useRef<boolean>(true)
    const iframeVisible = useRef<boolean>(false)
    const models = useRef<THREE.Mesh[]>([])
    const controls = useRef<any>(null)

    const domain = "https://novel-head-392156.framer.app/"
    const [hotspotVisible, setHotspotVisible] = useState<boolean>(false)

    interface Hotspot {
        label: string
        worldPosition: THREE.Vector3
        action: () => void
        screenPosition: { x: number; y: number }
        hovered: boolean
        labelHovered: boolean
    }

    const [hotspots, setHotspots] = useState<Hotspot[]>([])

    let hoveredObject: THREE.Object3D | null = null
    let selectedObject: THREE.Object3D | null = null

    const moveCamera = (
        dstPosition: THREE.Vector3,
        dstTarget: THREE.Vector3,
        baseDuration: number,
        ease: string
    ): void => {
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

    const hideIframe = () => {
        if (iframeRef.current) {
            iframeRef.current.style.display = "none"
            iframeRef.current.remove() // clean up
            iframeRef.current = null
            selectedObject = null
            return
        }
    }

    const updateMaterial = (
        target: THREE.Object3D & { material: THREE.Material }
    ) => {
        const targetMaterial = target.material as
            | THREE.PointsMaterial
            | (THREE.Material & {
                  size?: number
                  vertexColors?: boolean
                  opacity?: number
                  needsUpdate?: boolean
              })

        targetMaterial.opacity = 1
        targetMaterial.size = 0.01
        targetMaterial.vertexColors = true
        targetMaterial.needsUpdate = true

        models.current.forEach((model) => {
            if (model !== target) {
                const material = model.material as typeof targetMaterial

                material.opacity = 0.5
                material.size = 0.007
                material.vertexColors = true
                material.needsUpdate = true
            }
        })
    }

    const setAxonView = (): void => {
        allModelVisible.current = false
        iframeVisible.current = false
        setHotspotVisible(true)
        hideIframe()
        moveCamera(
            new THREE.Vector3(3.16, 3.25, 3.2),
            new THREE.Vector3(0, 0, 0),
            2.5,
            "power2.inOut"
        )

        models.current.forEach((model) => {
            const material = model.material as
                | THREE.PointsMaterial
                | (THREE.Material & {
                      size?: number
                      vertexColors?: boolean
                      opacity?: number
                      needsUpdate?: boolean
                  })

            material.opacity = 1
            material.size = 0.01
            material.vertexColors = true
            material.needsUpdate = true
        })
    }

    const setOsbmView = (): void => {
        allModelVisible.current = true
        setHotspotVisible(false)
        hideIframe()
        moveCamera(
            new THREE.Vector3(0.48, 0.177, 0.38),
            new THREE.Vector3(0.7, -0.5, 2.3),
            2.5,
            "power2.inOut"
        )

        iframeVisible.current = true

        const osbm = models.current.find(
            (model) => model.userData?.redirectPath === "osbm"
        )

        if (osbm) {
            updateMaterial(osbm)
        }
    }

    const setEasypairView = (): void => {
        allModelVisible.current = true
        setHotspotVisible(false)
        hideIframe()
        moveCamera(
            new THREE.Vector3(-2.5, 1.65, 0.01),
            new THREE.Vector3(-4, 1.55, 0),
            2.5,
            "power2.inOut"
        )

        iframeVisible.current = true

        const easypair = models.current.find(
            (model) => model.userData?.redirectPath === "easypair"
        )

        if (easypair) {
            updateMaterial(easypair)
        }
    }

    const setLivingarchiveView = (): void => {
        allModelVisible.current = true
        setHotspotVisible(false)
        hideIframe()
        moveCamera(
            new THREE.Vector3(-1.17, 0.75, 0.052),
            new THREE.Vector3(-1.756, 0.608, 0.735),
            2.5,
            "power2.inOut"
        )

        iframeVisible.current = true

        const livingarchive = models.current.find(
            (model) => model.userData?.redirectPath === "livingarchive"
        )

        if (livingarchive) {
            updateMaterial(livingarchive)
        }
    }

    const setSpatialWellnessView = (): void => {
        allModelVisible.current = true
        setHotspotVisible(false)
        hideIframe()
        moveCamera(
            new THREE.Vector3(-0.64, 0.23, -2.08),
            new THREE.Vector3(-0.51, 0.15, -0.824),
            2.5,
            "power2.inOut"
        )

        iframeVisible.current = true

        const spatialwellness = models.current.find(
            (model) => model.userData?.redirectPath === "spatialwellness"
        )

        if (spatialwellness) {
            updateMaterial(spatialwellness)
        }
    }

    useEffect(() => {
        if (
            !containerRef.current ||
            containerRef.current.querySelector("canvas")
        )
            return

        const loadPLYLoader = async () => {
            const { PLYLoader } = await import(
                "https://unpkg.com/three@0.152.2/examples/jsm/loaders/PLYLoader.js"
            )
            return PLYLoader
        }

        const init = async () => {
            const PLYLoader = await loadPLYLoader()

            const scene = new THREE.Scene()

            const light = new THREE.SpotLight()
            light.position.set(500, 500, 500)
            light.intensity = 0
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
            raycaster.params.Points.threshold = 0.05
            const mouse = new THREE.Vector2()

            const loadModel = (path, position, redirectPath = "") => {
                const loader = new PLYLoader()
                loader.load(path, (geometry) => {
                    const material = new THREE.PointsMaterial({
                        size: 0.005,
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
                "osbm"
            )
            loadModel(
                "https://raw.githubusercontent.com/Fredge69/CoAl_Website/main/easy pair_PC.ply",
                new THREE.Vector3(0, 0, 0),
                "easypair"
            )
            loadModel(
                "https://raw.githubusercontent.com/Fredge69/CoAl_Website/main/living archive_UPDATE_PC.ply",
                new THREE.Vector3(0, 0, 0),
                "livingarchive"
            )

            const hotspotList = [
                {
                    label: "spatial wellness",
                    worldPosition: new THREE.Vector3(-0.7, 1.2, -2),
                    action: setSpatialWellnessView,
                },
                {
                    label: "osbm",
                    worldPosition: new THREE.Vector3(0.8, -0.5, 2.3),
                    action: setOsbmView,
                },
                {
                    label: "easy pair",
                    worldPosition: new THREE.Vector3(-4, 1.55, 0),
                    action: setEasypairView,
                },
                {
                    label: "living archive",
                    worldPosition: new THREE.Vector3(-1.5, 1, 1.4),
                    action: setLivingarchiveView,
                },
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

            hotspotList.forEach(({ label, worldPosition, action }) =>
                addHotspot(label, worldPosition, action)
            )

            window.addEventListener("resize", () => {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                updateIframeStyle()
            })

            const updateIframeStyle = () => {
                if (!iframeRef.current) return

                const vw = window.innerWidth
                const vh = window.innerHeight

                let width, height

                // Mobile (<=768px): portrait aspect (400x600)
                if (vw <= 768) {
                    width = vw * 0.9
                    height = vh * 0.5
                }
                // Tablet (<=1024px): landscape aspect (600x400)
                else if (vw <= 1024) {
                    width = Math.max(600, vw * 0.8)
                    height = Math.max(400, vh * 0.5)
                }
                // Desktop: larger iframe (800x450 or fit in viewport)
                else {
                    width = Math.min(1000, vw * 0.6)
                    height = Math.min(600, vh * 0.6)
                }

                iframeRef.current.style.width = `${width}px`
                iframeRef.current.style.height = `${height}px`
                iframeRef.current.style.left = `calc(50% - ${width / 2}px)`
                iframeRef.current.style.top = `calc(50% - ${height / 2}px)`
            }

            window.addEventListener("mousemove", (event) => {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

                if (allModelVisible.current || event.buttons !== 0) return

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
                const currentWindowURL = window.location.href
                const pageURL = currentWindowURL.split(domain)[1]

                // if (!iframeVisible.current || pageURL !== "model-test") return
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
                    const redirectPath =
                        intersects[0].object.userData.redirectPath
                    if (redirectPath === "") return

                    const targetURL = domain + redirectPath

                    iframeRef.current = document.createElement("div")
                    iframeRef.current.setAttribute("id", "subpage_iframe")
                    iframeRef.current.style.position = "fixed"
                    iframeRef.current.style.top = "0"
                    iframeRef.current.style.left = "0"
                    iframeRef.current.style.width = "100vw"
                    iframeRef.current.style.height = "100vh"
                    iframeRef.current.style.zIndex = "1000"
                    iframeRef.current.style.border = "1px solid #ccc"
                    iframeRef.current.style.boxShadow =
                        "0 4px 8px rgba(0, 0, 0, 0.1)"
                    iframeRef.current.style.opacity = "1"
                    iframeRef.current.style.display = "block"

                    const iframeElement = document.createElement("iframe")
                    iframeElement.src = targetURL + "-thumbnail"
                    iframeElement.style.width = "100%"
                    iframeElement.style.height = "100%"
                    iframeElement.style.border = "none"

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

            const animate = () => {
                requestAnimationFrame(animate)

                setHotspots((prev) =>
                    prev.map((hotspot) => {
                        const screenPosition = hotspot.worldPosition
                            .clone()
                            .project(camera)
                        const x =
                            (screenPosition.x + 1) * 0.5 * window.innerWidth
                        const y =
                            (-screenPosition.y + 1) * 0.5 * window.innerHeight
                        return { ...hotspot, screenPosition: { x, y } }
                    })
                )

                controls.current.update()
                renderer.render(scene, camera)
            }

            animate()

            moveCamera(
                new THREE.Vector3(3.44, 0.221, -0.13),
                new THREE.Vector3(0, 0, 0),
                5,
                "linear"
            )

            return () => {
                window.removeEventListener("resize")
                window.removeEventListener("mousemove")
                window.removeEventListener("click")
                if (iframeRef.current) {
                    document.body.removeChild(iframeRef.current)
                }
                container.removeChild(renderer.domElement)
                renderer.dispose()
            }
        }

        document.addEventListener("iconButtonClicked", (e) => {
            setAxonView()
        })

        document.addEventListener("osbmClicked", (e) => {
            setOsbmView()
        })

        document.addEventListener("easypairClicked", (e) => {
            setEasypairView()
        })

        document.addEventListener("spatialwellnessClicked", (e) => {
            setSpatialWellnessView()
        })

        document.addEventListener("livingarchiveClicked", (e) => {
            setLivingarchiveView()
        })

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
                            boxShadow: hotspot.hovered
                                ? "0 0 10px rgba(255, 102, 0, 0.5)"
                                : "none",
                            border: "2px solid #fff",
                            borderRadius: "50%",
                            transform: "translate(-50%, -50%)",
                            cursor: "pointer",
                            zIndex: 10,
                            display: hotspotVisible ? "block" : "none",
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            hotspot.action()
                        }}
                        onMouseEnter={() => {
                            setHotspots((prev) => {
                                const updated = [...prev]
                                updated[idx] = {
                                    ...updated[idx],
                                    hovered: true,
                                }
                                return updated
                            })
                        }}
                        onMouseLeave={() => {
                            setHotspots((prev) => {
                                const updated = [...prev]
                                updated[idx] = {
                                    ...updated[idx],
                                    hovered: false,
                                }
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
                            display: hotspotVisible ? "block" : "none",
                        }}
                        onMouseEnter={() => {
                            setHotspots((prev) => {
                                const updated = [...prev]
                                updated[idx] = {
                                    ...updated[idx],
                                    labelHovered: true,
                                }
                                return updated
                            })
                        }}
                        onMouseLeave={() => {
                            setHotspots((prev) => {
                                const updated = [...prev]
                                updated[idx] = {
                                    ...updated[idx],
                                    labelHovered: false,
                                }
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
        </div>
    )
}
