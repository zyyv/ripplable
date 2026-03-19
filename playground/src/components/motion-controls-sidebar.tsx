import type { RefObject } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
} from '@ripplable/ui'
import {
  type MotionConfig,
  type MotionControlDefinition,
  formatControlValue,
  motionControlSections,
} from '@/lib/motion-config'

function MotionControlRow({
  control,
  value,
  onChange,
}: {
  control: MotionControlDefinition
  value: number
  onChange: (key: keyof MotionConfig, value: number) => void
}) {
  return (
    <label className="motion-control-row">
      <div className="motion-control-head">
        <span className="motion-control-label">{control.label}</span>
        <Badge variant="outline" className="motion-control-value">
          {formatControlValue(value, control.step)}
        </Badge>
      </div>
      <input
        className="motion-control-slider"
        max={control.max}
        min={control.min}
        step={control.step}
        type="range"
        value={value}
        onChange={event => onChange(control.key, Number(event.target.value))}
      />
    </label>
  )
}

interface MotionControlsSidebarProps {
  panelRef: RefObject<HTMLDivElement | null>
  isOpen: boolean
  showFps: boolean
  motionConfig: MotionConfig
  onOpenChange: (nextOpen: boolean) => void
  onShowFpsChange: (nextShowFps: boolean) => void
  onMotionConfigChange: (key: keyof MotionConfig, value: number) => void
  onReset: () => void
}

export function MotionControlsSidebar({
  panelRef,
  isOpen,
  showFps,
  motionConfig,
  onOpenChange,
  onShowFpsChange,
  onMotionConfigChange,
  onReset,
}: MotionControlsSidebarProps) {
  return (
    <>
      <div className="motion-sidebar-toggle-wrap">
        <Button
          className="motion-sidebar-toggle"
          size="sm"
          variant="outline"
          onClick={() => onOpenChange(!isOpen)}
        >
          <span className="motion-sidebar-toggle-glyph" aria-hidden="true" />
          {isOpen ? 'Hide Controls' : 'Show Controls'}
        </Button>
      </div>

      <div
        ref={panelRef}
        className={`motion-sidebar ${isOpen ? 'is-open' : ''}`}
        data-motion-sidebar
        style={{ touchAction: 'auto' }}
      >
        <Card className="motion-sidebar-panel">
          <CardHeader className="motion-sidebar-header">
            <div className="motion-sidebar-header-top">
              <div className="motion-sidebar-heading">
                <Badge className="motion-sidebar-chip" variant="outline">
                  Motion Config
                </Badge>
                <div>
                  <CardTitle className="motion-sidebar-title">Sidebar Controls</CardTitle>
                  <CardDescription className="motion-sidebar-description">
                    Tune scroll follow, wave behavior, and lane spacing live.
                  </CardDescription>
                </div>
              </div>

              <Button
                aria-label="Reset motion settings"
                className="motion-sidebar-reset"
                size="icon-sm"
                variant="outline"
                onClick={onReset}
              >
                <span className="motion-sidebar-reset-symbol" aria-hidden="true">
                  ↺
                </span>
              </Button>
            </div>

            <div className="motion-sidebar-fps-row">
              <div>
                <div className="motion-sidebar-fps-label">FPS Monitor</div>
                <div className="motion-sidebar-fps-copy">Toggle the live frame counter overlay.</div>
              </div>
              <Switch checked={showFps} onCheckedChange={onShowFpsChange} />
            </div>
          </CardHeader>

          <CardContent className="motion-sidebar-content">
            <div className="motion-control-sections">
              {motionControlSections.map(section => (
                <section key={section.title} className="motion-control-section">
                  <div className="motion-control-section-header">
                    <div className="motion-control-section-title">{section.title}</div>
                    <p className="motion-control-section-description">{section.description}</p>
                  </div>

                  <div className="motion-control-section-body">
                    {section.controls.map(control => (
                      <MotionControlRow
                        key={control.key}
                        control={control}
                        value={motionConfig[control.key]}
                        onChange={onMotionConfigChange}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
