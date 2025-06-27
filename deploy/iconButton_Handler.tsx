import { forwardRef, type ComponentType } from "react"
import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"
import { randomColor } from "https://framer.com/m/framer/utils.js@^0.9.0"

// Learn more: https://www.framer.com/developers/overrides/

const useStore = createStore({
    background: "#0099FF",
})

export function withRotate(Component): ComponentType {
    return forwardRef((props, ref) => {
        return (
            <Component
                ref={ref}
                {...props}
                animate={{ rotate: 90 }}
                transition={{ duration: 2 }}
            />
        )
    })
}

export function withHover(Component): ComponentType {
    return forwardRef((props, ref) => {
        return <Component ref={ref} {...props} whileHover={{ scale: 1.05 }} />
    })
}

export function withRandomColor(Component): ComponentType {
    return forwardRef((props, ref) => {
        const [store, setStore] = useStore()

        return (
            <Component
                ref={ref}
                {...props}
                animate={{
                    background: store.background,
                }}
                onClick={() => {
                    setStore({ background: randomColor() })
                }}
            />
        )
    })
}

export function withIconButtonClick(Component): ComponentType {
    return forwardRef((props, ref) => {
        const [store, setStore] = useStore()

        return (
            <Component
                ref={ref}
                {...props}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    const event = new CustomEvent("iconButtonClicked", {
                        detail: "iconButton",
                    })
                    document.dispatchEvent(event)
                }}
            />
        )
    })
}

export function withOsbmClick(Component): ComponentType {
    return forwardRef((props, ref) => {
        const [store, setStore] = useStore()

        return (
            <Component
                ref={ref}
                {...props}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    const event = new CustomEvent("osbmClicked", {
                        detail: "obsm",
                    })
                    document.dispatchEvent(event)
                }}
            />
        )
    })
}

export function withSpatialwellnessClick(Component): ComponentType {
    return forwardRef((props, ref) => {
        const [store, setStore] = useStore()

        return (
            <Component
                ref={ref}
                {...props}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    const event = new CustomEvent("spatialwellnessClicked", {
                        detail: "spatialwellness",
                    })
                    document.dispatchEvent(event)
                }}
            />
        )
    })
}

export function withLivingarchiveClick(Component): ComponentType {
    return forwardRef((props, ref) => {
        const [store, setStore] = useStore()

        return (
            <Component
                ref={ref}
                {...props}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    const event = new CustomEvent("livingarchiveClicked", {
                        detail: "livingarchive",
                    })
                    document.dispatchEvent(event)
                }}
            />
        )
    })
}

export function withEasypairClick(Component): ComponentType {
    return forwardRef((props, ref) => {
        const [store, setStore] = useStore()

        return (
            <Component
                ref={ref}
                {...props}
                onPointerDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    const event = new CustomEvent("easypairClicked", {
                        detail: "easypair",
                    })
                    document.dispatchEvent(event)
                }}
            />
        )
    })
}
