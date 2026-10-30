(function () {
  "use strict";
  var MAX_BYTES = 20 * 1024 * 1024;
  var EXTS = [".pdf", ".txt", ".md"];
  var $ = function (id) { return document.getElementById(id); };
  var docCount = 0;
  var asking = false;

  var SVG_NS = "http://www.w3.org/2000/svg";
  function icon(path) {
    var s = document.createElementNS(SVG_NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("class", "icon");
    var p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", path);
    s.appendChild(p);
    return s;
  }
  var FILE_PATH = "M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5";
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function toast(msg, kind) {
    var t = el("div", "toast " + (kind || ""), msg);
    $("toasts").appendChild(t);
    setTimeout(function () { t.remove(); }, 4000);
  }
  function api(method, url, body, isForm) {
    var opts = { method: method, headers: {} };
    if (body && !isForm) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    if (isForm) opts.body = body;
    return fetch(url, opts).then(function (r) {
      if (r.status === 204) return null;
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) {
          var d = data && data.detail;
          if (Array.isArray(d)) d = d.map(function (x) { return x.msg; }).join("; ");
          throw new Error(d || ("Request failed (" + r.status + ")"));
        }
        return data;
      });
    });
  }

  function updateAskState() {
    $("ask-btn").disabled = asking || docCount === 0;
    $("ask-btn").title = docCount === 0 ? "Upload a document first" : "";
  }

  // ---- Health ----
  function checkHealth() {
    fetch("/health").then(function (r) {
      var ok = r.ok;
      $("status-dot").className = "status-dot " + (ok ? "ok" : "down");
      $("status-text").textContent = ok ? "Online" : "Unavailable";
    }).catch(function () {
      $("status-dot").className = "status-dot down";
      $("status-text").textContent = "Offline";
    });
  }

  // ---- Documents ----
  function renderDocs(docs) {
    var list = $("doc-list");
    list.replaceChildren();
    docCount = docs.length;
    updateAskState();
    if (!docs.length) {
      var empty = el("div", "empty");
      empty.appendChild(icon(FILE_PATH));
      empty.appendChild(el("p", "", "No documents yet. Upload a PDF, TXT or Markdown file to get started."));
      list.appendChild(empty);
      return;
    }
    docs.forEach(function (d) {
      var card = el("div", "doc-card");
      var ic = icon(FILE_PATH); ic.classList.add("file-icon");
      card.appendChild(ic);
      var meta = el("div", "doc-meta");
      meta.appendChild(el("div", "doc-name", d.filename));
      meta.appendChild(el("div", "doc-sub", d.chunk_count + " chunks"));
      card.appendChild(meta);
      var del = el("button", "btn btn-danger", "Delete");
      del.type = "button";
      del.addEventListener("click", function () {
        if (del.dataset.confirm !== "1") {
          del.dataset.confirm = "1"; del.textContent = "Confirm?";
          setTimeout(function () { del.dataset.confirm = ""; del.textContent = "Delete"; }, 3000);
          return;
        }
        del.disabled = true;
        api("DELETE", "/api/documents/" + encodeURIComponent(d.id))
          .then(function () { toast("Deleted " + d.filename, "success"); loadDocs(); })
          .catch(function (e) { del.disabled = false; toast(e.message, "error"); });
      });
      card.appendChild(del);
      list.appendChild(card);
    });
  }
  function loadDocs() {
    var list = $("doc-list");
    if (!list.children.length) {
      list.replaceChildren(el("div", "skeleton"), el("div", "skeleton"));
    }
    api("GET", "/api/documents").then(renderDocs).catch(function (e) {
      list.replaceChildren();
      var card = el("div", "card error", "Could not load documents: " + e.message + " ");
      var retry = el("button", "btn btn-secondary", "Retry");
      retry.type = "button";
      retry.addEventListener("click", loadDocs);
      card.appendChild(retry);
      list.appendChild(card);
    });
  }

  // ---- Upload ----
  function uploadFile(file) {
    var row = el("li", "upload-row");
    row.appendChild(icon(FILE_PATH));
    row.appendChild(el("span", "", file.name));
    var msg = el("span", "msg");
    row.appendChild(msg);
    $("upload-rows").appendChild(row);

    function fail(text) { row.classList.add("error"); msg.textContent = text; toast(file.name + ": " + text, "error"); }
    var lower = file.name.toLowerCase();
    if (!EXTS.some(function (x) { return lower.endsWith(x); })) return fail("Unsupported type");
    if (file.size > MAX_BYTES) return fail("Larger than 20 MB");

    var sp = el("span", "spinner");
    msg.textContent = "Indexing...";
    row.insertBefore(sp, msg);
    var fd = new FormData();
    fd.append("files", file, file.name);
    api("POST", "/api/documents", fd, true).then(function (res) {
      sp.remove();
      row.classList.add("done");
      var replaced = res && res[0] && res[0].replaced;
      msg.textContent = replaced ? "Replaced existing file" : "Added";
      loadDocs();
      setTimeout(function () { row.remove(); }, 5000);
    }).catch(function (e) { sp.remove(); fail(e.message); });
  }
  function handleFiles(files) { Array.prototype.forEach.call(files, uploadFile); }

  var dz = $("dropzone"), input = $("file-input");
  dz.addEventListener("click", function () { input.click(); });
  dz.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", function () { handleFiles(input.files); input.value = ""; });
  ["dragenter", "dragover"].forEach(function (n) {
    dz.addEventListener(n, function (e) { e.preventDefault(); dz.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach(function (n) {
    dz.addEventListener(n, function (e) { e.preventDefault(); dz.classList.remove("drag"); });
  });
  dz.addEventListener("drop", function (e) { handleFiles(e.dataTransfer.files); });

  // ---- Ask ----
  function renderAnswer(res) {
    var area = $("answer-area");
    area.replaceChildren();
    var hasSources = res.sources && res.sources.length;
    var card = el("div", hasSources ? "card answer" : "card info");
    card.appendChild(el("h3", "", "Answer"));
    card.appendChild(el("div", "answer-text", res.answer));
    area.appendChild(card);
    if (!hasSources) return;
    var wrap = el("div", "card");
    wrap.appendChild(el("h3", "", "Sources"));
    var list = el("div", "sources");
    res.sources.forEach(function (s, i) {
      var box = el("div", "source");
      var head = el("div", "source-head");
      head.appendChild(el("span", "badge n", String(i + 1)));
      var loc = s.filename + (s.page != null ? " · p." + s.page : " · chunk " + s.chunk_index);
      head.appendChild(el("span", "", loc));
      head.appendChild(el("span", "badge score", Math.round(s.score * 100) + "% match"));
      box.appendChild(head);
      box.appendChild(el("p", "snippet", s.snippet));
      var tg = el("button", "toggle", "Show more");
      tg.type = "button";
      tg.addEventListener("click", function () {
        var open = box.classList.toggle("open");
        tg.textContent = open ? "Show less" : "Show more";
      });
      box.appendChild(tg);
      list.appendChild(box);
    });
    wrap.appendChild(list);
    area.appendChild(wrap);
  }
  function ask() {
    var q = $("question").value.trim();
    if (!q || asking || docCount === 0) return;
    asking = true; updateAskState();
    var area = $("answer-area");
    var typing = el("div", "card typing");
    typing.appendChild(el("span")); typing.appendChild(el("span")); typing.appendChild(el("span"));
    area.replaceChildren(typing);
    api("POST", "/api/query", { question: q }).then(renderAnswer).catch(function (e) {
      area.replaceChildren(el("div", "card error", e.message));
    }).then(function () { asking = false; updateAskState(); });
  }
  $("ask-form").addEventListener("submit", function (e) { e.preventDefault(); ask(); });
  $("question").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ask(); }
  });

  $("answer-area").appendChild(el("div", "empty", "Ask a question about your uploaded documents. Answers cite their sources."));
  updateAskState();
  checkHealth();
  loadDocs();
})();
