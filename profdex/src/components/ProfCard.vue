<script setup>
defineProps({
  professor: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const COLORS = ['#e74c3c', '#3498db', '#2ecc71']
</script>

<template>
  <div
    class="prof-card"
    :class="{
      'prof-card--captured': professor.captured,
      'prof-card--discovered': professor.discovered && !professor.captured,
      'prof-card--unknown': !professor.discovered,
    }"
  >
    <div class="prof-card__inner">
      <div class="prof-card__num pixel">
        #{{ String(index + 1).padStart(3, '0') }}
      </div>

      <div class="prof-card__avatar">
        <template v-if="professor.captured">
          <div class="avatar-circle" :style="{ background: COLORS[index % COLORS.length] }">
            <span class="avatar-initial">{{ professor.name[0] }}</span>
          </div>
          <div class="captured-badge">✓</div>
        </template>

        <template v-else-if="professor.discovered">
          <div class="avatar-circle avatar-shadow">
            <span class="avatar-initial">?</span>
          </div>
          <div class="discovered-badge">!</div>
        </template>

        <template v-else>
          <div class="avatar-unknown">
            <span class="pixel">???</span>
          </div>
        </template>
      </div>

      <div class="prof-card__name">
        <span v-if="professor.captured">{{ professor.name }}</span>
        <span v-else-if="professor.discovered" class="name-shadow">
          {{ professor.name.replace(/./g, '?') }}
        </span>
        <span v-else class="pixel" style="font-size: 8px; color: var(--text-muted)">???</span>
      </div>

      <div class="prof-card__status pixel">
        <span v-if="professor.captured" class="status-captured">CAPTURADO</span>
        <span v-else-if="professor.discovered" class="status-discovered">ENCONTRADO</span>
        <span v-else class="status-unknown">???</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prof-card {
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  background: var(--bg-card);
  overflow: hidden;
  transition: transform 0.15s, border-color 0.15s;
  cursor: default;
}

.prof-card--captured {
  border-color: var(--yellow);
  box-shadow: 0 0 16px rgba(255, 222, 0, 0.2);
}

.prof-card--discovered {
  border-color: #3a3a6a;
}

.prof-card__inner {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.prof-card__num {
  font-size: 8px;
  color: var(--text-muted);
  align-self: flex-start;
}

.prof-card--captured .prof-card__num {
  color: var(--yellow);
}

.prof-card__avatar {
  width: 72px;
  height: 72px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 28px;
  color: white;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
}

.avatar-shadow {
  background: #2a2a4a !important;
  filter: brightness(0.3);
}

.avatar-unknown {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1a1a3a;
  border: 2px dashed var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: var(--text-muted);
}

.captured-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 22px;
  height: 22px;
  background: var(--yellow);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--bg);
  font-weight: 900;
}

.discovered-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 22px;
  height: 22px;
  background: var(--red);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: white;
  font-weight: 900;
  animation: pulse 1.5s ease-in-out infinite;
}

.prof-card__name {
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  min-height: 18px;
}

.name-shadow {
  color: var(--text-muted);
  filter: blur(3px);
  user-select: none;
}

.prof-card__status {
  font-size: 7px;
  letter-spacing: 0.5px;
}

.status-captured {
  color: var(--yellow);
}

.status-discovered {
  color: var(--red-light);
}

.status-unknown {
  color: var(--text-muted);
}
</style>
