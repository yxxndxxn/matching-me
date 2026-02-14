import "@testing-library/jest-dom/vitest"
import React from "react"
import { vi } from "vitest"

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string; [key: string]: unknown }) => {
    const { fill, priority, ...imgProps } = props
    return React.createElement("img", { ...imgProps, src: props.src, alt: props.alt })
  },
}))
