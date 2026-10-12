import { beforeEach, expect, test, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ execute: vi.fn(), insert: vi.fn(), values: vi.fn(), upsert: vi.fn(), admin: vi.fn(), select: vi.fn(), remove: vi.fn() }))
vi.mock('@tanstack/react-start', () => ({ createServerFn: () => ({ inputValidator: () => ({ handler: (fn: unknown) => fn }), handler: (fn: unknown) => fn }) }))
vi.mock('../../server/auth', () => ({ getCurrentAdmin: mocks.admin }))
vi.mock('../../server/db', () => ({ db: { execute: mocks.execute, transaction: (fn: Function) => fn({execute:mocks.execute,insert:mocks.insert}), select:mocks.select, delete:mocks.remove }, emailSubscribers: {email:'email',id:'id'} }))
import { submitGameScore, getGameLeaderboard, scoreInput } from '../../server/functions/leaderboard'
import { getSubscribers, exportSubscribersCSV, deleteSubscriber } from '../../server/functions/subscribers'
const input = {id:'c61ac667-cd9d-4b1b-9812-88546dd38a13',initials:'TST',email:'test@example.com',score:100,subscribe:true}
beforeEach(() => { vi.resetAllMocks(); mocks.execute.mockResolvedValue([{id:input.id}]); mocks.insert.mockReturnValue({values:mocks.values}); mocks.values.mockReturnValue({onConflictDoUpdate:mocks.upsert}); mocks.upsert.mockResolvedValue(undefined) })
test('opted-in score writes to the website subscriber list', async () => {
  await (submitGameScore as any)({data:input})
  expect(mocks.values).toHaveBeenCalledWith({email:input.email,source:'tough-crowd'})
  expect(mocks.upsert).toHaveBeenCalledWith({target:'email',set:{isActive:true}})
})
test('score-only entry never subscribes', async () => {
  await (submitGameScore as any)({data:{...input,subscribe:false}})
  expect(mocks.insert).not.toHaveBeenCalled()
})
test('replaying a saved submission never reactivates an unsubscribed address', async () => {
  mocks.execute.mockResolvedValue([])
  await (submitGameScore as any)({data:input})
  expect(mocks.insert).not.toHaveBeenCalled()
})
test('subscription failure is reported instead of a false success', async () => {
  mocks.upsert.mockRejectedValue(new Error('database unavailable'))
  await expect((submitGameScore as any)({data:input})).rejects.toThrow('database unavailable')
})
test('public scores exclude email and IDs', async () => {
  mocks.execute.mockResolvedValue([input])
  expect(await (getGameLeaderboard as any)()).toEqual([{initials:'TST',score:100}])
})
test('subscriber list, export and deletion require a server-side admin session', async () => {
  mocks.admin.mockResolvedValue(null)
  for (const action of [getSubscribers, exportSubscribersCSV]) await expect((action as any)()).rejects.toThrow('Unauthorized')
  await expect((deleteSubscriber as any)({data:{id:input.id}})).rejects.toThrow('Unauthorized')
  expect(mocks.select).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled()
})
test('normalizes addresses and rejects invalid email', () => {
  expect(scoreInput.parse({...input,email:'  TEST@EXAMPLE.COM  '}).email).toBe(input.email)
  expect(scoreInput.safeParse({...input,email:'invalid'}).success).toBe(false)
})
