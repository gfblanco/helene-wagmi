"use client"

import type { ComponentProps, ReactNode } from "react"

import { createContext, useContext, useMemo, useRef } from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export enum Keys {
  Enter = "Enter",
  Space = "Space",
  Control = "Control",
  Shift = "Shift",
  Alt = "Alt",
  Escape = "Escape",
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
  Backspace = "Backspace",
  Tab = "Tab",
  CapsLock = "CapsLock",
  Fn = "Fn",
  Command = "Command",
  Insert = "Insert",
  Delete = "Delete",
  Home = "Home",
  End = "End",
  PageUp = "PageUp",
  PageDown = "PageDown",
  PrintScreen = "PrintScreen",
  Pause = "Pause",
}

const KEY_MAPPINGS: Record<
  string,
  {
    symbols: {
      mac?: string
      windows?: string
      default: string
    }
    label: string
  }
> = {
  [Keys.Enter]: {
    symbols: { mac: "↩", default: "↵" },
    label: "Enter",
  },
  [Keys.Space]: {
    symbols: { default: "␣" },
    label: "Space",
  },
  [Keys.Control]: {
    symbols: { mac: "⌃", default: "Ctrl" },
    label: "Control",
  },
  [Keys.Shift]: {
    symbols: { mac: "⇧", default: "Shift" },
    label: "Shift",
  },
  [Keys.Alt]: {
    symbols: { mac: "⌥", default: "Alt" },
    label: "Alt/Option",
  },
  [Keys.Escape]: {
    symbols: { mac: "⎋", default: "Esc" },
    label: "Escape",
  },
  [Keys.ArrowUp]: {
    symbols: { default: "↑" },
    label: "Arrow Up",
  },
  [Keys.ArrowDown]: {
    symbols: { default: "↓" },
    label: "Arrow Down",
  },
  [Keys.ArrowLeft]: {
    symbols: { default: "←" },
    label: "Arrow Left",
  },
  [Keys.ArrowRight]: {
    symbols: { default: "→" },
    label: "Arrow Right",
  },
  [Keys.Backspace]: {
    symbols: { mac: "⌫", default: "⟵" },
    label: "Backspace",
  },
  [Keys.Tab]: {
    symbols: { mac: "⇥", default: "⭾" },
    label: "Tab",
  },
  [Keys.CapsLock]: {
    symbols: { default: "⇪" },
    label: "Caps Lock",
  },
  [Keys.Fn]: {
    symbols: { default: "Fn" },
    label: "Fn",
  },
  [Keys.Command]: {
    symbols: { mac: "⌘", windows: "⊞ Win", default: "Command" },
    label: "Command",
  },
  [Keys.Insert]: {
    symbols: { default: "Ins" },
    label: "Insert",
  },
  [Keys.Delete]: {
    symbols: { mac: "⌦", default: "Del" },
    label: "Delete",
  },
  [Keys.Home]: {
    symbols: { mac: "↖", default: "Home" },
    label: "Home",
  },
  [Keys.End]: {
    symbols: { mac: "↘", default: "End" },
    label: "End",
  },
  [Keys.PageUp]: {
    symbols: { mac: "⇞", default: "PgUp" },
    label: "Page Up",
  },
  [Keys.PageDown]: {
    symbols: { mac: "⇟", default: "PgDn" },
    label: "Page Down",
  },
  [Keys.PrintScreen]: {
    symbols: { default: "PrtSc" },
    label: "Print Screen",
  },
  [Keys.Pause]: {
    symbols: { mac: "⎉", default: "Pause" },
    label: "Pause/Break",
  },
}

// #region ShortcutContext

type ShortcutContextState = {
  os: "mac" | "windows"
  keyMappings: Record<
    string,
    {
      symbols?: {
        mac?: string
        windows?: string
        default?: string
      }
      label?: string
    }
  >
}

const ShortcutContext = createContext<ShortcutContextState | null>(null)

export const useShortcut = () => {
  const context = useContext(ShortcutContext)

  if (!context) throw new Error("useShortcut must be used within a ShortcutProvider")

  return context
}

// #endregion

// #region ShortcutProvider

type ShortcutProviderProps = {
  children: ReactNode
  os?: ShortcutContextState["os"]
  keyMappings?: ShortcutContextState["keyMappings"]
}

export const ShortcutProvider = ({
  children,
  os = "mac",
  keyMappings = {},
}: ShortcutProviderProps) => {
  const keyMappingsDefaults = useMemo(() => {
    const keyMappingsDefaults = {} as typeof keyMappings

    for (const key in KEY_MAPPINGS) {
      const keyData = keyMappings[key]
      const keyDataDefault = KEY_MAPPINGS[key]

      if (keyData) {
        keyMappingsDefaults[key] = {
          symbols: {
            mac: keyData?.symbols?.mac ?? keyDataDefault.symbols.mac,
            windows: keyData?.symbols?.windows ?? keyDataDefault.symbols.windows,
            default: keyData?.symbols?.default ?? keyDataDefault.symbols.default,
          },
          label: keyData?.label ?? keyDataDefault.label,
        }
      } else {
        keyMappingsDefaults[key] = keyDataDefault
      }
    }

    return keyMappingsDefaults
  }, [keyMappings])

  return (
    <TooltipProvider>
      <ShortcutContext.Provider
        value={{
          os,
          keyMappings: keyMappingsDefaults,
        }}
      >
        {children}
      </ShortcutContext.Provider>
    </TooltipProvider>
  )
}

// #endregion

// #region KeySymbol

type KeySymbolProps = ComponentProps<"kbd"> & {
  keyName: string
  disableTooltip?: boolean
}

export const KeySymbol = ({
  className,
  keyName,
  disableTooltip = false,
  ...props
}: KeySymbolProps) => {
  const triggerRef = useRef(null)
  const { os, keyMappings } = useShortcut()
  const keyData = keyMappings[keyName]
  const symbol = keyData?.symbols?.[os] ?? keyData?.symbols?.default ?? keyName
  const label = keyData?.label ?? keyName
  const hideTooltip = disableTooltip || label === symbol

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger
        ref={triggerRef}
        className={cn("cursor-help", hideTooltip && "cursor-default")}
        onClick={(e) => e.preventDefault()}
      >
        <kbd
          className={cn(
            "pointer-events-none flex h-5 w-fit min-w-5 select-none items-center justify-center rounded-sm border bg-muted px-1 text-xs font-normal tabular-nums tracking-tight text-primary/70",
            className,
          )}
          {...props}
        >
          {symbol}
        </kbd>
      </TooltipTrigger>
      <TooltipContent
        className="px-2 py-1"
        hidden={hideTooltip}
        onPointerDownOutside={(e) => e.target === triggerRef.current && e.preventDefault()}
      >
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  )
}

// #endregion

// #region KeyCombo

type KeyComboProps = Omit<ComponentProps<typeof KeySymbol>, "keyName" | "disableTooltip"> & {
  keyNames: string[]
  disableTooltips?: boolean
}

export const KeyCombo = ({ keyNames, disableTooltips = false, ...props }: KeyComboProps) => {
  return (
    <kbd className="flex items-center gap-1">
      {keyNames.map((keyName) => (
        <KeySymbol key={keyName} disableTooltip={disableTooltips} keyName={keyName} {...props} />
      ))}
    </kbd>
  )
}

// #endregion
