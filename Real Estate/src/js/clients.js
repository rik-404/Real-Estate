// Arquivo para gerenciar a funcionalidade específica de clientes

document.addEventListener("DOMContentLoaded", () => {
  // Verificar se estamos na página de clientes
  const clientsPage = document.getElementById("clients-page")
  if (!clientsPage) return

  // Inicializar a página de clientes
  initializeClientsPage()

  // Configurar botão para visualizar clientes pendentes
  setupPendingClientsButton()

  // Função para configurar botão de clientes pendentes
  function setupPendingClientsButton() {
    // Verificar se o usuário atual é admin ou dev
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (!["admin", "dev"].includes(currentUser.role)) {
      // Esconder o botão se não for admin ou dev
      const pendingBtn = document.getElementById("view-pending-clients-btn")
      if (pendingBtn) {
        pendingBtn.style.display = "none"
      }
      return
    }

    // Configurar botão para visualizar clientes pendentes
    const viewPendingBtn = document.getElementById("view-pending-clients-btn")
    if (viewPendingBtn) {
      viewPendingBtn.addEventListener("click", () => {
        console.log("Botão de clientes pendentes clicado")

        // Esconder a visualização principal
        document.getElementById("clients-list-view").style.display = "none"
        document.getElementById("clients-kanban-view").style.display = "none"
        document.getElementById("clients-kanban-view").classList.remove("visible")

        // Desativar botões de visualização
        document.querySelectorAll(".view-toggle-btn").forEach((btn) => {
          btn.classList.remove("active")
        })

        // Mostrar a seção de clientes pendentes
        const pendingSection = document.getElementById("pending-clients-section")
        pendingSection.style.display = "block"

        // Carregar os clientes pendentes
        loadPendingClientsTable()
      })
    }

    // Configurar botão para fechar a visualização de clientes pendentes
    const closePendingBtn = document.getElementById("close-pending-clients-btn")
    if (closePendingBtn) {
      closePendingBtn.addEventListener("click", () => {
        // Esconder a seção de clientes pendentes
        document.getElementById("pending-clients-section").style.display = "none"

        // Mostrar a visualização em lista por padrão
        document.getElementById("clients-list-view").style.display = "block"

        // Ativar o botão de visualização em lista
        const listViewBtn = document.querySelector(".view-toggle-btn[data-view='list']")
        if (listViewBtn) {
          listViewBtn.classList.add("active")
        }
      })
    }
  }

  // Função para inicializar a página de clientes
  function initializeClientsPage() {
    // Carregar dados de clientes
    loadClientsTable()

    // Configurar toggle de visualização
    setupViewToggle()

    // Configurar botões e formulários
    setupClientButtons()

    // Configurar drag and drop para o Kanban
    setupDragAndDrop()

    // Adicionar filtro para clientes pendentes
    setupPendingClientFilter()
  }

  // Dummy functions to prevent errors. These should be implemented elsewhere.
  function setupViewToggle() {
    console.warn("setupViewToggle function is not implemented.")
  }

  function setupClientButtons() {
    console.warn("setupClientButtons function is not implemented.")
  }

  function setupDragAndDrop() {
    console.warn("setupDragAndDrop function is not implemented.")
  }

  // Função para configurar filtro de clientes pendentes
  function setupPendingClientFilter() {
    // Verificar se o usuário atual é admin ou dev
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (!["admin", "dev"].includes(currentUser.role)) return

    // Criar o elemento de filtro
    const filtersContainer = document.querySelector(".filters-container")
    if (!filtersContainer) return

    const pendingFilterRow = document.createElement("div")
    pendingFilterRow.className = "admin-form-row"
    pendingFilterRow.style.marginTop = "10px"
    pendingFilterRow.innerHTML = `
      <div class="admin-form-group">
        <label>
          <input type="checkbox" id="filter-pending-clients"> 
          Mostrar apenas clientes pendentes
        </label>
      </div>
    `

    filtersContainer.appendChild(pendingFilterRow)

    // Adicionar event listener para o checkbox
    const pendingCheckbox = document.getElementById("filter-pending-clients")
    if (pendingCheckbox) {
      pendingCheckbox.addEventListener("change", () => {
        // Recarregar a tabela com o filtro aplicado
        loadClientsTable()
      })
    }
  }

  // Função para carregar a tabela de clientes com filtro de pendentes
  function loadClientsTable() {
    try {
      const tableBody = document.getElementById("clients-table-body")
      if (!tableBody) return

      tableBody.innerHTML = ""

      // Obter clientes do localStorage
      const clients = JSON.parse(localStorage.getItem("clients") || "[]")

      // Obter usuário atual
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

      // Filtrar clientes baseado no papel do usuário
      let filteredClients = [...clients]

      // Se for corretor, mostrar apenas seus próprios clientes
      if (currentUser.role === "corretor") {
        filteredClients = filteredClients.filter((client) => client.brokerId === currentUser.id)
      }

      // Aplicar filtro de clientes pendentes se o checkbox estiver marcado
      const pendingCheckbox = document.getElementById("filter-pending-clients")
      if (pendingCheckbox && pendingCheckbox.checked) {
        filteredClients = filteredClients.filter((client) => client.isPending)
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

      // Aplicar filtro de corretor (apenas para admin e dev)
      if (["admin", "dev"].includes(currentUser.role)) {
        const brokerFilter = document.getElementById("filter-broker")
        if (brokerFilter && brokerFilter.value !== "all") {
          filteredClients = filteredClients.filter((client) => client.brokerId === brokerFilter.value)
        }
      }

      // Renderizar clientes
      if (filteredClients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum cliente encontrado.</td></tr>'
        return
      }

      filteredClients.forEach((client) => {
        const row = document.createElement("tr")

        // Destacar clientes pendentes
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

      // Adicionar event listeners para botões
      addTableActionListeners()

      // Recarregar a tabela de clientes pendentes se estiver visível
      if (document.getElementById("pending-clients-section").style.display !== "none") {
        loadPendingClientsTable()
      }
    } catch (error) {
      console.error("Erro ao carregar tabela de clientes:", error)
    }
  }

  // Função para adicionar event listeners aos botões da tabela
  function addTableActionListeners() {
    // Botões de editar
    document.querySelectorAll(".edit").forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        showClientForm(id)
      })
    })

    // Botões de excluir
    document.querySelectorAll(".delete").forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        deleteClient(id)
      })
    })

    // Botões de atribuir corretor
    document.querySelectorAll(".assign-broker").forEach((button) => {
      button.addEventListener("click", function () {
        const id = this.getAttribute("data-id")
        showAssignBrokerDialog(id)
      })
    })
  }

  // Função para mostrar o formulário de cliente
  function showClientForm(id) {
    // Implementação existente ou a ser implementada
    if (typeof showForm === "function") {
      showForm("client", id)
    } else {
      console.warn("showForm function is not implemented.")
    }
  }

  // Função para excluir cliente
  function deleteClient(id) {
    // Implementação existente ou a ser implementada
    if (typeof deleteEntity === "function") {
      deleteEntity("client", id)
    } else {
      if (confirm("Tem certeza que deseja excluir este cliente?")) {
        const clients = JSON.parse(localStorage.getItem("clients") || "[]")
        const updatedClients = clients.filter((client) => client.id !== id)
        localStorage.setItem("clients", JSON.stringify(updatedClients))
        loadClientsTable()

        // Atualizar notificações de clientes pendentes
        if (
          window.notificationManager &&
          typeof window.notificationManager.updatePendingClientsNotification === "function"
        ) {
          window.notificationManager.updatePendingClientsNotification()
        }
      }
    }
  }

  // Dummy functions to prevent errors. These should be implemented elsewhere.
  function showForm(entityType, id) {
    console.warn("showForm function is not implemented.")
  }

  function deleteEntity(entityType, id) {
    console.warn("deleteEntity function is not implemented.")
  }

  // Função para mostrar diálogo de atribuição de corretor
  function showAssignBrokerDialog(clientId) {
    // Obter clientes e usuários
    const clients = JSON.parse(localStorage.getItem("clients") || "[]")
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Encontrar o cliente
    const client = clients.find((c) => c.id === clientId)
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
    const brokerSelect = dialog.querySelector("#assign-broker-select")
    const brokers = users.filter((user) => user.role === "corretor" && user.active)

    brokers.forEach((broker) => {
      const option = document.createElement("option")
      option.value = broker.id
      option.textContent = broker.name || broker.username
      brokerSelect.appendChild(option)
    })

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
        clients[clientIndex].brokerName = broker.name || broker.username
        clients[clientIndex].status = "Novo" // Atualizar status
        clients[clientIndex].isPending = false // Remover flag de pendente

        // Salvar no localStorage
        localStorage.setItem("clients", JSON.stringify(clients))

        // Recarregar a tabela
        loadClientsTable()

        // Recarregar a tabela de clientes pendentes se estiver visível
        if (document.getElementById("pending-clients-section").style.display !== "none") {
          loadPendingClientsTable()
        }

        // Atualizar notificações de clientes pendentes
        if (
          window.notificationManager &&
          typeof window.notificationManager.updatePendingClientsNotification === "function"
        ) {
          window.notificationManager.updatePendingClientsNotification()
        }

        // Fechar o diálogo
        closeDialog()

        // Mostrar mensagem de sucesso
        alert(`Cliente atribuído com sucesso ao corretor ${broker.name || broker.username}.`)
      }
    })
  }

  // Adicionar função para carregar a tabela de clientes pendentes
  // Modificar a função loadPendingClientsTable para garantir que os clientes pendentes sejam exibidos corretamente
  function loadPendingClientsTable() {
    try {
      console.log("Carregando tabela de clientes pendentes")
      const tableBody = document.getElementById("pending-clients-table-body")
      if (!tableBody) {
        console.error("Elemento pending-clients-table-body não encontrado")
        return
      }

      tableBody.innerHTML = ""

      // Obter clientes do localStorage
      const clients = JSON.parse(localStorage.getItem("clients") || "[]")
      console.log("Total de clientes:", clients.length)

      // Filtrar apenas clientes pendentes
      const pendingClients = clients.filter((client) => client.isPending === true)
      console.log("Clientes pendentes encontrados:", pendingClients.length)

      // Renderizar clientes pendentes
      if (pendingClients.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="6" style="text-align: center;">Nenhum cliente pendente encontrado.</td></tr>'
        return
      }

      pendingClients.forEach((client) => {
        const row = document.createElement("tr")
        row.classList.add("pending-client")

        // Formatar data de contato
        const contactDate = client.contactDate ? new Date(client.contactDate).toLocaleDateString("pt-BR") : "N/A"

        row.innerHTML = `
        <td>${client.id}</td>
        <td>${client.name || ""} <span class="badge pending">Pendente</span></td>
        <td>${client.phone || ""}</td>
        <td>${client.email || ""}</td>
        <td>${contactDate}</td>
        <td class="actions">
          <button class="assign-broker" data-id="${client.id}">Atribuir Corretor</button>
          <button class="edit" data-id="${client.id}">Editar</button>
          <button class="delete" data-id="${client.id}">Excluir</button>
        </td>
      `

        tableBody.appendChild(row)
      })

      // Adicionar event listeners para botões
      document.querySelectorAll("#pending-clients-table-body .assign-broker").forEach((button) => {
        button.addEventListener("click", function () {
          const id = this.getAttribute("data-id")
          showAssignBrokerDialog(id)
        })
      })

      document.querySelectorAll("#pending-clients-table-body .edit").forEach((button) => {
        button.addEventListener("click", function () {
          const id = this.getAttribute("data-id")
          showClientForm(id)
        })
      })

      document.querySelectorAll("#pending-clients-table-body .delete").forEach((button) => {
        button.addEventListener("click", function () {
          const id = this.getAttribute("data-id")
          deleteClient(id)
        })
      })
    } catch (error) {
      console.error("Erro ao carregar tabela de clientes pendentes:", error)
    }
  }

  // Adicionar função para criar clientes pendentes de teste (para fins de demonstração)
  // Adicionar esta função no final do arquivo, dentro do event listener DOMContentLoaded

  // Função para criar clientes pendentes de teste
  function createTestPendingClients() {
    // Verificar se já existem clientes pendentes
    const clients = JSON.parse(localStorage.getItem("clients") || "[]")
    const pendingClients = clients.filter((client) => client.isPending === true)

    // Se já existirem clientes pendentes, não criar novos
    if (pendingClients.length > 0) {
      console.log("Já existem clientes pendentes:", pendingClients.length)
      return
    }

    // Criar alguns clientes pendentes de teste
    const testClients = [
      {
        id: "pend-" + Date.now() + "-1",
        name: "Maria Silva",
        email: "maria.silva@example.com",
        phone: "(11) 98765-4321",
        isPending: true,
        contactDate: new Date().toISOString(),
        status: "Novo",
      },
      {
        id: "pend-" + Date.now() + "-2",
        name: "João Santos",
        email: "joao.santos@example.com",
        phone: "(11) 91234-5678",
        isPending: true,
        contactDate: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
        status: "Novo",
      },
      {
        id: "pend-" + Date.now() + "-3",
        name: "Ana Oliveira",
        email: "ana.oliveira@example.com",
        phone: "(11) 99876-5432",
        isPending: true,
        contactDate: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
        status: "Novo",
      },
    ]

    // Adicionar os clientes pendentes de teste ao localStorage
    const updatedClients = [...clients, ...testClients]
    localStorage.setItem("clients", JSON.stringify(updatedClients))
    console.log("Clientes pendentes de teste criados:", testClients.length)
  }

  // Chamar a função para criar clientes pendentes de teste
  createTestPendingClients()

  // Modificar a função saveClient para atualizar notificações
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
        // Verificar se o cliente é pendente (sem corretor atribuído)
        isPending: !brokerId || brokerId === "",
      }

      if (clientId) {
        // Atualizar cliente existente
        const index = clients.findIndex((c) => c.id === clientId)
        if (index !== -1) {
          clients[index] = client
          logAction(currentUser.role, `${currentUser.name} atualizou o cliente: ${client.name}`)
        }
      } else {
        // Adicionar novo cliente
        clients.push(client)
        logAction(currentUser.role, `${currentUser.name} adicionou novo cliente: ${client.name}`)
      }

      localStorage.setItem("clients", JSON.stringify(clients))

      // Atualizar tabelas
      loadClientsTable()
      loadKanbanView()
      loadStats()

      // Atualizar notificações de clientes pendentes
      if (
        window.notificationManager &&
        typeof window.notificationManager.updatePendingClientsNotification === "function"
      ) {
        window.notificationManager.updatePendingClientsNotification()
      }

      // Esconder formulário
      hideForm("client")

      alert(
        "Cliente salvo com sucesso!" +
          (currentUser.role === "corretor" ? " Cliente vinculado automaticamente a você." : ""),
      )
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      alert("Ocorreu um erro ao salvar o cliente. Por favor, tente novamente.")
    }
  }

  // Mock functions to resolve undeclared variables.  These should be implemented elsewhere.
  function getUserById(id) {
    console.warn("getUserById function is not implemented.")
    return null
  }

  function getClientById(id) {
    console.warn("getClientById function is not implemented.")
    return null
  }

  function logAction(role, message) {
    console.warn("logAction function is not implemented. Role:", role, "Message:", message)
  }

  function loadKanbanView() {
    console.warn("loadKanbanView function is not implemented.")
  }

  function loadStats() {
    console.warn("loadStats function is not implemented.")
  }

  function hideForm(entityType) {
    console.warn("hideForm function is not implemented.")
  }
})
