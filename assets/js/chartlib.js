/* =============================================================
 * chartlib.js — 零依赖 SVG 迷你图表库（离线可用）
 * 仅用于原型展示：所有数据由种子随机数生成，不含真实算法。
 * 颜色遵循 A 股习惯：红涨绿跌。
 * ============================================================= */
(function (global) {
  'use strict';

  /* ---------- 1. 种子随机数 & 数据生成 ---------- */
  function rng(seed) {
    var s = 2166136261;
    seed = String(seed);
    for (var i = 0; i < seed.length; i++) { s ^= seed.charCodeAt(i); s = (s * 16777619) >>> 0; }
    if (!s) s = 123456789;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function gauss(r) {
    var u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  // 几何随机游走
  function walk(seed, n, o) {
    o = o || {};
    var r = rng(seed), v = o.start == null ? 100 : o.start,
      vol = o.vol == null ? 0.012 : o.vol, mu = o.drift == null ? 0.0006 : o.drift,
      out = [];
    for (var i = 0; i < n; i++) { v = v * (1 + mu + vol * gauss(r)); out.push(v); }
    return out;
  }
  // 均值回复序列（宏观指标类）
  function ou(seed, n, o) {
    o = o || {};
    var r = rng(seed), m = o.mean == null ? 5 : o.mean, v = o.start == null ? m : o.start,
      k = o.k == null ? 0.08 : o.k, sd = o.sd == null ? 0.6 : o.sd, out = [];
    for (var i = 0; i < n; i++) { v += k * (m - v) + sd * gauss(r); out.push(v); }
    return out;
  }
  function months(n, endY, endM) {
    var out = [], y = endY || 2026, m = endM || 9;
    for (var i = n - 1; i >= 0; i--) {
      var mm = m - i, yy = y;
      while (mm <= 0) { mm += 12; yy -= 1; }
      out.push(String(yy).slice(2) + '/' + (mm < 10 ? '0' : '') + mm);
    }
    return out;
  }
  function days(n) {
    var out = [], d = new Date(2026, 8, 9);
    for (var i = n - 1; i >= 0; i--) {
      var t = new Date(d.getTime() - i * 86400000);
      out.push((t.getMonth() + 1) + '/' + t.getDate());
    }
    return out;
  }

  /* ---------- 2. 主题 ---------- */
  var T = {
    up: '#f2495c', down: '#2fbf71', axis: '#3a4459', grid: '#232a38',
    text: '#7f8da6', textStrong: '#c6d0e0',
    pal: ['#4d9fff', '#f2b53c', '#2fbf71', '#e0578f', '#8b7cf6', '#22c1c3', '#f2724b', '#9aa7bd']
  };
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(v, d) {
    if (v == null || isNaN(v)) return '--';
    if (Math.abs(v) >= 1e8) return (v / 1e8).toFixed(d == null ? 2 : d) + '亿';
    if (Math.abs(v) >= 1e4) return (v / 1e4).toFixed(d == null ? 1 : d) + '万';
    return v.toFixed(d == null ? 2 : d);
  }

  /* ---------- 3. 画布骨架 ---------- */
  var W = 640, H = 260;
  function open(h, cls) {
    return '<svg class="mc ' + (cls || '') + '" viewBox="0 0 ' + W + ' ' + (h || H) +
      '" xmlns="http://www.w3.org/2000/svg" role="img">';
  }
  function box(o) {
    o = o || {};
    return { l: o.l == null ? 44 : o.l, r: o.r == null ? 12 : o.r, t: o.t == null ? 18 : o.t, b: o.b == null ? 24 : o.b };
  }
  function niceTicks(min, max, n) {
    if (min === max) { min -= 1; max += 1; }
    var span = max - min, step = Math.pow(10, Math.floor(Math.log(span / n) / Math.LN10));
    var err = span / n / step;
    if (err >= 7.5) step *= 10; else if (err >= 3) step *= 5; else if (err >= 1.5) step *= 2;
    // 向外取整到步长边界，确保刻度区间完整覆盖 [min, max]
    var s = Math.floor(min / step) * step, e = Math.ceil(max / step) * step, out = [];
    for (var v = s; v <= e + step * 1e-9; v += step) out.push(+v.toFixed(10));
    if (out.length < 2) out.push(s + step);
    return out;
  }
  function grid(p, ticks, sy, opts) {
    opts = opts || {};
    var g = '';
    ticks.forEach(function (t) {
      var y = sy(t);
      g += '<line x1="' + p.x0 + '" y1="' + y.toFixed(1) + '" x2="' + p.x1 + '" y2="' + y.toFixed(1) +
        '" stroke="' + T.grid + '" stroke-width="1"/>';
      g += '<text x="' + (p.x0 - 6) + '" y="' + (y + 3.5).toFixed(1) + '" fill="' + T.text +
        '" font-size="9.5" text-anchor="end">' + (opts.fy ? opts.fy(t) : t) + '</text>';
    });
    return g;
  }
  function xlabels(p, cats, opts) {
    opts = opts || {};
    var n = cats.length, max = opts.max || 8, step = Math.max(1, Math.ceil(n / max)), g = '';
    for (var i = 0; i < n; i += step) {
      var x = p.x0 + (n === 1 ? p.w / 2 : (i / (n - 1)) * p.w);
      g += '<text x="' + x.toFixed(1) + '" y="' + (p.y1 + 14) + '" fill="' + T.text +
        '" font-size="9.5" text-anchor="middle">' + esc(cats[i]) + '</text>';
    }
    return g;
  }
  function plot(h, m) {
    var p = box(m);
    return { x0: p.l, y0: p.t, x1: W - p.r, y1: (h || H) - p.b, w: W - p.r - p.l, h: (h || H) - p.b - p.t };
  }
  function legend(items, y) {
    var g = '', x = 44;
    items.forEach(function (it) {
      g += '<rect x="' + x + '" y="' + (y - 6) + '" width="8" height="8" rx="2" fill="' + it.c + '"/>';
      g += '<text x="' + (x + 12) + '" y="' + (y + 1) + '" fill="' + T.text + '" font-size="9.5">' + esc(it.n) + '</text>';
      x += 22 + esc(it.n).length * 6.2;
    });
    return g;
  }

  /* ---------- 4. 图表类型 ---------- */
  var C = {};

  // 折线 / 面积 / 多序列
  C.line = function (o) {
    var h = o.height || H, p = plot(h, { t: o.legend === false ? 14 : 28 }), all = [];
    var n = 0;
    o.series.forEach(function (s) { n = Math.max(n, s.data.length); all = all.concat(s.data); });
    // 类目标签数量与数据点数量不一致时，按比例映射标签，避免坐标越界
    var cats = o.cats && o.cats.length === n ? o.cats
      : (o.cats && o.cats.length
        ? (function (c) { var a = []; for (var i = 0; i < n; i++) a.push(c[Math.min(c.length - 1, Math.round(i / Math.max(1, n - 1) * (c.length - 1)))]); return a; })(o.cats)
        : days(n));
    var mn = o.min != null ? o.min : Math.min.apply(null, all), mx = o.max != null ? o.max : Math.max.apply(null, all);
    var pad = (mx - mn) * 0.12 || 1; mn -= pad; mx += pad;
    var tk = niceTicks(mn, mx, 4);
    mn = tk[0]; mx = tk[tk.length - 1];
    var sy = function (v) { return p.y1 - (v - mn) / (mx - mn) * p.h; };
    var sx = function (i) { return p.x0 + (cats.length === 1 ? p.w / 2 : i / (cats.length - 1) * p.w); };
    var s = open(h) + grid(p, tk, sy, { fy: o.fy });
    if (o.zero) s += '<line x1="' + p.x0 + '" y1="' + sy(0) + '" x2="' + p.x1 + '" y2="' + sy(0) + '" stroke="' + T.axis + '" stroke-width="1" stroke-dasharray="3 3"/>';
    o.series.forEach(function (ss, k) {
      var c = ss.color || T.pal[k % T.pal.length], d = '', a = '';
      ss.data.forEach(function (v, i) { d += (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(v).toFixed(1) + ' '; });
      if (ss.area) {
        a = '<path d="' + d + 'L' + sx(ss.data.length - 1).toFixed(1) + ' ' + p.y1 + ' L' + p.x0 + ' ' + p.y1 + ' Z" fill="' + c + '" opacity="0.13"/>';
      }
      s += a + '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (ss.width || 1.8) +
        '" stroke-linejoin="round" ' + (ss.dash ? 'stroke-dasharray="4 3"' : '') + '/>';
      if (ss.dot !== false) {
        var li = ss.data.length - 1;
        s += '<circle cx="' + sx(li).toFixed(1) + '" cy="' + sy(ss.data[li]).toFixed(1) + '" r="2.6" fill="' + c + '"/>';
      }
    });
    s += xlabels(p, cats);
    if (o.legend !== false) s += legend(o.series.map(function (ss, k) { return { n: ss.name, c: ss.color || T.pal[k % T.pal.length] }; }), 12);
    return s + '</svg>';
  };

  // 柱状（支持涨跌着色 / 目标线 / 分组）
  C.bar = function (o) {
    var h = o.height || H, p = plot(h, { t: o.legend === false ? 14 : 28 });
    var series = o.series, cats = o.cats || [], all = [];
    series.forEach(function (s) { all = all.concat(s.data); });
    // 轴区间必须包含 0（否则零基柱状图会画到画布外）
    var lo = Math.min(0, Math.min.apply(null, all)), hi = Math.max(0, Math.max.apply(null, all));
    var pad = (hi - lo) * 0.1 || 1;
    var tk = niceTicks(lo < 0 ? lo - pad * 0.25 : lo, hi > 0 ? hi + pad : hi, 4);
    var mn = tk[0], mx = tk[tk.length - 1];
    var sy = function (v) { return p.y1 - (v - mn) / (mx - mn) * p.h; };
    var n = cats.length, gw = p.w / n, bw = gw * 0.62 / series.length;
    var s = open(h) + grid(p, tk, sy, { fy: o.fy });
    series.forEach(function (ss, k) {
      ss.data.forEach(function (v, i) {
        var c = ss.signColor ? (v >= 0 ? T.up : T.down) : (ss.color || T.pal[k % T.pal.length]);
        var x = p.x0 + gw * i + gw * 0.19 + bw * k, y0 = sy(0), y = sy(v);
        s += '<rect x="' + x.toFixed(1) + '" y="' + Math.min(y, y0).toFixed(1) + '" width="' + bw.toFixed(1) +
          '" height="' + Math.max(1, Math.abs(y - y0)).toFixed(1) + '" rx="1.5" fill="' + c + '" opacity="0.9"/>';
      });
    });
    if (o.target != null) s += '<line x1="' + p.x0 + '" y1="' + sy(o.target) + '" x2="' + p.x1 + '" y2="' + sy(o.target) + '" stroke="' + T.pal[1] + '" stroke-width="1.2" stroke-dasharray="5 3"/>';
    s += xlabels(p, cats, { max: 10 });
    if (o.legend !== false && series.length > 1) s += legend(series.map(function (ss, k) { return { n: ss.name, c: ss.color || T.pal[k % T.pal.length] }; }), 12);
    return s + '</svg>';
  };

  // 分组柱（mbar 简写，与 bar 同实现）
  C.mbar = C.bar;

  // 堆叠柱 / 堆叠面积
  C.stack = function (o) {
    var h = o.height || H, p = plot(h, { t: 28 }), cats = o.cats, series = o.series, n = cats.length;
    var tot = cats.map(function (_, i) { return series.reduce(function (a, s) { return a + s.data[i]; }, 0); });
    var mx = Math.max.apply(null, tot), tk = niceTicks(0, mx * 1.05, 4), mn = 0; mx = tk[tk.length - 1];
    var sy = function (v) { return p.y1 - (v - mn) / (mx - mn) * p.h; };
    var s = open(h) + grid(p, tk, sy, { fy: o.fy });
    if (o.area) {
      var acc = cats.map(function () { return 0; });
      series.forEach(function (ss, k) {
        var c = ss.color || T.pal[k % T.pal.length], top = [], bot = acc.slice();
        acc = acc.map(function (a, i) { top.push(a + ss.data[i]); return a + ss.data[i]; });
        var d = '';
        top.forEach(function (v, i) { d += (i ? 'L' : 'M') + (p.x0 + i / (n - 1) * p.w).toFixed(1) + ' ' + sy(v).toFixed(1) + ' '; });
        for (var i = n - 1; i >= 0; i--) d += 'L' + (p.x0 + i / (n - 1) * p.w).toFixed(1) + ' ' + sy(bot[i]).toFixed(1) + ' ';
        s += '<path d="' + d + 'Z" fill="' + c + '" opacity="0.55"/>';
      });
    } else {
      var gw = p.w / n, bw = gw * 0.6;
      cats.forEach(function (_, i) {
        var acc2 = 0;
        series.forEach(function (ss, k) {
          var c = ss.color || T.pal[k % T.pal.length], y0 = sy(acc2), y1 = sy(acc2 + ss.data[i]);
          s += '<rect x="' + (p.x0 + gw * i + (gw - bw) / 2).toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + bw.toFixed(1) +
            '" height="' + Math.max(0.8, y0 - y1).toFixed(1) + '" fill="' + c + '" opacity="0.88"/>';
          acc2 += ss.data[i];
        });
      });
    }
    return s + xlabels(p, cats, { max: 10 }) +
      legend(series.map(function (ss, k) { return { n: ss.name, c: ss.color || T.pal[k % T.pal.length] }; }), 12) + '</svg>';
  };

  // 横向条形（排行榜）
  C.hbar = function (o) {
    var items = o.items, h = o.height || (items.length * 22 + 24), p = plot(h, { l: o.labelW || 88, t: 8, b: 8 });
    var mxv = Math.max.apply(null, items.map(function (d) { return Math.abs(d.v); })) || 1;
    var s = open(h), rowH = p.h / items.length;
    items.forEach(function (d, i) {
      var y = p.y0 + rowH * i + rowH * 0.18, bh = rowH * 0.64;
      var half = o.diverge;
      // 只有双向模式才向左绘制；单向模式统一按幅度绘制、按符号着色
      var neg = half && d.v < 0;
      var zero = half ? (p.x0 + p.w / 2) : p.x0;
      var len = Math.abs(d.v) / mxv * (half ? p.w / 2 : p.w) * 0.9;
      var c = d.color || (half || o.signColor ? (d.v < 0 ? T.down : T.up) : T.pal[0]);
      s += '<text x="' + (p.x0 - 6) + '" y="' + (y + bh * 0.75).toFixed(1) + '" fill="' + T.textStrong +
        '" font-size="10" text-anchor="end">' + esc(d.n) + '</text>';
      s += '<rect x="' + (neg ? zero - len : zero).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + len.toFixed(1) +
        '" height="' + bh.toFixed(1) + '" rx="2" fill="' + c + '" opacity="0.85"/>';
      s += '<text x="' + ((neg ? zero - len - 4 : zero + len + 4)).toFixed(1) + '" y="' + (y + bh * 0.75).toFixed(1) +
        '" fill="' + T.text + '" font-size="9.5" text-anchor="' + (neg ? 'end' : 'start') + '">' +
        (o.fv ? o.fv(d.v) : d.v.toFixed(2)) + '</text>';
    });
    if (o.diverge) s += '<line x1="' + (p.x0 + p.w / 2) + '" y1="' + p.y0 + '" x2="' + (p.x0 + p.w / 2) + '" y2="' + p.y1 + '" stroke="' + T.axis + '" stroke-width="1"/>';
    return s + '</svg>';
  };

  // K 线
  C.candle = function (o) {
    var h = o.height || 280, p = plot(h, { t: 14, b: 40 }), d = o.data, n = d.length;
    var lo = Math.min.apply(null, d.map(function (x) { return x[2]; })),
      hi = Math.max.apply(null, d.map(function (x) { return x[1]; }));
    var tk = niceTicks(lo, hi, 4); lo = tk[0]; hi = tk[tk.length - 1];
    var volH = 34, py1 = p.y1 - volH - 8;
    var sy = function (v) { return py1 - (v - lo) / (hi - lo) * (py1 - p.y0); };
    var gw = p.w / n, bw = Math.max(1.6, gw * 0.6);
    var s = open(h);
    tk.forEach(function (t) {
      var y = sy(t);
      s += '<line x1="' + p.x0 + '" y1="' + y.toFixed(1) + '" x2="' + p.x1 + '" y2="' + y.toFixed(1) + '" stroke="' + T.grid + '"/>' +
        '<text x="' + (p.x0 - 6) + '" y="' + (y + 3.5).toFixed(1) + '" fill="' + T.text + '" font-size="9.5" text-anchor="end">' + t.toFixed(1) + '</text>';
    });
    var mv = Math.max.apply(null, d.map(function (x) { return x[4]; }));
    d.forEach(function (b, i) {
      var x = p.x0 + gw * i + gw / 2, up = b[3] >= b[0], c = up ? T.up : T.down;
      s += '<line x1="' + x.toFixed(1) + '" y1="' + sy(b[1]).toFixed(1) + '" x2="' + x.toFixed(1) + '" y2="' + sy(b[2]).toFixed(1) + '" stroke="' + c + '" stroke-width="1"/>';
      var yo = sy(b[0]), yc = sy(b[3]);
      s += '<rect x="' + (x - bw / 2).toFixed(1) + '" y="' + Math.min(yo, yc).toFixed(1) + '" width="' + bw.toFixed(1) +
        '" height="' + Math.max(1, Math.abs(yc - yo)).toFixed(1) + '" fill="' + (up ? c : c) + '" opacity="' + (up ? 0.95 : 0.8) + '"/>';
      var vh = b[4] / mv * volH;
      s += '<rect x="' + (x - bw / 2).toFixed(1) + '" y="' + (p.y1 - vh).toFixed(1) + '" width="' + bw.toFixed(1) +
        '" height="' + vh.toFixed(1) + '" fill="' + c + '" opacity="0.45"/>';
    });
    // 均线
    [5, 20].forEach(function (win, k) {
      var ma = '', cnt = 0;
      for (var i = win - 1; i < n; i++) {
        var sum = 0; for (var j = i - win + 1; j <= i; j++) sum += d[j][3];
        ma += (cnt++ ? 'L' : 'M') + (p.x0 + gw * i + gw / 2).toFixed(1) + ' ' + sy(sum / win).toFixed(1) + ' ';
      }
      s += '<path d="' + ma + '" fill="none" stroke="' + T.pal[k === 0 ? 1 : 0] + '" stroke-width="1.2" opacity="0.9"/>';
    });
    return s + xlabels({ x0: p.x0, w: p.w, y1: p.y1 }, o.cats || days(n), { max: 8 }) +
      legend([{ n: 'MA5', c: T.pal[1] }, { n: 'MA20', c: T.pal[0] }, { n: '成交量', c: T.text }], 10) + '</svg>';
  };

  // 散点 + 回归线
  C.scatter = function (o) {
    var h = o.height || H, p = plot(h, { t: 16 }), pts = o.points;
    var xs = pts.map(function (d) { return d[0]; }), ys = pts.map(function (d) { return d[1]; });
    var xt = niceTicks(Math.min.apply(null, xs), Math.max.apply(null, xs), 4),
      yt = niceTicks(Math.min.apply(null, ys), Math.max.apply(null, ys), 4);
    var x0 = xt[0], x1 = xt[xt.length - 1], y0 = yt[0], y1 = yt[yt.length - 1];
    var sx = function (v) { return p.x0 + (v - x0) / (x1 - x0) * p.w; }, sy = function (v) { return p.y1 - (v - y0) / (y1 - y0) * p.h; };
    var s = open(h) + grid(p, yt, sy, { fy: o.fy });
    pts.forEach(function (d) {
      s += '<circle cx="' + sx(d[0]).toFixed(1) + '" cy="' + sy(d[1]).toFixed(1) + '" r="' + (d[2] || 3).toFixed(1) +
        '" fill="' + (d[3] || T.pal[0]) + '" opacity="0.7"/>';
    });
    // OLS
    var n = pts.length, mx = xs.reduce(function (a, b) { return a + b; }, 0) / n, my = ys.reduce(function (a, b) { return a + b; }, 0) / n;
    var sxy = 0, sxx = 0;
    pts.forEach(function (d) { sxy += (d[0] - mx) * (d[1] - my); sxx += (d[0] - mx) * (d[0] - mx); });
    var beta = sxx ? sxy / sxx : 0, alpha = my - beta * mx;
    s += '<path d="M' + sx(x0) + ' ' + sy(alpha + beta * x0) + ' L' + sx(x1) + ' ' + sy(alpha + beta * x1) +
      '" stroke="' + T.pal[1] + '" stroke-width="1.4" stroke-dasharray="5 3" fill="none"/>';
    xt.forEach(function (t) {
      s += '<text x="' + sx(t).toFixed(1) + '" y="' + (p.y1 + 14) + '" fill="' + T.text + '" font-size="9.5" text-anchor="middle">' + t + '</text>';
    });
    s += '<text x="' + (p.x1 - 4) + '" y="' + (p.y0 + 2) + '" fill="' + T.pal[1] + '" font-size="9.5" text-anchor="end">β=' +
      beta.toFixed(2) + '  R²=' + Math.min(0.99, Math.abs(beta) * 0.4 + 0.35).toFixed(2) + '</text>';
    return s + '</svg>';
  };

  // 热力图（相关性 / IC 矩阵）
  C.heat = function (o) {
    var rows = o.rows, cols = o.cols, m = o.matrix;
    var cellH = o.cellH || 18, h = o.height || (rows.length * cellH + 46);
    var p = plot(h, { l: o.labelW || 76, t: 24, b: 22 });
    var cw = p.w / cols.length, ch = p.h / rows.length;
    var s = open(h);
    function col(v) {
      var t = Math.max(-1, Math.min(1, v));
      if (t >= 0) return 'rgba(242,73,92,' + (0.12 + 0.8 * t).toFixed(3) + ')';
      return 'rgba(47,191,113,' + (0.12 + 0.8 * -t).toFixed(3) + ')';
    }
    cols.forEach(function (c, j) {
      s += '<text x="' + (p.x0 + cw * j + cw / 2).toFixed(1) + '" y="' + (p.y0 - 7) + '" fill="' + T.text +
        '" font-size="9" text-anchor="middle">' + esc(c) + '</text>';
    });
    rows.forEach(function (r, i) {
      s += '<text x="' + (p.x0 - 6) + '" y="' + (p.y0 + ch * i + ch / 2 + 3.5).toFixed(1) + '" fill="' + T.textStrong +
        '" font-size="9.5" text-anchor="end">' + esc(r) + '</text>';
      cols.forEach(function (c, j) {
        var v = m[i][j];
        s += '<rect x="' + (p.x0 + cw * j).toFixed(1) + '" y="' + (p.y0 + ch * i).toFixed(1) + '" width="' + (cw - 1).toFixed(1) +
          '" height="' + (ch - 1).toFixed(1) + '" fill="' + col(v) + '"/>';
        if (cw > 34 && ch > 14) s += '<text x="' + (p.x0 + cw * j + cw / 2).toFixed(1) + '" y="' + (p.y0 + ch * i + ch / 2 + 3).toFixed(1) +
          '" fill="#dfe6f2" font-size="8.5" text-anchor="middle">' + v.toFixed(2) + '</text>';
      });
    });
    return s + '</svg>';
  };

  // 雷达
  C.radar = function (o) {
    var h = o.height || 250, cx = W / 2, cy = h / 2 + 4, R = Math.min(h / 2 - 26, 100), ax = o.axes;
    var s = open(h), n = ax.length;
    function pt(i, v) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
    }
    [0.25, 0.5, 0.75, 1].forEach(function (r) {
      var d = '';
      for (var i = 0; i < n; i++) { var q = pt(i, r); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ' '; }
      s += '<path d="' + d + 'Z" fill="none" stroke="' + T.grid + '"/>';
    });
    for (var i = 0; i < n; i++) {
      var q = pt(i, 1);
      s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + q[0].toFixed(1) + '" y2="' + q[1].toFixed(1) + '" stroke="' + T.grid + '"/>';
      var lq = pt(i, 1.2);
      s += '<text x="' + lq[0].toFixed(1) + '" y="' + lq[1].toFixed(1) + '" fill="' + T.text + '" font-size="9.5" text-anchor="middle">' + esc(ax[i]) + '</text>';
    }
    (o.series || []).forEach(function (ss, k) {
      var c = ss.color || T.pal[k % T.pal.length], d = '';
      ss.data.forEach(function (v, i) { var q = pt(i, Math.max(0.04, v)); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ' '; });
      s += '<path d="' + d + 'Z" fill="' + c + '" opacity="0.18"/><path d="' + d + 'Z" fill="none" stroke="' + c + '" stroke-width="1.8"/>';
    });
    return s + legend((o.series || []).map(function (ss, k) { return { n: ss.name, c: ss.color || T.pal[k % T.pal.length] }; }), 12) + '</svg>';
  };

  // 环形图
  C.donut = function (o) {
    var h = o.height || 230, cx = 150, cy = h / 2, R = Math.min(h / 2 - 16, 78), r0 = R * 0.6;
    var tot = o.items.reduce(function (a, b) { return a + b.v; }, 0), a0 = -Math.PI / 2, s = open(h);
    o.items.forEach(function (it, k) {
      var a1 = a0 + it.v / tot * Math.PI * 2, c = it.color || T.pal[k % T.pal.length], large = (a1 - a0) > Math.PI ? 1 : 0;
      s += '<path d="M' + (cx + Math.cos(a0) * R).toFixed(1) + ' ' + (cy + Math.sin(a0) * R).toFixed(1) +
        ' A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + (cx + Math.cos(a1) * R).toFixed(1) + ' ' + (cy + Math.sin(a1) * R).toFixed(1) +
        ' L' + (cx + Math.cos(a1) * r0).toFixed(1) + ' ' + (cy + Math.sin(a1) * r0).toFixed(1) +
        ' A' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + (cx + Math.cos(a0) * r0).toFixed(1) + ' ' + (cy + Math.sin(a0) * r0).toFixed(1) +
        ' Z" fill="' + c + '" opacity="0.88"/>';
      a0 = a1;
    });
    if (o.center) s += '<text x="' + cx + '" y="' + (cy - 2) + '" fill="' + T.textStrong + '" font-size="15" text-anchor="middle" font-weight="600">' + esc(o.center) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 14) + '" fill="' + T.text + '" font-size="9.5" text-anchor="middle">' + esc(o.centerSub || '') + '</text>';
    var ly = cy - o.items.length * 9 + 6;
    o.items.forEach(function (it, k) {
      var c = it.color || T.pal[k % T.pal.length], y = ly + k * 18;
      s += '<rect x="285" y="' + (y - 7) + '" width="9" height="9" rx="2" fill="' + c + '"/>' +
        '<text x="300" y="' + y + '" fill="' + T.textStrong + '" font-size="10">' + esc(it.n) + '</text>' +
        '<text x="' + (W - 14) + '" y="' + y + '" fill="' + T.text + '" font-size="10" text-anchor="end">' +
        (it.v * 100 / tot).toFixed(1) + '%</text>';
    });
    return s + '</svg>';
  };

  // 瀑布（归因）
  C.waterfall = function (o) {
    var h = o.height || H, p = plot(h, { t: 16 }), items = o.items;
    var acc = 0, lo = 0, hi = 0, seq = items.map(function (it) {
      var st = acc; acc += it.v; lo = Math.min(lo, acc); hi = Math.max(hi, acc); return [st, acc, it];
    });
    var tk = niceTicks(lo, hi * 1.1 || 1, 4); lo = tk[0]; hi = tk[tk.length - 1];
    var sy = function (v) { return p.y1 - (v - lo) / (hi - lo) * p.h; };
    var gw = p.w / (items.length + 1), bw = gw * 0.6, s = open(h) + grid(p, tk, sy, { fy: o.fy });
    seq.forEach(function (q, i) {
      var c = q[2].total ? T.pal[0] : (q[2].v >= 0 ? T.up : T.down);
      var y = Math.min(sy(q[0]), sy(q[1])), hh = Math.max(1.5, Math.abs(sy(q[1]) - sy(q[0])));
      var x = p.x0 + gw * i + (gw - bw) / 2;
      if (q[2].total) { y = Math.min(sy(0), sy(q[1])); hh = Math.abs(sy(q[1]) - sy(0)); }
      s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) +
        '" rx="1.5" fill="' + c + '" opacity="0.88"/>';
      s += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" fill="' + T.text + '" font-size="9" text-anchor="middle">' +
        (q[2].v > 0 ? '+' : '') + q[2].v.toFixed(2) + '</text>';
      s += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (p.y1 + 14) + '" fill="' + T.text + '" font-size="9" text-anchor="middle">' + esc(q[2].n) + '</text>';
    });
    // 合计
    var xt = p.x0 + gw * items.length + (gw - bw) / 2;
    s += '<rect x="' + xt.toFixed(1) + '" y="' + Math.min(sy(0), sy(acc)).toFixed(1) + '" width="' + bw.toFixed(1) +
      '" height="' + Math.abs(sy(acc) - sy(0)).toFixed(1) + '" rx="1.5" fill="' + T.pal[0] + '"/>' +
      '<text x="' + (xt + bw / 2).toFixed(1) + '" y="' + (p.y1 + 14) + '" fill="' + T.textStrong + '" font-size="9" text-anchor="middle">合计</text>';
    return s + '</svg>';
  };

  // 直方图 + 正态叠加（收益分布 / 蒙特卡洛）
  C.hist = function (o) {
    var h = o.height || H, p = plot(h, { t: 16 }), r = rng(o.seed || 'h'), n = o.n || 2000, bins = o.bins || 26;
    var vals = [];
    for (var i = 0; i < n; i++) vals.push((o.mean || 0) + (o.sd || 1) * gauss(r) + (o.skew || 0) * Math.pow(Math.abs(gauss(r)), 2) * -1);
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), bw = (mx - mn) / bins, cnt = new Array(bins).fill(0);
    vals.forEach(function (v) { cnt[Math.min(bins - 1, Math.floor((v - mn) / bw))]++; });
    var mc = Math.max.apply(null, cnt), gw = p.w / bins, s = open(h);
    var tk = niceTicks(0, mc, 4);
    var sy = function (v) { return p.y1 - v / tk[tk.length - 1] * p.h; };
    s += grid(p, tk, sy, {});
    cnt.forEach(function (c, i) {
      var x = p.x0 + gw * i, v0 = mn + bw * i;
      var col = o.varLine != null && v0 < o.varLine ? T.down : T.pal[0];
      s += '<rect x="' + x.toFixed(1) + '" y="' + sy(c).toFixed(1) + '" width="' + (gw - 1).toFixed(1) + '" height="' +
        (p.y1 - sy(c)).toFixed(1) + '" fill="' + col + '" opacity="0.75"/>';
    });
    if (o.varLine != null) {
      var xv = p.x0 + (o.varLine - mn) / (mx - mn) * p.w;
      s += '<line x1="' + xv.toFixed(1) + '" y1="' + p.y0 + '" x2="' + xv.toFixed(1) + '" y2="' + p.y1 + '" stroke="' + T.pal[1] + '" stroke-width="1.4" stroke-dasharray="4 3"/>' +
        '<text x="' + (xv + 4).toFixed(1) + '" y="' + (p.y0 + 10) + '" fill="' + T.pal[1] + '" font-size="9.5">' + (o.varLabel || 'VaR 95%') + '</text>';
    }
    [0, Math.floor(bins / 2), bins - 1].forEach(function (i) {
      s += '<text x="' + (p.x0 + gw * i + gw / 2).toFixed(1) + '" y="' + (p.y1 + 14) + '" fill="' + T.text +
        '" font-size="9.5" text-anchor="middle">' + (mn + bw * i).toFixed(1) + '</text>';
    });
    return s + '</svg>';
  };

  // 树图（持仓 / 市场地图）
  C.treemap = function (o) {
    var h = o.height || 250, items = o.items.slice().sort(function (a, b) { return b.v - a.v; });
    var tot = items.reduce(function (a, b) { return a + b.v; }, 0), s = open(h);
    // 简化 slice-and-dice
    var x = 6, y = 6, w = W - 12, hh = h - 12, horiz = true, rest = tot, out = [];
    items.forEach(function (it) {
      var frac = it.v / rest;
      var cw = horiz ? w * frac : w, chh = horiz ? hh : hh * frac;
      out.push({ x: x, y: y, w: cw, h: chh, it: it });
      if (horiz) { x += cw; w -= cw; } else { y += chh; hh -= chh; }
      rest -= it.v; horiz = !horiz;
    });
    out.forEach(function (b, k) {
      var v = b.it.chg == null ? 0 : b.it.chg;
      var c = b.it.color || (v >= 0 ? 'rgba(242,73,92,' + (0.25 + Math.min(0.6, Math.abs(v) / 6)).toFixed(2) + ')'
        : 'rgba(47,191,113,' + (0.25 + Math.min(0.6, Math.abs(v) / 6)).toFixed(2) + ')');
      s += '<rect x="' + b.x.toFixed(1) + '" y="' + b.y.toFixed(1) + '" width="' + Math.max(0, b.w - 2).toFixed(1) +
        '" height="' + Math.max(0, b.h - 2).toFixed(1) + '" fill="' + c + '" stroke="#0b0e14" stroke-width="1"/>';
      if (b.w > 46 && b.h > 26) {
        s += '<text x="' + (b.x + 6).toFixed(1) + '" y="' + (b.y + 16).toFixed(1) + '" fill="#e8eefb" font-size="10.5">' + esc(b.it.n) + '</text>';
        s += '<text x="' + (b.x + 6).toFixed(1) + '" y="' + (b.y + 29).toFixed(1) + '" fill="#c3cde0" font-size="9.5">' +
          (v >= 0 ? '+' : '') + v.toFixed(2) + '%</text>';
      }
    });
    return s + '</svg>';
  };

  // 桑基（资金流 / 产业链传导）
  C.sankey = function (o) {
    var h = o.height || 260, s = open(h), layers = o.layers, gapX = (W - 120) / (layers.length - 1);
    var pos = [];
    layers.forEach(function (nodes, li) {
      var tot = nodes.reduce(function (a, b) { return a + b.v; }, 0), y = 18, arr = [];
      nodes.forEach(function (nd, i) {
        var nh = (h - 40 - (nodes.length - 1) * 8) * nd.v / tot;
        var x = 60 + gapX * li - 6;
        arr.push({ x: x, y: y, h: nh, nd: nd });
        var c = nd.color || T.pal[(li * 3 + i) % T.pal.length];
        s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="11" height="' + nh.toFixed(1) + '" rx="2" fill="' + c + '"/>';
        var anchor = li === layers.length - 1 ? 'end' : (li === 0 ? 'start' : 'middle');
        var tx = li === layers.length - 1 ? x - 5 : (li === 0 ? x + 15 : x + 5.5);
        s += '<text x="' + tx.toFixed(1) + '" y="' + (y + nh / 2 + 3.5).toFixed(1) + '" fill="' + T.textStrong +
          '" font-size="9.5" text-anchor="' + anchor + '">' + esc(nd.n) + '</text>';
        y += nh + 8;
      });
      pos.push(arr);
    });
    (o.links || []).forEach(function (lk) {
      var a = pos[lk[0]][lk[1]], b = pos[lk[0] + 1][lk[2]], t = lk[3] == null ? 0.5 : lk[3];
      var ah = a.h * t, bh = b.h * t;
      var x1 = a.x + 11, x2 = b.x, xm = (x1 + x2) / 2;
      var y1 = a.y + a.h * 0.5 - ah / 2, y2 = b.y + b.h * 0.5 - bh / 2;
      s += '<path d="M' + x1 + ' ' + y1.toFixed(1) + ' C' + xm + ' ' + y1.toFixed(1) + ' ' + xm + ' ' + y2.toFixed(1) + ' ' + x2 + ' ' + y2.toFixed(1) +
        ' L' + x2 + ' ' + (y2 + bh).toFixed(1) + ' C' + xm + ' ' + (y2 + bh).toFixed(1) + ' ' + xm + ' ' + (y1 + ah).toFixed(1) + ' ' + x1 + ' ' + (y1 + ah).toFixed(1) +
        ' Z" fill="' + T.pal[0] + '" opacity="0.16"/>';
    });
    return s + '</svg>';
  };

  // 关系网络（指标/因子联系图谱）
  C.network = function (o) {
    var h = o.height || 300, s = open(h), nodes = o.nodes, cx = W / 2, cy = h / 2, R = Math.min(h / 2 - 34, 116);
    var pos = nodes.map(function (nd, i) {
      if (nd.center) return { x: cx, y: cy, nd: nd };
      var k = nodes.filter(function (x) { return !x.center; }).indexOf(nd), m = nodes.filter(function (x) { return !x.center; }).length;
      var a = -Math.PI / 2 + k * 2 * Math.PI / m;
      return { x: cx + Math.cos(a) * R * 1.5, y: cy + Math.sin(a) * R, nd: nd };
    });
    (o.edges || []).forEach(function (e) {
      var a = pos[e[0]], b = pos[e[1]], w = e[2] == null ? 1 : e[2];
      s += '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) +
        '" stroke="' + (w < 0 ? T.down : T.pal[0]) + '" stroke-width="' + (0.6 + Math.abs(w) * 2.2).toFixed(2) + '" opacity="0.35"/>';
    });
    pos.forEach(function (q, i) {
      var r = q.nd.center ? 26 : 18, c = q.nd.color || (q.nd.center ? T.pal[1] : T.pal[i % T.pal.length]);
      s += '<circle cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) + '" r="' + r + '" fill="' + c + '" opacity="0.2" stroke="' + c + '" stroke-width="1.4"/>';
      var words = String(q.nd.n).match(/.{1,4}/g) || [q.nd.n];
      words.slice(0, 2).forEach(function (wd, wi) {
        s += '<text x="' + q.x.toFixed(1) + '" y="' + (q.y + (words.length > 1 ? -1 + wi * 11 : 3.5)).toFixed(1) +
          '" fill="#e6ecf8" font-size="9" text-anchor="middle">' + esc(wd) + '</text>';
      });
    });
    return s + '</svg>';
  };

  // 可搭建流程画布（分层节点 + 连线，用于 AI 工作台）
  C.flow = function (o) {
    var layers = o.layers || [], h = o.height || 280;
    var padL = 16, padR = 16, padT = 26, padB = 14, gapX = 12, gapY = 8, nh = 30;
    var innerW = W - padL - padR, nL = layers.length;
    var colW = (innerW - gapX * (nL - 1)) / nL;
    var maxRows = Math.max.apply(null, layers.map(function (l) { return l.length; }));
    var needH = padT + padB + maxRows * nh + (maxRows - 1) * gapY;
    h = Math.max(h, needH);
    var s = open(h);
    function colX(li) { return padL + li * (colW + gapX); }
    function nodePos(li, ni) {
      var rows = layers[li].length;
      var blockH = rows * nh + (rows - 1) * gapY;
      var y0 = padT + (h - padT - padB - blockH) / 2;
      return { x: colX(li), y: y0 + ni * (nh + gapY), w: colW, h: nh };
    }
    // 层标题
    layers.forEach(function (l, li) {
      var t = o.titles ? o.titles[li] : null;
      if (t) s += '<text x="' + (colX(li) + colW / 2).toFixed(1) + '" y="15" fill="#7d8ca8" font-size="9.5" text-anchor="middle">' + esc(t) + '</text>';
    });
    // 连线
    var edges = o.edges || [];
    if (!edges.length) {
      for (var li = 0; li < nL - 1; li++) {
        layers[li].forEach(function (_, ni) {
          var nxt = layers[li + 1];
          nxt.forEach(function (_, nj) { edges.push([li, ni, li + 1, nj]); });
        });
      }
    }
    edges.forEach(function (e) {
      var a = nodePos(e[0], e[1]), b = nodePos(e[2], e[3]);
      var x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2;
      var mx = (x1 + x2) / 2;
      s += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + y1.toFixed(1) +
        ' ' + mx.toFixed(1) + ' ' + y2.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) +
        '" stroke="#3a4763" stroke-width="1.1" fill="none" opacity="0.7"/>';
      s += '<polygon points="' + (x2 - 5).toFixed(1) + ',' + (y2 - 3).toFixed(1) + ' ' +
        (x2 + 1).toFixed(1) + ',' + y2.toFixed(1) + ' ' + (x2 - 5).toFixed(1) + ',' + (y2 + 3).toFixed(1) +
        '" fill="#3a4763" opacity="0.8"/>';
    });
    // 节点
    layers.forEach(function (l, li) {
      l.forEach(function (txt, ni) {
        var q = nodePos(li, ni), c = (o.colors || T.pal)[li % (o.colors || T.pal).length];
        s += '<rect x="' + q.x.toFixed(1) + '" y="' + q.y.toFixed(1) + '" width="' + q.w.toFixed(1) + '" height="' + q.h +
          '" rx="6" fill="#141b2b" stroke="' + c + '" stroke-width="1.3"/>';
        s += '<rect x="' + q.x.toFixed(1) + '" y="' + q.y.toFixed(1) + '" width="3" height="' + q.h + '" rx="1.5" fill="' + c + '"/>';
        var label = String(txt);
        s += '<text x="' + (q.x + 9).toFixed(1) + '" y="' + (q.y + q.h / 2 + 3.6).toFixed(1) +
          '" fill="#dbe3f2" font-size="9.8">' + esc(label.length > 9 ? label.slice(0, 9) : label) + '</text>';
      });
    });
    return s + '</svg>';
  };

  // 仪表盘（情绪 / 拥挤度）
  C.gauge = function (o) {
    var h = o.height || 190, cx = W / 2, cy = h - 34, R = Math.min(h - 56, 100), s = open(h);
    var segs = o.segs || [[0, .2, T.down], [.2, .4, '#78b96b'], [.4, .6, T.pal[1]], [.6, .8, '#ef8a5a'], [.8, 1, T.up]];
    segs.forEach(function (sg) {
      var a0 = Math.PI + sg[0] * Math.PI, a1 = Math.PI + sg[1] * Math.PI;
      s += '<path d="M' + (cx + Math.cos(a0) * R).toFixed(1) + ' ' + (cy + Math.sin(a0) * R).toFixed(1) +
        ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + Math.cos(a1) * R).toFixed(1) + ' ' + (cy + Math.sin(a1) * R).toFixed(1) +
        '" stroke="' + sg[2] + '" stroke-width="14" fill="none" opacity="0.8"/>';
    });
    var a = Math.PI + Math.max(0, Math.min(1, o.value)) * Math.PI;
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(a) * (R - 18)).toFixed(1) + '" y2="' + (cy + Math.sin(a) * (R - 18)).toFixed(1) +
      '" stroke="#e8eefb" stroke-width="2.6"/><circle cx="' + cx + '" cy="' + cy + '" r="4.5" fill="#e8eefb"/>';
    s += '<text x="' + cx + '" y="' + (cy + 26) + '" fill="' + T.textStrong + '" font-size="17" text-anchor="middle" font-weight="600">' +
      (o.label || (o.value * 100).toFixed(0)) + '</text>';
    s += '<text x="' + cx + '" y="' + (cy + 40) + '" fill="' + T.text + '" font-size="9.5" text-anchor="middle">' + esc(o.sub || '') + '</text>';
    return s + '</svg>';
  };

  // 区间带（预测扇形 / 置信区间）
  C.band = function (o) {
    var h = o.height || H, p = plot(h, { t: 26 }), n = o.n || 36, r = rng(o.seed || 'b');
    var base = ou(o.seed || 'b', n, { mean: o.mean == null ? 4 : o.mean, sd: o.sd == null ? .4 : o.sd });
    var cats = o.cats || months(n), split = o.split == null ? Math.floor(n * 0.65) : o.split;
    var up = [], dn = [], mid = [];
    base.forEach(function (v, i) {
      var w = i <= split ? 0 : (i - split) * (o.spread || 0.16);
      mid.push(v); up.push(v + w); dn.push(v - w);
    });
    var all = up.concat(dn), tk = niceTicks(Math.min.apply(null, all), Math.max.apply(null, all), 4);
    var mn = tk[0], mx = tk[tk.length - 1];
    var sy = function (v) { return p.y1 - (v - mn) / (mx - mn) * p.h; },
      sx = function (i) { return p.x0 + i / (n - 1) * p.w; };
    var s = open(h) + grid(p, tk, sy, { fy: o.fy });
    var d = '';
    for (var i = split; i < n; i++) d += (i === split ? 'M' : 'L') + sx(i).toFixed(1) + ' ' + sy(up[i]).toFixed(1) + ' ';
    for (var j = n - 1; j >= split; j--) d += 'L' + sx(j).toFixed(1) + ' ' + sy(dn[j]).toFixed(1) + ' ';
    s += '<path d="' + d + 'Z" fill="' + T.pal[0] + '" opacity="0.16"/>';
    var dm = '';
    mid.forEach(function (v, i) { dm += (i ? 'L' : 'M') + sx(i).toFixed(1) + ' ' + sy(v).toFixed(1) + ' '; });
    s += '<path d="' + dm + '" fill="none" stroke="' + T.pal[0] + '" stroke-width="1.8"/>';
    s += '<line x1="' + sx(split).toFixed(1) + '" y1="' + p.y0 + '" x2="' + sx(split).toFixed(1) + '" y2="' + p.y1 +
      '" stroke="' + T.axis + '" stroke-dasharray="3 3"/><text x="' + (sx(split) + 4).toFixed(1) + '" y="' + (p.y0 + 10) +
      '" fill="' + T.text + '" font-size="9">预测起点</text>';
    return s + xlabels(p, cats) + legend([{ n: o.name || '中枢路径', c: T.pal[0] }, { n: '80% 置信区间', c: 'rgba(77,159,255,0.4)' }], 12) + '</svg>';
  };

  // 台阶图 / 事件时间轴
  C.timeline = function (o) {
    var items = o.items, h = o.height || (items.length * 30 + 20), s = open(h);
    items.forEach(function (it, i) {
      var y = 18 + i * 30;
      s += '<line x1="26" y1="' + (y - 12) + '" x2="26" y2="' + (y + 18) + '" stroke="' + T.grid + '" stroke-width="1.5"/>';
      s += '<circle cx="26" cy="' + y + '" r="4.5" fill="' + (it.color || T.pal[i % T.pal.length]) + '"/>';
      s += '<text x="40" y="' + (y - 1) + '" fill="' + T.textStrong + '" font-size="10.5">' + esc(it.n) + '</text>';
      s += '<text x="40" y="' + (y + 12) + '" fill="' + T.text + '" font-size="9.5">' + esc(it.d || '') + '</text>';
      if (it.tag) s += '<text x="' + (W - 12) + '" y="' + (y - 1) + '" fill="' + (it.color || T.pal[i % T.pal.length]) +
        '" font-size="9.5" text-anchor="end">' + esc(it.tag) + '</text>';
    });
    return s + '</svg>';
  };

  // 期限结构 / 曲线对比（带 shift 标注）
  C.curve = function (o) {
    return C.line({
      height: o.height, cats: o.cats, legend: o.legend,
      series: o.series, fy: o.fy
    });
  };

  // 明细表格 / 事件清单 / 对话卡：非 SVG 视图，但同样由 render 统一渲染
  function cellHtml(c) {
    if (c == null) return '--';
    if (typeof c === 'object') {
      if (c.bar != null) return '<span class="bar-cell" style="width:' + (14 + c.bar * 46).toFixed(0) +
        'px"></span> <span style="font-size:10.5px;color:#9aa8bf">' + (c.bar * 100).toFixed(0) + '%</span>';
      if (c.b) return '<span class="badge ' + c.b + '">' + esc(c.v) + '</span>';
      if (c.c) return '<span class="' + c.c + '">' + esc(c.v) + '</span>';
      return esc(c.v);
    }
    return esc(c);
  }
  C.table = function (o) {
    var h = '<div class="tw" style="max-height:' + (o.h || 250) + 'px"><table class="dt"><thead><tr>';
    (o.cols || []).forEach(function (c) { h += '<th>' + esc(c) + '</th>'; });
    h += '</tr></thead><tbody>';
    (o.rows || []).forEach(function (r) {
      h += '<tr>' + r.map(function (c) { return '<td>' + cellHtml(c) + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  };
  C.list = function (o) {
    var h = '<div class="lst" style="max-height:' + (o.h || 250) + 'px;overflow:auto">';
    (o.items || []).forEach(function (it) {
      h += '<div class="row"><div><div class="t">' + it.t + '</div>' + (it.s ? '<div class="s">' + it.s + '</div>' : '') +
        '</div><div class="rt">' + (it.b ? '<span class="badge ' + it.b + '">' + esc(it.rt || '') + '</span>' : esc(it.rt || '')) +
        '</div></div>';
    });
    return h + '</div>';
  };
  C.chat = function (o) {
    var h = '<div class="chat">';
    (o.msgs || []).forEach(function (m) {
      h += '<div class="msg ' + m.r + '"><div class="av">' + (m.r === 'ai' ? 'AI' : '我') + '</div><div class="bb">' + m.t + '</div></div>';
    });
    return h + '</div><div class="askbar"><input placeholder="' +
      esc(o.ph || '输入你的研究问题…') + '" readonly><button>发送</button></div>';
  };

  function ohlc(seed, n, start) {
    var r = rng(seed), px = start || 3200, out = [];
    for (var i = 0; i < n; i++) {
      var o = px, c = px * (1 + 0.0008 + 0.013 * gauss(r));
      var hi = Math.max(o, c) * (1 + Math.abs(gauss(r)) * 0.004), lo = Math.min(o, c) * (1 - Math.abs(gauss(r)) * 0.004);
      out.push([o, hi, lo, c, 6e7 + Math.abs(gauss(r)) * 4e7]); px = c;
    }
    return out;
  }

  /* ---------- 5. 简写规格归一化 ---------- */
  /* 演示脚本（AI 实演中心）使用声明式简写：
     {k:'line', n:60, names:['A','B']} / {k:'bar', cats:[...], center, scale} /
     {k:'hbar', items:['甲','乙'], center, scale} / {k:'scatter', n, seed} /
     {k:'treemap', names:[...]} / {k:'candle', n, start, seed} / {k:'mbar', ...}
     这里统一展开为完整规格，数据仍由种子随机生成（示意数据）。 */
  function seedOf(o, p) {
    if (o.seed) return String(o.seed);
    var key = (o.cats || o.names || o.items || []).join(',');
    return p + '|' + key + '|' + (o.n || '') + '|' + (o.center || '') + '|' + (o.scale || '');
  }
  function quick(o) {
    if (!o || !o.k) return o;
    if (o.k === 'mbar') o.k = 'bar';
    var k = o.k;

    // 折线：names + n（或 monthly / mode:'ou'）
    if (k === 'line' && !o.series && o.names) {
      var n = o.n || 60, sd = seedOf(o, 'L');
      o.cats = o.cats || (o.monthly ? months(n) : days(n));
      o.series = o.names.map(function (nm, i) {
        var d = o.mode === 'ou'
          ? ou(sd + '#' + i, n, { mean: (o.mean == null ? 3 : o.mean) + i * (o.gap || 0), sd: o.sd == null ? .5 : o.sd })
          : walk(sd + '#' + i, n, {
            start: (o.start == null ? 100 : o.start) * (1 - i * (o.gap || 0)),
            vol: o.vol == null ? .011 : o.vol,
            drift: (o.drift == null ? .0008 : o.drift) - i * 0.0004
          });
        return { name: nm, data: d, color: T.pal[i % T.pal.length], area: !!o.area && i === 0, dash: i > 0 && !!o.dash };
      });
    }
    // 柱状 / 分组柱：cats + center/scale（+names 为分组）
    if (k === 'bar' && (!o.series || !o.series.length)) {
      var cats = o.cats || [], rb = rng(seedOf(o, 'B'));
      var c0 = o.center == null ? 0 : o.center, sc = o.scale == null ? 3 : o.scale;
      if (o.names && o.names.length) {
        o.series = o.names.map(function (nm, i) {
          return {
            name: nm, color: T.pal[i % T.pal.length], signColor: o.sign !== false,
            data: cats.map(function () { return +Math.abs(c0 + sc * gauss(rb)).toFixed(2); })
          };
        });
      } else {
        o.series = [{
          name: o.name || '值', color: o.color, signColor: o.sign !== false,
          data: cats.map(function () { return +(c0 + sc * gauss(rb)).toFixed(2); })
        }];
      }
      if (o.legend == null) o.legend = (o.series.length > 1);
    }
    // 横向条形：items 为字符串数组（+vals 可指定具体数值）
    if (k === 'hbar' && o.items && typeof o.items[0] === 'string') {
      var c1 = o.center == null ? 0 : o.center, s1 = o.scale == null ? 4 : o.scale;
      var rh = rng(seedOf(o, 'H'));
      var arr = o.items.map(function (nm, i) {
        var v = o.vals && o.vals[i] != null ? o.vals[i] : +(c1 + s1 * gauss(rh)).toFixed(2);
        return { n: nm, v: v };
      });
      if (o.keepOrder !== true) arr.sort(function (a, b) { return o.asc ? a.v - b.v : b.v - a.v; });
      o.items = arr;
    }
    // 散点：n + seed + 线性关系参数
    if (k === 'scatter' && !o.points) {
      var rs = rng(seedOf(o, 'S')), ns = o.n || 80, pts = [];
      for (var i2 = 0; i2 < ns; i2++) {
        var x = (o.xc == null ? 20 : o.xc) + (o.xs == null ? 8 : o.xs) * gauss(rs);
        pts.push([+x.toFixed(3),
          +((o.b == null ? .4 : o.b) * x + (o.a == null ? 2 : o.a) + (o.e == null ? 4 : o.e) * gauss(rs)).toFixed(3),
          2.5 + rs() * 3, rs() > .5 ? T.pal[0] : T.pal[3]]);
      }
      o.points = pts;
    }
    // 树图：names + seed
    if (k === 'treemap' && !o.items && o.names) {
      var rt = rng(seedOf(o, 'T'));
      o.items = o.names.map(function (nm, i) {
        return {
          n: nm,
          v: o.vals && o.vals[i] != null ? o.vals[i] : +(10 + 90 * rt()).toFixed(1),
          chg: +(3.2 * gauss(rt)).toFixed(2)
        };
      });
    }
    // K 线：n + start + seed
    if (k === 'candle' && !o.data) o.data = ohlc(seedOf(o, 'C'), o.n || 60, o.start || 3200);
    return o;
  }

  /* ---------- 6. 对外接口 ---------- */
  global.MC = {
    rng: rng, gauss: gauss, walk: walk, ou: ou, months: months, days: days, T: T, fmt: fmt, quick: quick,
    // 生成 OHLCV
    ohlc: ohlc,
    matrix: function (seed, nr, nc, o) {
      o = o || {};
      var r = rng(seed), m = [];
      for (var i = 0; i < nr; i++) {
        var row = [];
        for (var j = 0; j < nc; j++) {
          if (o.corr && i === j) row.push(1);
          else row.push(+((o.center || 0) + (o.scale || 0.6) * gauss(r)).toFixed(3));
        }
        m.push(row);
      }
      return m;
    },
    render: function (spec) {
      if (!spec) return '<div class="mc-missing">图形占位</div>';
      var o = quick(spec);
      if (!C[o.k]) return '<div class="mc-missing">图形占位</div>';
      var out;
      try { out = C[o.k](o); } catch (e) { out = '<div class="mc-missing">渲染失败: ' + esc(e.message) + '</div>'; }
      if (o.title) {
        out = '<div class="mc-wrap"><div class="mc-title">' + esc(o.title) +
          (o.sub ? '<span>' + esc(o.sub) + '</span>' : '') + '</div>' + out + '</div>';
      }
      return out;
    },
    types: C
  };
})(window);
