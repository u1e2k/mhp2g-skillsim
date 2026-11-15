import type { SimSolution } from '../types';

export function formatSolutionForClipboard(solution: SimSolution): string {
  const parts = [
    { label: '頭', armor: solution.head, decos: solution.decorations.head },
    { label: '胴', armor: solution.body, decos: solution.decorations.body },
    { label: '腕', armor: solution.arm, decos: solution.decorations.arm },
    { label: '腰', armor: solution.waist, decos: solution.decorations.waist },
    { label: '脚', armor: solution.leg, decos: solution.decorations.leg },
  ];

  let text = `【MHP2G 装備構成】\n`;
  text += `防御力: ${solution.totalDefense} (火:${solution.resistances.fire} 水:${solution.resistances.water} 雷:${solution.resistances.thunder} 氷:${solution.resistances.ice} 龍:${solution.resistances.dragon})\n`;
  text += `発動スキル: ${solution.activeSkills.join(', ')}\n\n`;

  if (solution.decorations.weapon.length > 0) {
    const decosStr = solution.decorations.weapon.map((d) => d.name).join(', ');
    text += `■ 武器スロット: [${decosStr}]\n`;
  }

  for (const p of parts) {
    const slotsStr = '○'.repeat(p.armor.slots) + '―'.repeat(Math.max(0, 3 - p.armor.slots));
    const decosStr = p.decos.length > 0 ? ` [${p.decos.map((d) => d.name).join(', ')}]` : '';
    const torsoUpStr = p.armor.torsoUp ? ' (胴系統倍加)' : '';
    text += `■ ${p.label}: ${p.armor.name}${torsoUpStr} (${slotsStr})${decosStr}\n`;
  }

  // All decorations summary
  const decoCounts = new Map<string, number>();
  const allDecos = [
    ...solution.decorations.weapon,
    ...solution.decorations.head,
    ...solution.decorations.body,
    ...solution.decorations.arm,
    ...solution.decorations.waist,
    ...solution.decorations.leg,
  ];
  for (const d of allDecos) {
    decoCounts.set(d.name, (decoCounts.get(d.name) ?? 0) + 1);
  }

  if (decoCounts.size > 0) {
    text += `\n【必要装飾品】\n`;
    text += Array.from(decoCounts.entries())
      .map(([name, count]) => `${name}×${count}`)
      .join(', ') + '\n';
  }

  if (solution.remainingSlots.total > 0) {
    text += `空きスロット数: ${solution.remainingSlots.total}\n`;
  }

  text += `\n#MHP2G #モンハン2G`;
  return text;
}
