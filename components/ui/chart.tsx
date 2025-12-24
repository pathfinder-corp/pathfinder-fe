"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
>

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof TooltipProvider
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <TooltipProvider>
        <div
          data-chart={chartId}
          ref={ref}
          className={className}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = Tooltip
const ChartTooltipTrigger = TooltipTrigger
const ChartTooltipContent = ({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelKey,
  nameKey,
}: {
  active?: boolean
  payload?: Array<any>
  className?: string
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  label?: string
  labelKey?: string
  nameKey?: string
}) => {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item.dataKey || item.name || "value"}`
    const itemConfig = config[key as keyof typeof config]
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (!value) {
      return null
    }

    return value
  }, [
    label,
    labelKey,
    payload,
    hideLabel,
    config,
  ])

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={`bg-neutral-800 border border-neutral-700 rounded-lg px-5 py-3 shadow-lg ${className || ''}`}>
      {tooltipLabel && (
        <div className="font-medium mb-1.5 text-base text-neutral-300">{tooltipLabel}</div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = config[key as keyof typeof config]
          const indicatorColor = item.payload?.fill || item.color

          return (
            <div
              key={item.dataKey || index}
              className="flex items-center gap-2 [&>svg]:size-4 [&>svg]:text-neutral-400"
            >
              {!hideIndicator && (
                <div
                  className="shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: indicatorColor,
                    borderColor: indicatorColor,
                  } as React.CSSProperties}
                >
                  {indicator === "dot" && (
                    <div className="size-2.5 rounded-full bg-current" style={{ backgroundColor: indicatorColor }} />
                  )}
                  {indicator === "line" && (
                    <div className="size-0.5 w-3 bg-current" style={{ backgroundColor: indicatorColor }} />
                  )}
                  {indicator === "dashed" && (
                    <div className="size-0.5 w-3 border border-dashed bg-transparent" style={{ borderColor: indicatorColor }} />
                  )}
                </div>
              )}
              {itemConfig?.icon && (
                <itemConfig.icon />
              )}
              <div className="flex w-full items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-1 break-all text-neutral-400">
                  <span>{itemConfig?.label || item.name}</span>
                </div>
                <div className="font-mono font-medium tabular-nums text-neutral-200">
                  {typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipTrigger,
  ChartTooltipContent,
  useChart,
}