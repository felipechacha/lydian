# Ideias de Features - Lydian

Este documento serve para registrar ideias de novas funcionalidades e melhorias para o ecossistema Lydian.

---

## 📅 Calendário de Estudos e Gamificação de BPM

### Descrição
Implementar um sistema de acompanhamento diário onde o usuário registra suas sessões de estudo, conteúdos abordados e o progresso técnico (BPM).

### Funcionalidades
- **Registro Diário**: Interface de calendário para marcar dias de estudo.
- **Métricas**: Input de "O que estudou" e "BPM atual" para cada exercício/sessão.
- **Sistema de Tolerância e "Punição"**:
  - O usuário configura quantos dias de pausa são tolerados (ex: 1 dia, 2 dias).
  - Caso o período sem estudo exceda a tolerância configurada, o sistema sugere automaticamente a redução dos BPMs dos exercícios.
  - **Objetivo**: Garantir uma progressão segura e incentivar a consistência, evitando lesões ou frustrações ao tentar retomar velocidades altas após pausas longas.

### Configurações Sugeridas
- Limite de dias sem estudo (Tolerância).
- Regra de redução (ex: -5% BPM por cada dia extra ou valor fixo).
