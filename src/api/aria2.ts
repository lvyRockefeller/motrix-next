/** @fileoverview Aria2 JSON-RPC client wrapper providing typed API for task management. */
import { Aria2 } from '@shared/aria2'
import { TASK_STATUS } from '@shared/constants'
import {
    changeKeysToCamelCase,
    formatOptionsForEngine,
} from '@shared/utils'

let client: Aria2 | null = null
let engineReady = false

/** Returns true when the aria2 RPC connection has been established. */
export function isEngineReady(): boolean {
    return engineReady
}

/** Returns the initialized Aria2 client instance or throws if not yet initialized. */
export function getClient(): Aria2 {
    if (!client) throw new Error('Aria2 client not initialized')
    return client
}

/** Creates and opens a new Aria2 RPC client connection. */
export async function initClient(options: { port: number; secret: string }) {
    client = new Aria2({
        host: '127.0.0.1',
        port: options.port,
        secret: options.secret,
    })
    await client.open()
    engineReady = true
    return client
}

/** Closes the active Aria2 RPC connection and resets the client. */
export async function closeClient() {
    if (client) {
        await client.close()
        client = null
    }
}

/** Retrieves aria2 engine version and list of enabled features. */
export async function getVersion() {
    return getClient().call('getVersion') as Promise<{ version: string; enabledFeatures: string[] }>
}

export async function getGlobalOption() {
    const data = await getClient().call('getGlobalOption')
    return changeKeysToCamelCase(data as Record<string, unknown>)
}

export async function getGlobalStat() {
    return getClient().call('getGlobalStat') as Promise<Record<string, string>>
}

export async function changeGlobalOption(options: Record<string, unknown>) {
    const engineOptions = formatOptionsForEngine(options)
    return getClient().call('changeGlobalOption', engineOptions)
}

export async function getOption(params: { gid: string }) {
    const data = await getClient().call('tellStatus', params.gid)
    return changeKeysToCamelCase(data as Record<string, unknown>)
}

export async function changeOption(params: { gid: string; options: Record<string, unknown> }) {
    const engineOptions = formatOptionsForEngine(params.options)
    return getClient().call('changeOption', params.gid, engineOptions)
}

async function tellStatus(gid: string) {
    return getClient().call('tellStatus', gid) as Promise<Record<string, unknown>>
}

async function tellActive() {
    return getClient().call('tellActive') as Promise<Record<string, unknown>[]>
}

async function tellWaiting(offset: number, num: number) {
    return getClient().call('tellWaiting', offset, num) as Promise<Record<string, unknown>[]>
}

async function tellStopped(offset: number, num: number) {
    return getClient().call('tellStopped', offset, num) as Promise<Record<string, unknown>[]>
}

export async function fetchActiveTaskList() {
    return tellActive()
}

export async function fetchTaskList(params: { type: string }) {
    const { type } = params
    switch (type) {
        case TASK_STATUS.ACTIVE: {
            const [active, waiting] = await Promise.all([
                tellActive(),
                tellWaiting(0, 1000),
            ])
            return [...active, ...waiting] as Record<string, unknown>[]
        }
        default:
            return tellStopped(0, 1000)
    }
}

export async function fetchTaskItem(params: { gid: string }) {
    return tellStatus(params.gid)
}

export async function fetchTaskItemWithPeers(params: { gid: string }) {
    const [task, peers] = await Promise.all([
        tellStatus(params.gid),
        getClient().call('getPeers', params.gid) as Promise<unknown[]>,
    ])
    return { ...task, peers }
}

/** Adds one or more URI downloads with per-URI output filename overrides. */
export async function addUri(params: { uris: string[]; outs: string[]; options: Record<string, unknown> }) {
    const { uris, outs, options } = params
    const engineOptions = formatOptionsForEngine(options)
    const tasks = uris.map((uri, index) => {
        const opts = { ...engineOptions }
        if (outs[index]) opts.out = outs[index]
        return getClient().call('addUri', [uri], opts)
    })
    return Promise.all(tasks)
}

/** Adds a torrent download from a base64-encoded .torrent file. */
export async function addTorrent(params: { torrent: string; options: Record<string, unknown> }) {
    const engineOptions = formatOptionsForEngine(params.options)
    return getClient().call('addTorrent', params.torrent, [], engineOptions)
}

export async function addMetalink(params: { metalink: string; options: Record<string, unknown> }) {
    const engineOptions = formatOptionsForEngine(params.options)
    return getClient().call('addMetalink', params.metalink, engineOptions)
}

export async function removeTask(params: { gid: string }) {
    return getClient().call('forceRemove', params.gid)
}

export async function forcePauseTask(params: { gid: string }) {
    return getClient().call('forcePause', params.gid)
}

export async function pauseTask(params: { gid: string }) {
    return getClient().call('pause', params.gid)
}

export async function resumeTask(params: { gid: string }) {
    return getClient().call('unpause', params.gid)
}

export async function pauseAllTask() {
    return getClient().call('pauseAll')
}

export async function forcePauseAllTask() {
    return getClient().call('forcePauseAll')
}

export async function resumeAllTask() {
    return getClient().call('unpauseAll')
}

export async function saveSession() {
    return getClient().call('saveSession')
}

export async function removeTaskRecord(params: { gid: string }) {
    return getClient().call('removeDownloadResult', params.gid)
}

export async function purgeTaskRecord() {
    return getClient().call('purgeDownloadResult')
}

export async function batchResumeTask(params: { gids: string[] }) {
    const calls = params.gids.map((gid) => ['unpause', gid] as [string, ...unknown[]])
    return getClient().multicall(calls)
}

export async function batchPauseTask(params: { gids: string[] }) {
    const calls = params.gids.map((gid) => ['forcePause', gid] as [string, ...unknown[]])
    return getClient().multicall(calls)
}

export async function batchForcePauseTask(params: { gids: string[] }) {
    return batchPauseTask(params)
}

export async function batchRemoveTask(params: { gids: string[] }) {
    const calls = params.gids.map((gid) => ['forceRemove', gid] as [string, ...unknown[]])
    return getClient().multicall(calls)
}

/** Fetches user preferences from the Tauri persistent store. */
export async function fetchPreference() {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke('get_app_config') as Promise<Record<string, unknown>>
}

/** Saves updated user preferences to the Tauri persistent store. */
export async function savePreference(config: Record<string, unknown>) {
    const { invoke } = await import('@tauri-apps/api/core')
    return invoke('save_preference', { config })
}

const api = {
    initClient,
    closeClient,
    getVersion,
    getGlobalOption,
    getGlobalStat,
    changeGlobalOption,
    getOption,
    changeOption,
    fetchActiveTaskList,
    fetchTaskList,
    fetchTaskItem,
    fetchTaskItemWithPeers,
    addUri,
    addTorrent,
    addMetalink,
    removeTask,
    forcePauseTask,
    pauseTask,
    resumeTask,
    pauseAllTask,
    forcePauseAllTask,
    resumeAllTask,
    saveSession,
    removeTaskRecord,
    purgeTaskRecord,
    batchResumeTask,
    batchPauseTask,
    batchForcePauseTask,
    batchRemoveTask,
    fetchPreference,
    savePreference,
}

export default api
