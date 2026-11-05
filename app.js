(function () {
  const $ = (s) => document.querySelector(s);
  const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const estado = { cat: "Todos", q: "", ordem: "destaques", sacola: {} };

  try { estado.sacola = JSON.parse(localStorage.getItem("amabile-sacola")) || {}; } catch (e) {}
  const salvar = () => { try { localStorage.setItem("amabile-sacola", JSON.stringify(estado.sacola)); } catch (e) {} };

  // ---- Menu compacto (RF14)
  const menu = $("#menu"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    menuBtn.setAttribute("aria-expanded", aberto);
  });
  menu.addEventListener("click", (e) => { if (e.target.tagName === "A") { menu.classList.remove("aberto"); menuBtn.setAttribute("aria-expanded", false); } });

  // ---- Catálogo (RF02 a RF06)
  const cats = ["Todos", ...new Set(PRODUTOS.map((p) => p.categoria))];
  $("#filtros").innerHTML = cats.map((c) => `<button type="button" data-cat="${c}" aria-pressed="${c === "Todos"}">${c}</button>`).join("");
  $("#filtros").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    estado.cat = b.dataset.cat;
    document.querySelectorAll("#filtros button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    catalogo();
  });
  $("#busca").addEventListener("input", (e) => { estado.q = norm(e.target.value); catalogo(); });
  $("#ordem").addEventListener("change", (e) => { estado.ordem = e.target.value; catalogo(); });

  function catalogo() {
    let lista = PRODUTOS.filter((p) => (estado.cat === "Todos" || p.categoria === estado.cat) && norm(p.nome + " " + p.descricao).includes(estado.q));
    if (estado.ordem === "menor") lista.sort((a, b) => a.preco - b.preco);
    else if (estado.ordem === "maior") lista.sort((a, b) => b.preco - a.preco);
    else lista.sort((a, b) => a.destaque - b.destaque);
    $("#total").textContent = lista.length + (lista.length === 1 ? " produto encontrado" : " produtos encontrados");
    $("#grade").innerHTML = lista.length ? lista.map((p) => `
      <article class="card">
        <div class="thumb" data-c="${p.categoria}" ${p.imagem ? `style="background-image:url('${p.imagem}')"` : ""} role="img" aria-label="${p.nome}">${p.imagem ? "" : p.nome[0]}${p.selo ? `<span class="selo">${p.selo}</span>` : ""}</div>
        <div class="linha"><span>${p.categoria}</span><span>${brl(p.preco)}</span></div>
        <h3>${p.nome}</h3><p>${p.descricao}</p>
        <button type="button" data-add="${p.id}">Adicionar à encomenda</button>
      </article>`).join("") : `<p class="vazio">Nenhum produto encontrado. Tente outra palavra ou escolha “Todos”.</p>`;
  }
  $("#grade").addEventListener("click", (e) => {
    const id = e.target.dataset.add; if (!id) return;
    estado.sacola[id] = (estado.sacola[id] || 0) + 1; salvar(); sacola();
    e.target.textContent = "Adicionado"; setTimeout(() => (e.target.textContent = "Adicionar à encomenda"), 1200);
  });

  // ---- Sacola (RF07 a RF09)
  function sacola() {
    const ids = Object.keys(estado.sacola).filter((id) => estado.sacola[id] > 0);
    let sub = 0, qtd = 0;
    $("#itens").innerHTML = ids.length ? ids.map((id) => {
      const p = PRODUTOS.find((x) => x.id == id), n = estado.sacola[id];
      sub += p.preco * n; qtd += n;
      return `<li><strong>${p.nome}</strong> <span>${brl(p.preco * n)}</span>
        <div class="qtd"><button type="button" data-dec="${id}" aria-label="Diminuir ${p.nome}">−</button><span>${n}</span><button type="button" data-inc="${id}" aria-label="Aumentar ${p.nome}">+</button>
        <button type="button" class="rem" data-rem="${id}">Remover</button></div></li>`;
    }).join("") : `<li>Sua sacola está vazia. Escolha produtos no catálogo.</li>`;
    $("#subtotal").textContent = brl(sub); $("#contador").textContent = qtd;
  }
  $("#itens").addEventListener("click", (e) => {
    const d = e.target.dataset;
    if (d.inc) estado.sacola[d.inc]++;
    if (d.dec) estado.sacola[d.dec] = Math.max(0, estado.sacola[d.dec] - 1);
    if (d.rem) delete estado.sacola[d.rem];
    salvar(); sacola();
  });
  const gaveta = $("#gaveta"), fundo = $("#fundo");
  function abrir(sim) {
    gaveta.classList.toggle("aberta", sim); fundo.hidden = !sim; gaveta.setAttribute("aria-hidden", !sim);
    if (sim) $("#fecharSacola").focus(); else $("#abrirSacola").focus();
  }
  $("#abrirSacola").addEventListener("click", () => abrir(true));
  $("#fecharSacola").addEventListener("click", () => abrir(false));
  fundo.addEventListener("click", () => abrir(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && gaveta.classList.contains("aberta")) abrir(false); });
  $("#levar").addEventListener("click", () => {
    const linhas = Object.keys(estado.sacola).filter((id) => estado.sacola[id] > 0).map((id) => {
      const p = PRODUTOS.find((x) => x.id == id); return `${estado.sacola[id]}x ${p.nome} (${brl(p.preco * estado.sacola[id])})`;
    });
    if (linhas.length) { $("#assunto").value = "Encomenda"; $("#mensagem").value = "Gostaria de encomendar:\n" + linhas.join("\n") + "\nSubtotal: " + $("#subtotal").textContent; }
    abrir(false); $("#contato").scrollIntoView(); $("#nome").focus();
  });

  // ---- Formulário (RF11, RF12, RNF07)
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const campos = { nome: "Informe seu nome.", assunto: "Selecione um assunto.", mensagem: "Escreva sua mensagem." };
    let valido = true;
    for (const c in campos) {
      const vazio = !$("#" + c).value.trim();
      $("#e-" + c).textContent = vazio ? campos[c] : ""; if (vazio) valido = false;
    }
    $("#ok").textContent = "";
    if (!valido) return;
    // Versão inicial: sem back-end. Integrar aqui WhatsApp ou e-mail (ver README).
    $("#ok").textContent = "Mensagem recebida! A Amabile entrará em contato em breve.";
    $("#form").reset();
  });

  catalogo(); sacola();
})();
