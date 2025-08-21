document.addEventListener("DOMContentLoaded", () => {
  // Inicializar dados se não existirem
  if (!localStorage.getItem("properties")) {
    localStorage.setItem("properties", JSON.stringify([]))
  }

  // Preencher os campos de filtro com os parâmetros da URL
  fillFilterFieldsFromUrl()

  // Carregar imóveis
  loadProperties()

  // Registrar visualização da página
  incrementPageView()

  // Adicionar event listener para o botão de filtro
  document.getElementById("filter-button").addEventListener("click", () => {
    loadProperties()
  })

  // Funções auxiliares
  function fillFilterFieldsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)

    // Preencher os campos de filtro com os parâmetros da URL
    if (urlParams.has("type")) {
      document.getElementById("property-type").value = urlParams.get("type")
    }

    if (urlParams.has("location")) {
      document.getElementById("property-location").value = urlParams.get("location")
    }

    if (urlParams.has("minPrice")) {
      document.getElementById("min-price").value = urlParams.get("minPrice")
    }

    if (urlParams.has("maxPrice")) {
      document.getElementById("max-price").value = urlParams.get("maxPrice")
    }
  }

  function loadProperties() {
    const propertiesContainer = document.getElementById("properties-container")
    let properties = JSON.parse(localStorage.getItem("properties") || "[]")

    // Aplicar filtros
    properties = filterProperties(properties)

    // Atualizar contador
    document.getElementById("properties-count").textContent = properties.length

    // Limpar container
    propertiesContainer.innerHTML = ""

    if (properties.length === 0) {
      propertiesContainer.innerHTML =
        '<p class="no-properties">Nenhum imóvel encontrado com os filtros selecionados.</p>'
      return
    }

    // Renderizar imóveis
    properties.forEach((property) => {
      const propertyCard = document.createElement("div")
      propertyCard.className = "card"
      propertyCard.setAttribute("data-id", property.id)

      propertyCard.innerHTML = `
        <img src="${property.image}" alt="${property.title}">
        <div class="card-content">
            <h3>${property.type}</h3>
            <p>${property.location}</p>
            <br>
            <p><i class="fa-solid fa-ruler-combined"></i> ${property.area}m² | <i class="fa-solid fa-bed"></i> ${property.bedrooms} quartos | <br><i class="fa-solid fa-toilet"></i> ${property.bathrooms} banheiros | <i class="fa-solid fa-car"></i> ${property.garage} vagas</p>
            <br>
            <p class="price">R$ ${Number(property.price).toLocaleString("pt-BR")}</p>
            <br>
            <p class="code">${property.ref}</p>
        </div>
      `

      // Adicionar event listener para visualizar detalhes
      propertyCard.addEventListener("click", function () {
        const propertyId = this.getAttribute("data-id")
        viewPropertyDetails(propertyId)
      })

      propertiesContainer.appendChild(propertyCard)
    })
  }

  function filterProperties(properties) {
    const type = document.getElementById("property-type").value
    const location = document.getElementById("property-location").value.toLowerCase()
    const minPrice = document.getElementById("min-price").value
    const maxPrice = document.getElementById("max-price").value

    // Verificar se há um parâmetro de busca na URL
    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get("search")

    return properties.filter((property) => {
      // Se houver um parâmetro de busca, filtrar por ele
      if (
        searchParam &&
        !property.location.toLowerCase().includes(searchParam.toLowerCase()) &&
        !property.type.toLowerCase().includes(searchParam.toLowerCase())
      ) {
        return false
      }

      // Filtrar por tipo
      if (type && property.type !== type) {
        return false
      }

      // Filtrar por localização
      if (location && !property.location.toLowerCase().includes(location)) {
        return false
      }

      // Filtrar por preço mínimo
      if (minPrice && Number(property.price) < Number(minPrice)) {
        return false
      }

      // Filtrar por preço máximo
      if (maxPrice && Number(property.price) > Number(maxPrice)) {
        return false
      }

      return true
    })
  }

  function viewPropertyDetails(propertyId) {
    // Redirecionar para a página de detalhes do imóvel
    window.location.href = `../../property-detail.html?id=${propertyId}`
  }

  function incrementPageView() {
    let views = Number.parseInt(localStorage.getItem("totalViews") || "0")
    views++
    localStorage.setItem("totalViews", views.toString())
  }
})
