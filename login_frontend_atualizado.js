/* =====================================================
   HourSync — login.js  (versão com backend Node/MongoDB)
   Substitui o login estático original
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const loginForm     = document.getElementById("loginForm");
  const loginEmail    = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginError    = document.getElementById("loginError");

  function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove("visually-hidden");
  }

  function hideError() {
    loginError.textContent = "";
    loginError.classList.add("visually-hidden");
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideError();

    const email = loginEmail.value.trim();
    const senha = loginPassword.value;

    if (!email || !senha) {
      showError("Preencha email e senha para continuar.");
      return;
    }

    // Desabilita botão durante a requisição
    const btnSubmit = loginForm.querySelector("button[type='submit']");
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Entrando...";
    }

    try {
      // Chama a API real — Auth está definido em api.js
      const usuario = await Auth.login(email, senha);

      // Redireciona conforme a role
      const redirecionamentos = {
        SUPER_ADMIN:  "../dashboard_admin/dashboard_admin.html",
        COORDENADOR:  "../dashboard_coordenador/dashboard_coordenador.html",
        ALUNO:        "../dashboard_coordenador/dashboard_coordenador.html", // ajuste se houver tela de aluno
      };

      const destino = redirecionamentos[usuario.role];
      if (destino) {
        window.location.href = destino;
      } else {
        showError("Perfil de usuário não reconhecido.");
      }
    } catch (err) {
      showError(err.message || "Email ou senha inválidos.");
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Entrar";
      }
    }
  });
});
