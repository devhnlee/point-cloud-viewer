import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

export default function ThreeJSComponent() {
    const containerRef = useRef(null)
    const iframeRef = useRef(null)
    const domain = "https://novel-head-392156.framer.app/"
    let iframeVisible = false

    useEffect(() => {
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
            light.intensity = 3
            scene.add(light)

            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.001,
                100000
            )
            camera.position.set(0, 0, 0)
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
                        iframeVisible = true
                        const tempObject = intersects[0].object
                        selectedObject = tempObject

                        updateIframeStyle()
                    } else if (redirectPath === "" && iframeRef.current) {
                        iframeRef.current.style.display = "none"
                        iframeVisible = false
                        selectedObject = null
                    }
                } else {
                    if (iframeRef.current) {
                        iframeRef.current.style.display = "none"
                    }
                    selectedObject = null
                    iframeVisible = false
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

            const RedirectSubpage = (path) => {
                window.location.href = domain + path
            }

            const clock = new THREE.Clock()
            const animate = () => {
                requestAnimationFrame(animate)

                const elapsedTime = clock.getElapsedTime()
                if (elapsedTime < 5) {
                    const t = elapsedTime / 5
                    camera.position.lerp(new THREE.Vector3(0, -18.7, 9), t)
                }

                controls.update()
                renderer.render(scene, camera)
            }

            animate()

            return () => {
                window.removeEventListener("resize", onWindowResize)
                window.removeEventListener("mousemove", onMouseMove)
                window.removeEventListener("click", onMouseClick)
                window.removeEventListener("dblclick", onMouseDoubleClick)
                if (iframeRef.current) {
                    document.body.removeChild(iframeRef.current)
                }
                container.removeChild(renderer.domElement)
                renderer.dispose()
            }
        }

        init()
    }, [])

    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
}
