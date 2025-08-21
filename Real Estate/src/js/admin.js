// Variáveis globais
let currentUser = {}
let properties = []
let users = []
let logs = []
let clients = []

// Função principal de inicialização
document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando painel administrativo...")

  // Verificar se o usuário está logado
  currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
  if (!currentUser.id) {
    window.location.href = "login.html"
    return
  }

  console.log("Usuário logado:", currentUser)

  // Inicializar dados
  initializeData()

  // Configurar interface
  setupInterface()

  // Carregar dados iniciais
  loadInitialData()

  // Configurar todos os event listeners
  setupAllEventListeners()

  console.log("Inicialização concluída com sucesso")
})

// Adicionar inicialização de dados de teste si não houver usuários
function initializeData() {
  console.log("Inicializando dados...")

  // Propriedades
  if (!localStorage.getItem("properties")) {
    localStorage.setItem("properties", JSON.stringify([]))
  }
  properties = JSON.parse(localStorage.getItem("properties") || "[]")

  // Usuários
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }
  users = JSON.parse(localStorage.getItem("users") || "[]")

  // Verificar se há corretores no sistema, se não, criar alguns para teste
  const hasCorretores = users.some((user) => user.role === "corretor")
  if (!hasCorretores && users.length > 0) {
    console.log("Criando corretores de teste...")
    // Criar alguns corretores de teste
    const testBrokers = [
      {
        id: "corretor1" + Date.now(),
        name: "João Silva",
        username: "joao.silva",
        password: "123456",
        role: "corretor",
        active: true,
        email: "joao@example.com",
        phone: "(11) 98765-4321",
      },
      {
        id: "corretor2" + Date.now(),
        name: "Maria Oliveira",
        username: "maria.oliveira",
        password: "123456",
        role: "corretor",
        active: true,
        email: "maria@example.com",
        phone: "(11) 91234-5678",
      },
    ]

    users = [...users, ...testBrokers]
    localStorage.setItem("users", JSON.stringify(users))
    console.log("Corretores de teste criados com sucesso!")
  }

  // Clientes
  if (!localStorage.getItem("clients")) {
    localStorage.setItem("clients", JSON.stringify([]))
  }
  clients = JSON.parse(localStorage.getItem("clients") || "[]")

  // Logs
  if (!localStorage.getItem("activityLogs")) {
    localStorage.setItem("activityLogs", JSON.stringify([]))
  }
  logs = JSON.parse(localStorage.getItem("activityLogs") || "[]")

  // Outras métricas
  if (!localStorage.getItem("totalViews")) {
    localStorage.setItem("totalViews", "0")
  }

  if (!localStorage.getItem("activeUsers")) {
    localStorage.setItem("activeUsers", "0")
  }

  if (!localStorage.getItem("brokerSales")) {
    localStorage.setItem("brokerSales", JSON.stringify({}))
  }

  console.log(
    `Dados carregados: ${properties.length} imóveis, ${users.length} usuários, ${clients.length} clientes, ${logs.length} logs`,
  )
}

// Configurar interface do usuário
function setupInterface() {
  // Atualizar mensagem de boas-vindas
  const welcomeElement = document.getElementById("user-welcome")
  if (welcomeElement) {
    welcomeElement.textContent = `Bem-vindo, ${currentUser.name || currentUser.username}`
  }

  // Configurar permissões baseadas no papel do usuário
  setupUserPermissions()

  // Ocultar estatísticas gerais para corretores
  if (currentUser.role === "corretor") {
    hideGeneralStatsForBrokers()
  }
}

// Adicionar esta nova função para ocultar estatísticas gerais para corretores
function hideGeneralStatsForBrokers() {
  // Ocultar estatísticas gerais para corretores
  const generalStats = document.querySelectorAll(".admin-stats:first-of-type .stat-card")
  if (generalStats && generalStats.length > 0) {
    generalStats.forEach((card) => {
      // Verificar o texto do parágrafo para identificar as estatísticas a serem ocultadas
      const statText = card.querySelector("p")?.textContent?.trim()
      if (
        statText === "Total de Imóveis" ||
        statText === "Imóveis em Destaque" ||
        statText === "Total de Clientes" ||
        statText === "Visualizações"
      ) {
        card.style.display = "none"
      }
    })
  }
}

// Modificar a função setupUserPermissions para garantir que o Kanban seja visível para corretores
function setupUserPermissions() {
  console.log("Configurando permissões para o usuário:", currentUser.role)

  // Adicionar classe ao body baseada no papel do usuário
  document.body.classList.add(`role-${currentUser.role}`)

  // Mostrar/esconder itens de menu baseado no papel do usuário
  document.querySelectorAll(".admin-menu a[data-role]").forEach((item) => {
    const requiredRoles = item.getAttribute("data-role").split(",")
    if (!requiredRoles.includes(currentUser.role)) {
      item.parentElement.style.display = "none"
    } else {
      item.parentElement.style.display = "block" // Garantir que itens permitidos estejam visíveis
    }
  })

  // Mostrar/esconder ações de DEV
  const devActions = document.getElementById("dev-actions")
  if (devActions) {
    devActions.style.display = currentUser.role === "dev" ? "block" : "none"
  }

  // Garantir que o toggle de visualização Kanban esteja visível para todos os usuários
  const viewToggleContainer = document.getElementById("view-toggle-container")
  if (viewToggleContainer) {
    viewToggleContainer.style.display = "flex" // Mostrar para todos os usuários
  }

  // Ocultar botões de CSV para corretores
  if (currentUser.role === "corretor") {
    document.querySelectorAll('.csv-button, [id$="-csv-btn"], [id^="export-"], [id^="import-"]').forEach((el) => {
      if (el) el.style.display = "none"
    })

    // Ocultar estatísticas gerais para corretores
    const generalStats = document.querySelector(".general-stats")
    if (generalStats) {
      generalStats.style.display = "none"
    }

    // Mostrar estatísticas específicas para corretores
    const brokerStats = document.getElementById("broker-stats")
    if (brokerStats) {
      brokerStats.style.display = "grid"
    }
  }
}

// Modificar a função loadInitialData para carregar a visualização Kanban para todos os usuários
function loadInitialData() {
  console.log("Carregando dados iniciais...")

  try {
    // Carregar estatísticas
    loadStats()

    // Carregar tabela de imóveis
    loadPropertiesTable()

    // Carregar tabela de clientes (para todos os usuários)
    loadClientsTable()

    // Carregar visualização Kanban (mas não exibir inicialmente)
    // Apenas carregar os dados, mas manter oculto
    const kanbanView = document.getElementById("clients-kanban-view")
    if (kanbanView) {
      kanbanView.style.display = "none"
      console.log("Kanban inicialmente oculto")
    }

    // Carregar dados do Kanban em segundo plano
    loadKanbanView()

    // Garantir que a visualização em lista esteja visível inicialmente
    const listView = document.getElementById("clients-list-view")
    if (listView) {
      listView.style.display = "block"
      console.log("Lista inicialmente visível")
    }

    // Carregar usuários (apenas para admin e dev)
    if (["admin", "dev"].includes(currentUser.role)) {
      loadUsersTable()
    }

    // Carregar configurações
    loadSettings()

    // Carregar destaques e logs
    loadFeaturedProperties()
    loadActivityLogs()

    console.log("Dados iniciais carregados com sucesso")
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error)
  }
}

// Modificar a função setupAllEventListeners para adicionar eventos para a visualização Kanban para todos
function setupAllEventListeners() {
  console.log("Configurando event listeners...")

  // Navegação do menu
  setupMenuNavigation()

  // Botão de logout
  setupLogoutButton()

  // Botões de adicionar
  setupAddButtons()

  // Botões de cancelar
  setupCancelButtons()

  // Formulários
  setupForms()

  // Configurar busca de CEP
  setupCepSearch()

  // Botões de pesquisa
  setupSearchButtons()

  // Botões de ação específicos
  setupActionButtons()

  // Toggle de visualização (Lista/Kanban) - para todos os usuários
  setupViewToggle()

  // Configurar funcionalidade de arrastar e soltar para o Kanban
  setupDragAndDrop()

  // Esconder botões de CSV para corretores
  if (currentUser.role === "corretor") {
    hideCSVButtonsForBrokers()
  }

  // Ativar o primeiro item do menu por padrão
  setTimeout(() => {
    const firstMenuItem = document.querySelector(".admin-menu a")
    if (firstMenuItem) {
      firstMenuItem.click()
    }
  }, 100)

  console.log("Event listeners configurados com sucesso")
}

// Modificar a função hideCSVButtonsForBrokers para não afetar o toggle de visualização
function hideCSVButtonsForBrokers() {
  console.log("Ocultando botões CSV para corretores")

  // Esconder botões de importação/exportação CSV para corretores
  const csvButtons = document.querySelectorAll('.csv-button, [id$="-csv-btn"], [id^="export-"], [id^="import-"]')
  csvButtons.forEach((button) => {
    if (button) {
      button.style.display = "none"
    }
  })

  // Esconder o container de botões CSV
  const csvButtonsContainer = document.querySelector(".csv-buttons")
  if (csvButtonsContainer) {
    csvButtonsContainer.style.display = "none"
  }

  // Garantir que o toggle de visualização esteja visível
  const viewToggleContainer = document.getElementById("view-toggle-container")
  if (viewToggleContainer) {
    viewToggleContainer.style.display = "flex"
  }

  const viewToggleWrapper = document.querySelector(".view-toggle-wrapper")
  if (viewToggleWrapper) {
    viewToggleWrapper.style.display = "flex"
  }
}

// Adicionar uma função para garantir que o Kanban seja inicializado corretamente
function ensureKanbanVisibility() {
  // Verificar se estamos na página de clientes
  const clientsPage = document.getElementById("clients-page")
  if (!clientsPage || clientsPage.style.display === "none") return

  // Verificar se o botão Kanban está ativo
  const kanbanBtn = document.querySelector('.view-toggle-btn[data-view="kanban"]')
  if (kanbanBtn && kanbanBtn.classList.contains("active")) {
    // Garantir que a visualização Kanban esteja visível
    const kanbanView = document.getElementById("clients-kanban-view")
    if (kanbanView) {
      kanbanView.style.display = "block"
      // Recarregar a visualização Kanban
      loadKanbanView()
    }
  }
}

// Modificar a função setupViewToggle para garantir que funcione para todos os usuários
function setupViewToggle() {
  console.log("Configurando toggle de visualização")
  const viewToggleBtns = document.querySelectorAll(".view-toggle-btn")

  viewToggleBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const viewType = this.getAttribute("data-view")
      console.log("Botão de toggle clicado:", viewType)

      // Remover classe active de todos os botões
      viewToggleBtns.forEach((b) => b.classList.remove("active"))

      // Adicionar classe active ao botão clicado
      this.classList.add("active")

      // Obter referências às visualizações
      const listView = document.getElementById("clients-list-view")
      const kanbanView = document.getElementById("clients-kanban-view")

      // Esconder AMBAS as visualizações primeiro
      if (listView) {
        listView.style.display = "none"
        console.log("Ocultando visualização em lista")
      }
      if (kanbanView) {
        kanbanView.style.display = "none"
        console.log("Ocultando visualização Kanban")
      }

      // Mostrar APENAS a visualização selecionada
      if (viewType === "list" && listView) {
        console.log("Mostrando APENAS visualização em lista")
        listView.style.display = "block"
        kanbanView.style.display = "none" // Garantir que o kanban esteja oculto
      } else if (viewType === "kanban" && kanbanView) {
        console.log("Mostrando APENAS visualização Kanban")
        kanbanView.style.display = "block"
        listView.style.display = "none" // Garantir que a lista esteja oculta
        // Recarregar a visualização Kanban
        loadKanbanView()
      }
    })
  })
}

// Configurar navegação do menu
function setupMenuNavigation() {
  const menuLinks = document.querySelectorAll(".admin-menu a")

  menuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Verificar permissões
      const requiredRoles = this.getAttribute("data-role")
      if (requiredRoles && !requiredRoles.split(",").includes(currentUser.role)) {
        alert("Você não tem permissão para acessar esta página.")
        return
      }

      // Remover classe active de todos os links
      menuLinks.forEach((l) => l.classList.remove("active"))

      // Adicionar classe active ao link clicado
      this.classList.add("active")

      // Obter a página a ser exibida
      const page = this.getAttribute("data-page")

      // Esconder todas as páginas
      document.querySelectorAll("#page-content > div").forEach((div) => {
        div.style.display = "none"
      })

      // Exibir a página selecionada
      const selectedPage = document.getElementById(`${page}-page`)
      if (selectedPage) {
        selectedPage.style.display = "block"

        // Se for a página de clientes, garantir que a visualização em lista seja exibida por padrão
        if (page === "clients") {
          // Garantir que o Kanban esteja SEMPRE oculto inicialmente
          const kanbanView = document.getElementById("clients-kanban-view")
          if (kanbanView) {
            kanbanView.style.display = "none"
            console.log("Ocultando Kanban ao navegar para a página de clientes")
          }

          // Garantir que a lista esteja SEMPRE visível inicialmente
          const listView = document.getElementById("clients-list-view")
          if (listView) {
            listView.style.display = "block"
            console.log("Mostrando lista ao navegar para a página de clientes")
          }

          // Garantir que o botão de lista esteja ativo
          document.querySelectorAll(".view-toggle-btn").forEach((btn) => {
            if (btn.getAttribute("data-view") === "list") {
              btn.classList.add("active")
            } else {
              btn.classList.remove("active")
            }
          })
        }
      }

      // Atualizar o título
      const titleElement = document.querySelector(".admin-title h1")
      if (titleElement) {
        titleElement.textContent = this.textContent.trim()
      }
    })
  })
}

// Configurar botão de logout
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Deseja realmente sair?")) {
        try {
          recordLogAction(
            currentUser.role,
            `${currentUser.name || currentUser.username} (${currentUser.role}) fez logout do painel administrativo`,
          )
        } catch (e) {
          console.error("Erro ao registrar log de logout:", e)
        }
        localStorage.removeItem("currentUser")
        window.location.href = "login.html"
      }
    })
  }
}

// Modificar a função setupAddButtons para remover referências a "Meus Clientes"
function setupAddButtons() {
  // Botão para adicionar novo imóvel
  const addPropertyBtn = document.getElementById("add-property-btn")
  if (addPropertyBtn) {
    addPropertyBtn.addEventListener("click", () => {
      console.log("Botão adicionar imóvel clicado")
      showForm("property", null)
    })
  }

  // Botão para adicionar novo cliente
  const addClientBtn = document.getElementById("add-client-btn")
  if (addClientBtn) {
    addClientBtn.addEventListener("click", () => {
      console.log("Botão adicionar cliente clicado")
      showForm("client", null)
    })
  }

  // Botão para adicionar novo usuário
  const addUserBtn = document.getElementById("add-user-btn")
  if (addUserBtn) {
    addUserBtn.addEventListener("click", () => {
      console.log("Botão adicionar usuário clicado")
      showForm("user", null)
    })
  }
}

// Configurar botões de cancelar
function setupCancelButtons() {
  // Botão para cancelar formulário de imóvel
  const cancelPropertyBtn = document.getElementById("cancel-property-btn")
  if (cancelPropertyBtn) {
    cancelPropertyBtn.addEventListener("click", () => {
      console.log("Botão cancelar imóvel clicado")
      hideForm("property")
    })
  }

  // Botão para cancelar formulário de cliente
  const cancelClientBtn = document.getElementById("cancel-client-btn")
  if (cancelClientBtn) {
    cancelClientBtn.addEventListener("click", () => {
      console.log("Botão cancelar cliente clicado")
      hideForm("client")
    })
  }

  // Botão para cancelar formulário de usuário
  const cancelUserBtn = document.getElementById("cancel-user-btn")
  if (cancelUserBtn) {
    cancelUserBtn.addEventListener("click", () => {
      console.log("Botão cancelar usuário clicado")
      hideForm("user")
    })
  }
}

// Configurar formulários
function setupForms() {
  // Formulário de imóvel
  const propertyForm = document.getElementById("property-form")
  if (propertyForm) {
    propertyForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveProperty()
    })

    // Preview de imagem
    const propertyImage = document.getElementById("property-image")
    if (propertyImage) {
      propertyImage.addEventListener("input", function () {
        updateImagePreview(this.value)
      })
    }
  }

  // Formulário de cliente
  const clientForm = document.getElementById("client-form")
  if (clientForm) {
    clientForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveClient()
    })
  }

  // Formulário de usuário
  const userForm = document.getElementById("user-form")
  if (userForm) {
    userForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveUser()
    })
  }

  // Formulário de configurações
  const settingsForm = document.getElementById("admin-settings-form")
  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault()
      saveSettings()
    })
  }
}

// Função para buscar endereço pelo CEP
function setupCepSearch() {
  const cepInput = document.getElementById("client-cep")
  if (cepInput) {
    cepInput.addEventListener("blur", function () {
      const cep = this.value.replace(/\D/g, "")

      if (cep.length !== 8) {
        return
      }

      // Mostrar indicador de carregamento
      const streetInput = document.getElementById("client-street")
      const neighborhoodInput = document.getElementById("client-neighborhood")
      const cityInput = document.getElementById("client-city")
      const stateInput = document.getElementById("client-state")

      if (streetInput) streetInput.value = "Carregando..."
      if (neighborhoodInput) neighborhoodInput.value = "Carregando..."
      if (cityInput) cityInput.value = "Carregando..."
      if (stateInput) stateInput.value = "..."

      // Fazer a requisição para a API do ViaCEP
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (data.erro) {
            alert("CEP não encontrado.")
            if (streetInput) streetInput.value = ""
            if (neighborhoodInput) neighborhoodInput.value = ""
            if (cityInput) cityInput.value = ""
            if (stateInput) stateInput.value = ""
            return
          }

          // Preencher os campos com os dados retornados
          if (streetInput) streetInput.value = data.logradouro || ""
          if (neighborhoodInput) neighborhoodInput.value = data.bairro || ""
          if (cityInput) cityInput.value = data.localidade || ""
          if (stateInput) stateInput.value = data.uf || ""

          // Focar no campo de número após preencher os dados
          const numberInput = document.getElementById("client-number")
          if (numberInput) numberInput.focus()
        })
        .catch((error) => {
          console.error("Erro ao buscar CEP:", error)
          alert("Erro ao buscar CEP. Por favor, tente novamente.")
          if (streetInput) streetInput.value = ""
          if (neighborhoodInput) neighborhoodInput.value = ""
          if (cityInput) cityInput.value = ""
          if (stateInput) stateInput.value = ""
        })
    })

    // Adicionar máscara para o CEP
    cepInput.addEventListener("input", function () {
      this.value = this.value
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .substring(0, 9)
    })
  }
}

// Modificar a função setupSearchButtons para remover referências a "Meus Clientes"
function setupSearchButtons() {
  // Botão para pesquisar clientes
  const searchClientBtn = document.getElementById("search-client-btn")
  if (searchClientBtn) {
    searchClientBtn.addEventListener("click", () => {
      console.log("Botão pesquisar clientes clicado")
      loadClientsTable()
      // Recarregar a visualização Kanban se estiver visível
      if (document.getElementById("clients-kanban-view").style.display !== "none") {
        loadKanbanView()
      }
    })
  }

  // Campo de pesquisa de clientes (Enter)
  const searchClientInput = document.getElementById("search-client")
  if (searchClientInput) {
    searchClientInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        loadClientsTable()
        // Recarregar a visualização Kanban se estiver visível
        if (document.getElementById("clients-kanban-view").style.display !== "none") {
          loadKanbanView()
        }
      }
    })
  }

  // Botão para aplicar filtro de corretores
  const applyBrokerFilterBtn = document.getElementById("apply-broker-filter")
  if (applyBrokerFilterBtn) {
    applyBrokerFilterBtn.addEventListener("click", () => {
      console.log("Botão aplicar filtro clicado")
      loadClientsTable()
      // Recarregar a visualização Kanban se estiver visível
      if (document.getElementById("clients-kanban-view").style.display !== "none") {
        loadKanbanView()
      }
    })
  }
}

// Configurar botões de ação específicos
function setupActionButtons() {
  // Botão para exportar logs
  const exportLogsBtn = document.getElementById("export-logs-btn")
  if (exportLogsBtn) {
    exportLogsBtn.addEventListener("click", () => {
      console.log("Botão exportar logs clicado")
      exportLogsToCSV()
    })
  }

  // Botão para zerar métricas (apenas para DEV)
  const resetMetricsBtn = document.getElementById("reset-metrics-btn")
  if (resetMetricsBtn && currentUser.role === "dev") {
    resetMetricsBtn.addEventListener("click", () => {
      console.log("Botão zerar métricas clicado")
      resetMetrics()
    })
  }
}

// Modificar a função showForm para mostrar o campo de corretor, mas desabilitado para corretores
function showForm(type, id) {
  const formContainer = document.getElementById(`${type}-form-container`)
  if (!formContainer) return

  formContainer.style.display = "block"

  const form = document.getElementById(`${type}-form`)
  if (form) {
    form.reset()
  }

  const idField = document.getElementById(`${type}-id`)
  if (idField) {
    idField.value = id || ""
  }

  // Configurações específicas para cada tipo de formulário
  switch (type) {
    case "property":
      // Limpar preview de imagem
      const imagePreview = document.getElementById("image-preview")
      if (imagePreview) {
        imagePreview.innerHTML = ""
      }

      // Mostrar/esconder opção de destaque baseado no papel do usuário
      const featuredCheckbox = document.getElementById("featured-checkbox-container")
      if (featuredCheckbox) {
        featuredCheckbox.style.display = ["admin", "dev"].includes(currentUser.role) ? "block" : "none"
      }

      // Se for edição, preencher o formulário
      if (id) {
        fillPropertyForm(id)
      }
      break

    case "client":
      // Configurar o campo de corretor responsável
      const clientBrokerContainer = document.getElementById("client-broker-container")
      const clientBrokerSelect = document.getElementById("client-broker")

      if (clientBrokerContainer && clientBrokerSelect) {
        // Preencher a lista de corretores
        populateBrokersList("client-broker")

        if (["admin", "dev"].includes(currentUser.role)) {
          // Para admin/dev, mostrar o campo normalmente
          clientBrokerContainer.style.display = "block"
          clientBrokerSelect.disabled = false
        } else {
          // Para corretores, mostrar o campo, mas desabilitado e preenchido com o corretor atual
          clientBrokerContainer.style.display = "block"
          clientBrokerSelect.value = currentUser.id
          clientBrokerSelect.disabled = true

          // Adicionar uma mensagem informativa
          const infoMessage = document.createElement("div")
          infoMessage.id = "broker-info-message"
          infoMessage.style.marginBottom = "15px"
          infoMessage.style.padding = "10px"
          infoMessage.style.backgroundColor = "#e8f5e9"
          infoMessage.style.borderRadius = "4px"
          infoMessage.style.color = "#2e7d32"
          infoMessage.innerHTML = `<i class="fa-solid fa-info-circle"></i> Este cliente será automaticamente vinculado a você (${currentUser.name}).`

          // Remover mensagem existente se houver
          const existingMessage = document.getElementById("broker-info-message")
          if (existingMessage) {
            existingMessage.remove()
          }

          // Inserir mensagem antes do primeiro campo do formulário
          const firstField = form.querySelector(".admin-form-row")
          if (firstField) {
            form.insertBefore(infoMessage, firstField)
          }
        }
      }

      // Se for edição, preencher o formulário
      if (id) {
        fillClientForm(id)
      }
      break

    case "user":
      // Mostrar/esconder opção de DEV baseado no papel do usuário
      const devOption = document.querySelector("#user-role option.dev-only")
      if (devOption) {
        devOption.style.display = currentUser.role === "dev" ? "block" : "none"
      }

      // Mostrar/esconder opção de ADMIN baseado no papel do usuário
      const adminOption = document.querySelector("#user-role option[value='admin']")
      if (adminOption) {
        adminOption.style.display = currentUser.role === "dev" ? "block" : "none"
      }

      // Se for edição, preencher o formulário
      if (id) {
        fillUserForm(id)
      }
      break
  }
}

// Função para esconder formulário
function hideForm(type) {
  const formContainer = document.getElementById(`${type}-form-container`)
  if (formContainer) {
    formContainer.style.display = "none"
  }
}

// Função para preencher formulário de imóvel
function fillPropertyForm(id) {
  const property = getPropertyById(id)
  if (!property) return

  document.getElementById("property-title").value = property.title || ""
  document.getElementById("property-type").value = property.type || "Casa"
  document.getElementById("property-location").value = property.location || ""
  document.getElementById("property-area").value = property.area || ""
  document.getElementById("property-bedrooms").value = property.bedrooms || ""
  document.getElementById("property-bathrooms").value = property.bathrooms || ""
  document.getElementById("property-garage").value = property.garage || ""
  document.getElementById("property-price").value = property.price || ""
  document.getElementById("property-description").value = property.description || ""
  document.getElementById("property-image").value = property.image || ""

  const propertyFeatured = document.getElementById("property-featured")
  if (propertyFeatured) {
    propertyFeatured.checked = property.featured || false
  }

  // Exibir preview da imagem
  updateImagePreview(property.image)
}

// Modificar a função fillClientForm para manter o campo de corretor desabilitado para corretores
function fillClientForm(id) {
  const client = getClientById(id)
  if (!client) return

  document.getElementById("client-name").value = client.name || ""
  document.getElementById("client-cpf").value = client.cpf || ""
  document.getElementById("client-email").value = client.email || ""
  document.getElementById("client-phone").value = client.phone || ""
  // Preencher campos de endereço
  document.getElementById("client-cep").value = client.cep || ""
  document.getElementById("client-street").value = client.street || ""
  document.getElementById("client-number").value = client.number || ""
  document.getElementById("client-neighborhood").value = client.neighborhood || ""
  document.getElementById("client-city").value = client.city || ""
  document.getElementById("client-state").value = client.state || ""
  document.getElementById("client-complement").value = client.complement || ""

  // Se o cliente não tiver os campos separados, mas tiver o endereço completo
  if (!client.street && client.address) {
    // Não tentamos separar o endereço completo, apenas mostramos no campo de rua
    document.getElementById("client-street").value = client.address || ""
  }
  document.getElementById("client-status").value = client.status || "Novo"
  document.getElementById("client-notes").value = client.notes || ""

  // Configurar o campo de corretor responsável
  const clientBrokerContainer = document.getElementById("client-broker-container")
  const clientBrokerSelect = document.getElementById("client-broker")

  if (clientBrokerContainer && clientBrokerSelect) {
    // Sempre mostrar o container
    clientBrokerContainer.style.display = "block"

    // Preencher a lista de corretores
    populateBrokersList("client-broker")

    // Selecionar o corretor atual
    clientBrokerSelect.value = client.brokerId || currentUser.id

    // Se for corretor, desabilitar o campo
    if (currentUser.role === "corretor") {
      clientBrokerSelect.disabled = true
    } else {
      clientBrokerSelect.disabled = false
    }
  }
}

// Função para preencher formulário de usuário
function fillUserForm(id) {
  const user = getUserById(id)
  if (!user) return

  // Verificar se o usuário tem permissão para editar o nível do usuário
  if (user.role === "admin" && currentUser.role !== "dev") {
    alert("Apenas desenvolvedores podem editar usuários administradores.")
    hideForm("user")
    return
  }

  if (user.role === "dev" && currentUser.role !== "dev") {
    alert("Apenas desenvolvedores podem editar outros desenvolvedores.")
    hideForm("user")
    return
  }

  document.getElementById("user-name").value = user.name || ""
  document.getElementById("user-cpf").value = user.cpf || ""
  document.getElementById("user-email").value = user.email || ""
  document.getElementById("user-phone").value = user.phone || ""
  document.getElementById("user-address").value = user.address || ""
  document.getElementById("user-birth").value = user.birth || ""
  document.getElementById("user-emergency-contact").value = user.emergencyContact || ""
  document.getElementById("user-emergency-phone").value = user.emergencyPhone || ""
  document.getElementById("user-username").value = user.username || ""
  document.getElementById("user-password").value = "" // Não preencher senha por segurança

  const userRoleSelect = document.getElementById("user-role")
  if (userRoleSelect) {
    userRoleSelect.value = user.role || "corretor"
  }

  const userActiveSelect = document.getElementById("user-active")
  if (userActiveSelect) {
    userActiveSelect.value = user.active.toString()
  }
}

// Função para atualizar preview de imagem
function updateImagePreview(imageUrl) {
  const preview = document.getElementById("image-preview")
  if (preview) {
    if (imageUrl) {
      preview.innerHTML = `<img src="${imageUrl}" alt="Preview">`
    } else {
      preview.innerHTML = ""
    }
  }
}

// Modificar a função saveProperty para garantir que o dashboard seja atualizado
function saveProperty() {
  try {
    const propertyId = document.getElementById("property-id").value
    const propertyFeatured = document.getElementById("property-featured")
    const isFeatured = propertyFeatured && propertyFeatured.checked && ["admin", "dev"].includes(currentUser.role)

    const property = {
      id: propertyId || Date.now().toString(),
      title: document.getElementById("property-title").value,
      type: document.getElementById("property-type").value,
      location: document.getElementById("property-location").value,
      area: document.getElementById("property-area").value,
      bedrooms: document.getElementById("property-bedrooms").value,
      bathrooms: document.getElementById("property-bathrooms").value,
      garage: document.getElementById("property-garage").value,
      price: document.getElementById("property-price").value,
      description: document.getElementById("property-description").value,
      image: document.getElementById("property-image").value,
      featured: isFeatured,
      ref: propertyId ? getPropertyById(propertyId).ref : generatePropertyRef(),
      createdBy: propertyId ? getPropertyById(propertyId).createdBy : currentUser.id,
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
    }

    if (propertyId) {
      // Atualizar imóvel existente
      const index = properties.findIndex((p) => p.id === propertyId)
      if (index !== -1) {
        const oldProperty = properties[index]
        properties[index] = property

        recordLogAction(currentUser.role, `${currentUser.name} atualizou o imóvel: ${property.title}`)

        // Verificar se o status de destaque foi alterado
        if (!oldProperty.featured && property.featured) {
          recordLogAction(currentUser.role, `${currentUser.name} adicionou o imóvel "${property.title}" aos destaques`)
        } else if (oldProperty.featured && !property.featured) {
          recordLogAction(currentUser.role, `${currentUser.name} removeu o imóvel "${property.title}" dos destaques`)
        }
      }
    } else {
      // Adicionar novo imóvel
      properties.push(property)
      recordLogAction(currentUser.role, `${currentUser.name} criou novo imóvel: ${property.title}`)

      // Se o novo imóvel for marcado como destaque
      if (property.featured) {
        recordLogAction(currentUser.role, `${currentUser.name} adicionou o imóvel "${property.title}" aos destaques`)
      }
    }

    localStorage.setItem("properties", JSON.stringify(properties))

    // Esconder formulário
    hideForm("property")

    alert("Imóvel salvo com sucesso!")

    // Forçar uma verificação de atualizações imediatamente se o atualizador estiver disponível
    if (window.dashboardUpdater) {
      window.dashboardUpdater.checkForUpdates()
    }
  } catch (error) {
    console.error("Erro ao salvar imóvel:", error)
    alert("Ocorreu um erro ao salvar o imóvel. Por favor, tente novamente.")
  }
}

// Modificar a função saveClient para garantir que o dashboard seja atualizado
function saveClient() {
  try {
    const clientId = document.getElementById("client-id").value

    // Determinar o corretor responsável
    let brokerId = currentUser.id
    let brokerName = currentUser.name

    // Se for admin ou dev e o campo não estiver desabilitado, pegar o corretor selecionado
    const brokerSelect = document.getElementById("client-broker")
    if (brokerSelect && !brokerSelect.disabled && ["admin", "dev"].includes(currentUser.role)) {
      const selectedBrokerId = brokerSelect.value
      if (selectedBrokerId) {
        const selectedBroker = getUserById(selectedBrokerId)
        if (selectedBroker) {
          brokerId = selectedBroker.id
          brokerName = selectedBroker.name
        }
      }
    } else {
      // Se for corretor ou o campo estiver desabilitado, vincular ao corretor atual
      brokerId = currentUser.id
      brokerName = currentUser.name
    }

    // Construir o endereço completo a partir dos campos individuais
    const cep = document.getElementById("client-cep").value
    const street = document.getElementById("client-street").value
    const number = document.getElementById("client-number").value
    const neighborhood = document.getElementById("client-neighborhood").value
    const city = document.getElementById("client-city").value
    const state = document.getElementById("client-state").value
    const complement = document.getElementById("client-complement").value

    const fullAddress = `${street}, ${number}${complement ? ", " + complement : ""}, ${neighborhood}, ${city}, ${state}, ${cep}`

    const client = {
      id: clientId || Date.now().toString(),
      name: document.getElementById("client-name").value,
      cpf: document.getElementById("client-cpf").value,
      email: document.getElementById("client-email").value,
      phone: document.getElementById("client-phone").value,
      address: fullAddress,
      cep: cep,
      street: street,
      number: number,
      neighborhood: neighborhood,
      city: city,
      state: state,
      complement: complement,
      status: document.getElementById("client-status").value,
      notes: document.getElementById("client-notes").value,
      brokerId: brokerId,
      brokerName: brokerName,
      createdAt: clientId ? getClientById(clientId).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (clientId) {
      // Atualizar cliente existente
      const index = clients.findIndex((c) => c.id === clientId)
      if (index !== -1) {
        clients[index] = client
        recordLogAction(currentUser.role, `${currentUser.name} atualizou o cliente: ${client.name}`)
      }
    } else {
      // Adicionar novo cliente
      clients.push(client)
      recordLogAction(currentUser.role, `${currentUser.name} adicionou novo cliente: ${client.name}`)
    }

    localStorage.setItem("clients", JSON.stringify(clients))

    // Esconder formulário
    hideForm("client")

    alert(
      "Cliente salvo com sucesso!" +
        (currentUser.role === "corretor" ? " Cliente vinculado automaticamente a você." : ""),
    )

    // Forçar uma verificação de atualizações imediatamente se o atualizador estiver disponível
    if (window.dashboardUpdater) {
      window.dashboardUpdater.checkForUpdates()
    }
  } catch (error) {
    console.error("Erro ao salvar cliente:", error)
    alert("Ocorreu um erro ao salvar o cliente. Por favor, tente novamente.")
  }
}

// Modificar a função saveUser para garantir que o dashboard seja atualizado
function saveUser() {
  try {
    const userId = document.getElementById("user-id").value
    const userRoleSelect = document.getElementById("user-role")
    const selectedRole = userRoleSelect ? userRoleSelect.value : "corretor"

    // Verificar se o usuário tem permissão para criar/editar o nível selecionado
    if (selectedRole === "admin" && currentUser.role !== "dev") {
      alert("Apenas desenvolvedores podem criar ou editar usuários administradores.")
      return
    }

    if (selectedRole === "dev" && currentUser.role !== "dev") {
      alert("Apenas desenvolvedores podem criar ou editar outros desenvolvedores.")
      return
    }

    const user = {
      id: userId || Date.now().toString(),
      name: document.getElementById("user-name").value,
      cpf: document.getElementById("user-cpf").value,
      email: document.getElementById("user-email").value,
      phone: document.getElementById("user-phone").value,
      address: document.getElementById("user-address").value,
      birth: document.getElementById("user-birth").value,
      emergencyContact: document.getElementById("user-emergency-contact").value,
      emergencyPhone: document.getElementById("user-emergency-phone").value,
      username: document.getElementById("user-username").value,
      password: document.getElementById("user-password").value || (userId ? getUserById(userId).password : ""),
      role: selectedRole,
      active: document.getElementById("user-active").value === "true",
    }

    // Verificar se o nome de usuário já existe
    const existingUser = users.find((u) => u.username === user.username && u.id !== user.id)
    if (existingUser) {
      alert("Este nome de usuário já está em uso. Por favor, escolha outro.")
      return
    }

    if (userId) {
      // Atualizar usuário existente
      const index = users.findIndex((u) => u.id === userId)
      if (index !== -1) {
        users[index] = user
        recordLogAction(currentUser.role, `${currentUser.name} atualizou o usuário: ${user.name} (${user.role})`)
      }
    } else {
      // Adicionar novo usuário
      users.push(user)
      recordLogAction(currentUser.role, `${currentUser.name} criou novo usuário: ${user.name} (${user.role})`)
    }

    localStorage.setItem("users", JSON.stringify(users))

    // Esconder formulário
    hideForm("user")

    alert("Usuário salvo com sucesso!")

    // Forçar uma verificação de atualizações imediatamente se o atualizador estiver disponível
    if (window.dashboardUpdater) {
      window.dashboardUpdater.checkForUpdates()
    }
  } catch (error) {
    console.error("Erro ao salvar usuário:", error)
    alert("Ocorreu um erro ao salvar o usuário. Por favor, tente novamente.")
  }
}

// Modificar a função deleteEntity para garantir que o dashboard seja atualizado
function deleteEntityByType(type, id) {
  switch (type) {
    case "property":
      deleteProperty(id)
      break
    case "client":
      deleteClient(id)
      // Atualizar notificações de clientes pendentes após excluir um cliente
      if (
        window.notificationManager &&
        typeof window.notificationManager.updatePendingClientsNotification === "function"
      ) {
        window.notificationManager.updatePendingClientsNotification()
      }
      break
    case "user":
      deleteUser(id)
      break
  }

  // Forçar uma verificação de atualizações imediatamente se o atualizador estiver disponível
  if (window.dashboardUpdater) {
    window.dashboardUpdater.checkForUpdates()
  }
}

// Modificar a função updateClientStatus para garantir que o dashboard seja atualizado
function changeClientStatus(clientId, newStatus) {
  // Encontrar o cliente
  const clientIndex = clients.findIndex((client) => client.id === clientId)

  if (clientIndex !== -1) {
    const oldStatus = clients[clientIndex].status

    // Se o status for o mesmo, não faz nada
    if (oldStatus === newStatus) return

    // Atualizar o status
    clients[clientIndex].status = newStatus

    // Salvar no localStorage
    localStorage.setItem("clients", JSON.stringify(clients))

    // Registrar no log
    recordLogAction(
      currentUser.role,
      `${currentUser.name} alterou o status do cliente ${clients[clientIndex].name} de "${oldStatus}" para "${newStatus}"`,
    )

    // Forçar uma verificação de atualizações imediatamente se o atualizador estiver disponível
    if (window.dashboardUpdater) {
      window.dashboardUpdater.checkForUpdates()
    }
  }
}

// Função para salvar configurações
function saveSettings() {
  try {
    const name = document.getElementById("settings-name").value
    const cpf = document.getElementById("settings-cpf").value
    const email = document.getElementById("settings-email").value
    const phone = document.getElementById("settings-phone").value
    const address = document.getElementById("settings-address").value
    const birth = document.getElementById("settings-birth").value
    const emergencyContact = document.getElementById("settings-emergency-contact").value
    const emergencyPhone = document.getElementById("settings-emergency-phone").value
    const username = document.getElementById("settings-username").value
    const password = document.getElementById("settings-password").value
    const confirmPassword = document.getElementById("settings-password-confirm").value
    const errorMessage = document.getElementById("settings-error")

    // Validar senhas
    if (password && password !== confirmPassword) {
      if (errorMessage) {
        errorMessage.textContent = "As senhas não coincidem"
      }
      return
    }

    // Atualizar usuário atual
    const userIndex = users.findIndex((u) => u.id === currentUser.id)

    if (userIndex !== -1) {
      // Verificar se o nome de usuário já existe
      const existingUser = users.find((u) => u.username === username && u.id !== currentUser.id)
      if (existingUser) {
        if (errorMessage) {
          errorMessage.textContent = "Este nome de usuário já está em uso. Por favor, escolha outro."
        }
        return
      }

      // Atualizar dados
      users[userIndex].name = name
      users[userIndex].cpf = cpf
      users[userIndex].email = email
      users[userIndex].phone = phone
      users[userIndex].address = address
      users[userIndex].birth = birth
      users[userIndex].emergencyContact = emergencyContact
      users[userIndex].emergencyPhone = emergencyPhone
      users[userIndex].username = username

      if (password) {
        users[userIndex].password = password
      }

      localStorage.setItem("users", JSON.stringify(users))

      // Atualizar usuário atual no localStorage
      const updatedUser = {
        ...currentUser,
        name: name,
        username: username,
      }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      currentUser = updatedUser

      // Atualizar mensagem de boas-vindas
      const welcomeElement = document.getElementById("user-welcome")
      if (welcomeElement) {
        welcomeElement.textContent = `Bem-vindo, ${name}`
      }

      recordLogAction(currentUser.role, `${currentUser.name} atualizou suas configurações de conta`)

      if (errorMessage) {
        errorMessage.textContent = ""
      }
      alert("Configurações salvas com sucesso!")
    }
  } catch (error) {
    console.error("Erro ao salvar configurações:", error)
    alert("Ocorreu um erro ao salvar as configurações. Por favor, tente novamente.")
  }
}

// Modificar a função loadStats para remover referências a "Meus Clientes"
function loadStats() {
  try {
    const featuredCount = properties.filter((p) => p.featured).length
    const totalViews = localStorage.getItem("totalViews") || "0"
    const clientsCount = clients.length

    // Verificar se o usuário é corretor
    if (currentUser.role !== "corretor") {
      // Mostrar todas as estatísticas para admin e dev
      const totalPropertiesElement = document.getElementById("total-properties")
      if (totalPropertiesElement) {
        totalPropertiesElement.textContent = properties.length
      }

      const featuredPropertiesElement = document.getElementById("featured-properties")
      if (featuredPropertiesElement) {
        featuredPropertiesElement.textContent = featuredCount
      }

      const totalViewsElement = document.getElementById("total-views")
      if (totalViewsElement) {
        totalViewsElement.textContent = totalViews
      }

      const totalClientsElement = document.getElementById("total-clients")
      if (totalClientsElement) {
        totalClientsElement.textContent = clientsCount
      }
    }

    // Estatísticas específicas para corretores
    const brokerStatsDiv = document.getElementById("broker-stats")
    if (brokerStatsDiv && currentUser.role === "corretor") {
      brokerStatsDiv.style.display = "grid"

      // Contar clientes do corretor
      const brokerClients = clients.filter((client) => client.brokerId === currentUser.id).length
      const brokerClientsElement = document.getElementById("broker-clients")
      if (brokerClientsElement) {
        brokerClientsElement.textContent = brokerClients
      }

      // Contar clientes com documentos em análise
      const pendingDocs = clients.filter(
        (client) =>
          client.brokerId === currentUser.id &&
          (client.status === "Análise documental" || client.status === "Análise bancária"),
      ).length
      const brokerPendingDocsElement = document.getElementById("broker-pending-docs")
      if (brokerPendingDocsElement) {
        brokerPendingDocsElement.textContent = pendingDocs
      }

      // Contar vendas realizadas
      const brokerSales = clients.filter(
        (client) => client.brokerId === currentUser.id && client.status === "Venda realizada",
      ).length
      const brokerSalesElement = document.getElementById("broker-sales")
      if (brokerSalesElement) {
        brokerSalesElement.textContent = brokerSales
      }
    }
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error)
  }
}

// Função para carregar tabela de imóveis
function loadPropertiesTable() {
  try {
    const tableBody = document.getElementById("properties-table-body")

    if (!tableBody) {
      console.warn("Elemento properties-table-body não encontrado")
      return
    }

    tableBody.innerHTML = ""

    if (properties.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = '<td colspan="7" style="text-align: center;">Nenhum imóvel cadastrado.</td>'
      tableBody.appendChild(row)
      return
    }

    properties.forEach((property) => {
      const row = document.createElement("tr")

      row.innerHTML = `
        <td>${property.ref || ""}</td>
        <td>${property.title || ""}</td>
        <td>${property.type || ""}</td>
        <td>${property.location || ""}</td>
        <td>R$ ${Number(property.price || 0).toLocaleString("pt-BR")}</td>
        <td>${property.featured ? '<i class="fa-solid fa-check" style="color: green;"></i>' : '<i class="fa-solid fa-xmark" style="color: red;"></i>'}</td>
        <td class="actions">
          <button class="edit" data-id="${property.id}">Editar</button>
          ${["admin", "dev"].includes(currentUser.role) ? `<button class="delete" data-id="${property.id}">Excluir</button>` : ""}
          ${
            ["admin", "dev"].includes(currentUser.role)
              ? `<button class="${property.featured ? "remove-featured" : "add-featured"}" data-id="${property.id}">
              ${property.featured ? "Remover Destaque" : "Adicionar Destaque"}
             </button>`
              : ""
          }
        </td>
      `

      tableBody.appendChild(row)
    })

    // Adicionar event listeners para botões de ação
    addTableActionListeners(tableBody)
  } catch (error) {
    console.error("Erro ao carregar tabela de imóveis:", error)
  }
}

// Modificar a função loadClientsTable para fazer o filtro de corretores funcionar corretamente
function loadClientsTable() {
  try {
    const tableBody = document.getElementById("clients-table-body")

    if (!tableBody) {
      console.warn("Elemento clients-table-body não encontrado")
      return
    }

    tableBody.innerHTML = ""

    // Filtrar clientes baseado no papel do usuário e filtros aplicados
    let filteredClients = [...clients]

    // Se for corretor, mostrar apenas seus próprios clientes
    if (currentUser.role === "corretor") {
      filteredClients = filteredClients.filter((client) => client.brokerId === currentUser.id)

      // Esconder o filtro de corretores para corretores
      const brokerFilterContainer = document.getElementById("broker-filter-container")
      if (brokerFilterContainer) {
        brokerFilterContainer.style.display = "none"
      }
    } else if (["admin", "dev"].includes(currentUser.role)) {
      // Se for admin ou dev, mostrar o filtro de corretores
      const brokerFilterContainer = document.getElementById("broker-filter-container")
      if (brokerFilterContainer) {
        brokerFilterContainer.style.display = "flex"
      }

      // Preencher a lista de corretores no filtro
      populateBrokersList("filter-broker")

      // Aplicar filtro se selecionado
      const brokerFilter = document.getElementById("filter-broker")
      if (brokerFilter && brokerFilter.value !== "all") {
        filteredClients = filteredClients.filter((client) => client.brokerId === brokerFilter.value)
        console.log(`Filtrando por corretor: ${brokerFilter.value}, ${filteredClients.length} clientes encontrados`)
      }
    }

    // Aplicar filtro de pesquisa
    const searchInput = document.getElementById("search-client")
    if (searchInput && searchInput.value.trim() !== "") {
      const searchTerm = searchInput.value.trim().toLowerCase()
      filteredClients = filteredClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.phone.includes(searchTerm) ||
          (client.cpf && client.cpf.includes(searchTerm)),
      )
    }

    if (filteredClients.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = '<td colspan="7" style="text-align: center;">Nenhum cliente encontrado.</td>'
      tableBody.appendChild(row)
      return
    }

    filteredClients.forEach((client) => {
      const row = document.createElement("tr")

      // Destacar clientes pendentes com uma classe CSS
      if (client.isPending) {
        row.classList.add("pending-client")
      }

      // Verificar se é um cliente pendente para mostrar botão de atribuir corretor
      const assignBrokerButton =
        client.isPending && ["admin", "dev"].includes(currentUser.role)
          ? `<button class="assign-broker" data-id="${client.id}">Atribuir Corretor</button>`
          : ""

      row.innerHTML = `
        <td>${client.id}</td>
        <td>${client.name || ""}${client.isPending ? ' <span class="badge pending">Pendente</span>' : ""}</td>
        <td>${client.phone || ""}</td>
        <td>${client.email || ""}</td>
        <td>${client.status || "Novo"}</td>
        <td>${client.brokerName || "Não atribuído"}</td>
        <td class="actions">
          <button class="edit" data-id="${client.id}">Editar</button>
          ${assignBrokerButton}
          ${["admin", "dev"].includes(currentUser.role) ? `<button class="delete" data-id="${client.id}">Excluir</button>` : ""}
        </td>
      `

      tableBody.appendChild(row)
    })

    // Adicionar event listeners para botões de ação
    addTableActionListeners(tableBody)

    // Adicionar event listeners para botões de atribuir corretor
    addAssignBrokerListeners()
  } catch (error) {
    console.error("Erro ao carregar tabela de clientes:", error)
  }
}

// Adicionar função para lidar com os botões de atribuir corretor
function addAssignBrokerListeners() {
  const assignButtons = document.querySelectorAll(".assign-broker")

  assignButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const clientId = this.getAttribute("data-id")
      showAssignBrokerDialog(clientId)
    })
  })
}

// Função para mostrar diálogo de atribuição de corretor
function showAssignBrokerDialog(clientId) {
  // Encontrar o cliente
  const client = getClientById(clientId)
  if (!client) return

  // Criar o diálogo
  const dialog = document.createElement("div")
  dialog.className = "modal-overlay"
  dialog.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>Atribuir Corretor para ${client.name}</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <p>Selecione um corretor para atender este cliente:</p>
        <select id="assign-broker-select" class="broker-select">
          <option value="">Selecione um corretor</option>
          <!-- Opções de corretores serão adicionadas dinamicamente -->
        </select>
      </div>
      <div class="modal-footer">
        <button class="admin-button add" id="confirm-assign-broker">Confirmar</button>
        <button class="admin-button secondary" id="cancel-assign-broker">Cancelar</button>
      </div>
    </div>
  `

  // Adicionar ao corpo do documento
  document.body.appendChild(dialog)

  // Preencher a lista de corretores
  populateBrokersList("assign-broker-select")

  // Configurar event listeners
  const closeBtn = dialog.querySelector(".close-modal")
  const cancelBtn = dialog.querySelector("#cancel-assign-broker")
  const confirmBtn = dialog.querySelector("#confirm-assign-broker")

  // Função para fechar o diálogo
  const closeDialog = () => {
    document.body.removeChild(dialog)
  }

  // Event listeners para fechar o diálogo
  closeBtn.addEventListener("click", closeDialog)
  cancelBtn.addEventListener("click", closeDialog)

  // Event listener para confirmar a atribuição
  confirmBtn.addEventListener("click", () => {
    const brokerSelect = dialog.querySelector("#assign-broker-select")
    const brokerId = brokerSelect.value

    if (!brokerId) {
      alert("Por favor, selecione um corretor.")
      return
    }

    // Obter informações do corretor
    const broker = getUserById(brokerId)
    if (!broker) {
      alert("Corretor não encontrado.")
      return
    }

    // Atualizar o cliente
    const clientIndex = clients.findIndex((c) => c.id === clientId)
    if (clientIndex !== -1) {
      clients[clientIndex].brokerId = brokerId
      clients[clientIndex].brokerName = broker.name
      clients[clientIndex].status = "Novo" // Atualizar status
      clients[clientIndex].isPending = false // Remover flag de pendente

      // Salvar no localStorage
      localStorage.setItem("clients", JSON.stringify(clients))

      // Registrar no log
      recordLogAction(
        currentUser.role,
        `${currentUser.name} atribuiu o cliente ${clients[clientIndex].name} ao corretor ${broker.name}`,
      )

      // Recarregar a tabela
      loadClientsTable()

      // Fechar o diálogo
      closeDialog()

      // Mostrar mensagem de sucesso
      alert(`Cliente atribuído com sucesso ao corretor ${broker.name}.`)
    }
  })
}

// Modificar a função loadKanbanView para permitir que corretores vejam apenas seus clientes
function loadKanbanView() {
  try {
    const kanbanView = document.getElementById("clients-kanban-view")
    if (kanbanView) {
      // Não alterar a visibilidade aqui, apenas carregar os dados
    }

    // Obter os clientes filtrados
    let filteredClients = [...clients]

    // Se for corretor, mostrar apenas seus próprios clientes
    if (currentUser.role === "corretor") {
      filteredClients = filteredClients.filter((client) => client.brokerId === currentUser.id)
    } else if (["admin", "dev"].includes(currentUser.role)) {
      // Se for admin ou dev e tiver filtro aplicado
      const brokerFilter = document.getElementById("filter-broker")
      if (brokerFilter && brokerFilter.value !== "all") {
        filteredClients = filteredClients.filter((client) => client.brokerId === brokerFilter.value)
      }
    }

    // Aplicar filtro de pesquisa
    const searchInput = document.getElementById("search-client")
    if (searchInput && searchInput.value.trim() !== "") {
      const searchTerm = searchInput.value.trim().toLowerCase()
      filteredClients = filteredClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.phone.toLowerCase().includes(searchTerm) ||
          client.cpf.includes(searchTerm),
      )
    }

    // Agrupar clientes por status
    const clientsByStatus = {
      Novo: [],
      Atendimento: [],
      "Análise documental": [],
      "Análise bancária": [],
      Aprovado: [],
      Condicionado: [],
      Reprovado: [],
      "Venda realizada": [],
      Distrato: [],
    }

    filteredClients.forEach((client) => {
      const status = client.status || "Novo"
      if (clientsByStatus[status]) {
        clientsByStatus[status].push(client)
      } else {
        clientsByStatus["Novo"].push(client)
      }
    })

    // Limpar e preencher cada coluna
    Object.keys(clientsByStatus).forEach((status) => {
      const clients = clientsByStatus[status]
      const statusId = getStatusId(status)

      // Atualizar contador
      const countElement = document.getElementById(`kanban-count-${statusId}`)
      if (countElement) {
        countElement.textContent = clients.length
      }

      // Limpar e preencher coluna
      const cardsContainer = document.getElementById(`kanban-cards-${statusId}`)
      if (cardsContainer) {
        cardsContainer.innerHTML = ""

        if (clients.length === 0) {
          cardsContainer.innerHTML = `<div class="kanban-empty">Nenhum cliente neste status</div>`
        } else {
          clients.forEach((client) => {
            const card = document.createElement("div")
            card.className = "kanban-card"
            card.setAttribute("data-id", client.id)
            card.setAttribute("draggable", "true") // Tornar o cartão arrastável

            card.innerHTML = `
              <div class="kanban-card-header">
                <h4 class="kanban-card-title">${client.name}</h4>
              </div>
              <div class="kanban-card-broker">Corretor: ${client.brokerName}</div>
              <div class="kanban-card-content">
                <div>${client.phone}</div>
                <div>${client.email}</div>
              </div>
              <div class="kanban-card-footer">
                <span>ID: ${client.id}</span>
                <div class="kanban-card-actions">
                  <button class="edit" data-id="${client.id}">Editar</button>
                </div>
              </div>
            `

            cardsContainer.appendChild(card)
          })
        }
      }
    })

    // Adicionar event listeners para botões de edição nos cartões
    document.querySelectorAll(".kanban-card-actions .edit").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault() // Prevenir comportamento padrão
        e.stopPropagation() // Impedir propagação do evento

        const id = this.getAttribute("data-id")
        showForm("client", id)
      })
    })

    // Adicionar event listeners para os cartões (para abrir o formulário de edição)
    document.querySelectorAll(".kanban-card").forEach((card) => {
      card.addEventListener("click", function (e) {
        // Verificar se o clique não foi em um botão
        if (!e.target.closest("button")) {
          const id = this.getAttribute("data-id")
          showForm("client", id)
        }
      })
    })

    // Configurar drag and drop para os cartões
    setupDragAndDrop()
  } catch (error) {
    console.error("Erro ao carregar visualização Kanban:", error)
  }
}

// Adicionar nova função para configurar o drag and drop
function setupDragAndDrop() {
  // Adicionar event listeners para drag and drop após um pequeno delay
  // para garantir que os elementos do Kanban já foram renderizados
  setTimeout(() => {
    const kanbanCards = document.querySelectorAll(".kanban-card")
    const kanbanColumns = document.querySelectorAll(".kanban-cards")

    // Configurar os cartões para serem arrastáveis
    kanbanCards.forEach((card) => {
      card.addEventListener("dragstart", handleDragStart)
      card.addEventListener("dragend", handleDragEnd)
    })

    // Configurar as colunas para receber os cartões
    kanbanColumns.forEach((column) => {
      column.addEventListener("dragover", handleDragOver)
      column.addEventListener("dragenter", handleDragEnter)
      column.addEventListener("dragleave", handleDragLeave)
      column.addEventListener("drop", handleDrop)
    })
  }, 500)
}

// Funções para manipular eventos de drag and drop
function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.getAttribute("data-id"))
  e.target.classList.add("dragging")
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging")
}

function handleDragOver(e) {
  e.preventDefault() // Necessário para permitir o drop
}

function handleDragEnter(e) {
  e.preventDefault()
  e.currentTarget.classList.add("drag-over")
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("drag-over")
}

function handleDrop(e) {
  e.preventDefault()
  e.currentTarget.classList.remove("drag-over")

  const clientId = e.dataTransfer.getData("text/plain")
  const targetColumn = e.currentTarget
  const targetStatus = targetColumn.parentElement.getAttribute("data-status")

  // Atualizar o status do cliente
  updateClientStatus(clientId, targetStatus)
}

// Função para atualizar o status do cliente
function updateClientStatus(clientId, newStatus) {
  // Encontrar o cliente
  const clientIndex = clients.findIndex((client) => client.id === clientId)

  if (clientIndex !== -1) {
    const oldStatus = clients[clientIndex].status

    // Se o status for o mesmo, não faz nada
    if (oldStatus === newStatus) return

    // Atualizar o status
    clients[clientIndex].status = newStatus

    // Salvar no localStorage
    localStorage.setItem("clients", JSON.stringify(clients))

    // Registrar no log
    recordLogAction(
      currentUser.role,
      `${currentUser.name} alterou o status do cliente ${clients[clientIndex].name} de "${oldStatus}" para "${newStatus}"`,
    )

    // Recarregar a visualização Kanban
    loadKanbanView()
  }
}

// Função auxiliar para obter o ID do status para o Kanban
function getStatusId(status) {
  switch (status) {
    case "Novo":
      return "novo"
    case "Atendimento":
      return "atendimento"
    case "Análise documental":
      return "analise-documental"
    case "Análise bancária":
      return "analise-bancaria"
    case "Aprovado":
      return "aprovado"
    case "Condicionado":
      return "condicionado"
    case "Reprovado":
      return "reprovado"
    case "Venda realizada":
      return "venda"
    case "Distrato":
      return "distrato"
    default:
      return "novo"
  }
}

// Função para carregar tabela de usuários
function loadUsersTable() {
  try {
    // Verificar se o usuário tem permissão para ver esta página
    if (!["admin", "dev"].includes(currentUser.role)) {
      return
    }

    const tableBody = document.getElementById("users-table-body")

    if (!tableBody) {
      console.warn("Elemento users-table-body não encontrado")
      return
    }

    tableBody.innerHTML = ""

    if (users.length === 0) {
      const row = document.createElement("tr")
      row.innerHTML = '<td colspan="7" style="text-align: center;">Nenhum usuário cadastrado.</td>'
      tableBody.appendChild(row)
      return
    }

    users.forEach((user) => {
      // DEVs só podem ser vistos e editados por outros DEVs
      if (user.role === "dev" && currentUser.role !== "dev") {
        return
      }

      const row = document.createElement("tr")

      row.innerHTML = `
        <td>${user.id || ""}</td>
        <td>${user.name || ""}</td>
        <td>${user.phone || "Não informado"}</td>
        <td>${user.email || ""}</td>
        <td><span class="user-role ${user.role}">${user.role}</span></td>
        <td><span class="user-status ${user.active ? "active" : "inactive"}">${user.active ? "Ativo" : "Inativo"}</span></td>
        <td class="actions">
          <button class="edit" data-id="${user.id}">Editar</button>
          ${user.id !== currentUser.id ? `<button class="delete" data-id="${user.id}">Excluir</button>` : ""}
        </td>
      `

      tableBody.appendChild(row)
    })

    // Adicionar event listeners para botões de ação
    addTableActionListeners(tableBody)
  } catch (error) {
    console.error("Erro ao carregar tabela de usuários:", error)
  }
}

// Modificar a função loadActivityLogs para corrigir bugs e adicionar cores
function loadActivityLogs() {
  try {
    const container = document.getElementById("activity-logs")

    if (!container) return

    container.innerHTML = ""

    if (logs.length === 0) {
      container.innerHTML = "<p>Nenhum log de atividade.</p>"
      return
    }

    // Exibir logs em ordem cronológica inversa (mais recentes primeiro)
    logs
      .slice()
      .reverse()
      .forEach((log) => {
        const logEntry = document.createElement("div")
        logEntry.className = "log-entry"

        // Determinar a categoria da ação para aplicar a cor correta
        const actionCategory = determineActionCategory(log.action)
        logEntry.classList.add(`log-${actionCategory}`)

        const timestamp = new Date(log.timestamp).toLocaleString("pt-BR")
        const userType = log.userType.charAt(0).toUpperCase() + log.userType.slice(1)

        logEntry.innerHTML = `
          <span class="timestamp">${timestamp}</span>
          <span class="user ${log.userType}">${userType}</span>
          <span class="action">${log.action}</span>
        `

        container.appendChild(logEntry)
      })
  } catch (error) {
    console.error("Erro ao carregar logs de atividade:", error)
    // Adicionar mensagem de erro visível para o usuário
    const container = document.getElementById("activity-logs")
    if (container) {
      container.innerHTML = `<div class="error-message">Erro ao carregar logs: ${error.message}</div>`
    }
  }
}

// Função para determinar a categoria da ação
function determineActionCategory(action) {
  const actionLower = action.toLowerCase()

  if (actionLower.includes("criou") || actionLower.includes("adicionou") || actionLower.includes("novo")) {
    return "create"
  } else if (actionLower.includes("atualizou") || actionLower.includes("alterou") || actionLower.includes("editou")) {
    return "update"
  } else if (actionLower.includes("excluiu") || actionLower.includes("deletou") || actionLower.includes("removeu")) {
    return "delete"
  } else if (
    actionLower.includes("login") ||
    actionLower.includes("logout") ||
    actionLower.includes("entrou") ||
    actionLower.includes("saiu")
  ) {
    return "auth"
  } else if (actionLower.includes("exportou") || actionLower.includes("importou")) {
    return "data"
  } else if (actionLower.includes("destaque")) {
    return "feature"
  } else if (actionLower.includes("atribuiu") || actionLower.includes("vinculou")) {
    return "assign"
  } else if (actionLower.includes("zerou") || actionLower.includes("resetou")) {
    return "reset"
  } else {
    return "other"
  }
}

// Função para registrar ações no log - corrigida para garantir consistência
function recordLogAction(userType, action) {
  try {
    // Verificar se os parâmetros são válidos
    if (!userType || !action) {
      console.error("Parâmetros inválidos para logAction:", { userType, action })
      return
    }

    // Criar novo log
    const newLog = {
      timestamp: new Date().toISOString(),
      userType: userType,
      action: action,
    }

    // Obter logs existentes
    let existingLogs = []
    try {
      existingLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
      // Verificar se o resultado é um array
      if (!Array.isArray(existingLogs)) {
        console.error("Logs recuperados não são um array:", existingLogs)
        existingLogs = []
      }
    } catch (parseError) {
      console.error("Erro ao analisar logs existentes:", parseError)
      existingLogs = []
    }

    // Adicionar novo log
    existingLogs.push(newLog)

    // Limitar a 100 logs para não sobrecarregar o localStorage
    if (existingLogs.length > 100) {
      existingLogs = existingLogs.slice(-100) // Manter apenas os 100 logs mais recentes
    }

    // Atualizar no localStorage
    localStorage.setItem("activityLogs", JSON.stringify(existingLogs))

    // Atualizar a variável global logs
    logs = existingLogs

    // Se estiver na página de logs, atualizar a visualização
    const logsPage = document.getElementById("logs-page")
    if (logsPage && logsPage.style.display !== "none") {
      loadActivityLogs()
    }
  } catch (error) {
    console.error("Erro ao registrar ação no log:", error)
  }
}

// Função para carregar configurações
function loadSettings() {
  try {
    const user = getUserById(currentUser.id)

    if (user) {
      const settingsFields = {
        "settings-name": user.name || "",
        "settings-cpf": user.cpf || "",
        "settings-email": user.email || "",
        "settings-phone": user.phone || "",
        "settings-address": user.address || "",
        "settings-birth": user.birth || "",
        "settings-emergency-contact": user.emergencyContact || "",
        "settings-emergency-phone": user.emergencyPhone || "",
        "settings-username": user.username || "",
        "settings-password": "",
        "settings-password-confirm": "",
      }

      for (const [id, value] of Object.entries(settingsFields)) {
        const element = document.getElementById(id)
        if (element) {
          element.value = value
        }
      }
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error)
  }
}

// Função para carregar imóveis em destaque
function loadFeaturedProperties() {
  try {
    // Verificar se o usuário tem permissão para ver esta página
    if (!["admin", "dev"].includes(currentUser.role)) {
      return
    }

    const featuredProperties = properties.filter((p) => p.featured)
    const container = document.getElementById("featured-properties-list")

    if (!container) {
      console.warn("Elemento featured-properties-list não encontrado")
      return
    }

    container.innerHTML = ""

    if (featuredProperties.length === 0) {
      container.innerHTML = "<p>Nenhum imóvel em destaque.</p>"
      return
    }

    const table = document.createElement("table")
    table.className = "admin-table"

    table.innerHTML = `
      <thead>
        <tr>
          <th>Ref.</th>
          <th>Título</th>
          <th>Tipo</th>
          <th>Preço</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${featuredProperties
          .map(
            (property) => `
          <tr>
            <td>${property.ref || ""}</td>
            <td>${property.title || ""}</td>
            <td>${property.type || ""}</td>
            <td>R$ ${Number(property.price || 0).toLocaleString("pt-BR")}</td>
            <td class="actions">
              <button class="edit" data-id="${property.id}">Editar</button>
              <button class="remove-featured" data-id="${property.id}">Remover Destaque</button>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    `

    container.appendChild(table)

    // Adicionar event listeners para botões de ação
    addTableActionListeners(container)
  } catch (error) {
    console.error("Erro ao carregar imóveis em destaque:", error)
  }
}

// Função para adicionar event listeners aos botões de ação nas tabelas
function addTableActionListeners(container) {
  // Botões de editar
  container.querySelectorAll(".edit").forEach((button) => {
    button.onclick = function (e) {
      e.preventDefault() // Prevenir comportamento padrão
      e.stopPropagation() // Impedir propagação do evento

      const id = this.getAttribute("data-id")
      const type = determineEntityType(id)

      if (type) {
        console.log(`Botão editar clicado para ${type}:`, id)
        showForm(type, id)
      }
    }
  })

  // Botões de excluir
  container.querySelectorAll(".delete").forEach((button) => {
    button.onclick = function (e) {
      e.preventDefault() // Prevenir comportamento padrão
      e.stopPropagation() // Impedir propagação do evento

      const id = this.getAttribute("data-id")
      const type = determineEntityType(id)

      if (type) {
        console.log(`Botão excluir clicado para ${type}:`, id)
        deleteEntityByType(type, id)
      }
    }
  })

  // Botões de adicionar destaque
  container.querySelectorAll(".add-featured").forEach((button) => {
    button.onclick = function (e) {
      e.preventDefault() // Prevenir comportamento padrão
      e.stopPropagation() // Impedir propagação do evento

      const propertyId = this.getAttribute("data-id")
      console.log("Botão adicionar destaque clicado para propriedade:", propertyId)
      addToFeatured(propertyId)
    }
  })

  // Botões de remover destaque
  container.querySelectorAll(".remove-featured").forEach((button) => {
    button.onclick = function (e) {
      e.preventDefault() // Prevenir comportamento padrão
      e.stopPropagation() // Impedir propagação do evento

      const propertyId = this.getAttribute("data-id")
      console.log("Botão remover destaque clicado para propriedade:", propertyId)
      removeFeatured(propertyId)
    }
  })
}

// Função para determinar o tipo de entidade com base no ID
function determineEntityType(id) {
  if (getPropertyById(id)) return "property"
  if (getClientById(id)) return "client"
  if (getUserById(id)) return "user"
  return null
}

// Modificar a função deleteEntity para atualizar notificações
function deleteEntity(type, id) {
  switch (type) {
    case "property":
      deleteProperty(id)
      break
    case "client":
      deleteClient(id)
      // Atualizar notificações de clientes pendentes após excluir um cliente
      if (
        window.notificationManager &&
        typeof window.notificationManager.updatePendingClientsNotification === "function"
      ) {
        window.notificationManager.updatePendingClientsNotification()
      }
      break
    case "user":
      deleteUser(id)
      break
  }

  // Forçar uma verificação de atualizações imediatamente se o atualizador estiver disponível
  if (window.dashboardUpdater) {
    window.dashboardUpdater.checkForUpdates()
  }
}

// Função para excluir imóvel
function deleteProperty(propertyId) {
  try {
    if (!confirm("Tem certeza que deseja excluir este imóvel?")) return

    const property = getPropertyById(propertyId)

    if (!property) return

    // Remover imóvel
    properties = properties.filter((p) => p.id !== propertyId)
    localStorage.setItem("properties", JSON.stringify(properties))

    recordLogAction(currentUser.role, `${currentUser.name} deletou o imóvel: ${property.title} (${property.ref || ""})`)

    // Atualizar tabela e estatísticas
    loadPropertiesTable()
    loadStats()
    loadFeaturedProperties()

    alert("Imóvel excluído com sucesso!")
  } catch (error) {
    console.error("Erro ao excluir imóvel:", error)
    alert("Ocorreu um erro ao excluir o imóvel. Por favor, tente novamente.")
  }
}

// Função para excluir cliente
function deleteClient(clientId) {
  try {
    // Verificar permissões - apenas admin e dev podem excluir clientes
    if (!["admin", "dev"].includes(currentUser.role)) {
      alert("Você não tem permissão para excluir clientes.")
      return
    }

    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    const client = getClientById(clientId)

    if (!client) return

    // Remover cliente
    clients = clients.filter((c) => c.id !== clientId)
    localStorage.setItem("clients", JSON.stringify(clients))

    recordLogAction(currentUser.role, `${currentUser.name} excluiu o cliente: ${client.name}`)

    // Atualizar tabela e estatísticas
    loadClientsTable()
    loadKanbanView()
    loadStats()

    alert("Cliente excluído com sucesso!")
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    alert("Ocorreu um erro ao excluir o cliente. Por favor, tente novamente.")
  }
}

// Função para excluir usuário
function deleteUser(userId) {
  try {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return

    const user = getUserById(userId)

    if (!user) return

    // Não permitir excluir o próprio usuário
    if (userId === currentUser.id) {
      alert("Você não pode excluir seu próprio usuário.")
      return
    }

    // Não permitir que um admin exclua um dev
    if (user.role === "dev" && currentUser.role !== "dev") {
      alert("Você não tem permissão para excluir um usuário desenvolvedor.")
      return
    }

    // Remover usuário
    users = users.filter((u) => u.id !== userId)
    localStorage.setItem("users", JSON.stringify(users))

    recordLogAction(currentUser.role, `${currentUser.name} excluiu o usuário: ${user.name} (${user.role})`)

    // Atualizar tabela
    loadUsersTable()

    alert("Usuário excluído com sucesso!")
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    alert("Ocorreu um erro ao excluir o usuário. Por favor, tente novamente.")
  }
}

// Função para adicionar imóvel aos destaques
function addToFeatured(propertyId) {
  try {
    const property = getPropertyById(propertyId)

    if (!property) return

    // Atualizar propriedade
    property.featured = true

    // Atualizar no localStorage
    const index = properties.findIndex((p) => p.id === propertyId)
    if (index !== -1) {
      properties[index] = property
      localStorage.setItem("properties", JSON.stringify(properties))

      recordLogAction(currentUser.role, `${currentUser.name} adicionou o imóvel "${property.title}" aos destaques`)

      // Atualizar tabela e estatísticas
      loadPropertiesTable()
      loadStats()
      loadFeaturedProperties()

      alert("Imóvel adicionado aos destaques com sucesso!")
    }
  } catch (error) {
    console.error("Erro ao adicionar imóvel aos destaques:", error)
    alert("Ocorreu um erro ao adicionar o imóvel aos destaques. Por favor, tente novamente.")
  }
}

// Função para remover imóvel dos destaques
function removeFeatured(propertyId) {
  try {
    const property = getPropertyById(propertyId)

    if (!property) return

    // Atualizar propriedade
    property.featured = false

    // Atualizar no localStorage
    const index = properties.findIndex((p) => p.id === propertyId)
    if (index !== -1) {
      properties[index] = property
      localStorage.setItem("properties", JSON.stringify(properties))

      recordLogAction(currentUser.role, `${currentUser.name} removeu o imóvel "${property.title}" dos destaques`)

      // Atualizar tabela e estatísticas
      loadPropertiesTable()
      loadStats()
      loadFeaturedProperties()

      alert("Imóvel removido dos destaques com sucesso!")
    }
  } catch (error) {
    console.error("Erro ao remover imóvel dos destaques:", error)
    alert("Ocorreu um erro ao remover o imóvel dos destaques. Por favor, tente novamente.")
  }
}

// Função para zerar métricas (apenas para DEV)
function resetMetrics() {
  try {
    if (confirm("Tem certeza que deseja zerar todas as métricas de acesso? Esta ação não pode ser desfeita.")) {
      localStorage.setItem("totalViews", "0")
      localStorage.setItem("activeUsers", "0")

      recordLogAction("dev", `${currentUser.name} zerou todas as métricas de acesso`)
      loadStats()
      alert("Métricas zeradas com sucesso!")
    }
  } catch (error) {
    console.error("Erro ao zerar métricas:", error)
    alert("Ocorreu um erro ao zerar as métricas. Por favor, tente novamente.")
  }
}

// Função para exportar logs para CSV
function exportLogsToCSV() {
  try {
    if (logs.length === 0) {
      alert("Não há logs para exportar.")
      return
    }

    // Criar cabeçalho do CSV
    let csvContent = "Data,Usuário,Ação\n"

    // Adicionar dados dos logs
    logs.forEach((log) => {
      const timestamp = new Date(log.timestamp).toLocaleString("pt-BR")
      const user = log.userType.charAt(0).toUpperCase() + log.userType.slice(1)
      // Escapar aspas duplas no texto da ação
      const action = log.action.replace(/"/g, '""')

      csvContent += `"${timestamp}","${user}","${action}"\n`
    })

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    // Criar elemento de link temporário
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `logs_elite_house_${formatDate(new Date())}.csv`)
    link.style.visibility = "hidden"

    // Adicionar à página, clicar e remover
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    recordLogAction(currentUser.role, `${currentUser.name} exportou os logs de atividade em CSV`)

    alert("Logs exportados com sucesso!")
  } catch (error) {
    console.error("Erro ao exportar logs:", error)
    alert("Ocorreu um erro ao exportar os logs. Por favor, tente novamente.")
  }
}

// Modificar a função populateBrokersList para garantir que todos os corretores sejam exibidos
function populateBrokersList(selectId) {
  try {
    const select = document.getElementById(selectId)
    if (!select) {
      console.warn(`Elemento ${selectId} não encontrado`)
      return
    }

    // Limpar opções existentes
    select.innerHTML = ""

    // Se for para filtro, adicionar opção "Todos"
    if (selectId === "filter-broker") {
      const allOption = document.createElement("option")
      allOption.value = "all"
      allOption.textContent = "Todos os Corretores"
      select.appendChild(allOption)
    }

    // Adicionar corretores - incluir todos os corretores, não apenas os ativos
    const brokers = users.filter((user) => user.role === "corretor")

    console.log(`Encontrados ${brokers.length} corretores para o select ${selectId}`)

    if (brokers.length > 0) {
      brokers.forEach((broker) => {
        const option = document.createElement("option")
        option.value = broker.id
        option.textContent = broker.name || broker.username
        select.appendChild(option)
        console.log(`Adicionado corretor: ${broker.name || broker.username} (${broker.id})`)
      })
    } else {
      // Se não houver corretores, adicionar opção padrão
      const option = document.createElement("option")
      option.value = ""
      option.textContent = "Nenhum corretor disponível"
      option.disabled = true
      select.appendChild(option)
      console.log("Nenhum corretor encontrado para adicionar ao select")
    }
  } catch (error) {
    console.error("Erro ao preencher lista de corretores:", error)
  }
}

// Função auxiliar para formatar data para o nome do arquivo
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}-${month}-${year}_${hours}-${minutes}`
}

// Função para obter imóvel por ID
function getPropertyById(id) {
  return properties.find((p) => p.id === id)
}

// Função para obter cliente por ID
function getClientById(id) {
  return clients.find((c) => c.id === id)
}

// Função para obter usuário por ID
function getUserById(id) {
  return users.find((u) => u.id === id)
}

// Função para gerar referência de imóvel
function generatePropertyRef() {
  const lastRef =
    properties.length > 0
      ? Math.max(...properties.map((p) => Number.parseInt((p.ref || "ref#00000").replace("ref#", ""))))
      : 0

  return `ref#${String(lastRef + 1).padStart(5, "0")}`
}

// Inicializar o painel quando o documento estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  console.log("Documento carregado, inicializando painel administrativo...")
})
