import { useEffect, useMemo, useRef, useState } from 'react'

const SelectArrow = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m6 15 6-6 6 6" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="m5 12 4 4 10-10" />
  </svg>
)

const CoachSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner',
  getOptionLabel = (option) => option?.label ?? option,
  getOptionValue = (option) => option?.value ?? option,
  disabled = false,
  className = ''
}) => {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const selectedOption = useMemo(
    () => options.find((option) => String(getOptionValue(option)) === String(value)),
    [getOptionValue, options, value]
  )

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[43px] w-full items-center justify-between rounded-md border px-4 text-left text-sm outline-none transition ${
          open
            ? 'border-brand-tamarillo text-brand-brown'
            : 'border-brand-brown/35 text-brand-brown'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span className={selectedOption ? 'truncate' : 'truncate text-brand-brown/35'}>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </span>
        <span className={`shrink-0 text-brand-brown/60 transition-transform ${open ? '' : 'rotate-180'}`}>
          <SelectArrow />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-56 overflow-y-auto rounded-md border border-brand-tamarillo/35 bg-brand-beige p-2 shadow-float">
          {options.map((option) => {
            const optionValue = getOptionValue(option)
            const selected = String(optionValue) === String(value)

            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => {
                  onChange(optionValue, option)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition ${
                  selected
                    ? 'bg-brand-tamarillo text-brand-beige'
                    : 'text-brand-brown hover:bg-brand-peach/40'
                }`}
              >
                <span className="truncate">{getOptionLabel(option)}</span>
                {selected ? <span className="ml-3 shrink-0"><CheckIcon /></span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default CoachSelect
