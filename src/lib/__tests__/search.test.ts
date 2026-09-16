import { describe, expect, it } from 'vitest'
import { searchLocations, getSearchableLocations, getLocationByNodeId } from '@/lib/search'

describe('searchLocations', () => {
  it('returns nothing for an empty query', () => {
    expect(searchLocations('')).toEqual([])
    expect(searchLocations('   ')).toEqual([])
  })

  it('matches by room number', () => {
    const results = searchLocations('ASB-101')
    expect(results.some((r) => r.nodeId === 'asb-f1-101')).toBe(true)
  })

  it('is case-insensitive', () => {
    const upper = searchLocations('ASB-101').map((r) => r.nodeId)
    const lower = searchLocations('asb-101').map((r) => r.nodeId)
    expect(upper).toEqual(lower)
  })

  it('ranks "starts with" matches above "contains" matches', () => {
    const results = searchLocations('AQ Main')
    expect(results[0]?.nodeId).toBe('aq-entrance')
  })

  it('respects the limit', () => {
    expect(searchLocations('a', 3)).toHaveLength(3)
  })

  it('excludes non-destination node types like hallways', () => {
    const all = getSearchableLocations()
    expect(all.some((l) => l.type === 'hallway')).toBe(false)
  })
})

describe('getLocationByNodeId', () => {
  it('finds a known location', () => {
    expect(getLocationByNodeId('asb-entrance')?.label).toBe('ASB Main Entrance')
  })

  it('returns undefined for an unknown id', () => {
    expect(getLocationByNodeId('not-a-real-node')).toBeUndefined()
  })
})
