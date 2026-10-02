import { describe, expect, it } from 'vitest'
import { parseMoney } from './money'

describe('parseMoney', () => {
  it.each([
    ['12', 1200],
    ['12.5', 1250],
    ['12,50', 1250],
    ['1.234,56', 123456],
    ['1,234.56', 123456],
    ['1.000', 100000],
    ['$ 9.99', 999],
  ])('parses %s', (input, expected) => {
    expect(parseMoney(input)).toBe(expected)
  })

  it('rejects input without digits', () => {
    expect(parseMoney('')).toBeNull()
    expect(parseMoney('abc')).toBeNull()
  })
})
