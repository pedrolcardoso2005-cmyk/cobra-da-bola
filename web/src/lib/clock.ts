// Relogio do servidor no celular. Cronometro, contagem e revelacao palavra
// por palavra comparam horarios que vem do servidor; se o relogio do
// celular estiver adiantado ou atrasado, o cronometro aparecia zerado e a
// pergunta inteira de uma vez. Cada estado da sala traz o horario do
// servidor e aqui guardamos a diferenca para corrigir.
let offsetMs = 0;
let samples: number[] = [];

export function syncServerClock(serverNowMs: number): void {
  if (!Number.isFinite(serverNowMs)) return;
  const sample = serverNowMs - Date.now();
  samples = [...samples.slice(-9), sample];
  // A amostra com menor atraso de rede e a maior (o pacote chegou mais
  // rapido); usa a maior das ultimas 10.
  offsetMs = Math.max(...samples);
}

/** "Agora" no relogio do servidor. */
export function serverNow(): number {
  return Date.now() + offsetMs;
}
