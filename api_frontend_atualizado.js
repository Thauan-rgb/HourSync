/* =====================================================
   HourSync — api.js  (versão com backend Node/MongoDB)
   ► COLE A URL DO SEU SERVIÇO NO RENDER abaixo
   ===================================================== */

//  ▼▼▼  COLE AQUI A URL DO SEU BACKEND NO RENDER  ▼▼▼
const API_BASE = "https://SEU-SERVICO.onrender.com";
//  ▲▲▲  exemplo: "https://hoursync-api.onrender.com"  ▲▲▲

/* =====================================================
   UTILITÁRIO CENTRAL DE REQUISIÇÃO
   ===================================================== */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("hoursync_token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type se for FormData (upload de arquivo)
  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Token expirado — redireciona para login
    if (response.status === 401) {
      localStorage.removeItem("hoursync_token");
      localStorage.removeItem("hoursync_user");
      window.location.href = "/login/login.html";
      return;
    }

    // Sem conteúdo (ex: DELETE bem-sucedido)
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Erro ${response.status}`);
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError") {
      throw new Error(
        "Sem conexão com o servidor. Se for a primeira requisição, aguarde ~30s (o Render pode estar iniciando)."
      );
    }
    throw err;
  }
}

/* =====================================================
   AUTH
   ===================================================== */
const Auth = {
  async login(email, senha) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    localStorage.setItem("hoursync_token", data.token);
    localStorage.setItem("hoursync_user", JSON.stringify(data.usuario));
    return data.usuario;
  },

  logout() {
    localStorage.removeItem("hoursync_token");
    localStorage.removeItem("hoursync_user");
    window.location.href = "/login/login.html";
  },

  getUsuario() {
    const raw = localStorage.getItem("hoursync_user");
    return raw ? JSON.parse(raw) : null;
  },

  getToken() {
    return localStorage.getItem("hoursync_token");
  },

  isLogado() {
    return !!this.getToken();
  },

  getRole() {
    return this.getUsuario()?.role || null;
  },

  async resetSenha(email, novaSenha) {
    return apiFetch("/auth/reset-senha", {
      method: "PUT",
      body: JSON.stringify({ email, novaSenha }),
    });
  },
};

/* =====================================================
   USUÁRIOS
   ===================================================== */
const Usuarios = {
  listar:              ()           => apiFetch("/usuarios"),
  buscarPorId:         (id)         => apiFetch(`/usuarios/${id}`),
  listarCoordenadores: ()           => apiFetch("/usuarios/coordenadores"),
  listarAlunos:        ()           => apiFetch("/usuarios/alunos"),

  criar(dados) {
    return apiFetch("/usuarios", { method: "POST", body: JSON.stringify(dados) });
  },

  atualizar(id, dados) {
    return apiFetch(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(dados) });
  },

  alterarSenha(id, senhaAtual, novaSenha) {
    return apiFetch(`/usuarios/${id}/senha`, {
      method: "PUT",
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
  },

  ativarInativar(id, ativo) {
    return apiFetch(`/usuarios/${id}/ativo?ativo=${ativo}`, { method: "PUT" });
  },

  remover(id) {
    return apiFetch(`/usuarios/${id}`, { method: "DELETE" });
  },
};

/* =====================================================
   CURSOS
   ===================================================== */
const Cursos = {
  listar:      ()    => apiFetch("/cursos"),
  buscarPorId: (id)  => apiFetch(`/cursos/${id}`),

  criar(dados) {
    return apiFetch("/cursos", { method: "POST", body: JSON.stringify(dados) });
  },

  atualizar(id, dados) {
    return apiFetch(`/cursos/${id}`, { method: "PUT", body: JSON.stringify(dados) });
  },

  remover(id) {
    return apiFetch(`/cursos/${id}`, { method: "DELETE" });
  },
};

/* =====================================================
   CERTIFICADOS
   ===================================================== */
const Certificados = {
  listar:          ()         => apiFetch("/certificados"),
  buscarPorId:     (id)       => apiFetch(`/certificados/${id}`),
  listarPorAluno:  (alunoId)  => apiFetch(`/certificados/aluno/${alunoId}`),
  listarPorCurso:  (cursoId)  => apiFetch(`/certificados/curso/${cursoId}`),
  listarPorStatus: (status)   => apiFetch(`/certificados/status/${status}`),

  submeter(dados) {
    return apiFetch("/certificados", { method: "POST", body: JSON.stringify(dados) });
  },

  validar(certId, status, coordenadorId, motivo = "") {
    let url = `/certificados/${certId}/validar?status=${status}&coordenadorId=${coordenadorId}`;
    if (motivo) url += `&motivo=${encodeURIComponent(motivo)}`;
    return apiFetch(url, { method: "PATCH" });
  },

  remover(id) {
    return apiFetch(`/certificados/${id}`, { method: "DELETE" });
  },
};

/* =====================================================
   UPLOAD DE ARQUIVO
   ===================================================== */
const Upload = {
  async enviar(arquivo) {
    const formData = new FormData();
    formData.append("file", arquivo);
    const data = await apiFetch("/upload", { method: "POST", body: formData });
    return data.url;
  },
};

/* =====================================================
   DASHBOARD
   ===================================================== */
const Dashboard = {
  admin:       ()        => apiFetch("/dashboard/admin"),
  coordenador: (cursoId) => apiFetch(`/dashboard/coordenador/${cursoId}`),
};

/* =====================================================
   HELPER — FEEDBACK VISUAL (toast Bootstrap)
   ===================================================== */
function showToast(mensagem, tipo = "success") {
  const toastId = "hoursync-toast-" + Date.now();
  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };

  const html = `
    <div id="${toastId}" class="toast align-items-center text-bg-${tipo} border-0 mb-2"
         role="alert" aria-live="assertive" style="min-width:300px;">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icons[tipo]} me-2"></i>${mensagem}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"></button>
      </div>
    </div>`;

  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = "position:fixed;top:20px;right:20px;z-index:9999;";
    document.body.appendChild(container);
  }

  container.insertAdjacentHTML("beforeend", html);
  const toastEl = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

/* =====================================================
   HELPER — LOADING (spinner em botões)
   ===================================================== */
function setLoading(btnEl, loading) {
  if (loading) {
    btnEl.dataset.textoOriginal = btnEl.innerHTML;
    btnEl.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Aguarde...`;
    btnEl.disabled = true;
  } else {
    btnEl.innerHTML = btnEl.dataset.textoOriginal || btnEl.innerHTML;
    btnEl.disabled = false;
  }
}
