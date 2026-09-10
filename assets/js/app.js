/* =============================================================
 * app.js — 导航、路由、面板渲染、功能说明抽屉、全局搜索
 * ============================================================= */
(function (g) {
  'use strict';
  var QW = g.QW, MC = g.MC;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  /* 虚拟模块：功能全景 */
  QW.modules.atlas = { n: '功能全景总表', ic: '☰', sub: 'Feature Atlas', desc: '平台全部功能面板的索引总表：按模块列出编号、名称、一句话说明、子功能数量与核心指标，可直接打开任一功能的完整说明，便于对照后续算法实现排期。' };
  QW.modules.atlas2 = { n: '子功能全表', ic: '≡', sub: 'Sub-feature Atlas', desc: '把每个功能面板拆解到可独立排期的子功能颗粒度，按「模块 → 面板 → 子功能」三级列出全部条目，支持关键词过滤，可直接作为开发任务清单（WBS）。' };

  /* ---------- 行情跑马灯 ---------- */
  function ticker() {
    var items = [
      ['上证指数', '3,482.16', 0.62], ['深证成指', '11,286.4', 0.94], ['创业板指', '2,412.8', 1.32],
      ['沪深300', '4,182.63', 0.83], ['中证500', '6,284.1', 0.41], ['中证1000', '6,912.5', -0.22],
      ['科创50', '1,142.7', 1.86], ['恒生指数', '24,861', 0.55], ['恒生科技', '5,742.3', 1.24],
      ['标普500', '6,842.1', 0.31], ['纳斯达克', '23,184', 1.12], ['日经225', '43,286', -0.42],
      ['10Y国债', '1.742%', -0.18], ['美元指数', '98.41', 0.12], ['USDCNH', '7.0912', -0.08],
      ['COMEX金', '3,842.6', 0.74], ['布伦特原油', '71.24', -1.35], ['LME铜', '9,842', 0.62],
      ['螺纹钢', '3,186', -0.44], ['碳酸锂', '82,400', 2.86], ['BTC', '112,486', -1.62],
      ['IF当季基差', '-2.10%', -0.4], ['50ETF IV', '16.8%', 2.6], ['两融余额', '1.94万亿', 0.35]
    ];
    var one = items.map(function (t) {
      var c = t[2] > 0 ? 'up' : (t[2] < 0 ? 'dn' : 'flat'), sign = t[2] > 0 ? '+' : '';
      return '<span class="tk"><b>' + t[0] + '</b><span class="v ' + c + '">' + t[1] +
        '</span><span class="' + c + '">' + sign + t[2].toFixed(2) + '%</span></span>';
    }).join('');
    $('#ticker').innerHTML = '<div class="track">' + one + one + '</div>';
  }

  /* ---------- 侧边导航 ---------- */
  function sidebar() {
    var h = '';
    QW.groups.forEach(function (grp) {
      h += '<div class="grp">' + esc(grp.n) + '</div>';
      grp.ms.forEach(function (mid) {
        var m = QW.modules[mid];
        if (!m) return;
        var ct = QW.features.filter(function (f) { return f.m === mid; }).length;
        var sc = mid === 'atlas' ? QW.totalCount() : (mid === 'atlas2' ? QW.subCount() : ct + QW.subCount(mid));
        h += '<a class="nav" data-m="' + mid + '" href="#/m/' + mid + '">' +
          '<span class="ic">' + m.ic + '</span><span class="nm">' + esc(m.n) + '</span>' +
          '<span class="ct">' + sc + '</span></a>';
      });
    });
    $('#side').innerHTML = h;
  }

  /* ---------- 图形渲染分派 ---------- */
  // ===== AI 实演中心：脚本化交互演示引擎 =====
  var __demos = {}; var __demoSeq = 0;
  function viz(spec) {
    if (!spec) return '';
    if (spec.k === 'html') return spec.html;
    if (spec.k === 'demo') {
      var id = 'demo-' + (++__demoSeq);
      spec._hostId = id; __demos[id] = spec;
      return '<div class="demo-host" id="' + id + '" data-demo></div>';
    }
    return MC.render(spec);
  }
  // 供注册表（如场景配图库）复用同一套渲染分派
  QW.viz = viz;
  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function demoInit(host, spec) {
    if (host.__inited) return; host.__inited = true;
    var log, input, busy = false;
    function shell() {
      host.innerHTML =
        '<div class="demo-scenario"><b>▶ ' + escHtml(spec.scenario || 'AI 实演样例') + '</b>' +
        '<button class="demo-restart" type="button">↺ 重放</button>' +
        '<span class="demo-taglive"><span class="demo-live-dot"></span>脚本化演示 · 可点击追问</span></div>' +
        '<div class="demo-log"></div>' +
        '<div class="demo-composer"><input placeholder="' + escHtml(spec.placeholder || '输入你的问题，或点击上方推荐问法…') + '"/>' +
        '<button type="button">发送</button></div>';
      log = host.querySelector('.demo-log');
      input = host.querySelector('input');
      host.querySelector('button.demo-restart').onclick = function () { host.__inited = false; demoInit(host, spec); };
      host.querySelector('.demo-composer button').onclick = onSend;
      input.onkeydown = function (e) { if (e.key === 'Enter') onSend(); };
    }
    function scroll() { log.scrollTop = log.scrollHeight; }
    function addMsg(who, html) {
      var d = document.createElement('div');
      d.className = 'demo-msg ' + who;
      d.innerHTML = '<div class="demo-av">' + (who === 'me' ? '我' : 'AI') + '</div>' +
        '<div class="demo-bubble">' + html + '</div>';
      log.appendChild(d); scroll(); return d;
    }
    function typing() {
      var d = addMsg('ai', '<span class="demo-typing"><i></i><i></i><i></i></span>');
      return d;
    }
    function nodeHtml(node) {
      var h = node.html || '';
      if (node.kpis) {
        h += '<div class="demo-cardgrid">' + node.kpis.map(function (k) {
          return '<div class="demo-kpi"><div class="k">' + escHtml(k.k) + '</div><div class="v ' + (k.c || '') + '">' + escHtml(k.v) + '</div></div>';
        }).join('') + '</div>';
      }
      if (node.steps) {
        h += '<div class="demo-steps">' + node.steps.map(function (st, i) {
          return '<div class="demo-step"><span class="demo-stepdot">' + (i + 1) + '</span><div><b>' + escHtml(st[0]) + '</b><br><span>' + escHtml(st[1]) + '</span></div></div>';
        }).join('') + '</div>';
      }
      if (node.table) h += node.table;
      if (node.chart) {
        try { h += '<div class="demo-chart">' + viz(node.chart) + '</div>'; }
        catch (e) { h += '<div class="demo-chart-err">图渲染失败: ' + escHtml(e.message) + '</div>'; }
      }
      if (node.verdict) h += '<div class="demo-verdict ' + (node.verdict[0] || 'wait') + '">' + node.verdict[1] + '</div>';
      if (node.src) h += '<div class="demo-src">数据来源（示意）：' + node.src + '</div>';
      // 走到结尾（无推荐问法）时自动补一个"回到开头"，保证任何一步都有可点选项
      var chips = (node.chips && node.chips.length) ? node.chips
        : (spec.nodes[spec.start] ? [{ t: '↺ 回到开头，换个问法', to: spec.start, gray: 1, quiet: 1 }] : []);
      if (chips.length) {
        h += '<div class="demo-chips">' + chips.map(function (c) {
          return '<span class="demo-chip' + (c.gray ? ' gray' : '') + '" data-to="' + escHtml(typeof c === 'string' ? '' : (c.to || '')) +
            '" data-q="' + escHtml(typeof c === 'string' ? c : c.t) + '" data-quiet="' + (c.quiet ? '1' : '') + '">' +
            escHtml(typeof c === 'string' ? c : c.t) + '</span>';
        }).join('') + '</div>';
      }
      return h;
    }
    function showNode(id, userText) {
      var node = spec.nodes[id]; if (!node) return;
      if (userText) addMsg('me', escHtml(userText));
      busy = true;
      var t = typing();
      setTimeout(function () {
        t.remove();
        addMsg('ai', nodeHtml(node));
        busy = false;
        if (node.auto) setTimeout(function () { var n = spec.nodes[node.auto]; if (n) showNode(node.auto); }, 700);
        if (input && !document.hidden) input.focus();
      }, 480 + Math.random() * 420);
    }
    function answer(text) {
      // 关键词路由 → 节点；未命中用 fallback
      var rules = spec.routes || [], hit = null;
      for (var i = 0; i < rules.length; i++) {
        if (rules[i].kw.some(function (k) { return text.indexOf(k) >= 0; })) { hit = rules[i].to; break; }
      }
      showNode(hit || spec.fallback || Object.keys(spec.nodes)[0], text);
    }
    function onSend() {
      var v = input.value.trim();
      if (!v || busy) return;
      input.value = ''; answer(v);
    }
    host.addEventListener('click', function (e) {
      var chip = e.target.closest('.demo-chip');
      if (chip && !busy) {
        var to = chip.getAttribute('data-to'), q = chip.getAttribute('data-q');
        if (chip.getAttribute('data-quiet')) {
          q = '';
          if (to === spec.start && log) log.innerHTML = '';   // 回到开头：清空历史重新演示
        }
        if (to) showNode(to, q); else answer(q);
      }
    });
    shell();
    // 开场白
    var open = spec.nodes[spec.start];
    addMsg('ai', nodeHtml(open));
    if (open.auto) setTimeout(function () { var n = spec.nodes[open.auto]; if (n) showNode(open.auto); }, 800);
    if (input) input.focus();
  }
  function bindDemos() {
    document.querySelectorAll('[data-demo]').forEach(function (host) {
      var spec = __demos[host.id];
      if (spec) demoInit(host, spec);
    });
  }

  /* ---------- 功能卡片 ---------- */
  function tagClass(t) {
    if (t === 'AI' || t === '创新') return 'ai';
    if (t === '核心') return 'new';
    if (t === '实时') return 'rt';
    return '';
  }
  // 贪心排版：按 12 栅格逐行装填，行尾不足时拉伸该行最后一张卡片，避免出现空洞
  function layout(list) {
    var rows = [], cur = [], fill = 0;
    list.forEach(function (f) {
      if (f.w > 12 - fill && cur.length) {
        cur[cur.length - 1].w2 += 12 - fill;
        rows.push(cur); cur = []; fill = 0;
      }
      cur.push({ f: f, w2: f.w }); fill += f.w;
    });
    if (cur.length) { if (fill < 12) cur[cur.length - 1].w2 += 12 - fill; rows.push(cur); }
    var out = [];
    rows.forEach(function (r) { r.forEach(function (c) { out.push(c); }); });
    return out;
  }

  function card(f, w2) {
    var spec;
    try { spec = typeof f.viz === 'function' ? f.viz() : f.viz; } catch (e) { spec = null; }
    var h = '<div class="card" style="grid-column:span ' + (w2 || f.w) + '" id="c-' + f.id + '">';
    h += '<div class="hd"><span class="fid">' + f.id + '</span><h3>' + esc(f.n) + '</h3><div class="sp">';
    f.tags.forEach(function (t) { h += '<span class="tag ' + tagClass(t) + '">' + esc(t) + '</span>'; });
    h += '<button class="iconbtn" data-open="' + f.id + '">说明</button></div></div>';
    h += '<div class="bd"><p class="desc">' + esc(f.desc) + '</p>' + viz(spec);
    if (f.metrics.length) {
      h += '<div class="chips">';
      f.metrics.slice(0, 7).forEach(function (m) { h += '<span class="chip m">' + esc(m) + '</span>'; });
      h += '</div>';
    }
    if (f.subs.length) {
      h += '<details class="subs"><summary>子功能 <b>' + f.subs.length + '</b> 项 <span class="n">（点击展开细粒度功能清单）</span></summary><div class="sublist">';
      f.subs.forEach(function (s) {
        h += '<div class="s" title="' + esc(s.n + '：' + s.d) + '"><span class="i">' + s.id + '</span><span class="t">' + esc(s.n) + '</span>' +
          (s.t ? '<span class="ai">' + esc(s.t) + '</span>' : '') + '<span class="d">' + esc(s.d) + '</span></div>';
      });
      h += '</div></details>';
    }
    h += '</div>';
    h += '<div class="ft"><span>数据源：' + esc(f.data.slice(0, 2).join(' / ') || '平台内部') + '</span>' +
      (f.subs.length ? '<span style="color:#55637d">· 含 ' + f.subs.length + ' 项子功能</span>' : '') +
      '<span class="more" data-open="' + f.id + '">功能说明与实现要点 →</span></div></div>';
    return h;
  }

  /* ---------- 模块页 ---------- */
  var filterTag = '全部';
  function renderModule(mid) {
    var m = QW.modules[mid];
    if (!m) return renderModule('home');
    var main = $('#main');
    if (mid === 'atlas') return renderAtlas();
    if (mid === 'atlas2') return renderSubAtlas();
    var fs = QW.features.filter(function (f) { return f.m === mid; });
    var shown = filterTag === '全部' ? fs : fs.filter(function (f) { return f.tags.indexOf(filterTag) >= 0; });
    var kpis = (QW.kpis[mid] || []);
    var nsub = QW.subCount(mid);
    var h = '<div class="phead"><div class="bc">投研平台 / ' + esc(m.sub) + '</div>' +
      '<h1>' + m.ic + ' ' + esc(m.n) + '<span class="cnt">' + fs.length + ' 个功能面板</span>' +
      '<span class="cnt">' + nsub + ' 项子功能</span><span class="cnt">合计 ' + (fs.length + nsub) + '</span></h1>' +
      '<p>' + esc(m.desc) + '</p></div>';
    if (kpis.length) {
      h += '<div class="kpis">';
      kpis.forEach(function (k) {
        h += '<div class="kpi ' + (k.c || '') + '"><div class="k">' + esc(k.k) + '</div><div class="v">' + k.v + '</div><div class="d">' + k.d + '</div></div>';
      });
      h += '</div>';
    }
    var tags = ['全部', '核心', 'AI', '实时', '风控', '创新'];
    h += '<div class="toolbar"><div class="seg">';
    tags.forEach(function (t) { h += '<button data-tag="' + t + '"' + (t === filterTag ? ' class="on"' : '') + '>' + t + '</button>'; });
    h += '</div><select class="sel"><option>全部市场</option><option>A股</option><option>港股</option><option>美股</option><option>期货</option><option>债券</option></select>' +
      '<select class="sel"><option>日频</option><option>周频</option><option>月频</option><option>分钟</option><option>实时</option></select>' +
      '<button class="iconbtn" id="expandAll">展开全部子功能</button>' +
      '<button class="iconbtn" id="collapseAll">收起</button>' +
      '<span class="spacer"></span><span style="font-size:11.5px;color:#6b7791">展示 ' + shown.length + ' / ' + fs.length + ' 个面板 · 图表为示意数据，不含真实算法</span></div>';
    h += '<div class="grid">' + layout(shown).map(function (c) { return card(c.f, c.w2); }).join('') + '</div>';
    h += footer();
    main.innerHTML = h;
    main.scrollTop = 0;
    bindPage();
  }

  function renderAtlas() {
    var h = '<div class="phead"><div class="bc">投研平台 / Feature Atlas</div><h1>☰ 功能全景总表<span class="cnt">' +
      QW.totalCount() + ' 项功能 · ' + nmod() + ' 个模块</span></h1>' +
      '<p>' + esc(QW.modules.atlas.desc) + '</p></div>';
    var aiSub = 0;
    QW.features.forEach(function (f) { f.subs.forEach(function (x) { if (x.t) aiSub++; }); });
    var stat = [
      { k: '功能总数', v: QW.totalCount(), d: '功能面板 ' + QW.panelCount() + ' + 子功能 ' + QW.subCount(), c: 'r' },
      { k: '业务模块', v: nmod(), d: '宏观到执行 + 一级/另类/业务/治理', c: '' },
      { k: '功能面板', v: QW.panelCount(), d: '每个面板一块可视化界面', c: '' },
      { k: '子功能', v: QW.subCount(), d: '平均每面板 ' + (QW.subCount() / QW.panelCount()).toFixed(1) + ' 项', c: '' },
      { k: 'AI / 创新功能', v: QW.features.filter(function (f) { return f.tags.indexOf('AI') >= 0 || f.tags.indexOf('创新') >= 0; }).length + aiSub, d: '面板级 + 子功能级 AI 标记', c: 'y' },
      { k: '核心指标条目', v: QW.features.reduce(function (a, f) { return a + f.metrics.length; }, 0), d: '可直接对应字段设计', c: '' },
      { k: '算法要点条目', v: QW.features.reduce(function (a, f) { return a + f.algo.length; }, 0), d: '后续实现参考', c: 'g' },
      { k: '功能关联关系', v: QW.features.reduce(function (a, f) { return a + f.links.length; }, 0), d: '构成功能依赖图', c: '' }
    ];
    h += '<div class="kpis">' + stat.map(function (k) {
      return '<div class="kpi ' + k.c + '"><div class="k">' + k.k + '</div><div class="v">' + k.v + '</div><div class="d">' + k.d + '</div></div>';
    }).join('') + '</div>';
    QW.groups.forEach(function (grp) {
      h += '<div class="subhd"><b>' + esc(grp.n) + '</b></div><div class="grid">';
      grp.ms.forEach(function (mid) {
        if (mid === 'atlas' || mid === 'atlas2') return;
        var m = QW.modules[mid], fs = QW.features.filter(function (f) { return f.m === mid; });
        if (!fs.length) return;
        var ns = QW.subCount(mid);
        h += '<div class="card" style="grid-column:span 12"><div class="hd"><span class="fid">' + (fs.length + ns) + '</span><h3>' + m.ic + ' ' + esc(m.n) + '</h3>' +
          '<div class="sp"><span class="tag">' + esc(m.sub) + '</span><span class="tag">' + fs.length + ' 面板 + ' + ns + ' 子功能</span>' +
          '<a class="iconbtn" href="#/m/' + mid + '">进入模块</a></div></div><div class="bd">';
        h += '<div class="tw" style="max-height:none"><table class="dt"><thead><tr><th style="width:70px">编号</th><th style="width:170px">功能名称</th><th style="text-align:left">功能说明</th><th style="width:44px">子功能</th><th style="width:210px;text-align:left">核心指标</th><th style="width:60px">说明</th></tr></thead><tbody>';
        fs.forEach(function (f) {
          h += '<tr><td style="font-family:ui-monospace;color:#4d9fff">' + f.id + '</td>' +
            '<td>' + esc(f.n) + '</td>' +
            '<td style="text-align:left;font-family:inherit;color:#9aa8bf;white-space:normal">' + esc(f.desc) + '</td>' +
            '<td>' + f.subs.length + '</td>' +
            '<td style="text-align:left;font-family:inherit;color:#6b7791;white-space:normal;font-size:10.5px">' + esc(f.metrics.slice(0, 5).join('、')) + '</td>' +
            '<td><span class="more" style="cursor:pointer;color:#4d9fff" data-open="' + f.id + '">查看</span></td></tr>';
        });
        h += '</tbody></table></div></div></div>';
      });
      h += '</div>';
    });
    h += footer();
    $('#main').innerHTML = h;
    $('#main').scrollTop = 0;
    bindPage();
  }

  // 子功能全表页
  function renderSubAtlas() {
    var h = '<div class="phead"><div class="bc">投研平台 / Sub-feature Atlas</div><h1>≡ 子功能全表<span class="cnt">' +
      QW.subCount() + ' 项子功能</span><span class="cnt">' + QW.panelCount() + ' 个面板</span></h1>' +
      '<p>' + esc(QW.modules.atlas2.desc) + '</p></div>';
    h += '<div class="toolbar"><input class="sel" id="subq" placeholder="过滤子功能（名称 / 说明 / 编号）" style="width:280px;height:26px">' +
      '<span class="spacer"></span><span style="font-size:11.5px;color:#6b7791">按模块 → 面板 → 子功能 三级列出，可用于排期与任务拆分</span></div>';
    QW.groups.forEach(function (grp) {
      var ms = grp.ms.filter(function (mid) { return mid !== 'atlas' && mid !== 'atlas2' && QW.subCount(mid); });
      if (!ms.length) return;
      h += '<div class="subhd"><b>' + esc(grp.n) + '</b></div><div class="grid">';
      ms.forEach(function (mid) {
        var m = QW.modules[mid];
        h += '<div class="card" style="grid-column:span 12"><div class="hd"><span class="fid">' + QW.subCount(mid) +
          '</span><h3>' + m.ic + ' ' + esc(m.n) + '</h3><div class="sp"><a class="iconbtn" href="#/m/' + mid + '">进入模块</a></div></div><div class="bd">';
        h += '<div class="tw" style="max-height:none"><table class="dt"><thead><tr><th style="width:74px">编号</th>' +
          '<th style="width:150px">所属面板</th><th style="width:180px">子功能名称</th><th style="text-align:left">说明</th></tr></thead><tbody>';
        QW.features.filter(function (f) { return f.m === mid; }).forEach(function (f) {
          f.subs.forEach(function (sb) {
            h += '<tr class="subrow" data-k="' + esc((sb.id + ' ' + sb.n + ' ' + sb.d).toLowerCase()) + '">' +
              '<td style="font-family:ui-monospace;color:#4d9fff">' + sb.id + '</td>' +
              '<td style="font-size:10.5px;color:#6b7791"><span class="more" style="cursor:pointer" data-open="' + f.id + '">' + esc(f.n) + '</span></td>' +
              '<td>' + esc(sb.n) + (sb.t ? ' <span class="badge info">' + esc(sb.t) + '</span>' : '') + '</td>' +
              '<td style="text-align:left;font-family:inherit;color:#9aa8bf;white-space:normal">' + esc(sb.d) + '</td></tr>';
          });
        });
        h += '</tbody></table></div></div></div>';
      });
      h += '</div>';
    });
    h += footer();
    $('#main').innerHTML = h;
    $('#main').scrollTop = 0;
    bindPage();
    var sq = $('#subq');
    if (sq) sq.oninput = function () {
      var v = this.value.trim().toLowerCase();
      Array.prototype.forEach.call(document.querySelectorAll('tr.subrow'), function (tr) {
        tr.style.display = (!v || tr.getAttribute('data-k').indexOf(v) >= 0) ? '' : 'none';
      });
    };
  }

  function nmod() {
    return Object.keys(QW.modules).filter(function (k) { return k !== 'atlas' && k !== 'atlas2'; }).length;
  }
  function footer() {
    return '<div class="footer"><span>QuantLab Pro · 投研平台功能原型</span>' +
      '<span>功能数 <b class="hl">' + QW.totalCount() + '</b>（面板 ' + QW.panelCount() + ' + 子功能 ' + QW.subCount() + '）</span>' +
      '<span>模块 <b class="hl">' + nmod() + '</b></span>' +
      '<span>所有图表均为<b class="hl">示意数据</b>，不含真实行情与算法实现</span>' +
      '<span>完整功能说明见仓库 <span class="mono">FUNCTIONS.md</span></span></div>';
  }

  /* ---------- 抽屉 ---------- */
  function sect(title, body) { return '<div class="sect"><h4>' + title + '</h4>' + body + '</div>'; }
  function ul(arr) { return '<ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
  function openDrawer(id) {
    var f = QW.byId[id];
    if (!f) return;
    var m = QW.modules[f.m];
    var h = '<div class="fid">' + f.id + ' · ' + esc(m.n) + ' / ' + esc(m.sub) + '</div><h2>' + esc(f.n) + '</h2>' +
      '<button class="x" id="dx">✕</button>';
    $('#dh').innerHTML = h;
    var b = '';
    b += sect('一句话定位', '<p>' + esc(f.desc) + '</p>');
    b += sect('功能说明', '<p>' + esc(f.spec) + '</p>');
    if (f.subs.length) {
      var st = '<table class="subtable">';
      f.subs.forEach(function (s) {
        st += '<tr><td class="i">' + s.id + '</td><td class="t">' + esc(s.n) + (s.t ? '<span class="ai">' + esc(s.t) + '</span>' : '') +
          '</td><td class="d">' + esc(s.d) + '</td></tr>';
      });
      b += sect('子功能清单（' + f.subs.length + ' 项）', st + '</table>');
    }
    b += sect('核心指标（' + f.metrics.length + '）', ul(f.metrics));
    b += sect('数据依赖', ul(f.data));
    b += sect('算法实现要点（后续开发参考）', ul(f.algo));
    b += sect('输出与下游', ul(f.out));
    if (f.links.length) {
      b += sect('关联功能', '<div class="linkchips">' + f.links.map(function (id) {
        var t = QW.byId[id];
        return '<span class="lc" data-open="' + id + '">' + id + (t ? ' ' + esc(t.n) : '') + '</span>';
      }).join('') + '</div>');
    }
    b += sect('实现优先级建议', '<div class="kv">' +
      '<div class="k">功能编号</div><div class="mono">' + f.id + '</div>' +
      '<div class="k">所属模块</div><div>' + esc(m.n) + '</div>' +
      '<div class="k">标签</div><div>' + (f.tags.join(' / ') || '常规') + '</div>' +
      '<div class="k">建议阶段</div><div>' + (f.tags.indexOf('核心') >= 0 ? 'P0 — 平台骨架必备' : (f.tags.indexOf('AI') >= 0 || f.tags.indexOf('创新') >= 0 ? 'P2 — 差异化增强' : 'P1 — 完整性补齐')) + '</div>' +
      '<div class="k">实现复杂度</div><div>' + ['低', '中', '中高', '高'][(f.algo.length + f.data.length) % 4] + '（算法要点 ' + f.algo.length + ' 项）</div>' +
      '</div>');
    b += '<div class="note">本页仅为功能与指标定义说明，平台原型不包含真实算法实现；上方"算法实现要点"可直接作为后续开发的技术选型清单。</div>';
    $('#db').innerHTML = b;
    $('#drawer').classList.add('on');
    $('#mask').classList.add('on');
    $('#db').scrollTop = 0;
    if (location.hash.indexOf('/f/') < 0) history.replaceState(null, '', '#/f/' + f.id);
  }
  function closeDrawer() {
    $('#drawer').classList.remove('on');
    $('#mask').classList.remove('on');
    if (location.hash.indexOf('/f/') >= 0) history.replaceState(null, '', '#/m/' + (cur || 'home'));
  }

  /* ---------- 事件绑定 ---------- */
  function bindPage() {
    bindDemos();
    Array.prototype.forEach.call(document.querySelectorAll('[data-open]'), function (el) {
      el.onclick = function (e) { e.preventDefault(); openDrawer(el.getAttribute('data-open')); };
    });
    Array.prototype.forEach.call(document.querySelectorAll('.seg [data-tag]'), function (el) {
      el.onclick = function () { filterTag = el.getAttribute('data-tag'); renderModule(cur); };
    });
    var ea = document.querySelector('#expandAll'), ca = document.querySelector('#collapseAll');
    var setAll = function (v) {
      Array.prototype.forEach.call(document.querySelectorAll('details.subs'), function (d) { d.open = v; });
    };
    if (ea) ea.onclick = function () { setAll(true); };
    if (ca) ca.onclick = function () { setAll(false); };
  }

  /* ---------- 全局搜索 ---------- */
  function search(q) {
    q = q.trim().toLowerCase();
    var box = $('#sugg');
    if (!q) { box.style.display = 'none'; return; }
    var hit = QW.features.filter(function (f) {
      return (f.id + ' ' + f.n + ' ' + f.desc + ' ' + f.metrics.join(' ') + ' ' + f.tags.join(' ') + ' ' + QW.modules[f.m].n).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 30);
    // 子功能命中（打开其所属面板说明）
    var shit = [];
    QW.features.forEach(function (f) {
      f.subs.forEach(function (sb) {
        if ((sb.id + ' ' + sb.n + ' ' + sb.d).toLowerCase().indexOf(q) >= 0) shit.push({ f: f, s: sb });
      });
    });
    shit = shit.slice(0, 40);
    var mh = Object.keys(QW.modules).filter(function (k) {
      return (QW.modules[k].n + QW.modules[k].sub).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 5);
    var h = '';
    if (mh.length) {
      h += '<div class="hd">模块</div>';
      mh.forEach(function (k) {
        h += '<div class="it" data-go="' + k + '"><span class="id">' + QW.modules[k].ic + '</span><span>' + esc(QW.modules[k].n) +
          '</span><span class="m">' + esc(QW.modules[k].sub) + '</span></div>';
      });
    }
    h += '<div class="hd">功能面板（' + hit.length + '）</div>';
    if (!hit.length) h += '<div class="it"><span style="color:#6b7791">未找到匹配的功能面板</span></div>';
    hit.forEach(function (f) {
      h += '<div class="it" data-open="' + f.id + '"><span class="id">' + f.id + '</span><span>' + esc(f.n) +
        '</span><span class="m">' + esc(QW.modules[f.m].n) + '</span></div>';
    });
    if (shit.length) {
      h += '<div class="hd">子功能（' + shit.length + '）</div>';
      shit.forEach(function (x) {
        h += '<div class="it" data-open="' + x.f.id + '"><span class="id">' + x.s.id + '</span><span>' + esc(x.s.n) +
          '</span><span class="m">' + esc(x.f.n) + '</span></div>';
      });
    }
    box.innerHTML = h;
    box.style.display = 'block';
    Array.prototype.forEach.call(box.querySelectorAll('[data-open]'), function (el) {
      el.onclick = function () { box.style.display = 'none'; openDrawer(el.getAttribute('data-open')); };
    });
    Array.prototype.forEach.call(box.querySelectorAll('[data-go]'), function (el) {
      el.onclick = function () { box.style.display = 'none'; location.hash = '#/m/' + el.getAttribute('data-go'); };
    });
  }

  /* ---------- 路由 ---------- */
  var cur = 'home';
  function route() {
    var h = location.hash || '#/m/home';
    var mf = h.match(/#\/f\/([A-Z0-9]+-\d+)/i);
    if (mf) {
      var f = QW.byId[mf[1].toUpperCase()];
      if (f) { if (cur !== f.m) { cur = f.m; renderModule(cur); mark(); } openDrawer(f.id); return; }
    }
    var mm = h.match(/#\/m\/(\w+)/);
    var mid = mm ? mm[1] : 'home';
    if (!QW.modules[mid]) mid = 'home';
    cur = mid;
    closeDrawerSilent();
    renderModule(mid);
    mark();
  }
  function closeDrawerSilent() {
    $('#drawer').classList.remove('on');
    $('#mask').classList.remove('on');
  }
  function mark() {
    Array.prototype.forEach.call(document.querySelectorAll('.nav'), function (el) {
      el.classList.toggle('on', el.getAttribute('data-m') === cur);
    });
  }

  /* ---------- 启动 ---------- */
  function init() {
    ticker();
    sidebar();
    $('#q').addEventListener('input', function () { search(this.value); });
    $('#q').addEventListener('focus', function () { if (this.value) search(this.value); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.gsearch')) $('#sugg').style.display = 'none';
    });
    $('#mask').onclick = closeDrawer;
    document.addEventListener('click', function (e) { if (e.target && e.target.id === 'dx') closeDrawer(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDrawer(); $('#sugg').style.display = 'none'; }
      if (e.key === '/' && document.activeElement !== $('#q')) { e.preventDefault(); $('#q').focus(); }
    });
    window.addEventListener('hashchange', route);
    route();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
