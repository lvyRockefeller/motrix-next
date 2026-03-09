<script setup lang="ts">
/** @fileoverview Torrent file drop zone and loaded torrent info display. */
import { NIcon, NTooltip, NButton, NText } from 'naive-ui'
import { CloudUploadOutline, TrashOutline } from '@vicons/ionicons5'

defineProps<{
  loaded: boolean
  name: string
}>()

defineEmits<{
  choose: []
  clear: []
}>()
</script>

<template>
  <div class="tab-pane-content">
    <Transition name="torrent-swap" mode="out-in">
      <div v-if="loaded" key="loaded">
        <div class="torrent-info-row">
          <NTooltip>
            <template #trigger>
              <div class="torrent-filename">
                <NIcon :size="18" style="margin-right: 6px; flex-shrink: 0"><CloudUploadOutline /></NIcon>
                <span>{{ name }}</span>
              </div>
            </template>
            {{ name }}
          </NTooltip>
          <NButton quaternary size="small" type="error" @click="$emit('clear')">
            <template #icon>
              <NIcon :size="16"><TrashOutline /></NIcon>
            </template>
          </NButton>
        </div>
        <slot name="file-list" />
      </div>
      <div v-else key="empty" class="torrent-upload" @click="$emit('choose')">
        <NIcon :size="48" :depth="3"><CloudUploadOutline /></NIcon>
        <NText style="display: block; margin-top: 8px; font-size: 14px">
          <slot name="placeholder">Drag torrent here or click to select</slot>
        </NText>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tab-pane-content {
  min-height: 150px;
  padding-bottom: 12px;
}
.torrent-swap-enter-active {
  transition:
    opacity 0.22s cubic-bezier(0.2, 0, 0, 1),
    transform 0.22s cubic-bezier(0.2, 0, 0, 1);
}
.torrent-swap-leave-active {
  transition:
    opacity 0.15s cubic-bezier(0.3, 0, 0.8, 0.15),
    transform 0.15s cubic-bezier(0.3, 0, 0.8, 0.15);
}
.torrent-swap-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
.torrent-swap-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.torrent-upload {
  min-height: 138px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px dashed var(--m3-drop-zone-border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1);
}
.torrent-upload:hover {
  border-color: var(--color-primary);
}
.torrent-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border: 1px solid var(--m3-drop-zone-border);
  border-radius: 8px;
  background: var(--m3-drop-zone-bg);
  margin-bottom: 10px;
}
.torrent-filename {
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  flex: 1;
  min-width: 0;
  max-width: 400px;
}
.torrent-filename span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
