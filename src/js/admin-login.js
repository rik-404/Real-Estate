document.addEventListener("DOMContentLoaded", () => {
  // Configurar usuários padrão se não existirem
  if (!localStorage.getItem("users")) {
    const defaultUsers = [
      {
        id: "1",
        username: "dev",
        password: "dev123",
        role: "dev",
        name: "Desenvolvedor",
        email: "dev@elitehouse.com",
        phone: "(11) 98765-4321",
        cpf: "123.456.789-00",
        address: "Rua Exemplo, 123, Centro, São Paulo, SP, 01001-000",
        birth: "1990-01-01",
        emergencyContact: "Contato de Emergência",
        emergencyPhone: "(11) 99999-9999",
        active: true,
      },
      {
        id: "2",
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "Administrador",
        email: "admin@elitehouse.com",
        phone: "(21) 98765-4321",
        cpf: "987.654.321-00",
        address: "Av. Principal, 456, Jardim, Rio de Janeiro, RJ, 20000-000",
        birth: "1985-05-15",
        emergencyContact: "Contato de Emergência",
        emergencyPhone: "(21) 99999-9999",
        active: true,
      },
      {
        id: "3",
        username: "corretor",
        password: "corretor123",
        role: "corretor",
        name: "Corretor Exemplo",
        email: "corretor@elitehouse.com",
        phone: "(19) 98765-4321",
        cpf: "111.222.333-44",
        address: "Rua das Flores, 789, Bela Vista, São Paulo, SP, 01310-000",
        birth: "1992-10-20",
        emergencyContact: "Contato de Emergência",
        emergencyPhone: "(11) 88888-8888",
        active: true,
      },
    ]
    localStorage.setItem("users", JSON.stringify(defaultUsers))
  }

  // Inicializar clientes se não existirem
  if (!localStorage.getItem("clients")) {
    localStorage.setItem("clients", JSON.stringify([]))
  }

  const loginForm = document.getElementById("admin-login-form")
  const errorMessage = document.getElementById("login-error")

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    // Verificar credenciais
    const users = JSON.parse(localStorage.getItem("users"))
    const user = users.find((u) => u.username === username && u.password === password && u.active)

    if (user) {
      // Login bem-sucedido
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
        }),
      )

      // Registrar no log
      logAction(user.role, `${user.name} (${user.role}) fez login no painel administrativo`)

      // Redirecionar para o dashboard
      window.location.href = "dashboard.html"
    } else {
      // Login falhou
      errorMessage.textContent = "Usuário ou senha incorretos ou conta inativa"
    }
  })

  // Função para registrar ações no log
  function logAction(userType, action) {
    const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]")

    logs.push({
      timestamp: new Date().toISOString(),
      userType: userType,
      action: action,
    })

    // Limitar a 100 logs para não sobrecarregar o localStorage
    if (logs.length > 100) {
      logs.shift() // Remove o log mais antigo
    }

    localStorage.setItem("activityLogs", JSON.stringify(logs))
  }

  // Adicionar funcionalidade para mostrar/ocultar senha
  const togglePasswordBtn = document.getElementById("toggle-password")
  const passwordInput = document.getElementById("password")

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", function () {
      // Alternar o tipo do campo de senha
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      // Alternar o ícone
      const icon = this.querySelector("i")
      if (type === "password") {
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
      } else {
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
      }
    })
  }
})
