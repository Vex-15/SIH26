# ThermalWatch AI — Component Registry

Source libraries (all Tailwind-based — no MUI, no Semantic UI):
- **shadcn/ui** → https://ui.shadcn.com
- **Magic UI** → https://magicui.design
- **ReactBits** → https://www.reactbits.dev
- **21st.dev** → https://21st.dev
- **Recharts** → https://recharts.org
- **Framer Motion** → https://www.framer.com/motion

Install pattern for shadcn: `npx shadcn@latest add <name>` unless stated otherwise.

---

## Primitives / Base

| # | Component | Source | Link / Install |
|---|-----------|--------|----------------|
| 1 | **Button** | 21st.dev | https://21st.dev/community/components/s/button?preview=%2F%40lyanchouss%2Fcomponents%2Forigin-button |
| 2 | **IconButton** | shadcn/ui | `npx shadcn@latest add button` — use `variant="ghost" size="icon"` |
| 3 | **Tooltip** | shadcn/ui | `npx shadcn@latest add tooltip` — https://ui.shadcn.com/docs/components/tooltip |
| 4 | **Badge** | shadcn/ui | `npx shadcn@latest add badge` — https://ui.shadcn.com/docs/components/badge |
| 5 | **Avatar** | shadcn/ui | `npx shadcn@latest add avatar` — https://ui.shadcn.com/docs/components/avatar |
| 6 | **Separator / Divider** | shadcn/ui | `npx shadcn@latest add separator` — https://ui.shadcn.com/docs/components/separator |
| 7 | **Spinner / Loader** | ReactBits | https://www.reactbits.dev/components/circular-text |
| 8 | **Skeleton** | shadcn/ui | `npx shadcn@latest add skeleton` — https://ui.shadcn.com/docs/components/skeleton |
| 9 | **Label** | shadcn/ui | `npx shadcn@latest add label` — https://ui.shadcn.com/docs/components/label |
| 10 | **Kbd** | shadcn registry | `pnpm dlx shadcn@latest add @reui/c-kbd-6` |

---

## Inputs & Controls

| # | Component | Source | Link / Install |
|---|-----------|--------|----------------|
| 11 | **Switch** | shadcn/ui | `npx shadcn@latest add switch` — https://ui.shadcn.com/docs/components/switch |
| 12 | **Checkbox** | shadcn/ui | `npx shadcn@latest add checkbox` — https://ui.shadcn.com/docs/components/checkbox |
| 13 | **RadioGroup** | shadcn/ui | `npx shadcn@latest add radio-group` — https://ui.shadcn.com/docs/components/radio-group |
| 14 | **RadioGroupItem** | shadcn/ui | Included with `radio-group` |
| 15 | **Slider** | shadcn/ui | `npx shadcn@latest add slider` — https://ui.shadcn.com/docs/components/slider |
| 16 | **RangeSlider** | shadcn/ui | Same `slider` — pass `min`, `max`, `step` props |
| 17 | **Select** | shadcn/ui | `npx shadcn@latest add select` — https://ui.shadcn.com/docs/components/select |
| 18 | **SelectTrigger** | shadcn/ui | Included with `select` |
| 19 | **SelectContent** | shadcn/ui | Included with `select` |
| 20 | **SelectItem** | shadcn/ui | Included with `select` |
| 21 | **Input** | shadcn/ui | `npx shadcn@latest add input` — https://ui.shadcn.com/docs/components/input |
| 22 | **SearchInput** | 21st.dev | https://21st.dev/categories/inputs — filter "search" |
| 23 | **Textarea** | shadcn/ui | `npx shadcn@latest add textarea` — https://ui.shadcn.com/docs/components/textarea |
| 24 | **NumberInput** | shadcn/ui | `<Input type="number">` — no separate install |

---

## Overlay & Containers

| # | Component | Source | Link / Install |
|---|-----------|--------|----------------|
| 25 | **Dialog** | shadcn/ui | `npx shadcn@latest add dialog` — https://ui.shadcn.com/docs/components/dialog |
| 26 | **DialogContent** | shadcn/ui | Included with `dialog` |
| 27 | **DialogHeader** | shadcn/ui | Included with `dialog` |
| 28 | **DialogFooter** | shadcn/ui | Included with `dialog` |
| 29 | **DialogOverlay** | shadcn/ui | Included with `dialog` |
| 30 | **Sheet** | shadcn/ui | `npx shadcn@latest add sheet` — https://ui.shadcn.com/docs/components/sheet |
| 31 | **SheetContent** | shadcn/ui | Included with `sheet` |
| 32 | **SheetHeader** | shadcn/ui | Included with `sheet` |
| 33 | **SheetFooter** | shadcn/ui | Included with `sheet` |
| 34 | **Drawer** | shadcn/ui | `npx shadcn@latest add drawer` — https://ui.shadcn.com/docs/components/drawer |
| 35 | **DrawerContent** | shadcn/ui | Included with `drawer` |
| 36 | **Popover** | shadcn/ui | `npx shadcn@latest add popover` — https://ui.shadcn.com/docs/components/popover |
| 37 | **PopoverContent** | shadcn/ui | Included with `popover` |
| 38 | **PopoverTrigger** | shadcn/ui | Included with `popover` |
| 39 | **HoverCard** | shadcn/ui | `npx shadcn@latest add hover-card` — https://ui.shadcn.com/docs/components/hover-card |
| 40 | **HoverCardContent** | shadcn/ui | Included with `hover-card` |
| 41 | **ContextMenu** | shadcn/ui | `npx shadcn@latest add context-menu` — https://ui.shadcn.com/docs/components/context-menu |
| 42 | **ContextMenuContent** | shadcn/ui | Included with `context-menu` |
| 43 | **ContextMenuItem** | shadcn/ui | Included with `context-menu` |
| 44 | **DropdownMenu** | shadcn/ui | `npx shadcn@latest add dropdown-menu` — https://ui.shadcn.com/docs/components/dropdown-menu |
| 45 | **DropdownMenuContent** | shadcn/ui | Included with `dropdown-menu` |
| 46 | **DropdownMenuItem** | shadcn/ui | Included with `dropdown-menu` |
| 47 | **DropdownMenuSeparator** | shadcn/ui | Included with `dropdown-menu` |

---

## Navigation & Layout

| # | Component | Source | Link / Install |
|---|-----------|--------|----------------|
| 48 | **Tabs** | shadcn/ui | `npx shadcn@latest add tabs` — https://ui.shadcn.com/docs/components/tabs |
| 49 | **TabsList** | shadcn/ui | Included with `tabs` |
| 50 | **TabsTrigger** | shadcn/ui | Included with `tabs` |
| 51 | **TabsContent** | shadcn/ui | Included with `tabs` |
| 52 | **Accordion** | shadcn/ui | `npx shadcn@latest add accordion` — https://ui.shadcn.com/docs/components/accordion |
| 53 | **AccordionItem** | shadcn/ui | Included with `accordion` |
| 54 | **AccordionTrigger** | shadcn/ui | Included with `accordion` |
| 55 | **AccordionContent** | shadcn/ui | Included with `accordion` |
| 56 | **Collapsible** | shadcn/ui | `npx shadcn@latest add collapsible` — https://ui.shadcn.com/docs/components/collapsible |
| 57 | **CollapsibleTrigger** | shadcn/ui | Included with `collapsible` |
| 58 | **CollapsibleContent** | shadcn/ui | Included with `collapsible` |
| 59 | **NavigationMenu** | shadcn/ui | `npx shadcn@latest add navigation-menu` — https://ui.shadcn.com/docs/components/navigation-menu |
| 60 | **ScrollArea** | shadcn/ui | `npx shadcn@latest add scroll-area` — https://ui.shadcn.com/docs/components/scroll-area |
| 61 | **ScrollAreaViewport** | shadcn/ui | Included with `scroll-area` |
| 62 | **ScrollAreaScrollbar** | shadcn/ui | Included with `scroll-area` |

---

## Feedback

| # | Component | Source | Link / Install |
|---|-----------|--------|----------------|
| 63 | **Toast** | shadcn/ui | `npx shadcn@latest add toast` — https://ui.shadcn.com/docs/components/toast |
| 64 | **Toaster** | shadcn/ui | Included with `toast` |
| 65 | **Alert** | shadcn/ui | `npx shadcn@latest add alert` — https://ui.shadcn.com/docs/components/alert |
| 66 | **AlertTitle** | shadcn/ui | Included with `alert` |
| 67 | **AlertDescription** | shadcn/ui | Included with `alert` |
| 68 | **Progress** | shadcn/ui | `npx shadcn@latest add progress` — https://ui.shadcn.com/docs/components/progress |
| 69 | **Sonner** | shadcn/ui | `npx shadcn@latest add sonner` — https://ui.shadcn.com/docs/components/sonner |

---

## Command & Search

| # | Component | Source | Link / Install |
|---|-----------|--------|----------------|
| 70 | **Command** | shadcn/ui | `npx shadcn@latest add command` — https://ui.shadcn.com/docs/components/command |
| 71 | **CommandDialog** | shadcn/ui | Included with `command` |
| 72 | **CommandInput** | shadcn/ui | Included with `command` |
| 73 | **CommandList** | shadcn/ui | Included with `command` |
| 74 | **CommandGroup** | shadcn/ui | Included with `command` |
| 75 | **CommandItem** | shadcn/ui | Included with `command` |
| 76 | **CommandSeparator** | shadcn/ui | Included with `command` |
| 77 | **CommandShortcut** | shadcn/ui | Included with `command` |
| 78 | **CommandEmpty** | shadcn/ui | Included with `command` |

---

## Data Display

| # | Component | Source | Link / Install |
|---|-----------|--------|----------------|
| 79 | **Table** | shadcn/ui | `npx shadcn@latest add table` — https://ui.shadcn.com/docs/components/table |
| 80 | **TableHeader** | shadcn/ui | Included with `table` |
| 81 | **TableBody** | shadcn/ui | Included with `table` |
| 82 | **TableRow** | shadcn/ui | Included with `table` |
| 83 | **TableCell** | shadcn/ui | Included with `table` |
| 84 | **TableHead** | shadcn/ui | Included with `table` |
| 85 | **Card** | shadcn/ui | `npx shadcn@latest add card` — https://ui.shadcn.com/docs/components/card |
| 86 | **CardHeader** | shadcn/ui | Included with `card` |
| 87 | **CardContent** | shadcn/ui | Included with `card` |
| 88 | **CardFooter** | shadcn/ui | Included with `card` |
| 89 | **CardTitle** | shadcn/ui | Included with `card` |
| 90 | **CardDescription** | shadcn/ui | Included with `card` |

---

## Charts (Recharts)

Install: `npm install recharts`
Docs: https://recharts.org/en-US/api

| # | Component |
|---|-----------|
| 91 | BarChart |
| 92 | Bar |
| 93 | AreaChart |
| 94 | Area |
| 95 | LineChart |
| 96 | Line |
| 97 | RadarChart |
| 98 | Radar |
| 99 | PolarGrid |
| 100 | PieChart |
| 101 | Pie |
| 102 | Cell |
| 103 | XAxis |
| 104 | YAxis |
| 105 | CartesianGrid |
| 106 | Tooltip |
| 107 | Legend |
| 108 | ResponsiveContainer |
| 109 | ReferenceLine |

All imported from `recharts`. No separate installs per component.

---

## Animation (Framer Motion)

Install: `npm install framer-motion`
Docs: https://www.framer.com/motion/

| # | Export |
|---|--------|
| 110 | `motion.div` |
| 111 | `motion.span` |
| 112 | `motion.button` |
| 113 | `AnimatePresence` |
| 114 | `useMotionValue` |
| 115 | `useSpring` |
| 116 | `useTransform` |
| 117 | `useScroll` |

All imported from `framer-motion`. No separate installs per export.

---

## Custom / App-Specific Components

Live in `website/src/components/ui/custom/`. Built once, reused everywhere.
Reference links are for inspiration — final code is project-owned.

| # | Component | Inspiration | Reference |
|---|-----------|-------------|-----------|
| 118 | **GlassCard** | ReactBits | https://www.reactbits.dev/components/glass-icons |
| 119 | **GlassSurface** | ReactBits | https://www.reactbits.dev/backgrounds/aurora |
| 120 | **IconDock** | Magic UI | https://magicui.design/docs/components/dock |
| 121 | **DockButton** | Magic UI | https://magicui.design/docs/components/dock |
| 122 | **FlyoutPanel** | Framer Motion | Custom — `AnimatePresence` + `motion.div` x-offset slide |
| 123 | **InspectorDrawer** | shadcn Sheet | `npx shadcn@latest add sheet` + glass overrides |
| 124 | **StatusPill** | Magic UI | https://magicui.design/docs/components/animated-subscribe-button |
| 125 | **PulsingDot** | Magic UI | https://magicui.design/docs/components/ripple |
| 126 | **AnomalyMarker** | Custom | Leaflet `DivIcon` + CSS pulse ring |
| 127 | **MarkerPulseRing** | ReactBits | https://www.reactbits.dev/components/magnet |
| 128 | **MetricCard** | shadcn Card | `card` primitive + glass overrides |
| 129 | **KeyValueRow** | Custom | Pure flexbox — no library |
| 130 | **DiurnalBarChart** | Recharts | `BarChart` + `Bar` + `ResponsiveContainer` minimal config |
| 131 | **FillBar** | shadcn Progress | `npx shadcn@latest add progress` |
| 132 | **ClassFilterRow** | shadcn Switch | `npx shadcn@latest add switch` + class color token |
| 133 | **FacilityJumpRow** | shadcn Button | `Button variant="ghost"` + class dot |
| 134 | **BasemapOptionRow** | shadcn RadioGroup | `npx shadcn@latest add radio-group` |
| 135 | **FeedStatusIndicator** | Magic UI | https://magicui.design/docs/components/ripple |
| 136 | **PollingHeartbeat** | ReactBits | https://www.reactbits.dev/components/animated-list |
| 137 | **PlaybackControls** | Custom | IconButton group from shadcn button primitive |
| 138 | **TimelineScrubber** | shadcn Slider | `npx shadcn@latest add slider` |
| 139 | **SpeedSelector** | shadcn Button | Cycles 1x/4x/12x — no separate library |
| 140 | **NotificationBadge** | shadcn Badge | `npx shadcn@latest add badge` — absolutely positioned |
| 141 | **AlertCard** | shadcn Alert | `npx shadcn@latest add alert` + glass styled |
| 142 | **ExportMenu** | shadcn DropdownMenu | `npx shadcn@latest add dropdown-menu` |
| 143 | **ConfidenceTable** | shadcn Table + Progress | `table` + `progress` fill bar |
| 144 | **GasTraceCard** | Custom | GlassCard + FillBar + mono text |
| 145 | **ShapWaterfall** | Recharts | Horizontal BarChart — future feature |
| 146 | **BurnScarPolygon** | Custom | Leaflet `GeoJSON` layer — future feature |
| 147 | **WindParticleOverlay** | Custom | Canvas/WebGL particles — future feature |
| 148 | **StateHeatmap** | Recharts | Analytics modal — future feature |
| 149 | **MapScaleBar** | Custom | Styled Leaflet scale control |
| 150 | **MapAttributionStrip** | Custom | Fixed bottom-left GlassCard |
| 151 | **TopBrandBar** | Custom | Fixed top-left transparent bar — no background |
| 152 | **ModeStatusTag** | Custom | StatusPill variant (archive vs live) |
| 153 | **SystemTelemetryModal** | shadcn Dialog | `npx shadcn@latest add dialog` + glass styled |
| 154 | **AnalyticsDashboardModal** | shadcn Dialog | Same — full-screen variant |
| 155 | **EmptyState** | Custom | Centered Lucide icon + text block |
| 156 | **ErrorState** | Custom | EmptyState pattern + retry button |
| 157 | **LoadingState** | Custom | Skeleton rows + Spinner |
| 158 | **CommandPaletteOverlay** | shadcn Command + Dialog | `npx shadcn@latest add command` inside Dialog |

---

## Dock (Keep As-Is)

Source: Magic UI
Install: `npx shadcn@latest add "https://magicui.design/r/dock"`
Docs: https://magicui.design/docs/components/dock

```tsx
import { Dock, DockIcon } from "@/components/magicui/dock"

<Dock iconMagnification={60} iconDistance={100}>
  <DockIcon className="bg-white/10 backdrop-blur-md">
    <MyIcon className="size-full" />
  </DockIcon>
</Dock>
```

Mounted vertically left and right of the map canvas using a `flex-col` wrapper.

---

## One-Shot Bulk Install

Run inside `/website`:

```bash
# All shadcn components at once
npx shadcn@latest add button tooltip badge avatar separator skeleton label switch checkbox radio-group slider select input textarea accordion collapsible tabs navigation-menu scroll-area dialog sheet drawer popover hover-card context-menu dropdown-menu toast alert progress sonner command table card

# Charts + animation
npm install recharts framer-motion

# Magic UI dock
npx shadcn@latest add "https://magicui.design/r/dock"
```
"use client"

import React from "react"

import { Dock, DockIcon } from "@/registry/magicui/dock"

export type IconProps = React.HTMLAttributes<SVGElement>

export function DockDemo() {
  return (
    <div className="relative">
      <Dock iconMagnification={60} iconDistance={100}>
        <DockIcon className="bg-black/10 dark:bg-white/10">
          <Icons.gitHub className="size-full" />
        </DockIcon>
        <DockIcon className="bg-black/10 dark:bg-white/10">
          <Icons.googleDrive className="size-full" />
        </DockIcon>
        <DockIcon className="bg-black/10 dark:bg-white/10">
          <Icons.notion className="size-full" />
        </DockIcon>
        <DockIcon className="bg-black/10 dark:bg-white/10">
          <Icons.whatsapp className="size-full" />
        </DockIcon>
      </Dock>
    </div>
  )
}

const Icons = {
  gitHub: (props: IconProps) => (
    <svg viewBox="0 0 438.549 438.549" {...props}>
      <path
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      ></path>
    </svg>
  ),
  notion: (props: IconProps) => (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"
        fill="#fff"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"
        fill="#000"
      />
    </svg>
  ),
  googleDrive: (props: IconProps) => (
    <svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
        fill="#0066da"
      />
      <path
        d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
        fill="#00ac47"
      />
      <path
        d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
        fill="#ea4335"
      />
      <path
        d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
        fill="#00832d"
      />
      <path
        d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
        fill="#2684fc"
      />
      <path
        d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
        fill="#ffba00"
      />
    </svg>
  ),
  whatsapp: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 175.216 175.552"
      {...props}
    >
      <defs>
        <linearGradient
          id="b"
          x1="85.915"
          x2="86.535"
          y1="32.567"
          y2="137.092"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
        <filter
          id="a"
          width="1.115"
          height="1.114"
          x="-.057"
          y="-.057"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="3.531" />
        </filter>
      </defs>
      <path
        fill="#b3b3b3"
        d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
        filter="url(#a)"
      />
      <path
        fill="#fff"
        d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
      />
      <path
        fill="url(#linearGradient1780)"
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"
      />
      <path
        fill="url(#b)"
        d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
      />
    </svg>
  ),
}
2. Button - https://21st.dev/community/components/s/button?preview=%2F%40lyanchouss%2Fcomponents%2Forigin-button

3. Icon Button - https://mui.com/material-ui/react-button/

4. ToolTip - https://react-aria.adobe.com/Tooltip

5. Badge - https://mui.com/material-ui/react-badge/

6. Avatar - import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

export default function SizeAvatars() {
  return (
    <Stack direction="row" spacing={2}>
      <Avatar
        alt="Remy Sharp"
        src="/static/images/avatar/1.jpg"
        sx={{ width: 24, height: 24 }}
      />
      <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
      <Avatar
        alt="Remy Sharp"
        src="/static/images/avatar/1.jpg"
        sx={{ width: 56, height: 56 }}
      />
    </Stack>
  );
}

7. Separator Divider - https://mui.com/material-ui/react-divider/

8. Spinner - .loader {
  --color-1: #fff;
  --size: 1px;

  color: var(--color-1);
  font-size: calc(10 * var(--size));
  width: 1em;
  height: 1em;
  border-radius: 50%;
  position: relative;
  text-indent: -9999em;
  animation: mulShdSpin 1.3s infinite linear;
  transform: translateZ(0);
}

@keyframes mulShdSpin {
  0%,
  100% {
    box-shadow:
      0 -3em 0 0.2em,
      2em -2em 0 0em,
      3em 0 0 -1em,
      2em 2em 0 -1em,
      0 3em 0 -1em,
      -2em 2em 0 -1em,
      -3em 0 0 -1em,
      -2em -2em 0 0;
  }
  12.5% {
    box-shadow:
      0 -3em 0 0,
      2em -2em 0 0.2em,
      3em 0 0 0,
      2em 2em 0 -1em,
      0 3em 0 -1em,
      -2em 2em 0 -1em,
      -3em 0 0 -1em,
      -2em -2em 0 -1em;
  }
  25% {
    box-shadow:
      0 -3em 0 -0.5em,
      2em -2em 0 0,
      3em 0 0 0.2em,
      2em 2em 0 0,
      0 3em 0 -1em,
      -2em 2em 0 -1em,
      -3em 0 0 -1em,
      -2em -2em 0 -1em;
  }
  37.5% {
    box-shadow:
      0 -3em 0 -1em,
      2em -2em 0 -1em,
      3em 0em 0 0,
      2em 2em 0 0.2em,
      0 3em 0 0em,
      -2em 2em 0 -1em,
      -3em 0em 0 -1em,
      -2em -2em 0 -1em;
  }
  50% {
    box-shadow:
      0 -3em 0 -1em,
      2em -2em 0 -1em,
      3em 0 0 -1em,
      2em 2em 0 0em,
      0 3em 0 0.2em,
      -2em 2em 0 0,
      -3em 0em 0 -1em,
      -2em -2em 0 -1em;
  }
  62.5% {
    box-shadow:
      0 -3em 0 -1em,
      2em -2em 0 -1em,
      3em 0 0 -1em,
      2em 2em 0 -1em,
      0 3em 0 0,
      -2em 2em 0 0.2em,
      -3em 0 0 0,
      -2em -2em 0 -1em;
  }
  75% {
    box-shadow:
      0em -3em 0 -1em,
      2em -2em 0 -1em,
      3em 0em 0 -1em,
      2em 2em 0 -1em,
      0 3em 0 -1em,
      -2em 2em 0 0,
      -3em 0em 0 0.2em,
      -2em -2em 0 0;
  }
  87.5% {
    box-shadow:
      0em -3em 0 0,
      2em -2em 0 -1em,
      3em 0 0 -1em,
      2em 2em 0 -1em,
      0 3em 0 -1em,
      -2em 2em 0 0,
      -3em 0em 0 0,
      -2em -2em 0 0.2em;
  }
}

10. Skeleton - https://mui.com/material-ui/react-skeleton/
11. Label - https://react.semantic-ui.com/elements/label/#types-basic
12. Kbd - pnpm dlx shadcn@latest add @reui/c-kbd-6
