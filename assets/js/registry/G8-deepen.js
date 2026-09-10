/* registry/G8-deepen.js — 决策 OS 等后期补齐（须晚于 E2-decision-os.js 加载） */
(function (g) {
  'use strict';
  var S = g.QW.S;

  // DEC-06 概率校准：log-loss + Brier 双重监控，避免"方向对但概率虚高"
  S('DEC-06',
    '概率校准损失|log-loss 与 Brier 双重监控，避免「方向对但概率虚高」'
  );
})(window);
