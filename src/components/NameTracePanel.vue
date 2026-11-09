<script setup lang="ts">
import StepList from "./StepList.vue";
import type { A11yNode } from "./../types/a11y";

defineProps<{ node: A11yNode | null }>();
</script>

<template>
  <section aria-labelledby="trace-title" class="border-t border-[var(--vp-c-divider)] p-4">
    <h2 id="trace-title" class="text-lg font-bold text-[var(--vp-c-text-1)]">
      Berechnung<template v-if="node"> für <code class="font-mono">&lt;{{ node.tag }}&gt;</code></template>
    </h2>

    <p v-if="!node" class="mt-2 text-[var(--vp-c-text-2)]">
      Wählen Sie im Baum ein Element.
    </p>

    <template v-else>
      <dl class="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-[max-content_1fr]">
        <dt class="font-semibold text-[var(--vp-c-text-2)]">Rolle</dt>
        <dd class="m-0 text-[var(--vp-c-text-1)]">{{ node.roleInfo.role ?? "generic" }}</dd>
        <dt class="font-semibold text-[var(--vp-c-text-2)]">Name</dt>
        <dd class="m-0 font-semibold text-[var(--vp-c-text-1)]">
          <template v-if="node.nameInfo.name">„{{ node.nameInfo.name }}“</template>
          <template v-else>kein Name</template>
        </dd>
        <dt class="font-semibold text-[var(--vp-c-text-2)]">Description</dt>
        <dd class="m-0 text-[var(--vp-c-text-1)]">
          <template v-if="node.descInfo.description">„{{ node.descInfo.description }}“</template>
          <template v-else>keine Description</template>
        </dd>
      </dl>

      <p
        v-if="node.nameTrace.prohibited"
        class="mt-3 rounded border border-red-400/40 bg-red-400/5 p-2 text-[var(--vp-c-text-1)]"
      >
        Die Rolle <code class="font-mono">{{ node.nameTrace.prohibited.role }}</code> darf keinen Namen haben. Gesetzte Quellen werden ignoriert. Browser halten sich nicht immer daran: Chrome 146 gibt zum Beispiel das <code class="font-mono">aria-label</code> eines <code class="font-mono">div</code> trotzdem als Namen aus.
        <a :href="node.nameTrace.prohibited.ref.url" class="underline underline-offset-4 focus-visible:outline-2 outline-offset-2 outline-sky-700">{{ node.nameTrace.prohibited.ref.label }}</a>
      </p>

      <div class="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 class="font-bold text-[var(--vp-c-text-1)]">Name</h3>
          <p class="mt-0.5 text-sm text-[var(--vp-c-text-2)]">
            Von oben nach unten, die erste Quelle mit Wert gewinnt. Regel:
            <a :href="node.nameTrace.rule.url" class="underline underline-offset-4 focus-visible:outline-2 outline-offset-2 outline-sky-700">{{ node.nameTrace.rule.label }}</a>
          </p>
          <StepList :steps="node.nameTrace.steps" class="mt-1" />
        </div>
        <div>
          <h3 class="font-bold text-[var(--vp-c-text-1)]">Description</h3>
          <p class="mt-0.5 text-sm text-[var(--vp-c-text-2)]">
            Quellen, die schon den Namen liefern, zählen nicht. Regel:
            <a href="https://www.w3.org/TR/html-aam-1.0/#accdesc-computation" class="underline underline-offset-4 focus-visible:outline-2 outline-offset-2 outline-sky-700">HTML-AAM 4.2</a>
          </p>
          <StepList :steps="node.descSteps" class="mt-1" />
        </div>
      </div>
    </template>
  </section>
</template>
