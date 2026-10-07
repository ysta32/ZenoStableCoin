import { describe, expect, it } from 'vitest'
import { formatUSD } from './money'

describe('formatUSD', () => {
  it.each([
    [0, '$0'],
    [1234.4, '$1,234'],
    [1234.6, '$1,235'],
    [-1234, '-$1,234'],
    [-0, '$0'],
    [-0.4, '$0'],
    [-0.5, '-$1'],
  ])('formats %s as %s by default', (value, expected) => {
    expect(formatUSD(value)).toBe(expected)
  })
  it('shows exactly two decimal places when cents are requested', () => {
    expect(formatUSD(12, { cents: true })).toBe('$12.00')
    expect(formatUSD(12.345, { cents: true })).toBe('$12.35')
    expect(formatUSD(-0.004, { cents: true })).toBe('$0.00')
    expect(formatUSD(-0.005, { cents: true })).toBe('-$0.01')
  })
  it('adds a positive sign but leaves zero unsigned', () => {
    expect(formatUSD(12, { sign: true })).toBe('+$12')
    expect(formatUSD(-12, { sign: true })).toBe('-$12')
    expect(formatUSD(0, { sign: true })).toBe('$0')
    expect(formatUSD(-0.4, { sign: true })).toBe('$0')
    expect(formatUSD(0.4, { sign: true })).toBe('$0')
  })
  it('formats compact thousands and millions', () => {
    expect(formatUSD(12500, { compact: true })).toBe('$12.5K')
    expect(formatUSD(2500000, { compact: true })).toBe('$2.5M')
    expect(formatUSD(-12500, { compact: true })).toBe('-$12.5K')
    expect(formatUSD(-0.04, { compact: true })).toBe('$0')
    expect(formatUSD(-0.05, { compact: true })).toBe('-$0.1')
  })
  it('combines all options', () => {
    expect(formatUSD(12500, { compact: true, cents: true, sign: true })).toBe('+$12.5K')
    expect(formatUSD(-12500, { compact: true, cents: true, sign: true })).toBe('-$12.5K')
    expect(formatUSD(12000, { compact: true, cents: true })).toBe('$12K')
  })
  it.each([NaN, Infinity, -Infinity])('renders non-finite %s as unavailable', (value) => {
    expect(formatUSD(value)).toBe('—')
    expect(formatUSD(value, { compact: true, cents: true, sign: true })).toBe('—')
  })
})
