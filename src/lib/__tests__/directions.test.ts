import { describe, expect, it } from 'vitest'
import { findRoute } from '@/lib/pathfinding'
import { generateDirections } from '@/lib/directions'

describe('generateDirections', () => {
  it('starts with a "Start at" instruction and ends with "Arrive at"', () => {
    const route = findRoute('aq-f1-101', 'asb-f1-101')
    const directions = generateDirections(route!)
    expect(directions[0].instruction).toMatch(/^Start at/)
    expect(directions.at(-1)?.instruction).toMatch(/^Arrive at/)
  })

  it('describes vertical circulation using "stairs" or "elevator" wording', () => {
    const route = findRoute('aq-f1-101', 'aq-f2-201', { accessibleOnly: true })
    const directions = generateDirections(route!)
    expect(directions.some((d) => /elevator/i.test(d.instruction))).toBe(true)
  })

  it('produces one instruction per route step, with zero time on the first', () => {
    const route = findRoute('aq-f1-101', 'aq-f1-102')
    const directions = generateDirections(route!)
    expect(directions).toHaveLength(route!.steps.length)
    expect(directions[0].timeSec).toBe(0)
    expect(directions[1].timeSec).toBeGreaterThan(0)
  })
})
