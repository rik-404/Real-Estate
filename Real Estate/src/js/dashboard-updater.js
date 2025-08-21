/**
 * Dashboard Updater
 * Sistema de atualização automática para o dashboard administrativo
 * Monitora alterações nos dados e atualiza a interface em tempo real
 */

// Declare variables for functions that are assumed to be globally available
let loadPropertiesTable,
  loadFeaturedProperties,
  loadClientsTable,
  loadKanbanView,
  loadUsersTable,
  loadActivityLogs,
  loadStats

class DashboardUpdater {
  constructor(options = {}) {
    // Configurações padrão
    this.config = {
      updateInterval: options.updateInterval || 5000, // Intervalo de verificação em ms (padrão: 5 segundos)
      enableLogs: options.enableLogs || false, // Habilitar logs de depuração
      updateStats: options.updateStats !== false, // Atualizar estatísticas
      updateTables: options.updateTables !== false, // Atualizar tabelas
      updateKanban: options.updateKanban !== false, // Atualizar visualização Kanban
    }

    // Armazenar hashes dos dados para comparação
    this.dataHashes = {
      properties: this.hashData(this.getProperties()),
      clients: this.hashData(this.getClients()),
      users: this.hashData(this.getUsers()),
      logs: this.hashData(this.getLogs()),
    }

    // Referência para o intervalo de atualização
    this.updateTimer = null

    // Flag para indicar se o updater está ativo
    this.isActive = false

    // Contador de atualizações
    this.updateCount = 0

    this.log("Dashboard Updater inicializado")
  }

  // Iniciar o monitoramento de atualizações
  start() {
    if (this.isActive) {
      this.log("Dashboard Updater já está ativo")
      return
    }

    this.isActive = true
    this.log("Iniciando monitoramento de atualizações")

    // Verificar atualizações imediatamente
    this.checkForUpdates()

    // Configurar verificação periódica
    this.updateTimer = setInterval(() => {
      this.checkForUpdates()
    }, this.config.updateInterval)

    // Adicionar indicador visual de atualização automática ativa
    this.addStatusIndicator()
  }

  // Parar o monitoramento de atualizações
  stop() {
    if (!this.isActive) {
      return
    }

    this.isActive = false
    this.log("Parando monitoramento de atualizações")

    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }

    // Atualizar indicador visual
    this.updateStatusIndicator(false)
  }

  // Verificar se há atualizações nos dados
  checkForUpdates() {
    this.log("Verificando atualizações...")
    let updatesDetected = false

    // Verificar alterações nas propriedades
    const propertiesHash = this.hashData(this.getProperties())
    if (propertiesHash !== this.dataHashes.properties) {
      this.log("Alterações detectadas em propriedades")
      this.dataHashes.properties = propertiesHash
      if (this.config.updateTables) {
        this.updatePropertiesTable()
      }
      updatesDetected = true
    }

    // Verificar alterações nos clientes
    const clientsHash = this.hashData(this.getClients())
    if (clientsHash !== this.dataHashes.clients) {
      this.log("Alterações detectadas em clientes")
      this.dataHashes.clients = clientsHash
      if (this.config.updateTables) {
        this.updateClientsTable()
        if (this.config.updateKanban) {
          this.updateKanbanView()
        }
      }
      updatesDetected = true
    }

    // Verificar alterações nos usuários
    const usersHash = this.hashData(this.getUsers())
    if (usersHash !== this.dataHashes.users) {
      this.log("Alterações detectadas em usuários")
      this.dataHashes.users = usersHash
      if (this.config.updateTables) {
        this.updateUsersTable()
      }
      updatesDetected = true
    }

    // Verificar alterações nos logs
    const logsHash = this.hashData(this.getLogs())
    if (logsHash !== this.dataHashes.logs) {
      this.log("Alterações detectadas em logs")
      this.dataHashes.logs = logsHash
      this.updateActivityLogs()
      updatesDetected = true
    }

    // Se alguma alteração foi detectada, atualizar estatísticas
    if (updatesDetected && this.config.updateStats) {
      this.updateStats()
      this.updateCount++
      this.updateStatusIndicator(true)
    }
  }

  // Atualizar tabela de propriedades
  updatePropertiesTable() {
    try {
      if (typeof loadPropertiesTable === "function") {
        loadPropertiesTable()
        this.log("Tabela de propriedades atualizada")
      }

      // Atualizar também a página de destaques se estiver visível
      if (
        document.getElementById("featured-page") &&
        document.getElementById("featured-page").style.display !== "none" &&
        typeof loadFeaturedProperties === "function"
      ) {
        loadFeaturedProperties()
        this.log("Lista de destaques atualizada")
      }
    } catch (error) {
      console.error("Erro ao atualizar tabela de propriedades:", error)
    }
  }

  // Atualizar tabela de clientes
  updateClientsTable() {
    try {
      if (typeof loadClientsTable === "function") {
        loadClientsTable()
        this.log("Tabela de clientes atualizada")
      }

      // Atualizar notificações de clientes pendentes
      if (
        window.notificationManager &&
        typeof window.notificationManager.updatePendingClientsNotification === "function"
      ) {
        window.notificationManager.updatePendingClientsNotification()
        this.log("Notificações de clientes pendentes atualizadas")
      }
    } catch (error) {
      console.error("Erro ao atualizar tabela de clientes:", error)
    }
  }

  // Atualizar visualização Kanban
  updateKanbanView() {
    try {
      // Verificar se a visualização Kanban está visível
      const kanbanView = document.getElementById("clients-kanban-view")
      if (kanbanView && kanbanView.style.display === "block" && typeof loadKanbanView === "function") {
        loadKanbanView()
        this.log("Visualização Kanban atualizada")
      }
    } catch (error) {
      console.error("Erro ao atualizar visualização Kanban:", error)
    }
  }

  // Atualizar tabela de usuários
  updateUsersTable() {
    try {
      if (typeof loadUsersTable === "function") {
        loadUsersTable()
        this.log("Tabela de usuários atualizada")
      }
    } catch (error) {
      console.error("Erro ao atualizar tabela de usuários:", error)
    }
  }

  // Atualizar logs de atividade
  updateActivityLogs() {
    try {
      if (typeof loadActivityLogs === "function") {
        loadActivityLogs()
        this.log("Logs de atividade atualizados")

        // Adicionar efeito visual para indicar que os logs foram atualizados
        const logsContainer = document.getElementById("activity-logs")
        if (logsContainer) {
          logsContainer.classList.add("logs-updated")
          setTimeout(() => {
            logsContainer.classList.remove("logs-updated")
          }, 1000)
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar logs de atividade:", error)
    }
  }

  // Atualizar estatísticas
  updateStats() {
    try {
      if (typeof loadStats === "function") {
        loadStats()
        this.log("Estatísticas atualizadas")
      }
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error)
    }
  }

  // Obter dados do localStorage
  getProperties() {
    return JSON.parse(localStorage.getItem("properties") || "[]")
  }

  getClients() {
    return JSON.parse(localStorage.getItem("clients") || "[]")
  }

  getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]")
  }

  getLogs() {
    return JSON.parse(localStorage.getItem("activityLogs") || "[]")
  }

  // Criar hash simples dos dados para comparação
  hashData(data) {
    if (!data) return "0"
    try {
      // Usar JSON.stringify para converter os dados em string
      const jsonString = JSON.stringify(data)

      // Criar um hash simples baseado no comprimento e conteúdo
      let hash = 0
      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Converter para inteiro de 32 bits
      }
      return hash.toString()
    } catch (e) {
      console.error("Erro ao criar hash dos dados:", e)
      return "0"
    }
  }

  // Adicionar indicador visual de status
  addStatusIndicator() {
    // Verificar se o indicador já existe
    if (document.getElementById("auto-update-indicator")) {
      return
    }

    // Criar o indicador
    const indicator = document.createElement("div")
    indicator.id = "auto-update-indicator"
    indicator.className = "auto-update-indicator"
    indicator.innerHTML = `
            <span class="indicator-dot"></span>
            <span class="indicator-text">Atualização automática ativa</span>
            <span class="indicator-count">(0)</span>
        `

    // Adicionar estilos
    const style = document.createElement("style")
    style.textContent = `
            .auto-update-indicator {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                transition: background-color 0.3s ease;
            }
            .indicator-dot {
                width: 8px;
                height: 8px;
                background-color: #4CAF50;
                border-radius: 50%;
                display: inline-block;
            }
            .indicator-dot.pulse {
                animation: pulse 1s;
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
            .indicator-count {
                opacity: 0.8;
            }
        `

    // Adicionar ao documento
    document.head.appendChild(style)
    document.body.appendChild(indicator)

    // Adicionar evento de clique para pausar/retomar
    indicator.addEventListener("click", () => {
      if (this.isActive) {
        this.stop()
      } else {
        this.start()
      }
    })
  }

  // Atualizar indicador visual
  updateStatusIndicator(updated = false) {
    const indicator = document.getElementById("auto-update-indicator")
    if (!indicator) return

    const dot = indicator.querySelector(".indicator-dot")
    const text = indicator.querySelector(".indicator-text")
    const count = indicator.querySelector(".indicator-count")

    if (this.isActive) {
      indicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
      dot.style.backgroundColor = "#4CAF50"
      text.textContent = "Atualização automática ativa"
      count.textContent = `(${this.updateCount})`

      if (updated) {
        // Adicionar animação de pulso
        dot.classList.remove("pulse")
        void dot.offsetWidth // Forçar reflow
        dot.classList.add("pulse")
      }
    } else {
      indicator.style.backgroundColor = "rgba(150, 150, 150, 0.7)"
      dot.style.backgroundColor = "#F44336"
      text.textContent = "Atualização automática pausada"
    }
  }

  // Função de log
  log(message) {
    if (this.config.enableLogs) {
      console.log(`[Dashboard Updater] ${message}`)
    }
  }
}

// Inicializar o atualizador quando o documento estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  // Verificar se estamos na página do dashboard
  if (
    window.location.pathname.includes("/admin/dashboard.html") ||
    window.location.pathname.includes("/admin/") ||
    document.querySelector(".admin-container")
  ) {
    // Criar instância do atualizador
    window.dashboardUpdater = new DashboardUpdater({
      updateInterval: 3000, // Verificar a cada 3 segundos
      enableLogs: false, // Desativar logs para produção
    })

    // Iniciar após um pequeno delay para garantir que todos os componentes foram carregados
    setTimeout(() => {
      window.dashboardUpdater.start()
    }, 1000)
  }
})

// Adicionar evento para pausar atualizações durante edições
document.addEventListener("DOMContentLoaded", () => {
  // Pausar durante edição de formulários
  const forms = ["property-form", "client-form", "user-form", "admin-settings-form"]

  forms.forEach((formId) => {
    const form = document.getElementById(formId)
    if (form) {
      // Pausar quando o formulário for exibido
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.target.style.display === "block" &&
            window.dashboardUpdater &&
            window.dashboardUpdater.isActive
          ) {
            window.dashboardUpdater.stop()
          } else if (
            mutation.target.style.display === "none" &&
            window.dashboardUpdater &&
            !window.dashboardUpdater.isActive
          ) {
            window.dashboardUpdater.start()
          }
        })
      })

      // Observar mudanças no container do formulário
      const formContainer = document.getElementById(`${formId}-container`)
      if (formContainer) {
        observer.observe(formContainer, { attributes: true, attributeFilter: ["style"] })
      }
    }
  })
})
