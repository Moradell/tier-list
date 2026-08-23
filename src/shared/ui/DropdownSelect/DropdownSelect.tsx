import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as SelectPrimitive from '@radix-ui/react-select'
import { useMemo, useRef, useState } from 'react'
import './DropdownSelect.scss'

export interface DropdownSelectOption {
  label: string
  value: string
}

interface DropdownSelectProps {
  ariaLabel: string
  className?: string
  onValueChange: (value: string) => void
  options: DropdownSelectOption[]
  searchMatch?: 'includes' | 'starts-with'
  searchable?: boolean
  scrollable?: boolean
  value: string
}

const EMPTY_VALUE = '__dropdown_select_empty__'

export function DropdownSelect({
  ariaLabel,
  className = '',
  onValueChange,
  options,
  searchMatch = 'includes',
  searchable = false,
  scrollable = false,
  value,
}: DropdownSelectProps) {
  if (searchable) {
    return (
      <SearchableDropdownSelect
        ariaLabel={ariaLabel}
        className={className}
        onValueChange={onValueChange}
        options={options}
        searchMatch={searchMatch}
        scrollable={scrollable}
        value={value}
      />
    )
  }

  return (
    <SelectPrimitive.Root
      value={value || EMPTY_VALUE}
      onValueChange={(nextValue) => onValueChange(nextValue === EMPTY_VALUE ? '' : nextValue)}
    >
      <SelectPrimitive.Trigger
        className={`dropdown-select-trigger ${className}`.trim()}
        aria-label={ariaLabel}
      >
        <SelectPrimitive.Value />
        <DropdownIcon />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={`dropdown-select-content${scrollable ? ' dropdown-select-content--scrollable' : ''}`}
          position="popper"
          side="bottom"
          align="start"
          sideOffset={5}
          avoidCollisions={false}
        >
          <SelectPrimitive.Viewport className="dropdown-select-viewport">
            {options.map((option) => (
              <SelectPrimitive.Item
                className="dropdown-select-item"
                key={option.value || EMPTY_VALUE}
                value={option.value || EMPTY_VALUE}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="dropdown-select-indicator">✓</SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

function DropdownIcon() {
  return (
    <span className="dropdown-select-icon" aria-hidden="true">
      <svg viewBox="0 0 12 12"><path d="m2.5 4.5 3.5 3 3.5-3" /></svg>
    </span>
  )
}

function SearchableDropdownSelect({
  ariaLabel,
  className = '',
  onValueChange,
  options,
  searchMatch = 'includes',
  scrollable = false,
  value,
}: Omit<DropdownSelectProps, 'searchable'>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const filteredOptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ru-RU')
    if (!normalizedQuery) return options
    return options.filter((option) => {
      const normalizedLabel = option.label.toLocaleLowerCase('ru-RU')
      return searchMatch === 'starts-with'
        ? normalizedLabel.startsWith(normalizedQuery)
        : normalizedLabel.includes(normalizedQuery)
    })
  }, [options, searchMatch, searchQuery])
  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  const selectOption = (option: DropdownSelectOption) => {
    onValueChange(option.value)
    setIsOpen(false)
  }

  return (
    <PopoverPrimitive.Root
      open={isOpen}
      onOpenChange={(nextIsOpen) => {
        setIsOpen(nextIsOpen)
        if (!nextIsOpen) setSearchQuery('')
      }}
    >
      <PopoverPrimitive.Trigger
        className={`dropdown-select-trigger ${className}`.trim()}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label}</span>
        <DropdownIcon />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={contentRef}
          className={`dropdown-select-content dropdown-select-content--combobox${scrollable ? ' dropdown-select-content--scrollable' : ''}`}
          side="bottom"
          align="start"
          sideOffset={5}
          avoidCollisions={false}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            searchInputRef.current?.focus({ preventScroll: true })
          }}
        >
          <div className="dropdown-select-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              ref={searchInputRef}
              aria-label={`Поиск: ${ariaLabel.toLocaleLowerCase('ru-RU')}`}
              value={searchQuery}
              placeholder="Начните вводить"
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  contentRef.current?.querySelector<HTMLButtonElement>('.dropdown-select-item')?.focus()
                }
                if (event.key === 'Enter' && filteredOptions[0]) {
                  event.preventDefault()
                  selectOption(filteredOptions[0])
                }
              }}
            />
          </div>
          <div className="dropdown-select-viewport" role="listbox">
            {filteredOptions.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className="dropdown-select-item"
                key={option.value || EMPTY_VALUE}
                onClick={() => selectOption(option)}
              >
                <span>{option.label}</span>
                {option.value === value && <span className="dropdown-select-indicator">✓</span>}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="dropdown-select-empty">Ничего не найдено</div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
