// Arquivo para gerenciar notificações do sistema

/**
 * Atualiza o contador de clientes pendentes no menu
 */
function updatePendingClientsNotification() {
  try {
    // Obter o elemento do badge
    const badge = document.getElementById("pending-clients-badge")
    if (!badge) return

    // Verificar se o usuário atual é admin ou dev
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (!["admin", "dev"].includes(currentUser.role)) {
      // Esconder o badge para corretores
      badge.style.display = "none"
      return
    }

    // Obter clientes do localStorage
    const clients = JSON.parse(localStorage.getItem("clients") || "[]")

    // Filtrar apenas clientes pendentes
    const pendingClients = clients.filter((client) => client.isPending === true)
    const pendingCount = pendingClients.length

    // Atualizar o badge
    if (pendingCount > 0) {
      badge.textContent = pendingCount.toString()
      badge.style.display = "inline-flex"
      badge.classList.add("has-pending")
    } else {
      badge.style.display = "none"
      badge.classList.remove("has-pending")
    }

    console.log(`Notificação atualizada: ${pendingCount} clientes pendentes`)
  } catch (error) {
    console.error("Erro ao atualizar notificação de clientes pendentes:", error)
  }
}

/**
 * Configura observadores para mudanças nos dados que afetam notificações
 */
function setupNotificationObservers() {
  // Criar um proxy para o localStorage para detectar mudanças
  const originalSetItem = localStorage.setItem

  localStorage.setItem = function (key, value) {
    // Chamar o método original
    originalSetItem.apply(this, arguments)

    // Se a chave for 'clients', atualizar notificações
    if (key === "clients") {
      updatePendingClientsNotification()
    }
  }

  // Atualizar notificações quando a página carregar
  document.addEventListener("DOMContentLoaded", () => {
    updatePendingClientsNotification()
  })

  // Atualizar notificações quando o usuário mudar de página
  document.querySelectorAll(".admin-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      updatePendingClientsNotification()
    })
  })
}

// Inicializar o sistema de notificações
setupNotificationObservers()

// Exportar funções para uso em outros arquivos
window.notificationManager = {
  updatePendingClientsNotification,
}
