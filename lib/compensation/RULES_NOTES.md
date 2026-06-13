# RULES_NOTES — Auditoría de reglas de compensación

Este documento registra las **inconsistencias** entre el texto de las reglas del
despacho y sus ejemplos numéricos, y cómo se resolvieron en el código. **No se
"arreglan" silenciosamente**: cada pieza debatible es un parámetro configurable
por `compensation_year`. La fórmula implementada en `core.ts` es la fuente de
verdad; este archivo explica el porqué.

---

## 1. Fórmula del bono: "−1,200" en el texto vs. "−1,700" en los ejemplos

- El texto de las reglas escribía la base del production bonus como
  `totalCreditable − 1,200`.
- Todos los ejemplos numéricos usan `totalCreditable − 1,700`.

**Resolución:** se usa **1,700** (= `parHours + trueUpMaxHours`). Las primeras
500 horas arriba del par (1,200 → 1,700) se pagan vía true-up; solo las horas
arriba de 1,700 generan production bonus. Así no se pagan dos veces.

Implementado en `bonusQualifyingHours()` usando `trueUpCeiling(p)`.

---

## 2. "Maximum par" mal etiquetado

- El término "maximum par" se usaba de forma ambigua.

**Resolución:** el techo efectivo del true-up es **1,700**
(`parHours + trueUpMaxHours`), expuesto como `trueUpCeiling(params)`.

---

## 3. Cap admin de 100 horas NO aplicado en CY26

- Las reglas mencionan un cap de 100 horas administrativas.
- El ejemplo CY26 usa `other = 114.1` (> 100), es decir, **no aplicó el cap**.

**Resolución:** `applyAdminCap` default **false**, configurable por año.
`adminCap` default 100 (solo se usa si `applyAdminCap = true`).
Implementado en `creditableOther()`.

---

## 4. Example 2 con error numérico

- Un ejemplo marcaba `1,600.5` como `< 1,200` (inconsistente).

**Resolución:** se ignora ese etiquetado erróneo. El gate de elegibilidad es
estrictamente `billableHours > parHours` (sección 2.3), implementado en
`isBonusEligible()`. El gate es sobre **billable**, no sobre creditable.

---

## 5. `trueUpRatePerHour` NO está definida en las reglas

- Las reglas no especifican la tarifa $/hora del true-up.

**Resolución:** es **input requerido** (`CompParams.trueUpRatePerHour`).
Default semilla = **70.35054**, derivado del ejemplo CY26:
`$35,175.27 / 500 h = 70.35054`. (El prompt mostraba `70.3505` redondeado, que
produce `$35,175.25`; usamos el valor exacto para reproducir el centavo.)
Se ofrece, además, la opción de derivarlo de `baseSalary / divisor` cuando el
despacho confirme el divisor; mientras tanto, se captura directo y se muestra la
tarifa efectiva resultante como verificación.

---

## 6. Inconsistencia interna en el caso de aceptación CY26 (documentada)

El caso CY26 de la sección 10 del prompt tiene una **tensión de redondeo**:

| Dato del prompt        | Valor      |
| ---------------------- | ---------- |
| `other`                | 114.1      |
| `productionBonus` esp. | $14,815.06 |

- Con `other = 114.1` → `totalCreditable = 1824.1` →
  `bonusQualifyingHours = 124.10` → `bonus = 124.10 × 119.40 = $14,817.54`.
- El `$14,815.06` del prompt corresponde a `bonusQualifyingHours = 124.08`
  (`14,815.06 / 119.40`), es decir `other ≈ 114.08`, **no** 114.1.

**Resolución (decisión del usuario):** los tests usan los **inputs exactos**
(`other = 114.1`) y la **fórmula como fuente de verdad** →
`productionBonus = $14,817.54`. El `$14,815.06` del despacho proviene de usar
`other = 114.08`. Ambos quedan documentados aquí; el `trueUp = $35,175.27` sí se
reproduce al centavo con `trueUpRatePerHour = 70.35054`.

> Si el despacho confirma que el `other` real fue 114.08, basta cambiar el input;
> la fórmula no cambia.
