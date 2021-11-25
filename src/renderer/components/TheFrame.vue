<template lang="pug">
.frame-wrap
  .frame
    .frame-icon.mdi.mdi-alpha-m-box
    .frame-title MoeViewerN
    .frame-spacer
    .frame-btn.mdi.mdi-window-minimize(@click="onMin")
    .frame-btn.mdi.mdi-window-restore(@click="onMax")
    .frame-btn.mdi.mdi-window-close(@click="onClose")
  slot
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  methods: {
    onMin() {
      ipcRenderer.send("window-min");
    },
    onMax() {
      ipcRenderer.send("window-max");
    },
    onClose() {
      ipcRenderer.send("window-close");
    }
  }
};
</script>

<style lang="less" scoped>
.frame {
  // 可拖拽窗口
  -webkit-app-region: drag;
  user-select: none;
  display: flex;
  cursor: pointer;
  color: rgba(216, 216, 216, 1);
  line-height: var(--frame-height);
  background: rgba(48, 48, 64, 1);
  align-items: center;
  justify-content: center;
  .frame-icon {
    margin-left: 0.5rem;
    font-size: 1.25rem;
  }
  .frame-title {
    font-family: Shizuku;
    font-size: 1rem;
    font-weight: 300;
    letter-spacing: 1px;
    margin-left: 0.33rem;
  }

  .frame-spacer {
    flex: 1;
  }

  .frame-btn {
    // 按钮不可拖拽
    -webkit-app-region: no-drag;
    text-align: center;
    width: 3rem;
    transition: 0.2s;
    font-size: 1.2rem;
    font-weight: 100;
    &:hover {
      background: rgba(64, 64, 96, 1);
    }
  }
}
</style>
