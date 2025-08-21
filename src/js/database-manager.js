/**
 * Módulo para gerenciamento de banco de dados
 * Permite importar e exportar dados do sistema em formato CSV
 */

document.addEventListener("DOMContentLoaded", () => {
  // Verificar se o usuário está logado e tem permissão (apenas admin e dev)
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
  if (!currentUser.id || !["admin", "dev"].includes(currentUser.role)) {
    return
  }

  // Configurar event listeners para botões de exportação
  setupExportButtons()

  // Configurar event listeners para botões de importação
  setupImportButtons()

  // Configurar event listeners para botões de limpeza
  setupClearButtons()

  console.log("Gerenciador de banco de dados inicializado")
})

// Função para configurar botões de exportação
function setupExportButtons() {
  // Botão para exportar todos os dados
  const exportAllBtn = document.getElementById("export-all-btn")
  if (exportAllBtn) {
    exportAllBtn.addEventListener("click", () => {
      exportAllData()
    })
  }

  // Botões para exportação individual
  const exportClientsDbBtn = document.getElementById("export-clients-db-btn")
  if (exportClientsDbBtn) {
    exportClientsDbBtn.addEventListener("click", () => {
      exportData("clients")
    })
  }

  const exportUsersDbBtn = document.getElementById("export-users-db-btn")
  if (exportUsersDbBtn) {
    exportUsersDbBtn.addEventListener("click", () => {
      exportData("users")
    })
  }

  const exportPropertiesDbBtn = document.getElementById("export-properties-db-btn")
  if (exportPropertiesDbBtn) {
    exportPropertiesDbBtn.addEventListener("click", () => {
      exportData("properties")
    })
  }

  // Botões nas páginas específicas
  const exportClientsBtn = document.getElementById("export-clients-btn")
  if (exportClientsBtn) {
    exportClientsBtn.addEventListener("click", () => {
      exportData("clients")
    })
  }

  const exportUsersBtn = document.getElementById("export-users-btn")
  if (exportUsersBtn) {
    exportUsersBtn.addEventListener("click", () => {
      exportData("users")
    })
  }

  const exportPropertiesBtn = document.getElementById("export-properties-btn")
  if (exportPropertiesBtn) {
    exportPropertiesBtn.addEventListener("click", () => {
      exportData("properties")
    })
  }
}

// Função para configurar botões de importação
function setupImportButtons() {
  // Botão para mostrar formulário de importação completa
  const importAllBtn = document.getElementById("import-all-btn")
  if (importAllBtn) {
    importAllBtn.addEventListener("click", () => {
      const importAllContainer = document.getElementById("import-all-container")
      if (importAllContainer) {
        importAllContainer.style.display = "block"
      }
    })
  }

  // Botão para cancelar importação completa
  const cancelImportAllBtn = document.getElementById("cancel-import-all-btn")
  if (cancelImportAllBtn) {
    cancelImportAllBtn.addEventListener("click", () => {
      const importAllContainer = document.getElementById("import-all-container")
      if (importAllContainer) {
        importAllContainer.style.display = "none"
      }
    })
  }

  // Botão para processar importação completa
  const processImportAllBtn = document.getElementById("process-import-all-btn")
  if (processImportAllBtn) {
    processImportAllBtn.addEventListener("click", () => {
      importAllData()
    })
  }

  // Botão para processar importação individual
  const processImportDbBtn = document.getElementById("process-import-db-btn")
  if (processImportDbBtn) {
    processImportDbBtn.addEventListener("click", () => {
      const fileInput = document.getElementById("import-db-file")
      const typeSelect = document.getElementById("import-db-type")

      if (fileInput && fileInput.files.length > 0 && typeSelect) {
        const file = fileInput.files[0]
        const type = typeSelect.value

        importData(file, type)
      } else {
        alert("Por favor, selecione um arquivo CSV e o tipo de dados.")
      }
    })
  }

  // Botões nas páginas específicas
  const importClientsBtn = document.getElementById("import-clients-btn")
  if (importClientsBtn) {
    importClientsBtn.addEventListener("click", () => {
      const fileInput = document.getElementById("import-clients-file")
      if (fileInput) {
        fileInput.click()
      }
    })
  }

  const importClientsFile = document.getElementById("import-clients-file")
  if (importClientsFile) {
    importClientsFile.addEventListener("change", function () {
      if (this.files.length > 0) {
        importData(this.files[0], "clients")
      }
    })
  }

  const importUsersBtn = document.getElementById("import-users-btn")
  if (importUsersBtn) {
    importUsersBtn.addEventListener("click", () => {
      const fileInput = document.getElementById("import-users-file")
      if (fileInput) {
        fileInput.click()
      }
    })
  }

  const importUsersFile = document.getElementById("import-users-file")
  if (importUsersFile) {
    importUsersFile.addEventListener("change", function () {
      if (this.files.length > 0) {
        importData(this.files[0], "users")
      }
    })
  }

  const importPropertiesBtn = document.getElementById("import-properties-btn")
  if (importPropertiesBtn) {
    importPropertiesBtn.addEventListener("click", () => {
      const fileInput = document.getElementById("import-properties-file")
      if (fileInput) {
        fileInput.click()
      }
    })
  }

  const importPropertiesFile = document.getElementById("import-properties-file")
  if (importPropertiesFile) {
    importPropertiesFile.addEventListener("change", function () {
      if (this.files.length > 0) {
        importData(this.files[0], "properties")
      }
    })
  }
}

// Função para configurar botões de limpeza
function setupClearButtons() {
  const clearClientsBtn = document.getElementById("clear-clients-btn")
  if (clearClientsBtn) {
    clearClientsBtn.addEventListener("click", () => {
      if (
        confirm(
          "ATENÇÃO: Você está prestes a excluir TODOS os clientes do sistema. Esta ação não pode ser desfeita. Deseja continuar?",
        )
      ) {
        clearData("clients")
      }
    })
  }

  const clearUsersBtn = document.getElementById("clear-users-btn")
  if (clearUsersBtn) {
    clearUsersBtn.addEventListener("click", () => {
      if (
        confirm(
          "ATENÇÃO: Você está prestes a excluir TODOS os usuários do sistema, exceto o seu. Esta ação não pode ser desfeita. Deseja continuar?",
        )
      ) {
        clearData("users")
      }
    })
  }

  const clearPropertiesBtn = document.getElementById("clear-properties-btn")
  if (clearPropertiesBtn) {
    clearPropertiesBtn.addEventListener("click", () => {
      if (
        confirm(
          "ATENÇÃO: Você está prestes a excluir TODOS os imóveis do sistema. Esta ação não pode ser desfeita. Deseja continuar?",
        )
      ) {
        clearData("properties")
      }
    })
  }
}

// Função para exportar todos os dados
function exportAllData() {
  try {
    // Exportar clientes
    const clients = JSON.parse(localStorage.getItem("clients") || "[]")
    if (clients.length > 0) {
      window.CSVHandler.exportToCSV(clients, `clientes_elite_house_${formatDate(new Date())}.csv`)
    }

    // Exportar usuários
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    if (users.length > 0) {
      window.CSVHandler.exportToCSV(users, `usuarios_elite_house_${formatDate(new Date())}.csv`)
    }

    // Exportar imóveis
    const properties = JSON.parse(localStorage.getItem("properties") || "[]")
    if (properties.length > 0) {
      window.CSVHandler.exportToCSV(properties, `imoveis_elite_house_${formatDate(new Date())}.csv`)
    }

    logAction("Exportação completa de dados realizada com sucesso")
    alert("Exportação de todos os dados concluída com sucesso!")
  } catch (error) {
    console.error("Erro ao exportar todos os dados:", error)
    alert("Ocorreu um erro ao exportar os dados. Por favor, tente novamente.")
  }
}

// Função para exportar dados específicos
function exportData(type) {
  try {
    let data = []
    let filename = ""

    switch (type) {
      case "clients":
        data = JSON.parse(localStorage.getItem("clients") || "[]")
        filename = `clientes_elite_house_${formatDate(new Date())}.csv`
        break
      case "users":
        data = JSON.parse(localStorage.getItem("users") || "[]")
        filename = `usuarios_elite_house_${formatDate(new Date())}.csv`
        break
      case "properties":
        data = JSON.parse(localStorage.getItem("properties") || "[]")
        filename = `imoveis_elite_house_${formatDate(new Date())}.csv`
        break
      default:
        throw new Error("Tipo de dados inválido")
    }

    if (data.length === 0) {
      alert(`Não há dados de ${getTypeName(type)} para exportar.`)
      return
    }

    window.CSVHandler.exportToCSV(data, filename)

    logAction(`Exportação de ${getTypeName(type)} realizada com sucesso`)
    alert(`Exportação de ${getTypeName(type)} concluída com sucesso!`)
  } catch (error) {
    console.error(`Erro ao exportar ${type}:`, error)
    alert(`Ocorreu um erro ao exportar os dados de ${getTypeName(type)}. Por favor, tente novamente.`)
  }
}

// Função para importar todos os dados
function importAllData() {
  try {
    const clientsFileInput = document.getElementById("import-clients-file-all")
    const usersFileInput = document.getElementById("import-users-file-all")
    const propertiesFileInput = document.getElementById("import-properties-file-all")

    let importCount = 0

    // Importar clientes
    if (clientsFileInput && clientsFileInput.files.length > 0) {
      window.CSVHandler.importFromCSV(clientsFileInput.files[0], (data) => {
        if (data.length > 0) {
          // Validar dados
          const validData = validateImportData(data, "clients")

          // Salvar no localStorage
          localStorage.setItem("clients", JSON.stringify(validData))

          logAction(`Importação de ${validData.length} clientes realizada com sucesso`)
          importCount++
          checkImportCompletion(importCount)
        }
      })
    }

    // Importar usuários
    if (usersFileInput && usersFileInput.files.length > 0) {
      window.CSVHandler.importFromCSV(usersFileInput.files[0], (data) => {
        if (data.length > 0) {
          // Validar dados
          const validData = validateImportData(data, "users")

          // Preservar o usuário atual
          const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
          if (currentUser.id) {
            const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
            const currentUserData = existingUsers.find((user) => user.id === currentUser.id)

            if (currentUserData) {
              // Verificar se o usuário atual não está no novo conjunto de dados
              const userExists = validData.some((user) => user.id === currentUser.id)

              if (!userExists) {
                // Adicionar o usuário atual aos dados importados
                validData.push(currentUserData)
              }
            }
          }

          // Salvar no localStorage
          localStorage.setItem("users", JSON.stringify(validData))

          logAction(`Importação de ${validData.length} usuários realizada com sucesso`)
          importCount++
          checkImportCompletion(importCount)
        }
      })
    }

    // Importar imóveis
    if (propertiesFileInput && propertiesFileInput.files.length > 0) {
      window.CSVHandler.importFromCSV(propertiesFileInput.files[0], (data) => {
        if (data.length > 0) {
          // Validar dados
          const validData = validateImportData(data, "properties")

          // Salvar no localStorage
          localStorage.setItem("properties", JSON.stringify(validData))

          logAction(`Importação de ${validData.length} imóveis realizada com sucesso`)
          importCount++
          checkImportCompletion(importCount)
        }
      })
    }

    // Se nenhum arquivo foi selecionado
    if (importCount === 0) {
      alert("Por favor, selecione pelo menos um arquivo para importar.")
    }
  } catch (error) {
    console.error("Erro ao importar todos os dados:", error)
    alert("Ocorreu um erro ao importar os dados. Por favor, tente novamente.")
  }
}

// Função para verificar conclusão da importação
function checkImportCompletion(count) {
  if (count === 3) {
    // Esconder o formulário de importação
    const importAllContainer = document.getElementById("import-all-container")
    if (importAllContainer) {
      importAllContainer.style.display = "none"
    }

    // Recarregar a página para atualizar os dados
    alert("Importação de todos os dados concluída com sucesso! A página será recarregada.")
    window.location.reload()
  }
}

// Função para importar dados específicos
function importData(file, type) {
  try {
    window.CSVHandler.importFromCSV(file, (data) => {
      if (data.length === 0) {
        alert(`O arquivo não contém dados válidos de ${getTypeName(type)}.`)
        return
      }

      // Validar dados
      const validData = validateImportData(data, type)

      if (validData.length === 0) {
        alert(`Nenhum dado válido de ${getTypeName(type)} foi encontrado no arquivo.`)
        return
      }

      // Confirmar importação
      if (
        confirm(`Foram encontrados ${validData.length} registros válidos de ${getTypeName(type)}. Deseja importá-los?`)
      ) {
        // Se for usuários, preservar o usuário atual
        if (type === "users") {
          const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
          if (currentUser.id) {
            const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
            const currentUserData = existingUsers.find((user) => user.id === currentUser.id)

            if (currentUserData) {
              // Verificar se o usuário atual não está no novo conjunto de dados
              const userExists = validData.some((user) => user.id === currentUser.id)

              if (!userExists) {
                // Adicionar o usuário atual aos dados importados
                validData.push(currentUserData)
              }
            }
          }
        }

        // Salvar no localStorage
        localStorage.setItem(type, JSON.stringify(validData))

        logAction(`Importação de ${validData.length} ${getTypeName(type)} realizada com sucesso`)
        alert(
          `Importação de ${validData.length} ${getTypeName(type)} concluída com sucesso! A página será recarregada.`,
        )

        // Recarregar a página para atualizar os dados
        window.location.reload()
      }
    })
  } catch (error) {
    console.error(`Erro ao importar ${type}:`, error)
    alert(`Ocorreu um erro ao importar os dados de ${getTypeName(type)}. Por favor, tente novamente.`)
  }
}

// Função para validar dados importados
function validateImportData(data, type) {
  const validData = []
  const errors = []

  data.forEach((item, index) => {
    let itemErrors = []

    switch (type) {
      case "clients":
        itemErrors = window.CSVHandler.validateClientData(item)
        break
      case "users":
        itemErrors = window.CSVHandler.validateUserData(item)
        break
      case "properties":
        itemErrors = window.CSVHandler.validatePropertyData(item)
        break
    }

    if (itemErrors.length === 0) {
      // Garantir que o item tenha um ID
      if (!item.id) {
        item.id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
      }

      validData.push(item)
    } else {
      errors.push(`Linha ${index + 2}: ${itemErrors.join(", ")}`)
    }
  })

  // Exibir erros, se houver
  if (errors.length > 0) {
    console.warn(`Erros na importação de ${type}:`, errors)

    if (errors.length <= 5) {
      alert(`Alguns registros não puderam ser importados devido a erros:\n\n${errors.join("\n")}`)
    } else {
      alert(
        `${errors.length} registros não puderam ser importados devido a erros. Verifique o console para mais detalhes.`,
      )
    }
  }

  return validData
}

// Função para limpar dados
function clearData(type) {
  try {
    switch (type) {
      case "clients":
        localStorage.setItem("clients", "[]")
        logAction("Todos os clientes foram removidos do sistema")
        break
      case "users":
        // Preservar o usuário atual
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
        if (currentUser.id) {
          const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
          const currentUserData = existingUsers.find((user) => user.id === currentUser.id)

          if (currentUserData) {
            localStorage.setItem("users", JSON.stringify([currentUserData]))
            logAction("Todos os usuários foram removidos do sistema, exceto o usuário atual")
          } else {
            localStorage.setItem("users", "[]")
            logAction("Todos os usuários foram removidos do sistema")
          }
        } else {
          localStorage.setItem("users", "[]")
          logAction("Todos os usuários foram removidos do sistema")
        }
        break
      case "properties":
        localStorage.setItem("properties", "[]")
        logAction("Todos os imóveis foram removidos do sistema")
        break
    }

    alert(`Todos os dados de ${getTypeName(type)} foram removidos com sucesso! A página será recarregada.`)

    // Recarregar a página para atualizar os dados
    window.location.reload()
  } catch (error) {
    console.error(`Erro ao limpar ${type}:`, error)
    alert(`Ocorreu um erro ao limpar os dados de ${getTypeName(type)}. Por favor, tente novamente.`)
  }
}

// Função para obter nome amigável do tipo de dados
function getTypeName(type) {
  switch (type) {
    case "clients":
      return "clientes"
    case "users":
      return "usuários"
    case "properties":
      return "imóveis"
    default:
      return type
  }
}

// Função para registrar ação no log
function logAction(action) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    const userType = currentUser.role || "desconhecido"
    const userName = currentUser.name || currentUser.username || "Usuário desconhecido"

    const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]")

    logs.push({
      timestamp: new Date().toISOString(),
      userType: userType,
      action: `${userName} (${userType}): ${action}`,
    })

    // Limitar a 100 logs para não sobrecarregar o localStorage
    if (logs.length > 100) {
      logs.shift() // Remove o log mais antigo
    }

    localStorage.setItem("activityLogs", JSON.stringify(logs))
  } catch (error) {
    console.error("Erro ao registrar ação no log:", error)
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
